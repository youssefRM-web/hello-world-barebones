import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import type { CurrentUser } from '@/types';

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<CurrentUser> => {
      // Retrieve and parse stored user data
      const storedData = localStorage.getItem("userInfo");
      if (!storedData) {
        throw new Error("No user data found in localStorage");
      }

      const parsedData = JSON.parse(storedData);
      const userId = parsedData?.id;

      if (!userId) {
        throw new Error("No user ID found in stored data");
      }

      // Fetch current user from API
      const response = await apiService.get<CurrentUser>(`/user/${userId}`);
      return response.data;
    },
    enabled: !!localStorage.getItem("userInfo"),
  });
};