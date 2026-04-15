import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenu, createMenu, type MenuData, type CreateMenuPayload } from "@/lib/api";

export function useMenu(menuId: string | undefined) {
  return useQuery<MenuData>({
    queryKey: ["menu", menuId],
    queryFn: () => getMenu(menuId!),
    enabled: !!menuId,
  });
}

export function useCreateMenu(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuPayload) => createMenu(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}
