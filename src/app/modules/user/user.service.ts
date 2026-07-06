import status from "http-status";
import { AccountType } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  IRegisterPayload,
  IRegisterIndividualPayload,
  IRegisterCorporationPayload,
} from "./user.interface";

const register = async (payload: IRegisterPayload) => {
  // 1. Ensure email is not already used.
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) {
    throw new AppError(
      status.CONFLICT,
      "A user with this email already exists",
    );
  }

  // 2. Create the base user via better-auth (handles password hashing,
  //    triggers email verification OTP). userType is forced to CUSTOMER
  //    by the database hook in auth.ts.
  const created = await auth.api.signUpEmail({
    body: {
      email: payload.email,
      password: payload.password,
      name: payload.name,
    },
  });

  const userId = created.user.id;

  // 3. Create the profile (Individual or Corporation) in a transaction.
  //    If it fails, delete the base user to avoid orphans.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { accountType: payload.accountType },
      });

      if (payload.accountType === AccountType.INDIVIDUAL) {
        const p = payload as IRegisterIndividualPayload & {
          accountType: typeof AccountType.INDIVIDUAL;
        };
        await tx.individualProfile.create({
          data: {
            userId,
            qualifiedInvoiceStatus: p.qualifiedInvoiceStatus ?? undefined,
            fullName: p.profile.fullName,
            telephone: p.profile.telephone,
            dateOfBirth: new Date(p.profile.dateOfBirth),
            sex: p.profile.sex,
            occupation: p.profile.occupation,
            postCode: p.profile.postCode,
            prefectureId: p.profile.prefectureId,
            cityTownVillage: p.profile.cityTownVillage,
            streetAddress: p.profile.streetAddress,
            apartment: p.profile.apartment,
          },
        });
      } else {
        const p = payload as IRegisterCorporationPayload & {
          accountType: typeof AccountType.CORPORATION;
        };
        await tx.corporationProfile.create({
          data: {
            userId,
            qualifiedInvoiceStatus: p.qualifiedInvoiceStatus ?? undefined,
            companyName: p.company.companyName,
            companyTelephone: p.company.companyTelephone,
            companyPostCode: p.company.postCode,
            companyPrefectureId: p.company.prefectureId,
            companyCityTownVillage: p.company.cityTownVillage,
            companyStreetAddress: p.company.streetAddress,
            companyApartment: p.company.apartment,
            contactName: p.contact.contactName,
            contactTelephone: p.contact.contactTelephone,
            contactDateOfBirth: new Date(p.contact.contactDateOfBirth),
            contactSex: p.contact.contactSex,
            contactOccupation: p.contact.contactOccupation,
            contactPostCode: p.contact.contactPostCode,
            contactPrefectureId: p.contact.contactPrefectureId,
            contactCityTownVillage: p.contact.contactCityTownVillage,
            contactStreetAddress: p.contact.contactStreetAddress,
            contactApartment: p.contact.contactApartment,
            bankAccount: p.contact.bankAccount,
            bankAccountNumber: p.contact.bankAccountNumber,
            bankAccountName: p.contact.bankAccountName,
          },
        });
      }
    });
  } catch (error) {
    console.error(error);
    // Roll back the auth user so registration can be retried cleanly.
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to complete registration. Please try again.",
    );
  }

  // 4. Return a safe view (no password/session data).
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
      accountType: true,
      emailVerified: true,
      createdAt: true,
      individualProfile: true,
      corporationProfile: true,
    },
  });

  return result;
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      userType: true,
      accountType: true,
      emailVerified: true,
      ekyc: { select: { status: true } },
      individualProfile: true,
      corporationProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user === null) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

export const UserService = {
  register,
  getMe,
};
