import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MendigoLogo from "../media/Mendigo_Logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

interface GlobalLoadingScreenProps {
  isVisible: boolean;
  hasErrors?: boolean;
  onRetry?: () => void;
}

const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  isVisible,
  hasErrors = false,
  onRetry,
}) => {
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background",
        "transition-opacity duration-500 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center space-y-6 px-4">
        <div className="flex items-center justify-start gap-3 px-2 py-3 h-12 w-48 ">
          <img src={MendigoLogo} alt="Logo" className="object-cover" />
        </div>

        {!hasErrors && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2
                className="h-8 w-8 text-primary animate-spin"
                strokeWidth={2}
              />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">
                {t("globalLoading.loadingWorkspace")}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("globalLoading.settingUpData")}
              </p>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                {t("globalLoading.somethingWentWrong")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("globalLoading.couldNotLoad")}
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
              >
                {t("globalLoading.tryAgain")}
              </button>
            )}
          </div>
        )}

        {!hasErrors && (
          <div className="flex space-x-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full bg-primary/30 animate-pulse",
                  `animation-delay-${i * 200}`
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoadingScreen;
