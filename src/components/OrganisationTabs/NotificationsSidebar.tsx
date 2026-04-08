import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationsQuery, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useUnreadCountQuery } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";
import { de, enUS } from "date-fns/locale";
import type { Notification } from "@/services/notificationService";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const resolveNotificationText = (
  key: string | undefined,
  fallback: string | undefined,
  t: (key: string) => string,
  data?: Record<string, any>
): string => {
  if (!key) return fallback || "";
  let translated = t(`notification.${key}`);
  if (translated === `notification.${key}`) translated = fallback || key;
  if (data) {
    translated = translated.replace(/\{(\w+)\}/g, (_, p) => data[p] || "");
  }
  return translated;
};

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsSidebar: React.FC<NotificationsSidebarProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotificationsQuery({ limit: 50 }, isOpen);
  const { data: unreadCount = 0 } = useUnreadCountQuery(isOpen);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    const taskLink = notification.data?.taskLink;
    if (taskLink) {
      onClose();
      navigate(taskLink);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: language === "de" ? de : enUS });
    } catch {
      return timestamp;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_MENTIONED":
        return "🎯";
      case "TASK_CREATED":
      case "TASK_UPDATED":
        return "📝";
      case "TASK_STATUS_CHANGED":
        return "🔄";
      case "COMMENT_ADDED":
      case "COMMENT_REPLY":
        return "💬";
      case "BUILDING_ASSIGNED":
        return "🏢";
      default:
        return "🔔";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        style={{margin : 0}}
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-background border-l shadow-xl z-50 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold text-lg">{t("organisation.allNotifications")}</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {unreadCount > 0 && (
          <div className="p-3 border-b">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              {markAllAsReadMutation.isPending ? t("organisation.marking") : t("organisation.markAllAsRead")}
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">{t("organisation.noNotificationsYet")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("text-sm line-clamp-2", !notification.isRead && "font-medium")}>
                          {resolveNotificationText(notification.titleKey, notification.title, t, notification.data)}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {resolveNotificationText(notification.messageKey, notification.message, t, notification.data)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
};

export default NotificationsSidebar;
