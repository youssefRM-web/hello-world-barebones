import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface TrialStatusBarProps {
  status: "trial" | "expired" | "active";
  trialEndsIn?: number;
  isCollapsed?: boolean;
}

export const TrialStatusBar = ({
  status,
  trialEndsIn,
  isCollapsed = false,
}: TrialStatusBarProps) => {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUserQuery();
  const { t } = useLanguage();

  const isManager =
    Array.isArray(currentUser?.Roles) &&
    currentUser.Roles[0]?.toLowerCase() === "manager";

  if (status === "active") {
    return null;
  }
  
  const daysLabel =
    trialEndsIn !== undefined
      ? `${trialEndsIn} ${trialEndsIn !== 1 ? t("trialBar.days") : t("trialBar.day")}`
      : "";

  const handleUpgrade = () => {
    navigate("/dashboard/organisation?tab=subscription");
  };

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        <div className="bg-card rounded-xl shadow-sm border border-border p-2 flex flex-col items-center gap-1.5">
          {status === "trial" && trialEndsIn !== undefined && (
            <span className="text-sm font-semibold text-foreground">
              {trialEndsIn} d
            </span>
          )}
          <button
            onClick={handleUpgrade}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(280, 70%, 55%), hsl(340, 80%, 55%))",
            }}
          >
            <Rocket className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded sidebar view
  return (
    <div className="px-3 py-3">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 flex flex-col items-center gap-3">
        {status === "trial" && trialEndsIn !== undefined && (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-medium">{t("trialBar.trialPeriod")}</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold">{daysLabel}</span>
          </div>
        )}
        {status === "expired" && (
          <span className="text-sm font-medium text-destructive text-center">
            {isManager
              ? t("trialBar.trialExpired")
              : t("trialBar.trialExpiredNonManager")}
          </span>
        )}
        {isManager && (
          <button
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, hsl(280, 70%, 55%), hsl(340, 80%, 55%))",
            }}
          >
            <Rocket className="h-4 w-4" />
            {t("trialBar.upgradeNow")}
          </button>
        )}
      </div>
    </div>
  );
};
