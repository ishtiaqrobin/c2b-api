import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import {
  IChangedPasswordPayload,
  ILoginUserPayload,
  IRegisterCorporationPayload,
  IRegisterIndividualPayload,
  IRegisterPayload,
  IRegisterUserPayload,
  ISession,
} from "./auth.interface";
import {
  AccountType,
  QualifiedInvoiceStatus,
  UserStatus,
} from "../../../generated/prisma/enums";
import { tokenUtils } from "../../utils/token";
import { jwtUtils } from "../../utils/jwt";
import { env } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const registerUser = async (payload: IRegisterPayload) => {
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
            qualifiedInvoiceStatus:
              p.qualifiedInvoiceStatus ?? QualifiedInvoiceStatus.NOT_APPLICABLE,
            fullName: p.profile.fullName,
            telephone: p.profile.telephone,
            dateOfBirth: new Date(p.profile.dateOfBirth),
            sex: p.profile.sex,
            occupation: p.profile.occupation,
            postCode: p.profile.postCode,
            districtId: p.profile.districtId,
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
            qualifiedInvoiceStatus:
              p.qualifiedInvoiceStatus ?? QualifiedInvoiceStatus.NOT_APPLICABLE,
            companyName: p.company.companyName,
            companyTelephone: p.company.companyTelephone,
            companyPostCode: p.company.companyPostCode,
            companyDistrictId: p.company.companyDistrictId,
            companyCityTownVillage: p.company.companyCityTownVillage,
            companyStreetAddress: p.company.companyStreetAddress,
            companyApartment: p.company.companyApartment,
            contactName: p.contact.contactName,
            contactTelephone: p.contact.contactTelephone,
            contactDateOfBirth: new Date(p.contact.contactDateOfBirth),
            contactSex: p.contact.contactSex,
            contactOccupation: p.contact.contactOccupation,
            contactPostCode: p.contact.contactPostCode,
            contactDistrictId: p.contact.contactDistrictId,
            contactCityTownVillage: p.contact.contactCityTownVillage,
            contactStreetAddress: p.contact.contactStreetAddress,
            contactApartment: p.contact.contactApartment,
            bankAccount: p.contact.bankAccount,
            bankAccountBranch: p.contact.bankAccountBranch,
            bankAccountType: p.contact.bankAccountType,
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

  // 4. Fetch a safe view (no password/session data) to return to the client.
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
      accountType: true,
      emailVerified: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      individualProfile: true,
      corporationProfile: true,
    },
  });

  if (!userProfile) {
    throw new AppError(status.NOT_FOUND, "User not found after creation");
  }

  // 5. Issue our own JWTs so the client is authenticated immediately
  //    after registration (no separate login call required).
  const accessToken = tokenUtils.getAccessToken({
    userId: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    status: userProfile.status,
    isDeleted: userProfile.isDeleted,
    emailVerified: userProfile.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    status: userProfile.status,
    isDeleted: userProfile.isDeleted,
    emailVerified: userProfile.emailVerified,
  });

  // `token` here is better-auth's own session token (kept only because the
  // controller still sets a better-auth session cookie alongside our JWTs).
  return {
    ...userProfile,
    token: created.token,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

/**
 * Returns the current authenticated user's profile.
 * req.user is already populated by checkAuth (session-based).
 */
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
      status: true,
      needPasswordChange: true,
      isActive: true,
      isBanned: true,
      isDeleted: true,
      ekyc: { select: { status: true } },
      individualProfile: true,
      corporationProfile: true,
      roles: {
        select: {
          storeId: true,
          role: { select: { key: true, name: true } },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "Your account has been deleted");
  }

  return user;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    env.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const changePassword = async (
  payload: IChangedPasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: { email, otp },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.FORBIDDEN, "Email not verified");
  }

  if (isUserExist.isBanned) {
    throw new AppError(status.FORBIDDEN, "Your account has been banned");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.forgetPasswordEmailOTP({
    body: {
      email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExits = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExits) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExits.emailVerified) {
    throw new AppError(status.FORBIDDEN, "Email not verified");
  }

  if (isUserExits.isDeleted || isUserExits.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (isUserExits.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExits.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: isUserExits.id,
    },
  });
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
};
