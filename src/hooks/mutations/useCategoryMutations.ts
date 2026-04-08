import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export const useAddBuildingToCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      buildingId,
    }: {
      categoryId: string;
      buildingId: string;
    }) => {
      
      const response = await apiService.patch(`/category/${categoryId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("Error adding building to category:", error);
      toast.error("Error", {
        description: "Failed to add building to category",
      });
    },
  });
};

export const useRemoveBuildingFromCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      buildingId,
    }: {
      categoryId: string;
      buildingId: string;
    }) => {
      const response = await apiService.patch(`/category/${categoryId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      
    },
    onError: (error) => {
      console.error("Error removing building from category:", error);
      toast.error("Error", {
        description: "Failed to remove building from category",
      });
    },
  });
};
