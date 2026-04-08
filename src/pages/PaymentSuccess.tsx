import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { queryClient } from "@/lib/queryClient";

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(4);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Invalidate subscription & organization queries so UI updates after redirect
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
    queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    queryClient.invalidateQueries({ queryKey: ["plans"] });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Invalidate again right before navigating to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ["organization"] });
          queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
          window.location.href = "/dashboard/organisation?tab=subscription";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
    queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    window.location.href = "/dashboard/organisation?tab=subscription"
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t("paymentSuccess.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("paymentSuccess.subscriptionActivated")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t("paymentSuccess.redirecting")}{" "}
                <span className="font-bold text-foreground">{countdown}</span>{" "}
                {t("paymentSuccess.seconds")}
              </p>
            </div>

            <Button
              onClick={handleGoToSubscription}
              className="w-full"
              size="lg"
            >
              {t("paymentSuccess.goToSubscription")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
