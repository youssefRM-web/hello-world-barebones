import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCurrentUserQuery } from './useCurrentUserQuery';
import { apiUrl } from '@/services/api';

export const useOrganizationQuery = () => {
  const { data: currentUser } = useCurrentUserQuery();
  const organizationQuery = useQuery({
    queryKey: ['organization', currentUser?.Organization_id?._id],
    queryFn: async () => {
      if (!currentUser?.Organization_id?._id) {
        return { hasOrganization: false, orgUsers: [], organization: null };
      }

      try {
        // Fetch the organization
        const response = await axios.get(
          `${apiUrl}/organization/${currentUser.Organization_id._id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch users in that organization
        const usersResponse = await axios.get(
          `${apiUrl}/invite?organizationId=${currentUser.Organization_id._id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        return {
          hasOrganization: !!response.data,
          orgUsers: usersResponse.data || [],
          organization: response.data,
        };
      } catch (error) {
        console.error("Error fetching organization:", error);
        return { hasOrganization: false, orgUsers: [], organization: null };
      }
    },
    enabled: !!currentUser?.Organization_id?._id,
  });

  return {
    hasOrganization: organizationQuery.data?.hasOrganization ?? null,
    orgUsers: organizationQuery.data?.orgUsers || [],
    organization: organizationQuery.data?.organization || null,
    isLoading: organizationQuery.isLoading,
    error: organizationQuery.error,
    refetch: organizationQuery.refetch,
  };
};