import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCurrentUserQuery } from './useCurrentUserQuery';
import { apiUrl } from '@/services/api';

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedBuildingsResponse {
  data: any[];
  pagination: PaginationInfo;
}

interface UsePaginatedBuildingsOptions {
  page?: number;
  limit?: number;
  archived?: boolean;
}

export const useBuildingsQuery = () => {
  const { data: currentUser } = useCurrentUserQuery();

  const buildingsQuery = useQuery({
    queryKey: ['buildings', currentUser?.Organization_id?._id, currentUser?._id],
    queryFn: async () => {
      if (!currentUser?.Organization_id?._id || !currentUser?._id) {
        throw new Error('No organization or user ID available');
      }

      const response = await axios.get(
        `${apiUrl}/building/by-organization/${currentUser.Organization_id._id}/user/${currentUser._id}`
      );
      return response.data || [];
    },
    enabled: !!currentUser?.Organization_id?._id && !!currentUser?._id,
  });

  const orgBuildingsQuery = useQuery({
    queryKey: ['orgBuildings', currentUser?.Organization_id?._id],
    queryFn: async () => {
      if (!currentUser?.Organization_id?._id) {
        throw new Error('No organization ID available');
      }

      const response = await axios.get(
        `${apiUrl}/building/by-organization/${currentUser.Organization_id._id}`
      );
      return response.data || [];
    },
    enabled: !!currentUser?.Organization_id?._id,
  });

  // 🔹 Buildings where user is "affectedTo" - filter out archived
  const affectedBuildingsQuery = useQuery({
    queryKey: ['affectedBuildings', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) throw new Error('No user ID available');

      const response = await axios.get(
        `${apiUrl}/user/affected-to/${currentUser._id}`
      );
      const buildings = response.data || [];
      // Filter out archived buildings for sidebar
      return buildings.filter((b: any) => !b.archived);
    },
    enabled: !!currentUser?._id,
  });



  return {
    buildings: buildingsQuery.data || [],
    orgBuildings: orgBuildingsQuery.data || [],
    affectedBuildings: affectedBuildingsQuery.data || [],
    isLoading: buildingsQuery.isLoading || orgBuildingsQuery.isLoading,
    error: buildingsQuery.error || orgBuildingsQuery.error,
    refetch: () => {
      buildingsQuery.refetch();
      orgBuildingsQuery.refetch();
      affectedBuildingsQuery.refetch();
    },
  };
};

// New paginated hook for BuildingsOverview
export const usePaginatedBuildingsQuery = (options: UsePaginatedBuildingsOptions = {}) => {
  const { page = 1, limit = 8, archived = false } = options;
  const { data: currentUser } = useCurrentUserQuery();

  return useQuery<PaginatedBuildingsResponse>({
    queryKey: ['paginatedBuildings', currentUser?._id, page, limit, archived],
    queryFn: async () => {
      if (!currentUser?._id) {
        throw new Error('No user ID available');
      }

      const response = await axios.get(
        `${apiUrl}/building/by-user/${currentUser._id}`,
        {
          params: { page, limit, archived }
        }
      );
      return response.data;
    },
    enabled: !!currentUser?._id,
  });
};