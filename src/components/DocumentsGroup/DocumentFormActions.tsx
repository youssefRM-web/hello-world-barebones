import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function DocumentFormActions({
  onCancel,
  onSave,
  isLoading,
}: DocumentFormActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" size="lg" onClick={onCancel}>
        {t("documents.cancel")}
      </Button>
      <Button
        onClick={onSave}
        disabled={isLoading}
        className="text-white"
        size="lg"
      >
        {isLoading ? t("documents.uploading") : t("documents.save")}
      </Button>
    </div>
  );
}
