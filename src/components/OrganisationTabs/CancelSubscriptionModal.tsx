import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName?: string;
  isLoading?: boolean;
}

const CancelSubscriptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  planName,
  isLoading = false,
}: CancelSubscriptionModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle>{t("organisation.cancelSubscription")}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t("organisation.cancelSubscriptionConfirm")}{" "}
            <span className="font-semibold text-foreground">{planName}</span> {t("organisation.subscription").toLowerCase()}?
          </p>
          <p className="text-sm text-muted-foreground">
            {t("organisation.cancelSubscriptionWarning")}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("organisation.keepSubscription")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("organisation.cancelling")}
              </>
            ) : (
              t("organisation.cancelSubscription")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionModal;
