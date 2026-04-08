import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/services/api';

export const useRecurringTasksQuery = () => {
  return useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: async () => {
      const response = await apiService.get(`${endpoints.reccuringTasks}`);
      return response.data;
    },
  });
};