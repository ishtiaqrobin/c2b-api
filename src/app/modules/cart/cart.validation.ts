import { z } from "zod";
import { ItemCondition } from "../../../generated/prisma/enums";

export const addItemZodSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  condition: z.enum([ItemCondition.NEW, ItemCondition.LIKE_NEW, ItemCondition.USED, ItemCondition.DAMAGED]),
  quantity: z.number().int().min(1).max(99).optional().default(1),
  notes: z.string().max(500).optional(),
  deductionIds: z.array(z.string()).optional(),
});

export const updateItemZodSchema = z.object({
  quantity: z.number().int().min(1).max(99).optional(),
  condition: z.enum([ItemCondition.NEW, ItemCondition.LIKE_NEW, ItemCondition.USED, ItemCondition.DAMAGED]).optional(),
  notes: z.string().max(500).optional(),
  deductionIds: z.array(z.string()).optional(),
});

export const removeItemsZodSchema = z.object({
  itemIds: z.array(z.string()).min(1, "At least one item ID is required"),
});
