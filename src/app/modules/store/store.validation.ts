import { z } from "zod";
import { Locale } from "../../../generated/prisma/enums";

// ---------- Store ----------

const translationSchema = z.object({
  locale: z.enum([Locale.EN, Locale.BN]),
  name: z.string().min(1, "Store name is required").max(200),
  address: z.string().optional(),
});

const businessHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  isClosed: z.boolean().optional(),
});

export const createStoreZodSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(100),
  isActive: z.boolean().optional(),
  translations: z
    .array(translationSchema)
    .min(1, "At least one translation is required"),
  businessHours: z.array(businessHourSchema).optional(),
});

export const updateStoreZodSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  translations: z.array(translationSchema).optional(),
  businessHours: z.array(businessHourSchema).optional(),
});

export const listStoreQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
  locale: z.enum([Locale.EN, Locale.BN]).optional(),
});
