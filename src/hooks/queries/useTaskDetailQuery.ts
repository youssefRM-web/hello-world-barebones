import { useQuery } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { AcceptedTasks } from "@/types";

export const TASK_DETAIL_QUERY_KEY = "taskDetail";

export const useTaskDetailQuery = (taskId: string | undefined) => {
  return useQuery({
    queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
    queryFn: async () => {
      if (!taskId) throw new Error("Task ID is required");
      const response = await apiService.get<AcceptedTasks>(
        `${endpoints.acceptedTasks}/${taskId}`
      );
      return response.data;
    },
    enabled: !!taskId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};