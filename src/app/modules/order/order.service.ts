import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import {
  BuybackMethod,
  OrderStatus,
  ItemCondition,
  Locale,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  IOrderCreate,
  IOrderListQuery,
  IOrderStatusUpdate,
} from "./order.interface";

// Generate order number: BB-YYYY-XXXXXX
const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  const seq = String(count + 1).padStart(6, "0");
  return `BB-${year}-${seq}`;
};

// ==================== ORDER ====================

const createOrder = async (payload: IOrderCreate, userId: string) => {
  // Validate all variants and compute pricing
  const variantIds = payload.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isDeleted: false, isActive: true },
    include: {
      product: { include: { translations: true } },
      deductions: {
        where: { isDeleted: false, isActive: true },
        include: { translations: true },
      },
    },
  });

  if (variants.length !== variantIds.length) {
    throw new AppError(
      status.BAD_REQUEST,
      "One or more variants not found or inactive",
    );
  }

  const orderNumber = await generateOrderNumber();

  // Build order items with price snapshots
  const orderItems = payload.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const basePrice =
      item.condition === ItemCondition.NEW
        ? variant.newPrice
        : variant.usedPrice;

    if (!basePrice) {
      throw new AppError(
        status.BAD_REQUEST,
        `No ${item.condition} price set for variant ${variant.sku ?? variant.id}`,
      );
    }

    // Resolve selected deductions
    const selectedDeductions = item.deductionIds
      ? variant.deductions.filter(
          (d) =>
            item.deductionIds!.includes(d.id) && d.condition === item.condition,
        )
      : [];

    const totalDeduction = selectedDeductions.reduce(
      (sum, d) => sum + Number(d.amount),
      0,
    );

    const unitPrice = Number(basePrice) - totalDeduction;
    const quantity = item.quantity ?? 1;
    const lineTotal = unitPrice * quantity;

    return {
      variantId: item.variantId,
      condition: item.condition,
      quantity,
      notes: item.notes ?? null,
      basePriceSnapshot: basePrice,
      totalDeduction,
      unitPriceSnapshot: unitPrice,
      lineTotal,
      productNameSnapshot:
        variant.product.translations[0]?.name ?? "Unknown Product",
      deductions: {
        create: selectedDeductions.map((d) => ({
          deductionId: d.id,
          labelSnapshot: d.translations[0]?.label ?? d.condition,
          amountSnapshot: d.amount,
        })),
      },
    };
  });

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + Number(item.lineTotal),
    0,
  );

  return prisma.order.create({
    data: {
      orderNumber,
      userId,
      method: payload.method,
      storeId: payload.storeId ?? null,
      shippingAddressId: payload.shippingAddressId ?? null,
      courier: payload.courier ?? null,
      totalAmount,
      items: { create: orderItems },
      statusHistory: {
        create: {
          status: OrderStatus.PENDING,
          note: "Order created",
        },
      },
    },
    include: {
      items: {
        include: { deductions: true },
      },
      statusHistory: true,
    },
  });
};

const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { translations: true } },
            },
          },
          deductions: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      store: { include: { translations: true } },
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  return order;
};

const getOrderByOrderNumber = async (orderNumber: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { translations: true } },
            },
          },
          deductions: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      store: { include: { translations: true } },
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  return order;
};

const listOrders = async (query: IOrderListQuery, userId?: string) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status as OrderStatus } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(userId ? { userId } : {}),
    ...(query.storeId ? { storeId: query.storeId } : {}),
    ...(query.method ? { method: query.method as BuybackMethod } : {}),
    ...(query.search
      ? {
          orderNumber: {
            contains: query.search,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              select: {
                sku: true,
                storage: true,
                color: true,
              },
            },
          },
        },
        store: {
          include: {
            translations: query.locale
              ? { where: { locale: query.locale as Locale } }
              : true,
          },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateOrderStatus = async (
  orderId: string,
  payload: IOrderStatusUpdate,
  actingUserId: string,
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: payload.status },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: payload.status,
        note: payload.note,
        changedBy: actingUserId,
      },
    });

    return tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { deductions: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
        store: { include: { translations: true } },
      },
    });
  });
};

const updateTrackingNumber = async (
  orderId: string,
  trackingNumber: string,
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber },
    select: {
      id: true,
      orderNumber: true,
      trackingNumber: true,
      status: true,
    },
  });
};

const cancelOrder = async (orderId: string, actingUserId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  const nonCancellable: OrderStatus[] = [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.PAID,
  ];
  if (nonCancellable.includes(order.status)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Cannot cancel order in ${order.status} status`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.CANCELLED,
        note: "Order cancelled",
        changedBy: actingUserId,
      },
    });

    return updated;
  });
};

export const OrderService = {
  createOrder,
  getOrderById,
  getOrderByOrderNumber,
  listOrders,
  updateOrderStatus,
  updateTrackingNumber,
  cancelOrder,
};
