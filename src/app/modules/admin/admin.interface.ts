import { EkycStatus } from "../../../generated/prisma/enums";

export interface IPromoteStaffPayload {
  userId: string;
  displayName?: string;
  // Optionally assign a role at promotion time.
  roleId?: string;
  storeId?: string | null;
}

export interface IAssignRolePayload {
  roleId: string;
  storeId?: string | null; // null/undefined = global scope
}

export interface IListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  userType?: "CUSTOMER" | "STAFF";
  isDeleted?: boolean;
}

export interface IReviewEkycPayload {
  status: typeof EkycStatus.VERIFIED | typeof EkycStatus.REJECTED;
  rejectReason?: string;
}
