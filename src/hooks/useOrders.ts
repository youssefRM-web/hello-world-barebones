import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrder, updateOrder, type ApiOrder } from "@/lib/api";

export function useOrders(status?: string) {
  return useQuery<ApiOrder[]>({
    queryKey: ["orders", status],
    queryFn: () => getOrders(status ? { status } : undefined),
  });
}

export function useOrder(id: string) {
  return useQuery<ApiOrder>({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; paymentStatus?: string } }) =>
      updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
