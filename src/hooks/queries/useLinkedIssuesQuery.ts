import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { apiService, endpoints } from "@/services/api";
import { socketService } from "@/services/socketService";

interface IssueStatusHistory {
  status: string;
  timestamp: string;
  message?: string;
}

export interface LinkedIssue {
  _id: string;
  issue_summary: string;
  status: "pending" | "accepted" | "declined" | "To Do" | "In Progress" | "Done";
  taskStatus?: "TO_DO" | "IN_PROGRESS" | "DONE" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  attachements?: string[];
  statusHistory?: IssueStatusHistory[];
  isAccepted? : boolean
  doneOnce?: boolean
}

interface UseLinkedIssuesQueryParams {
  linkedToId?: string | null;
  organizationId?: string | null;
  enableWebSocket?: boolean;
}

/**
 * Hook for fetching issues linked to a specific space or asset
 * Supports real-time updates via WebSocket
 */
export const useLinkedIssuesQuery = ({
  linkedToId,
  organizationId,
  enableWebSocket = true,
}: UseLinkedIssuesQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["linked-issues", linkedToId],
    queryFn: async () => {
      if (!linkedToId) return [];

      const response = await apiService.get<LinkedIssue[]>(
        `${endpoints.issues}/linked/${linkedToId}`
      );

      return response.data || [];
    },
    enabled: !!linkedToId,
    refetchOnWindowFocus: true,
  });

  // Handle WebSocket events for real-time updates
  const handleIssueCreated = useCallback(
    (issue: any) => {
      // Check if this issue is linked to our space/asset
      if (issue.Linked_To === linkedToId || issue.Linked_To?._id === linkedToId) {
        queryClient.invalidateQueries({ queryKey: ["linked-issues", linkedToId] });
      }
    },
    [linkedToId, queryClient]
  );

  const handleIssueUpdated = useCallback(
    (issue: any) => {
      // Check if this issue is linked to our space/asset
      if (issue.Linked_To === linkedToId || issue.Linked_To?._id === linkedToId) {
        queryClient.invalidateQueries({ queryKey: ["linked-issues", linkedToId] });
      }
    },
    [linkedToId, queryClient]
  );

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket || !linkedToId || !organizationId) return;

    // Connect to issues namespace
    const socket = socketService.connect("issues");

    // Join organization room to receive updates
    socketService.joinOrganization("issues", organizationId);

    // Listen for issue events
    socketService.on("issues", "issueCreated", handleIssueCreated);
    socketService.on("issues", "issueUpdated", handleIssueUpdated);

    return () => {
      socketService.off("issues", "issueCreated", handleIssueCreated);
      socketService.off("issues", "issueUpdated", handleIssueUpdated);
    };
  }, [enableWebSocket, linkedToId, organizationId, handleIssueCreated, handleIssueUpdated]);

  return query;
};
