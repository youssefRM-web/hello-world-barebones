import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { Issue } from "@/types";
import { useCurrentUserQuery } from "@/hooks/queries";
import { toast } from "sonner";

interface IssueSocketOptions {
  onIssueCreated?: (issue: Issue) => void;
  onIssueUpdated?: (issue: Issue) => void;
  showToasts?: boolean;
}

/**
 * Hook for real-time issue updates via WebSocket
 * Automatically invalidates React Query cache when issues change
 */
export function useIssueSocket(options: IssueSocketOptions = {}) {
  const { onIssueCreated, onIssueUpdated, showToasts = true } = options;
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();
  const organizationId = currentUser?.Organization_id?._id;

  // Handle new issue created
  const handleIssueCreated = useCallback(
    (issue: Issue) => {

      // Invalidate all issue-related queries to refresh counts and lists
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["issues-infinite"] });

      // Show toast notification
      if (showToasts) {
        toast.info("New Issue Reported", {
          description: issue.issue_summary || "A new issue has been reported",
        });
      }

      // Call custom handler if provided
      onIssueCreated?.(issue);
    },
    [queryClient, onIssueCreated, showToasts]
  );

  // Handle issue updated
  const handleIssueUpdated = useCallback(
    (issue: Issue) => {

      // Invalidate all issue-related queries
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["issues-infinite"] });

      // Call custom handler if provided
      onIssueUpdated?.(issue);
    },
    [queryClient, onIssueUpdated]
  );

  // Setup socket connection with event handlers
  const { emit, isConnected } = useSocket(
    { namespace: "issues", autoJoinOrg: true },
    [
      { event: "issueCreated", handler: handleIssueCreated },
      { event: "issueUpdated", handler: handleIssueUpdated },
    ]
  );

  return {
    isConnected,
    emit,
  };
}
