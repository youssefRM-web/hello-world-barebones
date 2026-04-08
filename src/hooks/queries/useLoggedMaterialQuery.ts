import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { LoggedMaterial } from "@/types/logged";
import { toast } from "sonner";
import axios from "axios";
import { TASK_DETAIL_QUERY_KEY } from "./useTaskDetailQuery";
import { useLanguage } from "@/contexts/LanguageContext";

export const LOGGED_MATERIAL_QUERY_KEY = (taskId: string) => [
  "loggedMaterial",
  taskId,
];

export const useLoggedMaterialQuery = (taskId: string) => {
  return useQuery({
    queryKey: LOGGED_MATERIAL_QUERY_KEY(taskId),
    queryFn: async () => {
      const response = await apiService.get<any>(
        `${endpoints.acceptedTasks}/${taskId}`
      );
      return response.data?.material_logs || [];
    },
    enabled: !!taskId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreateLoggedMaterialMutation = () => {
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
      const apiUrl = import.meta.env.VITE_API_URL;
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo?.accessToken;

      const response = await axios.post(
        `${apiUrl}/accepted-issue/${taskId}/logged-material`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: LOGGED_MATERIAL_QUERY_KEY(taskId),
      });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
      toast.success(t("board.title2"), {
        description: t("MatDescription"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to log material. Please try again.",
      });
    },
  });
};

export const useDeleteLoggedMaterialMutation = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      loggedMaterialId,
    }: {
      taskId: string;
      loggedMaterialId: string;
    }) => {
      await apiService.delete(
        `${endpoints.acceptedTasks}/logged-material/${loggedMaterialId}`
      );
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: LOGGED_MATERIAL_QUERY_KEY(taskId),
      });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
      toast.success(t("board.title2"), {
        description: "Logged material deleted successfully",
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to delete logged material. Please try again.",
      });
    },
  });
};
