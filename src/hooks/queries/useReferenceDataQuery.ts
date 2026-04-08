import { useQuery } from "@tanstack/react-query";
import { useCurrentUserQuery } from "./useCurrentUserQuery";
import { apiService } from "@/services/api";
import type {
  User,
  Category,
  Building,
  AcceptedTasks,
  Space,
  Organization,
  Asset,
  Issue,
} from "@/types";

interface ReferenceDataResponse {
  users: User[];
  // categories: Category[];
  buildings: Building[];
  acceptedTasks: AcceptedTasks[];
  // spaces: Space[];
  // assets: Asset[];
  issues: Issue[];
  organizations: Organization[];
  hasOrganization: boolean;
}

export const useReferenceDataQuery = () => {
  const { data: currentUser } = useCurrentUserQuery();

  return useQuery({
    queryKey: ["referenceData", currentUser?.Organization_id?._id],
    queryFn: async (): Promise<ReferenceDataResponse> => {
      if (!currentUser?.Organization_id?._id) {
        return {
          users: [],
          // categories: [],
          buildings: [],
          acceptedTasks: [],
          // spaces: [],
          // assets: [],
          issues: [],
          organizations: [],
          hasOrganization: false,
        };
      }

      try {
        // Helper function to safely fetch data
        const safeFetch = async <T>(endpoint: string): Promise<T[]> => {
          try {
            const response = await apiService.get<T[]>(endpoint);
            return response.data || [];
          } catch (error) {
            console.warn(`Failed to fetch ${endpoint}:`, error);
            return [];
          }
        };

        // Fetch all reference data in parallel
        const [
          users,
          // categories,
          buildings,
          acceptedTasks,
          // spaces,
          // assets,
          issues,
          organizations,
        ] = await Promise.all([
          safeFetch<User>(`/user/organization/${currentUser.Organization_id._id}`),
          // safeFetch<Category>('/categories'),
          safeFetch<Building>("/building"),
          safeFetch<AcceptedTasks>("/accepted-issue"),
          // safeFetch<Space>('/spaces'),
          // safeFetch<Asset>('/assets'),
          safeFetch<Issue>(`/issue/organization/${currentUser.Organization_id._id}`),
          safeFetch<Organization>("/organization"),
        ]);
        return {
          users,
          // categories,
          buildings,
          acceptedTasks,
          // spaces,
          // assets,
          issues,
          organizations,
          hasOrganization: !!currentUser?.Organization_id?._id,
        };
      } catch (error) {
        console.error("Error fetching reference data:", error);
        throw error;
      }
    },
    enabled: !!currentUser?.Organization_id?._id,
  });
};