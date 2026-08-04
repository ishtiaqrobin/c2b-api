import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IPayoutUpdate } from "./user.interface";

const updatePayoutInfo = async (userId: string, payload: IPayoutUpdate) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { individualProfile: true, corporationProfile: true },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.individualProfile) {
    await prisma.individualProfile.update({
      where: { userId },
      data: {
        ...(payload.preferredPayoutMethod !== undefined && {
          preferredPayoutMethod: payload.preferredPayoutMethod,
        }),
        ...(payload.bkashNumber !== undefined && {
          bkashNumber: payload.bkashNumber,
        }),
        ...(payload.nagadNumber !== undefined && {
          nagadNumber: payload.nagadNumber,
        }),
        ...(payload.bankAccountName !== undefined && {
          bankAccountName: payload.bankAccountName,
        }),
        ...(payload.bankAccountNumber !== undefined && {
          bankAccountNumber: payload.bankAccountNumber,
        }),
        ...(payload.bankAccountBranch !== undefined && {
          bankAccountBranch: payload.bankAccountBranch,
        }),
      },
    });
  } else if (user.corporationProfile) {
    await prisma.corporationProfile.update({
      where: { userId },
      data: {
        ...(payload.bankAccountName !== undefined && {
          bankAccountName: payload.bankAccountName,
        }),
        ...(payload.bankAccountNumber !== undefined && {
          bankAccountNumber: payload.bankAccountNumber,
        }),
        ...(payload.bankAccountBranch !== undefined && {
          bankAccountBranch: payload.bankAccountBranch,
        }),
      },
    });
  } else {
    throw new AppError(status.BAD_REQUEST, "No profile found for this user");
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      accountType: true,
      individualProfile: {
        select: {
          preferredPayoutMethod: true,
          bkashNumber: true,
          nagadNumber: true,
          bankAccountName: true,
          bankAccountNumber: true,
          bankAccountBranch: true,
        },
      },
      corporationProfile: {
        select: {
          bankAccount: true,
          bankAccountBranch: true,
          bankAccountName: true,
          bankAccountNumber: true,
        },
      },
    },
  });
};

export const UserService = {
  updatePayoutInfo,
};