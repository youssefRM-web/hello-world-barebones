import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useCurrentUserQuery } from "@/hooks/queries";
import { apiService, endpoints } from "@/services/api";
import { Ticket } from "@/hooks/queries/useTicketsQuery";
import { useSocket } from "@/hooks/useSocket";
import { Issue } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useTabNotification } from "@/hooks/useTabNotification";
import { usePermissions } from "@/contexts/PermissionsContext";

interface NotificationBadgesContextType {
  newIssuesCount: number;
  unreadTicketsCount: number;
  markIssuesAsViewed: () => void;
  markTicketsAsViewed: () => void;
  incrementNewIssues: () => void;
  refreshNotifications: () => Promise<void>;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const NotificationBadgesContext = createContext<NotificationBadgesContextType | undefined>(undefined);

export const useNotificationBadges = () => {
  const context = useContext(NotificationBadgesContext);
  if (!context) {
    throw new Error("useNotificationBadges must be used within a NotificationBadgesProvider");
  }
  return context;
};

export const NotificationBadgesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: currentUser } = useCurrentUserQuery();
  const queryClient = useQueryClient();
  const { canAccess } = usePermissions();
  
  // Check if user has access to issues
  const hasIssuesAccess = canAccess("issues");
  
  // Tab notification hook for title blinking and native notifications
  const { notifyNewIssue, permissionStatus, requestPermission } = useTabNotification({
    originalTitle: 'Mendigo',
    alertTitle: '🔔 New reported issues!',
    notificationTitle: 'New Issue Reported',
    notificationBody: 'A new issue has been reported and needs attention.',
    notificationIcon: '/favicon.ico',
  });
  
  // Track new issues that arrive while user is away from dashboard
  // Persist to localStorage so count survives page refresh
  const [newIssuesCount, setNewIssuesCount] = useState<number>(
    () => {
      const stored = localStorage.getItem("newIssuesCount");
      return stored ? parseInt(stored, 10) || 0 : 0;
    }
  );
  const [unreadTicketsCount, setUnreadTicketsCount] = useState(0);
  const [lastViewedTicketsTimestamp, setLastViewedTicketsTimestamp] = useState<string | null>(
    () => localStorage.getItem("lastViewedTicketsTimestamp")
  );
  
  // Track if user has ever visited dashboard in this session (to avoid showing badge on initial load)
  const hasVisitedDashboard = useRef(false);
  // Track if user is currently on dashboard (set by components via markIssuesAsViewed)
  const isOnDashboard = useRef(false);

  // Handle new issue from WebSocket
  const handleIssueCreated = useCallback(
    (issue: Issue) => {
      // Skip notification if user doesn't have access to issues
      if (!hasIssuesAccess) {
        return;
      }
      
      
      // Increment count if user is NOT currently on the dashboard
      if (!isOnDashboard.current) {
        setNewIssuesCount((prev) => prev + 1);
      }
      
      // Trigger tab notification (title blink + native notification) if tab is hidden
      const issueSummary = issue.issue_summary || 'New issue reported';
      notifyNewIssue('New Issue Reported', issueSummary);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["issues-infinite"] });
    },
    [queryClient, notifyNewIssue, hasIssuesAccess]
  );

  // Handle issue updated from WebSocket
  const handleIssueUpdated = useCallback(
    (issue: Issue) => {
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["issues-infinite"] });
    },
    [queryClient]
  );

  // Setup WebSocket connection for issues
  useSocket(
    { namespace: "issues", autoJoinOrg: true },
    [
      { event: "issueCreated", handler: handleIssueCreated },
      { event: "issueUpdated", handler: handleIssueUpdated },
    ]
  );

  // Fetch unread tickets count
  const fetchUnreadTickets = useCallback(async () => {
    try {
      const response = await apiService.get<Ticket[]>(`${endpoints.support}/tickets`);
      
      const ticketsWithUnreadMessages = response.data.filter((ticket) => {
        const hasUnreadStaffMessages = ticket.messages?.some(
          (msg) => msg.isStaff && !msg.read
        );
        
        if (lastViewedTicketsTimestamp) {
          const ticketUpdated = new Date(ticket.updatedAt) > new Date(lastViewedTicketsTimestamp);
          return hasUnreadStaffMessages || ticketUpdated;
        }
        
        return hasUnreadStaffMessages;
      });

      setUnreadTicketsCount(ticketsWithUnreadMessages.length);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  }, [lastViewedTicketsTimestamp]);

  // Sync newIssuesCount to localStorage
  useEffect(() => {
    localStorage.setItem("newIssuesCount", String(newIssuesCount));
  }, [newIssuesCount]);

  // Refresh all notifications
  const refreshNotifications = useCallback(async () => {
    await fetchUnreadTickets();
  }, [fetchUnreadTickets]);

  const markIssuesAsViewed = useCallback(() => {
    setNewIssuesCount(0);
    localStorage.setItem("newIssuesCount", "0");
    hasVisitedDashboard.current = true;
    isOnDashboard.current = true;
  }, []);

  const incrementNewIssues = useCallback(() => {
    // Called when user leaves dashboard - mark as not on dashboard
    isOnDashboard.current = false;
  }, []);

  const markTicketsAsViewed = useCallback(() => {
    const timestamp = new Date().toISOString();
    setLastViewedTicketsTimestamp(timestamp);
    localStorage.setItem("lastViewedTicketsTimestamp", timestamp);
    setUnreadTicketsCount(0);
  }, []);

  return (
    <NotificationBadgesContext.Provider
      value={{
        newIssuesCount,
        unreadTicketsCount,
        markIssuesAsViewed,
        markTicketsAsViewed,
        incrementNewIssues,
        refreshNotifications,
        notificationPermission: permissionStatus,
        requestNotificationPermission: requestPermission,
      }}
    >
      {children}
    </NotificationBadgesContext.Provider>
  );
};
