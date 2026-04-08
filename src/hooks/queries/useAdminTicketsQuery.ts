import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { Ticket } from "./useTicketsQuery";
import { toast } from "sonner";

export interface AdminTicket extends Ticket {
  ticketNumber?: string;
}

interface PaginatedResponse {
  data: AdminTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAdminTicketsQuery = () => {
  return useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const response = await apiService.get<AdminTicket[]>(
        `${endpoints.support}/admin/tickets`,
      );
      return response.data;
    },
    // refetchInterval: 30000,
  });
};

export const useAdminOpenTicketsQuery = () => {
  return useQuery({
    queryKey: ["admin-tickets-open"],
    queryFn: async () => {
      const response = await apiService.get<AdminTicket[]>(
        `${endpoints.support}/open`,
      );
      return response.data;
    },
    // refetchInterval: 30000,
  });
};

export const useAdminResolvedTicketsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-tickets-resolved"],
    queryFn: async () => {
      const response = await apiService.get(`${endpoints.support}/resolved`);
      return response.data;
    },
    enabled,
    // refetchInterval: 30000,
  });
};

export const useResolveTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiService.patch(
        `${endpoints.support}/${ticketId}/status`,
        { status: "resolved" },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets-open"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets-resolved"] });
      toast.success("Ticket resolved successfully");
    },
    onError: () => {
      toast.error("Failed to resolve ticket");
    },
  });
};

export const useAdminTicketStats = () => {
  const { data: tickets, isLoading } = useAdminTicketsQuery();

  const stats = {
    total: tickets?.length || 0,
    open:
      tickets?.filter(
        (t) =>
          t.status === "open" ||
          t.status === "awaiting" ||
          t.status === "pending",
      ).length || 0,
    resolved: tickets?.filter((t) => t.status === "closed").length || 0,
  };

  return { stats, isLoading, tickets };
};
