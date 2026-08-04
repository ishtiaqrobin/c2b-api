import { z } from "zod";
import { EkycStatus, EkycDocType } from "../../../generated/prisma/enums";

export const updateEkycZodSchema = z
  .object({
    status: z.enum([EkycStatus.VERIFIED, EkycStatus.REJECTED]),
    rejectReason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === EkycStatus.REJECTED && !data.rejectReason) {
        return false;
      }
      return true;
    },
    { message: "rejectReason is required when status is REJECTED" },
  );

export const uploadDocumentZodSchema = z.object({
  docType: z.enum([
    EkycDocType.NID,
    EkycDocType.SMART_CARD,
    EkycDocType.PASSPORT,
    EkycDocType.DRIVING_LICENSE,
    EkycDocType.BIRTH_CERTIFICATE,
    EkycDocType.TIN_CERTIFICATE,
    EkycDocType.TRADE_LICENSE,
    EkycDocType.UTILITY_BILL,
  ]),
});

export const listEkycQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});
