import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  validateQuery,
  validateRequest,
} from "../../middleware/validateRequest";
import {
  createNotificationZodSchema,
  listNotificationQueryZodSchema,
} from "./notification.validation";

const router = Router();

// Customer: get my notifications
router.get(
  "/my",
  checkAuth,
  validateQuery(listNotificationQueryZodSchema),
  NotificationController.getMyNotifications,
);

// Customer: get unread count
router.get(
  "/my/unread-count",
  checkAuth,
  NotificationController.getUnreadCount,
);

// Customer: get single notification
router.get("/my/:id", checkAuth, NotificationController.getNotificationById);

// Customer: mark as read
router.patch("/my/:id/read", checkAuth, NotificationController.markAsRead);

// Customer: mark all as read
router.patch("/my/read-all", checkAuth, NotificationController.markAllAsRead);

// Admin: list all notifications
router.get(
  "/",
  checkAuth,
  requirePermission("notification.manage"),
  validateQuery(listNotificationQueryZodSchema),
  NotificationController.listAllNotifications,
);

// Admin: create notification
router.post(
  "/",
  checkAuth,
  requirePermission("notification.manage"),
  validateRequest(createNotificationZodSchema),
  NotificationController.createNotification,
);

// Admin: get any notification by ID
router.get(
  "/:id",
  checkAuth,
  requirePermission("notification.manage"),
  NotificationController.getAdminNotificationById,
);

// Admin: delete notification
router.delete(
  "/:id",
  checkAuth,
  requirePermission("notification.manage"),
  NotificationController.deleteNotification,
);

export const NotificationRoutes = router;
