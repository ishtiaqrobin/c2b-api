import {
  NotificationChannel,
  NotificationStatus,
} from "../../../generated/prisma/enums";

export interface INotificationCreate {
  userId: string;
  type: string;
  channel?: NotificationChannel;
  subject?: string;
  body?: string;
}

export interface INotificationListQuery {
  page?: string;
  limit?: string;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  userId?: string;
  type?: string;
}
