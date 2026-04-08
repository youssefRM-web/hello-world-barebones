import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCurrentUserQuery } from "./useCurrentUserQuery";
import { apiUrl } from "@/services/api";

interface SubscriptionStatus {
  status: "trial" | "expired" | "active";
  trialEndsIn?: number;
}

// Helper function to calculate milliseconds until the next midnight
const getMsUntilNextMidnight = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // Set time to next midnight
  return nextMidnight.getTime() - now.getTime();
};

// Helper function to calculate days remaining in trial
const calculateTrialDaysRemaining = (trialEndDate: string): number => {
  const now = new Date();
  const endDate = new Date(trialEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const useSubscriptionStatus = () => {
  const { data: currentUser } = useCurrentUserQuery();
  const organizationId = currentUser?.Organization_id?._id;
  return useQuery<SubscriptionStatus>({
    queryKey: ["subscription-status", currentUser?._id, organizationId],
    queryFn: async () => {
      if (!currentUser) {
        throw new Error("No user data");
      }

      // Check if user has active subscription via organization
      let hasActiveSubscription = false;
      if (organizationId) {
        try {
          const response = await axios.get(
            `${apiUrl}/organization/${organizationId}/check-subscription`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          hasActiveSubscription = response.data.status === "active" || response.data.status === "pending_cancelled";
        } catch (error) {
          console.error("Error checking organization subscription:", error);
        }
      }

      // If organization has active subscription, return active
      if (hasActiveSubscription) {
        return { status: "active" };
      }

      // Otherwise, check user trial status
      if (currentUser.trialExpired) {
        return { status: "expired" };
      }

      // User is in trial period
      if (currentUser.trialEndDate) {
        const trialEndsIn = calculateTrialDaysRemaining(currentUser.trialEndDate);
        return {
          status: "trial",
          trialEndsIn,
        };
      }

      // Fallback
      return { status: "trial", trialEndsIn: 0 };
    },
    enabled: !!currentUser,
    refetchInterval: getMsUntilNextMidnight(),
    staleTime: getMsUntilNextMidnight(),
  });
};