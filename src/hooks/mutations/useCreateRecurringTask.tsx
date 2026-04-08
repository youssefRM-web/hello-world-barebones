import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export const useCreateRecurringTask = () => {
  const queryClient = useQueryClient();

  const { t } = useLanguage();

  return useMutation({
    mutationFn: async (data: FormData | any) => {
      const response = await apiService.post(endpoints.reccuringTasks, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      toast.success(t("recurringTask.createSuccessTitle"), {
        description: t("recurringTask.createSuccessDesc"),
      });
    },
    onError: () => {
      toast.error(t("recurringTask.createSuccessTitle"), {
        description: t("recurringTask.deleteErrorDesc"),
      });
    },
  });
};

export const useUpdateRecurringTask = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  const { t } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiService.patch(
        `${endpoints.reccuringTasks}/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      toast.success(t("recurringTask.updateSuccessTitle"), {
        description: t("recurringTask.updateSuccessDesc"),
      });
      // Close any open edit modal
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: () => {
      toast.error(t("recurringTask.updateSuccessTitle"), {
        description: t("recurringTask.updateErrorDesc"),
      });
    },
  });
};

export const useDeleteRecurringTask = () => {
  const queryClient = useQueryClient();

  const { t } = useLanguage();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiService.delete(`${endpoints.reccuringTasks}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      toast.success(t("recurringTask.deleteSuccessTitle"), {
        description: t("recurringTask.deleteSuccessDesc"),
      });
    },
    onError: () => {
      toast.error(t("recurringTask.deleteSuccessTitle"), {
        description: t("recurringTask.deleteErrorDesc"),
      });
    },
  });
};
