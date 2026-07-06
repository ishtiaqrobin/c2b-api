import { EkycStatus, EkycDocType } from "../../../generated/prisma/enums";

export interface IEkycUpdate {
  status: typeof EkycStatus.VERIFIED | typeof EkycStatus.REJECTED;
  rejectReason?: string;
}

export interface IEkycDocumentUpload {
  docType: EkycDocType;
}

export interface IEkycListQuery {
  page?: string;
  limit?: string;
  status?: EkycStatus;
  search?: string;
}
