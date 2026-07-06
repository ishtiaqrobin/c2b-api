import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import { IStoreScope } from "../interfaces/requestUser.interface";

/**
 * Verifies the better-auth session cookie, loads the user with RBAC roles,
 * and attaches a normalized user object (with effective permissions and
 * store scopes) to req.user. No JWT involved.
 */
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionToken = cookieUtils.getCookie(
      req,
      "better-auth.session_token",
    );

    if (!sessionToken) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized access! No session token provided",
      );
    }

    // better-auth stores the cookie value as "<token>.<signature>";
    // the DB holds only the token part before the dot.
    const rawToken = sessionToken.split(".")[0];

    const session = await prisma.session.findFirst({
      where: {
        token: rawToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized access! Invalid or expired session",
      );
    }

    const user = session.user;

    if (user.isDeleted) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized access! Your account has been deleted",
      );
    }

    if (!user.emailVerified) {
      throw new AppError(
        status.FORBIDDEN,
        "Please verify your email before continuing",
      );
    }

    // Build effective permissions + store scopes from RBAC roles.
    const permissionSet = new Set<string>();
    const storeScopes: IStoreScope[] = [];

    for (const userRole of user.roles) {
      storeScopes.push({
        roleKey: userRole.role.key,
        storeId: userRole.storeId,
      });
      for (const rp of userRole.role.permissions) {
        permissionSet.add(rp.permission.key);
      }
    }

    req.user = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      permissions: Array.from(permissionSet),
      storeScopes,
    };

    next();
  } catch (error) {
    next(error);
  }
};
