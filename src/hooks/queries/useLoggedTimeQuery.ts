import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { LoggedTime, LoggedTimeDisplay } from "@/types/logged";
import { toast } from "sonner";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { TASK_DETAIL_QUERY_KEY } from "./useTaskDetailQuery";
import { useLanguage } from "@/contexts/LanguageContext";

export const LOGGED_TIME_QUERY_KEY = (taskId: string) => ["loggedTime", taskId];

const calculateDuration = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

export const useLoggedTimeQuery = (taskId: string) => {
  const { users } = useReferenceData();

  return useQuery({
    queryKey: LOGGED_TIME_QUERY_KEY(taskId),
    queryFn: async () => {
      const response = await apiService.get<{ _id: string; time_logs: LoggedTime[] }>(`${endpoints.acceptedTasks}/${taskId}`);

      const task = response.data;

      if (!task?.time_logs || !Array.isArray(task.time_logs)) {
        return [];
      }

      const displayData: LoggedTimeDisplay[] = task.time_logs.map((item) => {
        const user = users.find((u) => u._id === item.id_user);
        const startDate = new Date(item.start_time);
        const endDate = new Date(item.end_time);

        return {
          _id: item._id,
          task_id: taskId,
          user_id: {
            _id: item.id_user,
            Name: user?.Name || "Unknown",
            Last_Name: user?.Last_Name || "",
            profile_picture: user?.profile_picture,
          },
          date: item.log_date,
          start_time: startDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }),
          end_time: endDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }),
          duration: calculateDuration(item.start_time, item.end_time),
          description: item.description,
          createdAt: item.log_date,
          updatedAt: item.log_date,
        };
      });

      return displayData;
    },
    enabled: !!taskId && users.length > 0,
  });
};


export const useCreateLoggedTimeMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: {
        date: string;
        start_time: string;
        end_time: string;
        description?: string;
        id_user?: string;
      };
    }) => {
      const response = await apiService.post(
        `${endpoints.acceptedTasks}/${taskId}/logged-time`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: LOGGED_TIME_QUERY_KEY(taskId),
      });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
      toast.success(t("board.title2"), {
        description: t("board.timeDescription"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to log time. Please try again.",
      });
    },
  });
};

export const useDeleteLoggedTimeMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      loggedTimeId,
    }: {
      taskId: string;
      loggedTimeId: string;
    }) => {
      await apiService.delete(
        `${endpoints.acceptedTasks}/${taskId}/logged-time/${loggedTimeId}`
      );
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: LOGGED_TIME_QUERY_KEY(taskId),
      });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
      toast.success(t("board.title2"), {
        description: t("board.deleteTimeDescription"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to delete logged time. Please try again.",
      });
    },
  });
};
