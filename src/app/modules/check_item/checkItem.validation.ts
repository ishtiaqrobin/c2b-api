import { z } from "zod";

export const createCheckItemZodSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  content: z.string().min(1, "Content is required"),
  sortOrder: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().int().min(0).optional().default(0),
  ),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export const updateCheckItemZodSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  sortOrder: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().int().min(0).optional(),
  ),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});
