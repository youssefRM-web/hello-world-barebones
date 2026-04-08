import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemainingQuotaBadgeProps {
  current: number;
  max: number | undefined;
  label: string;
  className?: string;
}

export const RemainingQuotaBadge = ({
  current,
  max,
  label,
  className,
}: RemainingQuotaBadgeProps) => {
  // If no max limit is set, don't show the badge
  if (!max) return null;

  const remaining = max - current;
  const percentage = (current / max) * 100;

  const getVariant = () => {
    if (remaining <= 0) return "destructive";
    if (percentage >= 80) return "warning";
    return "default";
  };

  const variant = getVariant();

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        variant === "destructive" && "bg-destructive/10 text-destructive border border-destructive/20",
        variant === "warning" && "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        variant === "default" && "bg-primary/5 text-muted-foreground border border-border",
        className
      )}
    >
      {variant === "destructive" ? (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      ) : variant === "warning" ? (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Info className="h-4 w-4 flex-shrink-0" />
      )}
      <span>
        {remaining <= 0 ? (
          <>No {label} remaining on your plan</>
        ) : (
          <>
            <span className="font-medium">{remaining}</span> {label} remaining ({current}/{max} used)
          </>
        )}
      </span>
    </div>
  );
};
