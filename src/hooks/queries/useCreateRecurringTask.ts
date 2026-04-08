import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export const useCreateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiService.post("/recurring-tasks", taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error.response?.data?.message || "Failed to create recurring task",
      });
    },
  });
};

export const useUpdateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiService.patch(`/recurring-tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
     
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error.response?.data?.message || "Failed to update recurring task",
      });
    },
  });
};
