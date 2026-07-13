import { z } from "zod";

// ---------- Category ----------

export const createCategoryZodSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(100),
  parentId: z.string().nullable().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1, "Name is required").max(200),
});

export const updateCategoryZodSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  parentId: z.string().nullable().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
});

export const listCategoryQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  parentId: z.string().optional(),
  isPopular: z.string().optional(),
  isActive: z.string().optional(),
});

// ---------- Category Notice ----------

export const createNoticeZodSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  body: z.string().min(1, "Notice body is required"),
});

export const updateNoticeZodSchema = z.object({
  body: z.string().min(1, "Notice body is required"),
});
