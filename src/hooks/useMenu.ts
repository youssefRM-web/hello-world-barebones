import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenu, getMyMenus, createMenu, updateMenu, deleteMenu } from "@/lib/api";
import type { MenuData, CreateMenuPayload, UpdateMenuPayload } from "@/lib/api";

export function useMenu(menuId: string | undefined) {
  return useQuery<MenuData>({
    queryKey: ["menu", menuId],
    queryFn: () => getMenu(menuId!),
    enabled: !!menuId,
  });
}

export function useMyMenus() {
  return useQuery<MenuData[]>({
    queryKey: ["menus"],
    queryFn: () => getMyMenus(),
  });
}

export function useCreateMenu(restaurantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuPayload) => createMenu(data, restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuPayload }) => updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}
