import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ISession } from "./auth.interface";

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

/**
 * Runs once after a successful Google OAuth login.
 * Ensures the user is a storefront customer; no JWT issued (session only).
 * Profile (Individual/Corporation) is completed later via the user module.
 */
const googleLoginSuccess = async (session: ISession) => {
  if (session.user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "Your account has been deleted");
  }

  // Nothing extra to create here for now: the better-auth user record
  // (with userType=CUSTOMER enforced by the db hook) is sufficient.
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      userType: session.user.userType,
      emailVerified: session.user.emailVerified,
    },
  };
};

export const AuthService = {
  getMe,
  logout,
  googleLoginSuccess,
};
