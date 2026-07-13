import { z } from "zod";

export const createNewsZodSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  title: z.string().min(1, "Title is required").max(300),
  body: z.string().max(50000).optional(),
});

export const updateNewsZodSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  title: z.string().min(1).max(300).optional(),
  body: z.string().max(50000).optional(),
});

export const listNewsQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isActive: z.string().optional(),
  search: z.string().optional(),
});
