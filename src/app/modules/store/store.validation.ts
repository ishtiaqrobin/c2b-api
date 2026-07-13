import { z } from "zod";

// ---------- Store ----------

const businessHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  isClosed: z.boolean().optional(),
});

export const createStoreZodSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(100),
  name: z.string().min(1, "Store name is required").max(200),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  businessHours: z.array(businessHourSchema).optional(),
});

export const updateStoreZodSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  businessHours: z.array(businessHourSchema).optional(),
});

export const listStoreQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
});
