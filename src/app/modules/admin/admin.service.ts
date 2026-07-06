import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import {
  UserType,
  EkycStatus,
  AuditAction,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  IAssignRolePayload,
  IListUsersQuery,
  IPromoteStaffPayload,
  IReviewEkycPayload,
} from "./admin.interface";
import { writeAuditLog } from "../../utils/auditLog";

// Promote a CUSTOMER to STAFF and create their AdminProfile.
const promoteToStaff = async (
  payload: IPromoteStaffPayload,
  actingUserId: string,
) => {
  const target = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!target || target.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (target.userType === UserType.STAFF) {
    throw new AppError(status.CONFLICT, "User is already a staff member");
  }

  // If a role is requested, make sure it exists before the transaction.
  if (payload.roleId) {
    const role = await prisma.role.findUnique({
      where: { id: payload.roleId },
    });
    if (!role) throw new AppError(status.NOT_FOUND, "Role not found");
  }
  if (payload.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: payload.storeId },
    });
    if (!store) throw new AppError(status.NOT_FOUND, "Store not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: { userType: UserType.STAFF },
    });

    await tx.adminProfile.upsert({
      where: { userId: target.id },
      update: { isActive: true, displayName: payload.displayName },
      create: {
        userId: target.id,
        displayName: payload.displayName,
        isActive: true,
      },
    });

    if (payload.roleId) {
      const existingRole = await tx.userRole.findFirst({
        where: {
          userId: target.id,
          roleId: payload.roleId,
          storeId: payload.storeId ?? null,
        },
      });

      if (!existingRole) {
        await tx.userRole.create({
          data: {
            userId: target.id,
            roleId: payload.roleId,
            storeId: payload.storeId ?? null,
            assignedBy: actingUserId,
          },
        });
      }
    }

    return tx.user.findUnique({
      where: { id: target.id },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        adminProfile: true,
        roles: {
          select: {
            storeId: true,
            role: { select: { key: true, name: true } },
          },
        },
      },
    });
  });
};

// Assign a role (optionally store-scoped) to a user.
const assignRole = async (
  userId: string,
  payload: IAssignRolePayload,
  actingUserId: string,
) => {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (target.userType !== UserType.STAFF) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only staff users can be assigned roles. Promote the user first.",
    );
  }

  const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
  if (!role) throw new AppError(status.NOT_FOUND, "Role not found");

  if (payload.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: payload.storeId },
    });
    if (!store) throw new AppError(status.NOT_FOUND, "Store not found");
  }

  const existingRole = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId: payload.roleId,
      storeId: payload.storeId ?? null,
    },
  });

  if (!existingRole) {
    return prisma.userRole.create({
      data: {
        userId,
        roleId: payload.roleId,
        storeId: payload.storeId ?? null,
        assignedBy: actingUserId,
      },
    });
  }

  return existingRole;
};

// Revoke a role assignment by its UserRole id.
const revokeRole = async (userRoleId: string) => {
  const existing = await prisma.userRole.findUnique({
    where: { id: userRoleId },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Role assignment not found");
  }
  await prisma.userRole.delete({ where: { id: userRoleId } });
  return { id: userRoleId };
};

// List users with filters + pagination.
const listUsers = async (query: IListUsersQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(query.userType ? { userType: query.userType } : {}),
    ...(typeof query.isDeleted === "boolean"
      ? { isDeleted: query.isDeleted }
      : {}),
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: "insensitive" } },
            { name: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        accountType: true,
        emailVerified: true,
        isDeleted: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// Soft delete a user (and revoke active sessions).
// const softDeleteUser = async (userId: string, actingUserId: string) => {
//   if (userId === actingUserId) {
//     throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
//   }

//   const target = await prisma.user.findUnique({ where: { id: userId } });
//   if (!target) throw new AppError(status.NOT_FOUND, "User not found");
//   if (target.isDeleted) {
//     throw new AppError(status.CONFLICT, "User is already deleted");
//   }

//   return prisma.$transaction(async (tx) => {
//     const updated = await tx.user.update({
//       where: { id: userId },
//       data: { isDeleted: true, deletedAt: new Date() },
//       select: { id: true, email: true, isDeleted: true, deletedAt: true },
//     });
//     // Force logout everywhere.
//     await tx.session.deleteMany({ where: { userId } });
//     return updated;
//   });
// };

// ... softDeleteUser এ, transaction এর পরে:

const softDeleteUser = async (
  userId: string,
  actingUserId: string,
  ipAddress?: string,
) => {
  if (userId === actingUserId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new AppError(status.NOT_FOUND, "User not found");
  if (target.isDeleted) {
    throw new AppError(status.CONFLICT, "User is already deleted");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date() },
      select: { id: true, email: true, isDeleted: true, deletedAt: true },
    });
    await tx.session.deleteMany({ where: { userId } });
    return u;
  });

  await writeAuditLog({
    actingUserId,
    action: AuditAction.DELETE,
    entityType: "User",
    entityId: userId,
    description: `Soft-deleted user ${target.email}`,
    before: { isDeleted: target.isDeleted },
    after: { isDeleted: true },
    ipAddress,
  });

  return updated;
};

// ... reviewEkyc এ:
const reviewEkyc = async (
  userId: string,
  payload: IReviewEkycPayload,
  actingUserId: string,
  ipAddress?: string,
) => {
  const ekyc = await prisma.ekyc.findUnique({ where: { userId } });
  if (!ekyc) throw new AppError(status.NOT_FOUND, "eKYC submission not found");

  const updated = await prisma.ekyc.update({
    where: { userId },
    data: {
      status: payload.status,
      rejectReason:
        payload.status === EkycStatus.REJECTED ? payload.rejectReason : null,
      verifiedAt: payload.status === EkycStatus.VERIFIED ? new Date() : null,
    },
  });

  await writeAuditLog({
    actingUserId,
    action: AuditAction.EKYC_REVIEW,
    entityType: "Ekyc",
    entityId: ekyc.id,
    description: `eKYC ${payload.status} for user ${userId}`,
    before: { status: ekyc.status },
    after: { status: payload.status },
    ipAddress,
  });

  return updated;
};

const restoreUser = async (userId: string) => {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new AppError(status.NOT_FOUND, "User not found");
  if (!target.isDeleted) {
    throw new AppError(status.CONFLICT, "User is not deleted");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isDeleted: false, deletedAt: null },
    select: { id: true, email: true, isDeleted: true },
  });
};

// Review a user's eKYC submission.
// const reviewEkyc = async (userId: string, payload: IReviewEkycPayload) => {
//   const ekyc = await prisma.ekyc.findUnique({ where: { userId } });
//   if (!ekyc) throw new AppError(status.NOT_FOUND, "eKYC submission not found");

//   return prisma.ekyc.update({
//     where: { userId },
//     data: {
//       status: payload.status,
//       rejectReason:
//         payload.status === EkycStatus.REJECTED ? payload.rejectReason : null,
//       verifiedAt: payload.status === EkycStatus.VERIFIED ? new Date() : null,
//     },
//   });
// };

const getAuditLogs = async (page = 1, limit = 20) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: (p - 1) * l,
      take: l,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count(),
  ]);
  return {
    data,
    meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
  };
};

export const AdminService = {
  promoteToStaff,
  assignRole,
  revokeRole,
  listUsers,
  softDeleteUser,
  restoreUser,
  reviewEkyc,
  getAuditLogs,
};
