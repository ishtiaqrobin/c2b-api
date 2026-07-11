import { z } from "zod";

// Multer parses every form-data field as a string, so an untouched
// optional field arrives as "" rather than undefined. Normalize it
// before validation so `.optional()` actually works as expected.
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

const categoryIdSchema = z.preprocess(
  emptyToUndefined,
  z.string().optional().nullable(),
);

const linkUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().url("Invalid link URL").optional().nullable(),
);

const sortOrderSchema = (opts: { withDefault: boolean }) =>
  z.preprocess(
    emptyToUndefined,
    opts.withDefault
      ? z.coerce.number().int().min(0).optional().default(0)
      : z.coerce.number().int().min(0).optional(),
  );

const isActiveSchema = z.preprocess(
  emptyToUndefined,
  z
    .enum(["true", "false"], {
      error: "isActive must be 'true' or 'false'",
    })
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
);

export const createBannerZodSchema = z.object({
  categoryId: categoryIdSchema,
  linkUrl: linkUrlSchema,
  sortOrder: sortOrderSchema({ withDefault: true }),
  isActive: isActiveSchema,
});

export const updateBannerZodSchema = z.object({
  categoryId: categoryIdSchema,
  linkUrl: linkUrlSchema,
  sortOrder: sortOrderSchema({ withDefault: false }),
  isActive: isActiveSchema,
});

export const listBannerQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});
