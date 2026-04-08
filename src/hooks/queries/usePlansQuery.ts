import { useQuery } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";

interface Plan {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  billingCycle: string;
  currency: string;
  features: string[];
  isActive: boolean;
  maxUsers: number;
  maxBuildings: number;
  maxAssets: number;
  hasAnalytics: boolean;
  hasAdvancedSupport: boolean;
  has24_7Support: boolean;
  trialDays: number;
  createdAt: string;
  updatedAt: string;
  nameKey?: string;
  descriptionKey?: string;
  billingTextKey?: string;
  featuresKeys?: string[];
}

export const usePlansQuery = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await apiService.get<Plan[]>(endpoints.plans);
      return response.data;
    },
  });
};