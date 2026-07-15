import { z } from "zod";

export const createFaqZodSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateFaqZodSchema = z.object({
  question: z.string().min(1, "Question is required").optional(),
  answer: z.string().min(1, "Answer is required").optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listFaqQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});
