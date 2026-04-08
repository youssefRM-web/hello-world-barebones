import { apiService } from "./api";

export interface Notification {
  _id: string;
  userId: string;
  title?: string;
  message?: string;
  titleKey?: string;
  messageKey?: string;
  type:
    | "TASK_ASSIGNED"
    | "TASK_MENTIONED"
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "TASK_DELETED"
    | "TASK_STATUS_CHANGED"
    | "COMMENT_ADDED"
    | "COMMENT_REPLY"
    | "BUILDING_ASSIGNED"
    | "GENERAL";
  data: {
    taskId?: string;
    commentId?: string;
    taskLink?: string;
    taskTitle?: string;
    buildingId?: string;
    triggeredByUserId?: {
      Name: string;
      Last_Name: string;
    };
    userFullName?: string;
    authorName?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationService = {
  // Fetch notifications for current user (uses JWT auth)
  getNotifications: (params?: {
    unread?: boolean;
    limit?: number;
    page?: number;
  }) => apiService.get<NotificationsResponse>("/notifications", { params }),

  // Get unread count for badge
  getUnreadCount: () =>
    apiService.get<UnreadCountResponse>("/notifications/unread-count"),

  // Mark single notification as read
  markAsRead: (id: string) =>
    apiService.patch<{ success: boolean; notification?: Notification }>(
      `/notifications/${id}/read`,
    ),

  // Mark all notifications as read
  markAllAsRead: () =>
    apiService.patch<{ success: boolean; message: string }>(
      "/notifications/read-all",
    ),
};
