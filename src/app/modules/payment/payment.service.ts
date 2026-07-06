import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { PaymentStatus, OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IPaymentUpdate, IPaymentListQuery } from "./payment.interface";

const getPaymentByOrderId = async (orderId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: { select: { sku: true, storage: true, color: true } },
            },
          },
          user: { select: { id: true, email: true, name: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found for this order");
  }

  return payment;
};

const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: { select: { sku: true, storage: true, color: true } },
            },
          },
          user: { select: { id: true, email: true, name: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  return payment;
};

const listPayments = async (query: IPaymentListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    ...(query.status ? { status: query.status as PaymentStatus } : {}),
    ...(query.orderId ? { orderId: query.orderId } : {}),
    ...(query.method
      ? { method: { contains: query.method, mode: "insensitive" } }
      : {}),
    ...(query.search
      ? {
          OR: [
            { reference: { contains: query.search, mode: "insensitive" } },
            {
              order: {
                orderNumber: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updatePayment = async (
  paymentId: string,
  payload: IPaymentUpdate,
  actingUserId: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  if (payment.status === PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "Payment is already completed");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: payload.status,
        method: payload.method ?? payment.method,
        reference: payload.reference ?? payment.reference,
        paidAt:
          payload.status === PaymentStatus.PAID ? new Date() : payment.paidAt,
      },
    });

    // If payment is marked as paid, update order status
    if (payload.status === PaymentStatus.PAID) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.PAID,
          note: `Payment completed via ${payload.method ?? payment.method}`,
          changedBy: actingUserId,
        },
      });
    }

    return tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  select: { sku: true, storage: true, color: true },
                },
              },
            },
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });
  });
};

export const PaymentService = {
  getPaymentByOrderId,
  getPaymentById,
  listPayments,
  updatePayment,
};
