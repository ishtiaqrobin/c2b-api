import { z } from "zod";
import { Locale } from "../../../generated/prisma/enums";

// ---------- Category ----------

const translationSchema = z.object({
  locale: z.enum([Locale.EN, Locale.BN]),
  name: z.string().min(1, "Translation name is required").max(200),
});

export const createCategoryZodSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(100),
  parentId: z.string().nullable().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(translationSchema)
    .min(1, "At least one translation is required"),
});

export const updateCategoryZodSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  parentId: z.string().nullable().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(translationSchema).optional(),
});

export const listCategoryQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  parentId: z.string().optional(),
  isPopular: z.string().optional(),
  isActive: z.string().optional(),
  locale: z.enum([Locale.EN, Locale.BN]).optional(),
});

// ---------- Category Notice ----------

const noticeTranslationSchema = z.object({
  locale: z.enum([Locale.EN, Locale.BN]),
  body: z.string().min(1, "Notice body is required"),
});

export const createNoticeZodSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  translations: z
    .array(noticeTranslationSchema)
    .min(1, "At least one translation is required"),
});

export const updateNoticeZodSchema = z.object({
  translations: z
    .array(noticeTranslationSchema)
    .min(1, "At least one translation is required"),
});
