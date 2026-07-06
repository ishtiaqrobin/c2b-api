import { z } from "zod";

export const createBannerZodSchema = z.object({
  categoryId: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Image URL is required"),
  imagePublicId: z.string().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateBannerZodSchema = z.object({
  categoryId: z.string().optional().nullable(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listBannerQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.string().optional(),
});
