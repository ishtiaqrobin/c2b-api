import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IChangedPasswordPayload, ISession } from "./auth.interface";
import { UserStatus } from "../../../generated/prisma/enums";

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

/**
 * Revokes the better-auth session (server-side sign out).
 */
const logout = async (sessionToken: string) => {
  return auth.api.signOut({
    headers: new Headers({
      Cookie: `better-auth.session_token=${sessionToken}`,
    }),
  });
};

const changePassword = async (
  payload: IChangedPasswordPayload,
  headers: Headers,
) => {
  const { currentPassword, newPassword, revokeOtherSessions } = payload;
  try {
    const result = await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions },
      headers,
    });

    // update needPasswordChange to false
    if (result.user.needPasswordChange) {
      await prisma.user.update({
        where: {
          id: result.user.id,
        },
        data: {
          needPasswordChange: false,
        },
      });
    }

    return result;
  } catch (error: any) {
    console.error("Change Password API Error details:", error.body || error);
    throw new AppError(
      status.BAD_REQUEST,
      error.body?.message || "Failed to change password",
    );
  }
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

  if (isUserExits.isBanned) {
    throw new AppError(status.FORBIDDEN, "Your account has been banned");
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
  getMe,
  logout,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
};
