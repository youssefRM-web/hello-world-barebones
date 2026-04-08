import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { Issue } from "@/types";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedIssuesResponse {
  data: Issue[];
  pagination: PaginationMeta;
}

interface UseIssuesQueryParams {
  organizationId?: string;
  buildingId?: string | null;
  buildingIds?: string[]; // For permission-scoped "All Buildings" filtering
  page?: number;
  limit?: number;
  status?: "pending" | "accepted" | "declined";
}

export const useIssuesQuery = ({ 
  organizationId, 
  buildingId,
  buildingIds,
  page = 1,
  limit = 10,
  status
}: UseIssuesQueryParams = {}) => {
  return useQuery({
    queryKey: ["issues", organizationId, buildingId ?? buildingIds?.join(",") ?? "all", page, limit, status],
    queryFn: async () => {
      if (!organizationId) {
        return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false } };
      }
      
      const params: Record<string, any> = { page, limit };
      if (buildingId) {
        params.buildingId = buildingId;
      } else if (buildingIds && buildingIds.length > 0) {
        params.buildingIds = buildingIds.join(",");
      }
      if (status) {
        params.status = status;
      }
      
      const response = await apiService.get<PaginatedIssuesResponse>(
        `/issue/organization/${organizationId}`,
        { params }
      );
      
      return response.data;
    },
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Infinite query for loading more issues
export const useInfiniteIssuesQuery = ({ 
  organizationId, 
  buildingId,
  limit = 10
}: Omit<UseIssuesQueryParams, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: ["issues-infinite", organizationId, buildingId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!organizationId) {
        return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false } };
      }
      
      const params: Record<string, any> = { page: pageParam, limit };
      if (buildingId) {
        params.buildingId = buildingId;
      }
      
      const response = await apiService.get<PaginatedIssuesResponse>(
        `/issue/organization/${organizationId}`,
        { params }
      );
      
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
  });
};

// Hook for pending issues count (for notification badge)
export const usePendingIssuesCountQuery = (organizationId?: string) => {
  return useQuery({
    queryKey: ["pending-issues-count", organizationId],
    queryFn: async () => {
      if (!organizationId) return 0;
      
      const response = await apiService.get<{ count: number }>(
        `/issue/organization/${organizationId}/pending-count`
      );
      
      return response.data.count;
    },
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });
};

// Hook for getting count of issues by status (for tab badges)
export const useIssuesCountByStatusQuery = ({ 
  organizationId, 
  buildingId,
  buildingIds,
  status
}: {
  organizationId?: string;
  buildingId?: string | null;
  buildingIds?: string[];
  status: "pending" | "accepted" | "declined";
}) => {
  return useQuery({
    queryKey: ["issues-count", organizationId, buildingId ?? buildingIds?.join(",") ?? "all", status],
    queryFn: async () => {
      if (!organizationId) return 0;
      
      const params: Record<string, any> = { page: 1, limit: 1, status };
      if (buildingId) {
        params.buildingId = buildingId;
      } else if (buildingIds && buildingIds.length > 0) {
        params.buildingIds = buildingIds.join(",");
      }
      
      const response = await apiService.get<PaginatedIssuesResponse>(
        `/issue/organization/${organizationId}`,
        { params }
      );
      
      return response.data.pagination.total;
    },
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
