import { z } from "zod";
import { Locale } from "../../../generated/prisma/enums";

const translationSchema = z.object({
  locale: z.enum([Locale.EN, Locale.BN]),
  title: z.string().min(1, "Title is required").max(300),
  body: z.string().max(50000).optional(),
});

export const createNewsZodSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(translationSchema)
    .min(1, "At least one translation is required"),
});

export const updateNewsZodSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(translationSchema).optional(),
});

export const listNewsQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  locale: z.enum([Locale.EN, Locale.BN]).optional(),
  isActive: z.string().optional(),
  search: z.string().optional(),
});
