import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("legal.privacyTitle")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <p>{t("legal.privacyContent.intro")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section1Title")}</h3>
            <p>{t("legal.privacyContent.section1")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section2Title")}</h3>
            <p>{t("legal.privacyContent.section2")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section3Title")}</h3>
            <p>{t("legal.privacyContent.section3")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section4Title")}</h3>
            <p>{t("legal.privacyContent.section4")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section5Title")}</h3>
            <p>{t("legal.privacyContent.section5")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section6Title")}</h3>
            <p>{t("legal.privacyContent.section6")}</p>
            <h3 className="font-semibold">{t("legal.privacyContent.section7Title")}</h3>
            <p>{t("legal.privacyContent.section7")}</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
