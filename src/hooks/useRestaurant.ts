import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRestaurant, updateRestaurant, uploadMenuImages } from "@/lib/api";
import type { RestaurantData, UpdateRestaurantPayload } from "@/lib/api";

export function useRestaurant(id: string | undefined) {
  return useQuery<RestaurantData>({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurant(id!),
    enabled: !!id,
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantPayload }) =>
      updateRestaurant(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurant", variables.id] });
    },
  });
}

export function useUploadMenuImages() {
  return useMutation({
    mutationFn: (files: File[]) => uploadMenuImages(files),
  });
}
