import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminController } from "./admin.controller";
import { PERMISSIONS } from "../../utils/permissions";
import {
  promoteStaffZodSchema,
  assignRoleZodSchema,
  reviewEkycZodSchema,
} from "./admin.validation";

const router = Router();

// All admin routes require an authenticated session.
router.use(checkAuth);

// Staff & role governance.
router.post(
  "/staff",
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest(promoteStaffZodSchema),
  AdminController.promoteToStaff,
);

router.post(
  "/users/:userId/roles",
  requirePermission(PERMISSIONS.ROLE_MANAGE),
  validateRequest(assignRoleZodSchema),
  AdminController.assignRole,
);

router.delete(
  "/roles/:userRoleId",
  requirePermission(PERMISSIONS.ROLE_MANAGE),
  AdminController.revokeRole,
);

// User management.
router.get(
  "/users",
  requirePermission(PERMISSIONS.USER_VIEW),
  AdminController.listUsers,
);

router.patch(
  "/users/:userId/soft-delete",
  requirePermission(PERMISSIONS.USER_MANAGE),
  AdminController.softDeleteUser,
);

router.patch(
  "/users/:userId/restore",
  requirePermission(PERMISSIONS.USER_MANAGE),
  AdminController.restoreUser,
);

// eKYC review.
router.patch(
  "/users/:userId/ekyc",
  requirePermission(PERMISSIONS.EKYC_REVIEW),
  validateRequest(reviewEkycZodSchema),
  AdminController.reviewEkyc,
);

// Audit logs.
router.get(
  "/audit-logs",
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  AdminController.getAuditLogs,
);

export const AdminRoutes = router;
