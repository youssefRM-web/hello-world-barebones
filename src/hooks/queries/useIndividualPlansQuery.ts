import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

export interface IndividualPlan {
  _id: string;
  customerId: string;
  displayPrice: number;
  billingCycle: "monthly" | "yearly";
  maxBuildings: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
  purchasedAt?: string;
  mollieSubscriptionId?: string;
  nextBillingDate?: string;
}

/**
 * Fetch individual plans assigned to a specific customer (used by Super Admin)
 */
export const useIndividualPlansQuery = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ["individualPlans", customerId],
    queryFn: async () => {
      const response = await apiService.get<IndividualPlan[]>(
        `/plans/individual/${customerId}`
      );
      return response.data;
    },
    enabled: !!customerId,
  });
};

/**
 * Fetch individual plans for the current customer's organization (used by customer SubscriptionTab)
 */
export const useMyIndividualPlansQuery = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ["myIndividualPlans", organizationId],
    queryFn: async () => {
      const response = await apiService.get<IndividualPlan[]>(
        `/plans/individual/my/${organizationId}`
      );
      return response.data;
    },
    enabled: !!organizationId,
  });
};
