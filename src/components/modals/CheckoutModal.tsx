import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

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

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  organizationId: string;
  action?: "process" | "upgrade" | "downgrade";
  organization?: OrganizationData | null;
  currentPlanData?: CurrentPlanData | null;
}

const VAT_RATE = 0.19;

export default function CheckoutModal({
  open,
  onOpenChange,
  plan,
  organizationId,
  action = "process",
  organization,
  currentPlanData,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // ── Calculate net price matching backend logic ──
 const calculateNetPrice = () => {
  if (action === "upgrade" && currentPlanData && organization) {
    const endDateStr = organization.subscriptionEndDate || organization.nextBillingDate;
    if (!endDateStr) {
      return { total: 0, debug: "No endDate" };
    }

    const now = new Date();
    const endDate = new Date(endDateStr);

    if (endDate <= now) {
      return { total: 0, debug: "endDate in past" };
    }

    // Accurate remaining months calculation
    let remainingMonths = 
      (endDate.getFullYear() - now.getFullYear()) * 12 +
      (endDate.getMonth() - now.getMonth());

    // If end day is before start day in the final month → not a full month
    /* if (endDate.getDate() < now.getDate()) {
      remainingMonths--;
    } */

    // Prevent negative / zero
    if (remainingMonths <= 0) {
      return { total: 0, debug: "No remaining months" };
    }

    const monthlyDiff = plan.price - currentPlanData.price;
    const totalUpgradeCost = monthlyDiff * remainingMonths;

    return {
      total: totalUpgradeCost,
      remainingMonths,
      // Keep these for debug if you want
      // diffDays: Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      monthlyDiff,
      debug: `months=${remainingMonths}, monthlyDiff=${monthlyDiff}`,
    };
  }

  // First time purchase (unchanged)
  const total = plan.billingCycle === "yearly" ? plan.price * 12 : plan.price;
  return { total, debug: `${plan.billingCycle}: ${plan.price}${plan.billingCycle === "yearly" ? " × 12" : ""}` };
};

  const calcResult = calculateNetPrice();
  const netPrice = calcResult.total;
  const vatAmount = +(netPrice * VAT_RATE).toFixed(2);
  const grossPrice = +(netPrice + vatAmount).toFixed(2);
  const currencySymbol = plan.currency === "EUR" ? "€" : plan.currency;

  const planName = plan.nameKey ? t(`plan.${plan.nameKey}`) : plan.name;
  const billingPeriod = plan.billingTextKey
    ? t(`plan.${plan.billingTextKey}`)
    : plan.billingCycle;

  // Build description for upgrade
 const getUpgradeInfo = () => {
  if (action !== "upgrade" || !currentPlanData || !organization) return null;

  const endDateStr = organization.subscriptionEndDate || organization.nextBillingDate;
  if (!endDateStr) return null;

  const now = new Date();
  const endDate = new Date(endDateStr);

  // Accurate month calculation
  let remainingMonths = 
    (endDate.getFullYear() - now.getFullYear()) * 12 +
    (endDate.getMonth() - now.getMonth());

  // Adjust if the end day hasn't reached the start day yet in the final month
 /*  if (endDate.getDate() < now.getDate()) {
    remainingMonths--;
  } */

  // Optional: prevent negative or zero
  if (remainingMonths <= 0) {
    return null; // or handle as expired
  }

  return { remainingMonths, oldPlanName: currentPlanData.name };
};

  const upgradeInfo = getUpgradeInfo();

  const handleContinueToPayment = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo?.accessToken;
      const lang = localStorage.getItem("language") || "en";

      const res = await fetch(`${apiUrl}/payment/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": lang,
        },
        body: JSON.stringify({
          organizationId,
          planId: plan._id,
          redirectUrl: `${window.location.origin}/payment/success`,
          metadata: { from: "frontend" },
        }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
         window.location.href = data.paymentUrl;
        onOpenChange(false);
      } else {
        toast({
          title: t("checkout.paymentError"),
          description: t("checkout.couldNotStart"),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: t("checkout.paymentFailed"),
        description: t("checkout.errorOccurred"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return value.toFixed(2).replace(".", ",") + " " + currencySymbol;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("checkout.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Plan info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-lg">{planName}</p>
              <p className="text-sm text-muted-foreground">{billingPeriod}</p>
              {upgradeInfo && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("checkout.upgradeFrom") || "Upgrade from"} {upgradeInfo.oldPlanName} · {upgradeInfo.remainingMonths} {t("checkout.monthsRemaining") || "months remaining"}
                </p>
              )}
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-3">
            {action === "process" && plan.billingCycle === "yearly" && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPrice(plan.price)} × 12 {t("checkout.months") || "months"}</span>
              </div>
            )}
            {action === "upgrade" && currentPlanData && upgradeInfo && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>({formatPrice(plan.price)} - {formatPrice(currentPlanData.price)}) × {upgradeInfo.remainingMonths} {t("checkout.months") || "months"}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("checkout.netPrice")}</span>
              <span className="text-foreground font-medium">{formatPrice(netPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("checkout.vat")} (19%)</span>
              <span className="text-foreground font-medium">{formatPrice(vatAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span className="text-foreground">{t("checkout.grossPrice")}</span>
              <span className="text-foreground">{formatPrice(grossPrice)}</span>
            </div>
            </div>

          {/* CTA */}
          <Button
            onClick={handleContinueToPayment}
            disabled={loading}
            size="lg"
            className="w-full text-base font-semibold rounded-xl bg-[hsl(222,82%,50%)] hover:bg-[hsl(222,82%,40%)] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("checkout.redirecting")}
              </>
            ) : (
              t("checkout.continueToPayment")
            )}
          </Button>

          {/* Legal links */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-1">
            <Link to="/impressum" className="hover:underline" target="_blank">
              {t("checkout.imprint")}
            </Link>
            <span>·</span>
            <Link to="/agb" className="hover:underline" target="_blank">
              {t("checkout.gtc")}
            </Link>
            <span>·</span>
            <Link to="/datenschutz" className="hover:underline" target="_blank">
              {t("checkout.privacy")}
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
