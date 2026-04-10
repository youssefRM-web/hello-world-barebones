import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionStatus } from "@/hooks/queries/useSubscriptionStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Check, CreditCard, Loader2, Ban, Building2 } from "lucide-react";
import { ContactModal, CheckoutButton } from "@/components/modals";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import {
  usePlansQuery,
  useOrganizationQuery,
  useCurrentUserQuery,
  useBuildingsQuery,
} from "@/hooks/queries";
import { useMyIndividualPlansQuery } from "@/hooks/queries/useIndividualPlansQuery";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContactSales } from "../contact-sales-provider";

const SubscriptionTab = () => {
  const { t, language } = useLanguage();
  const [contactModal, setContactModal] = useState(false);
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    planName: "",
  });
  const { data: plans = [], isLoading } = usePlansQuery();
  const { openContactSales } = useContactSales();
  const {
    organization,
    isLoading: orgLoading,
    refetch,
  } = useOrganizationQuery();
  const { data: currentUser } = useCurrentUserQuery();
  const { orgBuildings } = useBuildingsQuery();
  const { toast } = useToast();
  const { executeRequest, isLoading: isCancelling } = useApi();
  const [isRequesting, setIsRequesting] = useState<string | null>(null);
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const [enterpriseModal, setEnterpriseModal] = useState<{ open: boolean; planId: string; planName: string }>({ open: false, planId: "", planName: "" });
  const [enterpriseForm, setEnterpriseForm] = useState({ buildingCount: "", additionalInfo: "" });
  const [downgradeModal, setDowngradeModal] = useState<{ open: boolean; plan: any | null }>({ open: false, plan: null });
  const [isDowngrading, setIsDowngrading] = useState(false);

  const storedUser = localStorage.getItem("userInfo");
  const userInfo = storedUser ? JSON.parse(storedUser) : null;
  const companyId = userInfo?.company;
  const organizationId = currentUser?.Organization_id?._id || companyId;

  // Fetch individual plans for this organization
  const { data: individualPlans = [], isLoading: individualPlansLoading } = useMyIndividualPlansQuery(organizationId);

  const activeBuildingCount = orgBuildings.filter((b: any) => !b.archived).length;
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const isTrial = subscriptionStatus?.status === "trial";

  // Determine if this customer has individual plans
  const activeIndividualPlans = individualPlans.filter((p) => p.status === "active");
  const purchasedIndividualPlan = individualPlans.find((p) => p.purchasedAt);
  const hasIndividualPlans = activeIndividualPlans.length > 0 || !!purchasedIndividualPlan;

  const handleDowngrade = async () => {
    if (!downgradeModal.plan || !organizationId) return;
    setIsDowngrading(true);
    try {
      const response = await apiService.post(`/payment/downgrade`, {
        organizationId,
        planId: downgradeModal.plan._id,
      });
      const data = response.data as any;
      toast({
        title: t("organisation.downgradeSuccess"),
        description: t("organisation.downgradeSuccessDesc")
          .replace("{plan}", data.newPlan || downgradeModal.plan.name)
          .replace("{date}", data.nextBillingDate ? format(new Date(data.nextBillingDate), "dd.MM.yyyy") : ""),
          variant: "success"
      });
      setDowngradeModal({ open: false, plan: null });
      refetch();
    } catch (err: any) {
      console.error("Downgrade error:", err);
      toast({
        title: t("organisation.downgradeError"),
        description: t("organisation.downgradeErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsDowngrading(false);
    }
  };

  const disabledPlanText = {
    en: (planName: string, maxBuildings: number) =>
      `You cannot downgrade to ${planName} because you have ${activeBuildingCount} buildings, which exceeds the limit of ${maxBuildings} buildings for this plan. Please archive some buildings first.`,
    de: (planName: string, maxBuildings: number) =>
      `Sie können nicht auf ${planName} herabstufen, da Sie ${activeBuildingCount} Gebäude haben, was das Limit von ${maxBuildings} Gebäuden für diesen Plan überschreitet. Bitte archivieren Sie zuerst einige Gebäude.`,
  };

  const handleContactUs = () => {
    setContactModal(true);
  };

  const handleCancelSubscription = (planName: string) => {
    setCancelModal({ isOpen: true, planName });
  };

  const openEnterpriseRequestModal = (planId: string, planName: string) => {
    setEnterpriseModal({ open: true, planId, planName });
    setEnterpriseForm({ buildingCount: "", additionalInfo: "" });
  };

  const handleRequestCustomPlan = async () => {
    if (!organizationId) return;
    
    const { planId, planName } = enterpriseModal;
    setIsRequesting(planId);
    
    await executeRequest(
      () =>
        apiService.post(`${endpoints.plans}/request-custom`, {
          planId,
          planName,
          organizationId,
          organizationName: organization?.name || "Unknown",
          requestedBy: currentUser?.Email || currentUser?.Name || "Unknown",
          buildingCount: enterpriseForm.buildingCount,
          additionalInfo: enterpriseForm.additionalInfo,
        }),
      {
        successMessage: t("organisation.requestSentSuccess"),
        errorMessage: t("organisation.requestSendFailed"),
        onSuccess: () => {
          setIsRequesting(null);
          setEnterpriseModal({ open: false, planId: "", planName: "" });
        },
        onError: () => {
          setIsRequesting(null);
        },
      }
    );
  };

  const confirmCancelSubscription = async () => {
    if (!organization?._id) return;

    await executeRequest(
      () =>
        apiService.post(
          `${endpoints.payments}/subscription/${organization._id}/cancel`
        ),
      {
        successMessage: t("organisation.subscriptionCancelledSuccess"),
        errorMessage: t("organisation.subscriptionCancelFailed"),
        onSuccess: () => {
          setCancelModal({ isOpen: false, planName: "" });
          refetch();
        },
      }
    );
  };

  React.useEffect(() => {
    const handleExpiredSubscription = (event: CustomEvent) => {
      setShowExpiredMessage(true);
      toast({
        title: t("organisation.subscriptionExpired"),
        description: event.detail?.message || t("organisation.subscriptionExpiredDesc"),
        variant: "destructive",
        duration: 10000, 
      });
    };

    const isExpired = localStorage.getItem('subscriptionExpired') === 'true';
    if (isExpired) {
      setShowExpiredMessage(true);
    }

    window.addEventListener('subscription-expired', handleExpiredSubscription as EventListener);

    return () => {
      window.removeEventListener('subscription-expired', handleExpiredSubscription as EventListener);
    };
  }, [toast, language]);

  if (isLoading || orgLoading || individualPlansLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── INDIVIDUAL PLANS VIEW ───────────────────────────────────────────────
  if (hasIndividualPlans) {
    // If a plan has been purchased, show only that plan
    if (purchasedIndividualPlan) {
      return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("organisation.yourPlan") || "Your Plan"}
            </h2>
            <p className="text-muted-foreground">
              {t("organisation.activePlanDesc") || "Your current active subscription plan."}
            </p>
          </div>

          <Card className="border-2 border-primary shadow-lg shadow-primary/10">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {purchasedIndividualPlan.billingCycle === "monthly"
                  ? (t("organisation.monthlyPlan") || "Monthly Plan")
                  : (t("organisation.yearlyPlan") || "Yearly Plan")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">
                  €{purchasedIndividualPlan.displayPrice}
                </span>
                <span className="text-muted-foreground ml-1">
                  /{t("plan.monthly") || "month"}
                </span>
                {purchasedIndividualPlan.billingCycle === "yearly" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("organisation.billedYearly") || "Billed yearly"}: €
                    {(purchasedIndividualPlan.displayPrice * 12).toLocaleString()}
                    /{t("organisation.year") || "year"}
                  </p>
                )}
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("organisation.billingCycle") || "Billing Cycle"}
                  </span>
                  <span className="font-medium capitalize">
                    {purchasedIndividualPlan.billingCycle}
                  </span>
                </div>
                {purchasedIndividualPlan.nextBillingDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("organisation.nextBill") || "Next billing date"}
                    </span>
                    <span className="font-medium text-orange-600">
                      {format(new Date(purchasedIndividualPlan.nextBillingDate), "dd.MM.yyyy")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("organisation.maxBuildings") || "Max. Buildings"}
                  </span>
                  <span className="font-medium">
                    {purchasedIndividualPlan.maxBuildings}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("organisation.currentUsage") || "Current Usage"}
                  </span>
                  <span className="font-medium">
                    {activeBuildingCount} / {purchasedIndividualPlan.maxBuildings}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 font-medium text-sm"
                onClick={() =>
                  handleCancelSubscription(
                    purchasedIndividualPlan.billingCycle === "monthly"
                      ? "Monthly Plan"
                      : "Yearly Plan"
                  )
                }
              >
                {t("organisation.cancelSubscription") || "Cancel Subscription"}
              </Button>
            </CardContent>
          </Card>

          <CancelSubscriptionModal
            isOpen={cancelModal.isOpen}
            onClose={() => setCancelModal({ isOpen: false, planName: "" })}
            onConfirm={confirmCancelSubscription}
            planName={cancelModal.planName}
            isLoading={isCancelling}
          />
        </div>
      );
    }

    // Show available individual plans side by side for selection
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("organisation.yourIndividualPlans") || "Your Individual Plans"}
          </h2>
          <p className="text-muted-foreground">
            {t("organisation.choosePlanDesc") || "Choose the plan that works best for you. Prices are shown as monthly amounts for easy comparison."}
          </p>
        </div>

        <div className={`grid gap-8 max-w-4xl mx-auto ${activeIndividualPlans.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 md:grid-cols-2"}`}>
          {activeIndividualPlans.map((plan) => (
            <Card
              key={plan._id}
              className="relative hover:scale-[1.02] transition-all duration-300 flex flex-col border border-primary/30 shadow-lg hover:shadow-primary/10"
            >
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.billingCycle === "monthly"
                    ? (t("organisation.monthlyPlan") || "Monthly Plan")
                    : (t("organisation.yearlyPlan") || "Yearly Plan")}
                </CardTitle>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    €{plan.displayPrice}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{t("plan.monthly") || "month"}
                  </span>
                </div>

                {plan.billingCycle === "yearly" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("organisation.billedYearly") || "Billed yearly"}: €
                    {(plan.displayPrice * 12).toLocaleString()}/{t("organisation.year") || "year"}
                  </p>
                )}
                {plan.billingCycle === "monthly" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("organisation.billedMonthly") || "Billed monthly"}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0 flex flex-col flex-1">
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center text-foreground">
                    <Building2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm">
                      {t("organisation.upToBuildings") || "Up to"} {plan.maxBuildings} {t("organisation.buildings") || "buildings"}
                    </span>
                  </li>
                  <li className="flex items-center text-foreground">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">
                      {t("organisation.fullFunctionality") || "Full functionality included"}
                    </span>
                  </li>
                </ul>

                <div className="mt-auto">
                  <Button
                    className="w-full text-lg font-semibold rounded-xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                    onClick={() => {
                      // Redirect to Mollie payment
                      window.location.href = `/api/payment/individual/subscribe?planId=${plan._id}&organizationId=${organizationId}`;
                    }}
                  >
                    {t("organisation.subscribe") || "Subscribe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── GENERIC PLANS VIEW (existing behavior) ─────────────────────────────
  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{t("organisation.noSubscriptionPlans")}</p>
      </div>
    );
  }
  
  return (
    <>
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {showExpiredMessage && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                {t("organisation.subscriptionExpired")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("organisation.subscriptionExpiredDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExpiredMessage(false)}
              className="flex-shrink-0"
            >
              {t("organisation.dismiss")}
            </Button>
          </div>
        </div>
      )}
      
      <div className={`grid gap-6 md:gap-8 max-w-6xl mx-auto ${isTrial ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
        {plans
          .filter((plan) => plan.isActive)
          .filter((plan) => isTrial ? plan.type === "enterprise" : true)
          .map((plan) => {
            const isCurrent = organization?.currentPlan === plan._id;
            const isEnterprise = plan.type === "enterprise";

            const planRank: Record<string, number> = { "Starter": 1, "Professional": 2, "Enterprise": 3 };
            const currentPlanObj = plans.find((p) => p._id === organization?.currentPlan);
            const currentRank = currentPlanObj ? (planRank[currentPlanObj.name] ?? 0) : 0;
            const thisRank = planRank[plan.name] ?? 0;
            const isUpgrade = currentRank > 0 && thisRank > currentRank && !isCurrent;
            const isDowngrade = currentRank > 0 && thisRank < currentRank && !isCurrent;

            const exceedsBuildingLimit =
              !isCurrent &&
              plan.maxBuildings &&
              activeBuildingCount > plan.maxBuildings;
            const isDisabled = exceedsBuildingLimit && !isEnterprise;
            
            const isCustomPlan = plan.price === -1;

            return (
              <Card
                key={plan._id}
                className={`relative hover:scale-105 transition-all duration-300 flex flex-col border ${
                  isCurrent
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-primary/50 shadow-lg shadow-primary/10 hover:shadow-primary/20'
                } ${isEnterprise ? 'bg-gradient-to-b from-[hsl(220,70%,12%)] to-[hsl(220,55%,32%)]' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      {t("organisation.currentPlan")}
                    </div>
                  </div>
                )}

                <CardHeader className={isTrial && isEnterprise ? 'pb-4' : 'pb-8'}>
                  <CardTitle className={`text-2xl font-bold ${isEnterprise ? 'text-white' : 'text-foreground'}`}>
                    {isTrial && isEnterprise
                      ? (language === 'de' ? 'Reden wir!' : "Let's talk!")
                      : (plan.nameKey ? t(`plan.${plan.nameKey}`) : plan.name)}
                  </CardTitle>
                  {!(isTrial && isEnterprise) && (
                    <p className={`text-base ${isEnterprise ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {plan.descriptionKey ? t(`plan.${plan.descriptionKey}`) : plan.description}
                    </p>
                  )}

                  {!(isTrial && isEnterprise) && (
                    <div className="mt-6">
                      {isCustomPlan ? (
                        <div className={`text-3xl font-bold ${isEnterprise ? 'text-white' : 'text-foreground'}`}>
                          {plan.billingTextKey ? t(`plan.${plan.billingTextKey}`) : t("organisation.onRequest")}
                        </div>
                      ) : (
                        <>
                          <span className={`text-4xl font-bold ${isEnterprise ? 'text-white' : 'text-foreground'}`}>
                            {plan.price}
                          </span>
                          <span className={`ml-1 ${isEnterprise ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {plan.currency == "EUR" ? "€" : "EUR"}/{t(`plan.monthly`)} ({t(`plan.${plan.billingTextKey}`)})
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {isCurrent && organization?.subscriptionStartDate && (
                    <div className="mt-4 space-y-1 text-sm">
                      <div className={`${isEnterprise ? 'text-white/80' : 'text-foreground/80'}`}>
                        {t("organisation.started")}:{" "}
                        <span className="font-medium">
                          {format(new Date(organization.subscriptionStartDate), "dd.MM.yyyy")}
                        </span>
                      </div>
                      {organization?.subscriptionStatus === "pending_cancelled" ? (
                        <div className="text-destructive font-medium">
                          {t("organisation.cancelsOn")}: {organization?.subscriptionEndDate ? format(new Date(organization.subscriptionEndDate), "dd.MM.yyyy") : "N/A"}
                        </div>
                      ) : organization?.nextBillingDate && (
                        <div className={`${isEnterprise ? 'text-white/80' : 'text-foreground/80'}`}>
                          {t("organisation.nextBill")}:{" "}
                          <span className="font-medium text-orange-600">
                            {format(new Date(organization.nextBillingDate), "dd.MM.yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {isCurrent && organization?.subscriptionStatus === "pending_cancelled" && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium text-center">
                        {t("organisation.subscriptionCancelled")}
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {t("organisation.accessUntilEnd")}
                      </p>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0 flex flex-col flex-1">
                  <ul className="space-y-4 mb-8 flex-1">
                    {(plan.featuresKeys && plan.featuresKeys.length > 0 ? plan.featuresKeys : plan.features).map((feature, i) => (
                      <li key={i} className={`flex items-center ${isEnterprise ? 'text-white' : 'text-foreground'}`}>
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.featuresKeys && plan.featuresKeys.length > 0 ? t(`plan.${feature}`) : feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-3">
                    {isCustomPlan ? (
                      <Button
                        className="w-full py-3 font-semibold text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0"
                        onClick={openContactSales}
                      >
                        {t("organisation.onRequest")}
                      </Button>
                    ) : isEnterprise ? (
                      <Button
                        className="w-full py-3 font-semibold text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0"
                        onClick={() => setContactModal(true)}
                      >
                        {t("organisation.contactSales")}
                      </Button>
                    ) : isCurrent ? (
                      <Button
                        className="w-full py-3 font-semibold text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0"
                        disabled
                      >
                        {t("organisation.currentPlan")}
                      </Button>
                    ) : isDisabled ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Button
                                className="w-full py-3 font-semibold text-sm opacity-50 cursor-not-allowed"
                                disabled
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {t("organisation.notAvailable")}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs p-3 text-sm">
                            {language === "de"
                              ? disabledPlanText.de(plan.name, plan.maxBuildings)
                              : disabledPlanText.en(plan.name, plan.maxBuildings)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : isDowngrade ? (
                      <Button
                        onClick={() => setDowngradeModal({ open: true, plan })}
                        size="lg"
                        variant="outline"
                        className="w-full text-lg font-semibold rounded-xl"
                      >
                        {t("organisation.downgrade")}
                      </Button>
                    ) : (
                      <CheckoutButton
                        plan={plan}
                        organizationId={organizationId}
                        organization={organization}
                        currentPlanData={currentPlanObj ? { _id: currentPlanObj._id, name: currentPlanObj.name, price: currentPlanObj.price } : null}
                        action={
                          !organization?.mollieCustomerId || !organization?.currentPlan
                            ? "process"
                            : isUpgrade
                            ? "upgrade"
                            : "process"
                        }
                        buttonText={
                          isUpgrade
                            ? t("organisation.upgrade")
                            : t("organisation.choosePlan")
                        }
                      />
                    )}

                    {isCurrent && organization?.subscriptionStatus !== "pending_cancelled" && (
                      <Button
                        variant="ghost"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 font-medium text-sm"
                        onClick={() => handleCancelSubscription(plan.name)}
                      >
                        {t("organisation.cancelSubscription")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      <CancelSubscriptionModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, planName: "" })}
        onConfirm={confirmCancelSubscription}
        planName={cancelModal.planName}
        isLoading={isCancelling}
      />

      <Dialog open={enterpriseModal.open} onOpenChange={(open) => { if (!open) setEnterpriseModal({ open: false, planId: "", planName: "" }); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("organisation.enterpriseRequest")}</DialogTitle>
            <DialogDescription>{t("organisation.enterpriseRequestDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("organisation.numberOfBuildings")} *</Label>
              <Input
                type="number"
                min="1"
                placeholder={t("organisation.numberOfBuildingsPlaceholder")}
                value={enterpriseForm.buildingCount}
                onChange={(e) => setEnterpriseForm(prev => ({ ...prev, buildingCount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("organisation.additionalInfo")}</Label>
              <Textarea
                placeholder={t("organisation.additionalInfoPlaceholder")}
                value={enterpriseForm.additionalInfo}
                onChange={(e) => setEnterpriseForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnterpriseModal({ open: false, planId: "", planName: "" })}>
              {t("organisation.cancel")}
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
              onClick={handleRequestCustomPlan}
              disabled={!enterpriseForm.buildingCount || isRequesting === enterpriseModal.planId}
            >
              {isRequesting === enterpriseModal.planId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("organisation.sending")}
                </>
              ) : (
                t("organisation.sendRequest")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Confirmation Dialog */}
      <Dialog open={downgradeModal.open} onOpenChange={(open) => !isDowngrading && setDowngradeModal({ open, plan: open ? downgradeModal.plan : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("organisation.downgradeTitle")}</DialogTitle>
            <DialogDescription>
              {t("organisation.downgradeDesc")
                .replace("{plan}", downgradeModal.plan?.nameKey ? t(`plan.${downgradeModal.plan.nameKey}`) : downgradeModal.plan?.name || "")
                .replace("{date}", organization?.nextBillingDate ? format(new Date(organization.nextBillingDate), "dd.MM.yyyy") : "")}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
            <p>• {t("organisation.downgradeNote1")}</p>
            <p>• {t("organisation.downgradeNote2")}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDowngradeModal({ open: false, plan: null })} disabled={isDowngrading}>
              {t("organisation.cancel")}
            </Button>
            <Button onClick={handleDowngrade} disabled={isDowngrading} variant="destructive">
              {isDowngrading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("organisation.processing")}
                </>
              ) : (
                t("organisation.confirmDowngrade")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  
    </>
  );
};

export default SubscriptionTab;
