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
  invoiceNumber: any;
  _id : any;
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
    currentPlan: {
      nameKey?: string;
      price?: number;
      currency?: any;
      billingTextKey?: string;
      featuresKeys?: string[];
      features?: string[];
    };
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
    firstName?: string;
    lastName?: string;
  };
  supportTicket : Array<{
    _id?: string;
    subject?: string;
    description?: string;
    customer?: {
      Name?: string;
      Last_Name?: string;
    };
    status?: string;
    createdAt: Date | string;
  }>;
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