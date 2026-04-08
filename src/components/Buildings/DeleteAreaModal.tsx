import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  areaName: string;
  isDeleting: boolean;
}

export function DeleteAreaModal({
  isOpen,
  onClose,
  onConfirm,
  areaName,
  isDeleting,
}: DeleteAreaModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buildings.confirmArea")}</DialogTitle>
          <DialogDescription>
            {t("buildings.deleteAreaConfirm").replace("{name}", areaName)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("buildings.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("buildings.deleting") : t("buildings.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
