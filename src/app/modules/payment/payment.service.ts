import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import {
  PaymentStatus,
  PaymentMethod,
  OrderStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IPaymentUpdate, IPaymentListQuery } from "./payment.interface";

// Full payment detail (order, customer payout info, status history).
const paymentDetailInclude = {
  statusHistory: { orderBy: { createdAt: "desc" } },
  order: {
    include: {
      items: {
        include: {
          variant: { select: { sku: true, storage: true, color: true } },
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          individualProfile: {
            select: {
              fullName: true,
              telephone: true,
              preferredPayoutMethod: true,
              bkashNumber: true,
              nagadNumber: true,
              bankAccountName: true,
              bankAccountNumber: true,
              bankAccountBranch: true,
            },
          },
          corporationProfile: {
            select: {
              companyName: true,
              companyTelephone: true,
              bankAccount: true,
              bankAccountBranch: true,
              bankAccountNumber: true,
              bankAccountName: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PaymentInclude;

// List view keeps the payload light; the drawer loads detail on demand.
const paymentListInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          individualProfile: {
            select: {
              fullName: true,
              preferredPayoutMethod: true,
              bkashNumber: true,
              nagadNumber: true,
              bankAccountNumber: true,
            },
          },
          corporationProfile: {
            select: {
              companyName: true,
              bankAccountName: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PaymentInclude;

const getPaymentByOrderId = async (orderId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: paymentDetailInclude,
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found for this order");
  }

  return payment;
};

const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: paymentDetailInclude,
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  return payment;
};

const listMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { order: { userId } },
    orderBy: { createdAt: "desc" },
    include: {
      statusHistory: { orderBy: { createdAt: "desc" } },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          storeId: true,
        },
      },
    },
  });
};

const listPayments = async (query: IPaymentListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    ...(query.status ? { status: query.status as PaymentStatus } : {}),
    ...(query.orderId ? { orderId: query.orderId } : {}),
    ...(query.method
      ? { method: query.method as PaymentMethod }
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
      include: paymentListInclude,
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

  const newStatus = payload.status as PaymentStatus;

  // A completed payment can only be refunded, never re-processed as PAID/FAILED.
  if (
    payment.status === PaymentStatus.PAID &&
    newStatus !== PaymentStatus.REFUNDED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment is already completed; it can only be refunded",
    );
  }

  const method = (payload.method as PaymentMethod) ?? payment.method;
  const reference = payload.reference ?? payment.reference;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        method,
        reference,
        paidAt:
          newStatus === PaymentStatus.PAID ? new Date() : payment.paidAt,
      },
    });

    await tx.paymentStatusHistory.create({
      data: {
        paymentId,
        oldStatus: payment.status,
        newStatus,
        changedBy: actingUserId,
        note: payload.note ?? null,
      },
    });

    // Sync the order lifecycle with the payout result.
    if (newStatus === PaymentStatus.PAID) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.PAID,
          note: `Payment completed via ${method}`,
          changedBy: actingUserId,
        },
      });
    } else if (newStatus === PaymentStatus.REFUNDED) {
      // Money pulled back — order returns to a payable state.
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_PENDING },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.PAYMENT_PENDING,
          note: `Payment refunded. ${payload.note ?? ""}`.trim(),
          changedBy: actingUserId,
        },
      });
    }

    return tx.payment.findUnique({
      where: { id: paymentId },
      include: paymentDetailInclude,
    });
  });
};

export const PaymentService = {
  getPaymentByOrderId,
  getPaymentById,
  listMyPayments,
  listPayments,
  updatePayment,
};