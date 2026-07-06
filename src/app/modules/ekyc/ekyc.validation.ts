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
    EkycDocType.PASSPORT,
    EkycDocType.DRIVING_LICENSE,
    EkycDocType.MY_NUMBER,
    EkycDocType.RESIDENCE_CARD,
  ]),
});

export const listEkycQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});
