import { z } from "zod";
import { PaymentStatus } from "../../../generated/prisma/enums";

export const updatePaymentZodSchema = z.object({
  status: z.enum([
    PaymentStatus.PAID,
    PaymentStatus.FAILED,
    PaymentStatus.REFUNDED,
  ]),
  method: z.string().optional(),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export const listPaymentQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  orderId: z.string().optional(),
  method: z.string().optional(),
  search: z.string().optional(),
});
