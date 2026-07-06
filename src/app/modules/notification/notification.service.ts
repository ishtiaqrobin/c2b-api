import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import {
  NotificationChannel,
  NotificationStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  INotificationCreate,
  INotificationListQuery,
} from "./notification.interface";

const getMyNotifications = async (
  userId: string,
  query: INotificationListQuery,
) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(query.status ? { status: query.status as NotificationStatus } : {}),
    ...(query.channel ? { channel: query.channel as NotificationChannel } : {}),
    ...(query.type ? { type: query.type } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getNotificationById = async (id: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  return notification;
};

const markAsRead = async (id: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  if (notification.status === NotificationStatus.SENT) {
    throw new AppError(status.BAD_REQUEST, "Notification already sent");
  }

  return prisma.notification.update({
    where: { id },
    data: {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    },
  });
};

const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      status: NotificationStatus.PENDING,
    },
    data: {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    },
  });

  return result.count;
};

const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      status: NotificationStatus.PENDING,
    },
  });

  return count;
};

// Admin: list all notifications
const listAllNotifications = async (query: INotificationListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.NotificationWhereInput = {
    ...(query.status ? { status: query.status as NotificationStatus } : {}),
    ...(query.channel ? { channel: query.channel as NotificationChannel } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.type ? { type: query.type } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// Admin: create notification
const createNotification = async (payload: INotificationCreate) => {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      channel: payload.channel ?? NotificationChannel.EMAIL,
      subject: payload.subject,
      body: payload.body,
    },
  });

  return notification;
};

// Admin: get notification by ID (any user)
const getAdminNotificationById = async (id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!notification) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  return notification;
};

// Admin: delete notification
const deleteNotification = async (id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  await prisma.notification.delete({ where: { id } });

  return notification;
};

export const NotificationService = {
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
