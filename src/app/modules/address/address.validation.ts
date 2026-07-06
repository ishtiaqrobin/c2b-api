import { z } from "zod";
import { AddressType } from "../../../generated/prisma/enums";

export const createAddressZodSchema = z.object({
  type: z
    .enum([
      AddressType.HOME,
      AddressType.SHIPPING,
      AddressType.RETURN,
      AddressType.COMPANY,
    ])
    .optional(),
  label: z.string().max(50).optional(),
  recipientName: z.string().max(100).optional(),
  telephone: z.string().max(20).optional(),
  postCode: z.string().min(1, "Post code is required"),
  prefectureId: z.number().int().min(1, "Prefecture ID is required"),
  cityTownVillage: z.string().min(1, "City/Town/Village is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartment: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressZodSchema = z.object({
  type: z
    .enum([
      AddressType.HOME,
      AddressType.SHIPPING,
      AddressType.RETURN,
      AddressType.COMPANY,
    ])
    .optional(),
  label: z.string().max(50).optional(),
  recipientName: z.string().max(100).optional(),
  telephone: z.string().max(20).optional(),
  postCode: z.string().optional(),
  prefectureId: z.number().int().min(1).optional(),
  cityTownVillage: z.string().optional(),
  streetAddress: z.string().optional(),
  apartment: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export const listPrefectureQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});
