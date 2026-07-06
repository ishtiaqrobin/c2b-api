import { z } from "zod";
import { Locale, ItemCondition } from "../../../generated/prisma/enums";

// ---------- Product ----------

const productTranslationSchema = z.object({
  locale: z.enum([Locale.EN, Locale.BN]),
  name: z.string().min(1, "Product name is required").max(300),
});

const deductionTranslationSchema = z.object({
  locale: z.enum([Locale.EN, Locale.BN]),
  label: z.string().min(1, "Label is required").max(200),
});

const deductionSchema = z.object({
  condition: z.enum([ItemCondition.NEW, ItemCondition.USED]),
  amount: z.number().nonnegative("Amount must be non-negative"),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(deductionTranslationSchema)
    .min(1, "At least one translation is required"),
});

const variantSchema = z.object({
  sku: z.string().max(50).optional(),
  storage: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  newPrice: z.number().nonnegative().optional(),
  usedPrice: z.number().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  maxQuantityPerOrder: z.number().int().positive().optional(),
  dailyPurchaseLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  deductions: z.array(deductionSchema).optional(),
});

export const createProductZodSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(150),
  categoryId: z.string().min(1, "Category ID is required"),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(productTranslationSchema)
    .min(1, "At least one translation is required"),
  variants: z.array(variantSchema).optional(),
});

export const updateProductZodSchema = z.object({
  slug: z.string().min(1).max(150).optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(productTranslationSchema).optional(),
});

export const listProductQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.string().optional(),
  locale: z.enum([Locale.EN, Locale.BN]).optional(),
});

// ---------- Variant ----------

export const createVariantZodSchema = variantSchema;

export const updateVariantZodSchema = z.object({
  sku: z.string().max(50).optional(),
  storage: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  newPrice: z.number().nonnegative().optional(),
  usedPrice: z.number().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  maxQuantityPerOrder: z.number().int().positive().optional(),
  dailyPurchaseLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const listVariantQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  productId: z.string().optional(),
  storage: z.string().optional(),
  isActive: z.string().optional(),
});

// ---------- Deduction ----------

export const createDeductionZodSchema = z.object({
  condition: z.enum([ItemCondition.NEW, ItemCondition.USED]),
  amount: z.number().nonnegative("Amount must be non-negative"),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(deductionTranslationSchema)
    .min(1, "At least one translation is required"),
});

export const updateDeductionZodSchema = z.object({
  condition: z.enum([ItemCondition.NEW, ItemCondition.USED]).optional(),
  amount: z.number().nonnegative().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(deductionTranslationSchema).optional(),
});

// ---------- Price Update ----------

export const updatePriceZodSchema = z.object({
  condition: z.enum([ItemCondition.NEW, ItemCondition.USED]),
  newPrice: z.number().nonnegative("Price must be non-negative"),
});
