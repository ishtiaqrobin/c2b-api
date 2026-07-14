import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

const sortOrderSchema = (opts: { withDefault: boolean }) =>
  z.preprocess(
    emptyToUndefined,
    opts.withDefault
      ? z.coerce.number().int().min(0).optional().default(0)
      : z.coerce.number().int().min(0).optional(),
  );

export const createBuybackFeatureZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sortOrder: sortOrderSchema({ withDefault: true }),
});

export const updateBuybackFeatureZodSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  sortOrder: sortOrderSchema({ withDefault: false }),
});

export const listBuybackFeatureQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});
