import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { NotificationService } from "./notification.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// Customer: get my notifications
const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  //   const query =
  //     (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await NotificationService.getMyNotifications(
    user.userId,
    req.query,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notifications retrieved",
    data: result.data,
    meta: result.meta,
  });
});

// Customer: get single notification
const getNotificationById = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await NotificationService.getNotificationById(
    param(req, "id"),
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notification retrieved",
    data: result,
  });
});

// Customer: mark as read
const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await NotificationService.markAsRead(
    param(req, "id"),
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

// Customer: mark all as read
const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const count = await NotificationService.markAllAsRead(user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `${count} notifications marked as read`,
    data: { updatedCount: count },
  });
});

// Customer: get unread count
const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const count = await NotificationService.getUnreadCount(user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Unread count retrieved",
    data: { unreadCount: count },
  });
});

// Admin: list all notifications
const listAllNotifications = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  //   const query =
  //     (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await NotificationService.listAllNotifications(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notifications retrieved",
    data: result.data,
    meta: result.meta,
  });
});

// Admin: create notification
const createNotification = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await NotificationService.createNotification(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Notification created",
    data: result,
  });
});

// Admin: get any notification by ID
const getAdminNotificationById = catchAsync(
  async (req: Request, res: Response) => {
    ensureUser(req);
    const result = await NotificationService.getAdminNotificationById(
      param(req, "id"),
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Notification retrieved",
      data: result,
    });
  },
);

// Admin: delete notification
const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  await NotificationService.deleteNotification(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notification deleted",
    data: null,
  });
});

export const NotificationController = {
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  listAllNotifications,
  createNotification,
  getAdminNotificationById,
  deleteNotification,
};
