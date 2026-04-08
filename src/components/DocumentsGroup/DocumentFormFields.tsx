import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentFormFieldsProps {
  formData: {
    name: string;
    additionalInformation: string;
  };
  onFieldChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export function DocumentFormFields({
  formData,
  onFieldChange,
  errors = {},
  clearError,
}: DocumentFormFieldsProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="space-y-7">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("documents.documentNameLabel")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder={t("documents.documentNamePlaceholder")}
            className="h-11 text-sm"
            value={formData.name}
            onChange={(e) => {
              onFieldChange("name", e.target.value);
              clearError?.("name");
            }}
          />
          <FormError error={errors.name} />
        </div>

        {/* Additional Information */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("documents.additionalInformation")}{" "}
            <span className="text-muted-foreground text-sm">({t("documents.additionalInfoOptional")})</span>
          </Label>
          <Textarea
            id="additionalInformation"
            placeholder={t("documents.additionalInfoPlaceholder")}
            className="min-h-32 resize-none text-sm"
            value={formData.additionalInformation}
            onChange={(e) =>
              onFieldChange("additionalInformation", e.target.value)
            }
          />
        </div>
      </div>
    </>
  );
}
