import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrder, updateOrder, getAnalytics } from "@/lib/api";
import type { ApiOrder, AnalyticsData } from "@/lib/api";

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

export function useAnalytics(from: string, to: string) {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics", from, to],
    queryFn: () => getAnalytics(from, to),
    enabled: !!from && !!to,
  });
}
