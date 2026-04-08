import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { socketService } from "@/services/socketService";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Notification } from "@/services/notificationService";
import { toast } from "sonner";
import React from "react";
import { Bell } from "lucide-react";

/**
 * Hook for real-time notifications via WebSocket.
 * Connects to the "notifications" namespace.
 * The backend joins the user to a personal room (user:<userId>)
 * after receiving the "identify" event.
 */
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUserQuery();
  const { t } = useLanguage();

  // Use refs so event handlers always have latest values without re-triggering the effect
  const queryClientRef = useRef(queryClient);
  const navigateRef = useRef(navigate);
  const tRef = useRef(t);
  queryClientRef.current = queryClient;
  navigateRef.current = navigate;
  tRef.current = t;

  const userId = currentUser?._id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = socketService.connect("notifications", { userId });

    // Backend handleConnection doesn't auto-join from handshake auth,
    // so emit joinNotifications to join the user's private room
    const joinRoom = () => {
      socket.emit("joinNotifications", userId);
    };

    // Join on connect (and re-join on reconnect)
    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const resolveText = (
      key?: string,
      fallback?: string,
      notification?: any,
    ) => {
      if (!key) return fallback || "";

      let translated = tRef.current(`notification.${key}`);

      if (translated === `notification.${key}`) {
        translated = fallback || key;
      }
      
      // Merge all possible replacement sources
      const replacementSource = {
        ...(notification?.data || {}),
        ...(notification?.translationParams || {}),
        triggeredByName: notification?.triggeredByUserId
      ? `${notification.triggeredByUserId.Name} ${notification.triggeredByUserId.Last_Name}`
      : "",
      taskTitle: notification?.taskTitle ?? "",
      };

      translated = translated.replace(/\{(\w+)\}/g, (_, p) => {
        return replacementSource[p] ?? "";
      });

      return translated;
    };
    const onNotification = (notification: Notification) => {
      queryClientRef.current.invalidateQueries({ queryKey: ["notifications"] });
      queryClientRef.current.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });

      const taskLink = notification.data?.taskLink;
      const title = resolveText(
        notification.titleKey,
        notification.title,
        notification.data,
      );
      const message = resolveText(
        notification.messageKey,
        notification.message,
        notification.data,
      );

      toast(title || "New Notification", {
        description: <span className="text-gray-300">{message}</span>,
        icon: <Bell className="h-4 w-4 text-white" />,
        style: { background: "#0F4C7BFF", color: "white" },
        duration: 6000,
        action: taskLink
          ? {
              label: tRef.current("common.view") || "View",
              onClick: () => navigateRef.current(taskLink),
            }
          : undefined,
      });
    };

    const onUnreadCount = (data: { count: number }) => {
      queryClientRef.current.setQueryData(
        ["notifications", "unread-count"],
        (old: any) => {
          if (!old) return old;
          return { ...old, data: { unreadCount: data.count } };
        },
      );
    };

    // Listen to the gateway's event names
    socket.on("notificationCreated", onNotification);
    socket.on("unreadCountUpdated", onUnreadCount);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("notificationCreated", onNotification);
      socket.off("unreadCountUpdated", onUnreadCount);
      socket.offAny();
      socketService.disconnect("notifications");
    };
  }, [userId]);
}
