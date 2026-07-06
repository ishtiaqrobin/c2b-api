import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

// Roles that bypass all permission checks.
const SUPER_ADMIN_ROLE_KEY = "super_admin";

interface RequirePermissionOptions {
  storeScoped?: boolean;
  storeIdFrom?: "params" | "body" | "query";
  storeIdKey?: string;
}

export const requirePermission =
  (permission: string, options: RequirePermissionOptions = {}) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
      }

      // Super admin (global scope) bypasses every permission + store check.
      const isSuperAdmin = user.storeScopes.some(
        (s) => s.roleKey === SUPER_ADMIN_ROLE_KEY && s.storeId === null,
      );
      if (isSuperAdmin) {
        return next();
      }

      if (!user.permissions.includes(permission)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden! You don't have permission to perform this action",
        );
      }

      // Store-scope enforcement (e.g. a Store Manager limited to one store).
      if (options.storeScoped) {
        const { storeIdFrom = "params", storeIdKey = "storeId" } = options;
        const targetStoreId = (req[storeIdFrom] as Record<string, string>)?.[
          storeIdKey
        ];

        const hasGlobal = user.storeScopes.some((s) => s.storeId === null);
        const hasThisStore =
          !!targetStoreId &&
          user.storeScopes.some((s) => s.storeId === targetStoreId);

        if (!hasGlobal && !hasThisStore) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden! You can only manage your assigned store",
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
