import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  IUpdateMyProfilePayload,
  IPayoutUpdate,
} from "./user.interface";

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

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  image: true,
  userType: true,
  accountType: true,
  emailVerified: true,
  status: true,
  needPasswordChange: true,
  isActive: true,
  isBanned: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  ekyc: { select: { status: true } },
  adminProfile: true,
  individualProfile: true,
  corporationProfile: true,
  roles: {
    select: {
      storeId: true,
      role: { select: { key: true, name: true } },
    },
  },
} as const;

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "Your account has been deleted");
  }

  return user;
};

/**
 * Update the authenticated user's own profile. Accepts optional profile info
 * (name, image, admin displayName) plus an `individual` or `corporation`
 * sub-object — only the section matching the user's accountType is applied.
 */
const updateMyProfile = async (
  userId: string,
  payload: IUpdateMyProfilePayload,
  uploadedImageUrl?: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      individualProfile: true,
      corporationProfile: true,
      adminProfile: true,
    },
  });

  if (!user) throw new AppError(status.NOT_FOUND, "User not found");
  if (user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "Your account has been deleted");
  }

  const imageUrl = uploadedImageUrl ?? payload.image;

  await prisma.$transaction(async (tx) => {
    // Base user — name / avatar.
    if (payload.name !== undefined || imageUrl !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(payload.name !== undefined && { name: payload.name }),
          ...(imageUrl !== undefined && { image: imageUrl }),
        },
      });
    }

    // Admin/STAFF profile display name.
    if (payload.displayName !== undefined && user.adminProfile) {
      await tx.adminProfile.update({
        where: { userId },
        data: { displayName: payload.displayName },
      });
    }

    // Individual customer profile.
    if (payload.individual && user.individualProfile) {
      const p = payload.individual;

      const data: Record<string, unknown> = {};
      if (p.fullName !== undefined) data.fullName = p.fullName;
      if (p.telephone !== undefined) data.telephone = p.telephone;
      if (p.dateOfBirth !== undefined) {
        data.dateOfBirth = new Date(p.dateOfBirth);
      }
      if (p.sex !== undefined) data.sex = p.sex;
      if (p.occupation !== undefined) data.occupation = p.occupation;
      if (p.qualifiedInvoiceStatus !== undefined)
        data.qualifiedInvoiceStatus = p.qualifiedInvoiceStatus;
      if (p.postCode !== undefined) data.postCode = p.postCode;
      if (p.districtId !== undefined) data.districtId = p.districtId;
      if (p.cityTownVillage !== undefined)
        data.cityTownVillage = p.cityTownVillage;
      if (p.streetAddress !== undefined) data.streetAddress = p.streetAddress;
      if (p.apartment !== undefined) data.apartment = p.apartment;
      if (p.preferredPayoutMethod !== undefined)
        data.preferredPayoutMethod = p.preferredPayoutMethod;
      if (p.bkashNumber !== undefined) data.bkashNumber = p.bkashNumber;
      if (p.nagadNumber !== undefined) data.nagadNumber = p.nagadNumber;
      if (p.bankAccountName !== undefined)
        data.bankAccountName = p.bankAccountName;
      if (p.bankAccountNumber !== undefined)
        data.bankAccountNumber = p.bankAccountNumber;
      if (p.bankAccountBranch !== undefined)
        data.bankAccountBranch = p.bankAccountBranch;

      if (Object.keys(data).length > 0) {
        await tx.individualProfile.update({ where: { userId }, data });
      }
    }

    // Corporation customer profile.
    if (payload.corporation && user.corporationProfile) {
      const p = payload.corporation;

      const data: Record<string, unknown> = {};
      if (p.qualifiedInvoiceStatus !== undefined)
        data.qualifiedInvoiceStatus = p.qualifiedInvoiceStatus;
      if (p.companyName !== undefined) data.companyName = p.companyName;
      if (p.companyTelephone !== undefined)
        data.companyTelephone = p.companyTelephone;
      if (p.companyPostCode !== undefined)
        data.companyPostCode = p.companyPostCode;
      if (p.companyDistrictId !== undefined)
        data.companyDistrictId = p.companyDistrictId;
      if (p.companyCityTownVillage !== undefined)
        data.companyCityTownVillage = p.companyCityTownVillage;
      if (p.companyStreetAddress !== undefined)
        data.companyStreetAddress = p.companyStreetAddress;
      if (p.companyApartment !== undefined)
        data.companyApartment = p.companyApartment;
      if (p.contactName !== undefined) data.contactName = p.contactName;
      if (p.contactTelephone !== undefined)
        data.contactTelephone = p.contactTelephone;
      if (p.contactDateOfBirth !== undefined)
        data.contactDateOfBirth = new Date(p.contactDateOfBirth);
      if (p.contactSex !== undefined) data.contactSex = p.contactSex;
      if (p.contactOccupation !== undefined)
        data.contactOccupation = p.contactOccupation;
      if (p.contactPostCode !== undefined)
        data.contactPostCode = p.contactPostCode;
      if (p.contactDistrictId !== undefined)
        data.contactDistrictId = p.contactDistrictId;
      if (p.contactCityTownVillage !== undefined)
        data.contactCityTownVillage = p.contactCityTownVillage;
      if (p.contactStreetAddress !== undefined)
        data.contactStreetAddress = p.contactStreetAddress;
      if (p.contactApartment !== undefined)
        data.contactApartment = p.contactApartment;
      if (p.bankAccount !== undefined) data.bankAccount = p.bankAccount;
      if (p.bankAccountBranch !== undefined)
        data.bankAccountBranch = p.bankAccountBranch;
      if (p.bankAccountType !== undefined)
        data.bankAccountType = p.bankAccountType;
      if (p.bankAccountNumber !== undefined)
        data.bankAccountNumber = p.bankAccountNumber;
      if (p.bankAccountName !== undefined)
        data.bankAccountName = p.bankAccountName;

      if (Object.keys(data).length > 0) {
        await tx.corporationProfile.update({ data, where: { userId } });
      }
    }
  });

  return getMyProfile(userId);
};

export const UserService = {
  updatePayoutInfo,
  getMyProfile,
  updateMyProfile,
};