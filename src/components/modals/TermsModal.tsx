import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("legal.termsTitle")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <p>{t("legal.termsContent.intro")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section1Title")}</h3>
            <p>{t("legal.termsContent.section1")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section2Title")}</h3>
            <p>{t("legal.termsContent.section2")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section3Title")}</h3>
            <p>{t("legal.termsContent.section3")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section4Title")}</h3>
            <p>{t("legal.termsContent.section4")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section5Title")}</h3>
            <p>{t("legal.termsContent.section5")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section6Title")}</h3>
            <p>{t("legal.termsContent.section6")}</p>
            <h3 className="font-semibold">{t("legal.termsContent.section7Title")}</h3>
            <p>{t("legal.termsContent.section7")}</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
