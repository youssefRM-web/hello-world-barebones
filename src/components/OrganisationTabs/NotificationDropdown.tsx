import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ExternalLink } from "lucide-react";
import { de, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useUnreadCountQuery,
} from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/services/notificationService";
import NotificationsSidebar from "./NotificationsSidebar";
import { cn } from "@/lib/utils";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useLanguage } from "@/contexts/LanguageContext";

const resolveNotificationText = (
  key: string | undefined,
  fallback: string | undefined,
  t: (key: string) => string,
  notification?: Notification,
): string => {
  if (!key) return fallback || "";

  let translated = t(`notification.${key}`);
  if (translated === `notification.${key}`)
    translated = fallback || key;
  const replacementSource = {
    ...(notification?.data || {}),
    triggeredByName: notification?.data?.triggeredByUserId
    ? `${notification.data.triggeredByUserId.Name} ${notification.data.triggeredByUserId.Last_Name}`
    : "",
    taskTitle: notification?.data?.taskTitle ?? "",
  };
  
  return translated.replace(/\{(\w+)\}/g, (_, p) => {
    return replacementSource[p] ?? "";
  });
};

const NotificationDropdown = () => {
   const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useNotificationSocket();
  
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useNotificationsQuery({ limit: 5 }, isOpen);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    const taskLink = notification.data?.taskLink;
    if (taskLink) {
      setIsOpen(false);
      navigate(taskLink);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleSeeAllClick = () => {
    setIsOpen(false);
    setIsSidebarOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: language === "de" ? de : enUS });
    } catch {
      return timestamp;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_MENTIONED":
        return "bg-blue-100 text-blue-800";
      case "COMMENT_ADDED":
      case "COMMENT_REPLY":
        return "bg-green-100 text-green-800";
      case "BUILDING_ASSIGNED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 max-h-96 flex flex-col"
          align="end"
        >
          <div className="px-3 py-2 border-b shrink-0">
            <h3 className="font-semibold">{t("organisation.notifications")}</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount}{" "}
                {unreadCount !== 1
                  ? t("organisation.unreadNotifications")
                  : t("organisation.unreadNotification")}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("organisation.loadingNotifications")}
              </div>
            ) : error ? (
              <div className="px-3 py-6 text-center text-sm text-red-500">
                {t("organisation.failedToLoadNotifications")}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("organisation.noNotificationsYet")}
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className={cn(
                      "px-3 py-3 cursor-pointer",
                      !notification.isRead && "bg-primary/5",
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <h4
                            className={cn(
                              "text-sm line-clamp-2 first-letter:uppercase",
                              !notification.isRead && "font-medium",
                            )}
                          >
                            {resolveNotificationText(
                              notification.messageKey,
                              notification.message,
                              t,
                              notification,
                            )}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </div>

          <div className="shrink-0 border-t">
            {unreadCount > 0 && (
              <DropdownMenuItem
                className="px-3 py-2 text-center text-sm text-primary cursor-pointer justify-center"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending
                  ? t("organisation.marking")
                  : t("organisation.markAllAsRead")}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="px-3 py-2 text-center text-sm cursor-pointer justify-center gap-2"
              onClick={handleSeeAllClick}
            >
              <ExternalLink className="h-4 w-4" />
              {t("organisation.seeAllNotifications")}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default NotificationDropdown;
