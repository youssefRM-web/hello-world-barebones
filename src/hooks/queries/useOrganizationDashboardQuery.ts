import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

export interface OrganizationDashboardUser {
  userId: string;
  name: string;
  email: string;
  ticketsCreated: number;
  profile_picture?: string;
}

export interface OrganizationInvoice {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paidAt: string;
}

export interface OrganizationDashboard {
  _id: string;
  name: string;
  companyDetails: {
    name: string;
    businessType: string;
    telephone: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    owner: string;
  };
  subscription: {
    status: string;
    startDate: string;
    endDate: string | null;
    trialEndDate: string | null;
    nextBillingDate: string | null;
    currentPlan: string | null;
    hasPaymentMethod: boolean;
  };
  billingAndPayment: {
    totalRevenue: number;
    totalPaidPayments: number;
    billingAddress?: string;
    billingCity?: string;
    billingZip?: string;
    billingCountry?: string;
    billingCompanyName?: string;
    billingFirstName?: string;
    billingLastName?: string;
    billingTaxNumber?: string;
    billingVatNumber?: string;
  };
  invoices: OrganizationInvoice[];
  activeUsers: number;
  totalTickets: number;
  ticketsCreatedByMembers: OrganizationDashboardUser[];
}

export const useOrganizationDashboardQuery = () => {
  return useQuery({
    queryKey: ["organization-dashboard"],
    queryFn: async (): Promise<OrganizationDashboard[]> => {
      const response = await apiService.get<OrganizationDashboard[]>("/organization/dashboard");
      return response.data || [];
    },
  });
};