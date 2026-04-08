import { useQuery } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";

export interface Payment {
  _id: string;
  organizationId: string;
  planId: string;
  molliePaymentId: string;
  mollieCustomerId: string;
  status: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata?: any;
  invoiceNumber : string;
  expiresAt: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  __v: number;
}

interface UsePaymentsQueryParams {
  role?: string[];
  organizationId?: string;
}

export const usePaymentsQuery = ({ role, organizationId }: UsePaymentsQueryParams = {}) => {
  const isAdmin = Array.isArray(role) && role[0] === "admin";
  const endpoint = isAdmin 
    ? `${endpoints.payments}/all`
    : `${endpoints.payments}/organization/${organizationId}`;

  return useQuery({
    queryKey: ["payments", role, organizationId],
    queryFn: async () => {
      const response = await apiService.get<Payment[]>(endpoint);
      return response.data;
    },
    // refetchInterval: 5000,
    enabled: !!organizationId || isAdmin,
  });
};