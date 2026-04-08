import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { ContactModal, CheckoutButton } from "@/components/modals";
import {
  usePlansQuery,
  useOrganizationQuery,
  useCurrentUserQuery,
} from "@/hooks/queries";
import axios from "axios";
import { apiUrl } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { ContactSalesModal } from "../contact-sales-modal";
import { useContactSales } from "../contact-sales-provider";

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExpired?: boolean;
}

export const SubscriptionPlansModal = ({
  isOpen,
  onClose,
  isExpired = false,
}: SubscriptionPlansModalProps) => {
  const [contactModal, setContactModal] = useState(false);
  const { data: plans = [], isLoading } = usePlansQuery();
  const { organization } = useOrganizationQuery();
  const { data: currentUser } = useCurrentUserQuery();
  const { openContactSales } = useContactSales();
  const { t } = useLanguage();

  const storedUser = localStorage.getItem("userInfo");
  const userInfo = storedUser ? JSON.parse(storedUser) : null;
  const companyId = userInfo?.company;
  const organizationId = currentUser?.Organization_id?._id || companyId;

  const handleContactUs = () => {
    setContactModal(true);
  };

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = user?.accessToken;

      if (token) {
        await axios.post(
          `${apiUrl}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      ["userInfo", "selectedBuilding", "selectedBuildingId"].forEach((key) =>
        localStorage.removeItem(key),
      );

      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);

      ["userInfo", "selectedBuilding", "selectedBuildingId"].forEach((key) =>
        localStorage.removeItem(key),
      );
      window.location.href = "/";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={isExpired ? undefined : onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col items-center">
          <DialogHeader>
            <div className="text-center space-y-2">
              {isExpired && (
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
              )}
              <DialogTitle className="text-2xl">
                {isExpired
                  ? t("subscriptionPlans.trialExpiredTitle")
                  : t("subscriptionPlans.title")}
              </DialogTitle>
              {isExpired && (
                <p className="text-muted-foreground">
                  {t("subscriptionPlans.selectPlanToContinue")}
                </p>
              )}
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground text-lg">
                {t("subscriptionPlans.noPlansAvailable")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 py-4">
              {plans
                .filter((plan) => plan.isActive)
                .map((plan) => {
                  const isCurrent = organization?.currentPlan === plan._id;
                  const isEnterprise = plan.type === "organization";
                  const isCustomPlan = plan.price === -1;
                  return (
                    <Card
                      key={plan._id}
                      className={`py-3 px-4 ${isCurrent ? "border-blue-500 border-2" : ""} relative border flex flex-col h-full`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            {t("subscriptionPlans.currentPlan")}
                          </div>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">
                          {plan.nameKey ? t(`plan.${plan.nameKey}`) : plan.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {plan.descriptionKey
                            ? t(`plan.${plan.descriptionKey}`)
                            : plan.description}
                        </p>
                        <div className="text-2xl sm:text-xl font-bold">
                          <div className="mt-4 mb-4">
                            {isCustomPlan && (
                              <div className="text-3xl font-bold text-foreground">
                                {plan.billingTextKey
                                  ? t(`plan.${plan.billingTextKey}`)
                                  : t("subscriptionPlans.onRequest")}
                              </div>
                            )}
                            {!isCustomPlan && (
                              <span className="text-5xl font-bold text-foreground">
                                {plan.price}
                              </span>
                            )}
                            {!isCustomPlan && (
                              <span className="text-sm font-bold text-muted-foreground">
                                {plan.currency == "EUR" ? "€" : "EUR"}
                              </span>
                            )}
                            {!isCustomPlan && (
                              <span
                                className={`ml-1 ${isEnterprise ? "text-white/70" : "text-muted-foreground"}`}
                              >
                                /{t(`plan.monthly`)} (
                                {t(`plan.${plan.billingTextKey}`)})
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="space-y-3 flex-1 mb-4">
                          {(plan.featuresKeys && plan.featuresKeys.length > 0
                            ? plan.featuresKeys
                            : plan.features
                          ).map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-2"
                            >
                              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="text-sm">
                                {plan.featuresKeys &&
                                plan.featuresKeys.length > 0
                                  ? t(`plan.${feature}`)
                                  : feature}
                              </span>
                            </div>
                          ))}
                        </div>
                        {isEnterprise ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={openContactSales}
                          >
                            {t("subscriptionPlans.contactUs")}
                          </Button>
                        ) : isCurrent ? (
                          <Button
                            variant="default"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled
                          >
                            {t("subscriptionPlans.currentPlan")}
                          </Button>
                        ) : (
                          (() => {
                            const hasCurrentPlan = !!organization?.currentPlan;
                            const currentPlanObj = hasCurrentPlan
                              ? plans.find(
                                  (p) => p._id === organization.currentPlan,
                                )
                              : null;
                            const isUpgrade =
                              hasCurrentPlan &&
                              currentPlanObj &&
                              plan.price > currentPlanObj.price;
                            return (
                              <CheckoutButton
                                plan={plan}
                                organizationId={organizationId}
                                action={isUpgrade ? "upgrade" : "process"}
                                organization={organization}
                                currentPlanData={
                                  currentPlanObj
                                    ? {
                                        _id: currentPlanObj._id,
                                        name: currentPlanObj.name,
                                        price: currentPlanObj.price,
                                      }
                                    : null
                                }
                              />
                            );
                          })()
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
          <Button
            onClick={handleLogout}
            size="lg"
            className="max-w-40 font-medium py-2"
          >
            {t("subscriptionPlans.logout")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
