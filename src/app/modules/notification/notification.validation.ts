import { z } from "zod";
import {
  NotificationChannel,
  NotificationStatus,
} from "../../../generated/prisma/enums";

export const createNotificationZodSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.string().min(1, "Notification type is required"),
  channel: z
    .enum([
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.IN_APP,
    ])
    .optional(),
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
});

export const listNotificationQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  channel: z.string().optional(),
  userId: z.string().optional(),
  type: z.string().optional(),
});

export const deleteNotificationsZodSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, "At least one notification id is required")
    .max(100, "Cannot delete more than 100 notifications at once"),
});
