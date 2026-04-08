import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export interface TicketMessage {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isStaff: boolean;
  read: boolean;
  sender: {
    _id: string;
    Name: string;
    Last_Name: string;
    Email: string;
    profile_picture?: string;
  };
  attachments?: string[];
  replyTo?: string | null;
  __v?: number;
}

export interface TicketCustomer {
  _id: string;
  Name: string;
  Last_Name: string;
  Email: string;
  profile_picture?: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  status: "open" | "awaiting" | "closed" | "pending";
  priority: number;
  customer: TicketCustomer;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  read?: boolean;
  __v?: number;
}

export const useTicketsQuery = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await apiService.get<Ticket[]>(
        `${endpoints.support}/tickets`,
      );
      return response.data;
    },
    // refetchInterval: 3000,
  });
};

export const useTicketDetailQuery = (ticketId: string | null) => {
  return useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: async () => {
      const response = await apiService.get<Ticket>(
        `${endpoints.support}/tickets/${ticketId}`,
      );
      return response.data;
    },
    enabled: !!ticketId,
    refetchInterval: 3000,
  });
};

export const useCreateTicketMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiService.post<Ticket>(
        `${endpoints.support}/tickets`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({
        title: "Support",
        description: "Ticket created successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });
};

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      ticketId,
      data,
      isStaff = false,
    }: {
      ticketId: string;
      data: FormData;
      isStaff?: boolean;
    }) => {
      // Ensure ticketId is in FormData
      if (!data.has("ticketId")) {
        data.append("ticketId", ticketId);
      }
      // Add isStaff flag
      data.append("isStaff", String(isStaff));

      const response = await apiService.post<Ticket>(
        `${endpoints.support}/messages`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });
};

export const useMarkTicketReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiService.patch(
        `${endpoints.support}/${ticketId}/read`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicketStatusMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: "open" | "awaiting" | "closed";
    }) => {
      const response = await apiService.patch(
        `${endpoints.support}/${ticketId}/status`,
        { status },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({
        title: "Support",
        description: "Ticket status updated successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });
};
