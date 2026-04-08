import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import CheckoutModal from "./CheckoutModal";

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  nameKey?: string;
  billingTextKey?: string;
}

interface OrganizationData {
  currentPlan?: string;
  subscriptionEndDate?: string;
  nextBillingDate?: string;
}

interface CurrentPlanData {
  _id: string;
  name: string;
  price: number;
}

interface CheckoutButtonProps {
  plan: Plan;
  organizationId: string;
  buttonText?: string;
  action?: "process" | "upgrade" | "downgrade";
  organization?: OrganizationData | null;
  currentPlanData?: CurrentPlanData | null;
}

export default function CheckoutButton({
  plan,
  organizationId,
  buttonText,
  action = "process",
  organization,
  currentPlanData,
}: CheckoutButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <Button
        onClick={() => setShowCheckout(true)}
        size="lg"
        className="w-full text-lg font-semibold rounded-xl transition-all bg-[hsl(222,82%,50%)] hover:bg-[hsl(222,82%,40%)] text-white"
      >
        {buttonText || t("checkout.choosePlan")}
      </Button>
      
      <CheckoutModal
        open={showCheckout}
        onOpenChange={setShowCheckout}
        plan={plan}
        organizationId={organizationId}
        action={action}
        organization={organization}
        currentPlanData={currentPlanData}
      />
    </>
  );
}
