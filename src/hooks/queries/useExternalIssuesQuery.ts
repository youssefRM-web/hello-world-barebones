import { useQuery } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { Issue } from "@/types";
import { useCurrentUserQuery } from "./useCurrentUserQuery";

/**
 * Query hook for fetching external/location-based issues
 * These are issues that have only organization ID but no building ID
 * They come from public location-based reports
 */
export const useExternalIssuesQuery = () => {
  const { data: currentUser } = useCurrentUserQuery();
  const organizationId = currentUser?.Organization_id?._id;

  return useQuery({
    queryKey: ["external-issues", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      // Fetch all organization issues
      const response = await apiService.get<Issue[]>(
        `${endpoints.issues}/organization/${organizationId}`
      );

      // Filter to only get external issues (has location_coordinates but no buildingId)
      const externalIssues = response.data.filter(
        (issue) => 
          issue.location_coordinates && 
          !issue.buildingId
      );

      return externalIssues;
    },
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
  });
};