import { z } from "zod";
import { EkycStatus } from "../../../generated/prisma/enums";

export const promoteStaffZodSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  displayName: z.string().optional(),
  roleId: z.string().optional(),
  storeId: z.string().nullable().optional(),
});

export const assignRoleZodSchema = z.object({
  roleId: z.string().min(1, "roleId is required"),
  storeId: z.string().nullable().optional(),
});

export const reviewEkycZodSchema = z
  .object({
    status: z.enum([EkycStatus.VERIFIED, EkycStatus.REJECTED]),
    rejectReason: z.string().optional(),
  })
  .refine(
    (d) => d.status !== EkycStatus.REJECTED || !!d.rejectReason,
    { message: "rejectReason is required when rejecting", path: ["rejectReason"] },
  );
