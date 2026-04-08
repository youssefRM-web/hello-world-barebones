import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { TASKS_QUERY_KEY } from "@/hooks/queries/useTasksQuery";
import { toast } from "sonner";

interface AcceptedIssueSocketOptions {
  onAcceptedIssueCreated?: (issue: any) => void;
  onAcceptedIssueUpdated?: (issue: any) => void;
  onAcceptedIssueDeleted?: (data: { id: string }) => void;
  showToasts?: boolean;
}

/**
 * Hook for real-time accepted issue updates via WebSocket.
 * Connects to the "accepted-issues" namespace.
 */
export function useAcceptedIssueSocket(options: AcceptedIssueSocketOptions = {}) {
  const {
    onAcceptedIssueCreated,
    onAcceptedIssueUpdated,
    onAcceptedIssueDeleted,
    showToasts = true,
  } = options;
  const queryClient = useQueryClient();

  const handleCreated = useCallback(
    (acceptedIssue: any) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-issues-count"] });
      queryClient.invalidateQueries({ queryKey: ["reference-data"] });

      onAcceptedIssueCreated?.(acceptedIssue);
    },
    [queryClient, onAcceptedIssueCreated, showToasts]
  );

  const handleUpdated = useCallback(
    (acceptedIssue: any) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["reference-data"] });

      onAcceptedIssueUpdated?.(acceptedIssue);
    },
    [queryClient, onAcceptedIssueUpdated]
  );

  const handleDeleted = useCallback(
    (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["reference-data"] });


      onAcceptedIssueDeleted?.(data);
    },
    [queryClient, onAcceptedIssueDeleted, showToasts]
  );

  const { emit, isConnected } = useSocket(
    { namespace: "accepted-issues", autoJoinOrg: true },
    [
      { event: "acceptedIssueCreated", handler: handleCreated },
      { event: "acceptedIssueUpdated", handler: handleUpdated },
      { event: "acceptedIssueDeleted", handler: handleDeleted },
    ]
  );

  return { emit, isConnected };
}
