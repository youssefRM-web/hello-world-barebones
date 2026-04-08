import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { AcceptedTasks } from "@/types";
import axios from "axios";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export const TASKS_QUERY_KEY = ["acceptedTasks"];

// Pagination response type from backend
interface TasksPaginationResponse {
  data: AcceptedTasks[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Hook params type
interface UseTasksQueryParams {
  page?: number;
  limit?: number;
  archived?: boolean;
  enabled?: boolean;
}

// New paginated query hook
export const useTasksQuery = (params: UseTasksQueryParams = {}) => {
  const { page = 1, limit = 100, archived = false, enabled = true } = params;

  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, { page, limit, archived }],
    queryFn: async () => {
      const response = await apiService.get<TasksPaginationResponse>(
        endpoints.acceptedTasks,
        {
          params: { page, limit, archived },
        },
      );
      return response.data;
    },
    staleTime: 3000,
    refetchOnWindowFocus: true,
    enabled,
  });
};

// Legacy hook for backward compatibility - fetches all non-archived tasks
export const useAllTasksQuery = () => {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "all"],
    queryFn: async () => {
      const response = await apiService.get<
        TasksPaginationResponse | AcceptedTasks[]
      >(endpoints.acceptedTasks, {
        params: { page: 1, limit: 1000, archived: false },
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Partial<AcceptedTasks>;
    }) => {
      const response = await apiService.patch(
        `${endpoints.acceptedTasks}/${taskId}`,
        data,
      );
      return response.data;
    },
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      const previousQueries = queryClient.getQueriesData({
        queryKey: TASKS_QUERY_KEY,
      });

      queryClient.setQueriesData({ queryKey: TASKS_QUERY_KEY }, (old: any) => {
        if (!old) return old;
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((task: AcceptedTasks) =>
              task._id === taskId ? { ...task, ...data } : task,
            ),
          };
        }
        if (Array.isArray(old)) {
          return old.map((task: AcceptedTasks) =>
            task._id === taskId ? { ...task, ...data } : task,
          );
        }
        return old;
      });

      queryClient.setQueryData(
        ["taskDetail", taskId],
        (old: AcceptedTasks | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        },
      );

      return { previousQueries };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiService.delete(`${endpoints.acceptedTasks}/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(t("board.title2"), {
        description: t("board.deleteTaskSucc"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to delete task. Please try again.",
      });
    },
  });
};

export const useCreateTaskMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formPayload: FormData) => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo?.accessToken;

      const response = await axios.post(
        `${apiUrl}/accepted-issue`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
        refetchType: "all",
      });

      /* toast.success(t("board.title2"), {
        description: t("issues.taskCreated"),
      }); */
    },
    onError: () => {
      toast.error(t("board.title2"), {
        description: "Failed to create task. Please try again.",
      });
    },
  });
};

// -------------------- IMAGE UPLOAD MUTATION --------------------
export const useUploadTaskAttachmentMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      formData,
    }: {
      taskId: string;
      formData: FormData;
    }) => {
      const response = await apiService.post(
        `${endpoints.acceptedTasks}/${taskId}/attachments`,
        formData,
      );
      return response.data;
    },
    onError: (error) => {
      console.error("❌ Image upload failed:", error);
      toast.error("Error", {
        description: "Failed to upload image. Please try again.",
      });
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
        refetchType: "all",
      });
     
    },
  });
};

// -------------------- ARCHIVE/UNARCHIVE MUTATION --------------------
export const useArchiveTaskMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      archived,
    }: {
      taskId: string;
      archived: boolean;
    }) => {
      const response = await apiService.patch(
        `${endpoints.acceptedTasks}/${taskId}`,
        { archived },
      );
      return response.data;
    },
    onMutate: async ({ taskId, archived }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      return {};
    },
    onError: (err, variables, context) => {
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      });
    },
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(t("board.title2"), {
        description: archived
          ? "Task archived successfully"
          : "Task unarchived successfully",
      });
    },
  });
};
