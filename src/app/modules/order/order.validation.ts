import { z } from "zod";
import {
  BuybackMethod,
  Courier,
  ItemCondition,
  OrderStatus,
} from "../../../generated/prisma/enums";

// ---------- Order ----------

const orderItemSchema = z.object({
  variantId: z.string().min(1, "variantId is required"),
  condition: z.enum([ItemCondition.NEW, ItemCondition.USED]),
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  deductionIds: z.array(z.string()).optional(),
});

export const createOrderZodSchema = z
  .object({
    method: z.enum([
      BuybackMethod.IN_STORE,
      BuybackMethod.MAIL_IN,
      BuybackMethod.CORPORATE,
    ]),
    storeId: z.string().optional(),
    shippingAddressId: z.string().optional(),
    courier: z
      .enum([
        Courier.STEADFAST,
        Courier.PATHAO,
        Courier.REDX,
        Courier.PAPERFLY,
        Courier.E_DESH,
        Courier.SA_PARCEL,
        Courier.SUNDARBAN,
      ])
      .optional(),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
  })
  .refine((d) => d.method !== BuybackMethod.IN_STORE || !!d.storeId, {
    message: "storeId is required for IN_STORE method",
    path: ["storeId"],
  })
  .refine(
    (d) =>
      d.method !== BuybackMethod.MAIL_IN ||
      (!!d.shippingAddressId && !!d.courier),
    {
      message: "shippingAddressId and courier are required for MAIL_IN method",
      path: ["shippingAddressId"],
    },
  );

export const updateOrderStatusZodSchema = z.object({
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.SUBMITTED,
    OrderStatus.SHIPPED,
    OrderStatus.RECEIVED,
    OrderStatus.UNDER_INSPECTION,
    OrderStatus.APPROVED,
    OrderStatus.REJECTED,
    OrderStatus.PAYMENT_PENDING,
    OrderStatus.PAID,
    OrderStatus.COMPLETED,
    OrderStatus.RETURNED,
    OrderStatus.CANCELLED,
  ]),
  note: z.string().optional(),
});

export const listOrderQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  userId: z.string().optional(),
  storeId: z.string().optional(),
  method: z.string().optional(),
  search: z.string().optional(),
});

export const updateTrackingZodSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
});
