import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Users } from "lucide-react";
import { FormError } from "../ui/form-error";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentVisibilitySelectProps {
  value: string;
  onChange: (value: string) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export function DocumentVisibilitySelect({
  value,
  onChange,
  errors = {},
  clearError,
}: DocumentVisibilitySelectProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {t("documents.visibility")} <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={(val) => { onChange(val); clearError?.("visibility"); }}>
        <SelectTrigger className="h-11">
          <div className="flex items-center gap-3">
            {value === "private" && <EyeOff className="w-4.5 h-4.5" />}
            {value === "public" && <Users className="w-4.5 h-4.5" />}
            {!value && <Eye className="w-4.5 h-4.5 text-muted-icon-muted" />}
            <span className={!value ? "text-muted-foreground" : ""}>
              {value === "private" && t("documents.visibilityPrivate")}
              {value === "public" && t("documents.visibilityPublic")}
              {!value && t("documents.chooseVisibility")}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">
            <div className="flex items-start gap-3 py-1">
              <EyeOff className="w-4.5 h-4.5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{t("documents.visibilityPrivate")}</div>
                <p className="text-sm text-muted-foreground">{t("documents.privateDesc")}</p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="public">
            <div className="flex items-start gap-3 py-1">
              <Users className="w-4.5 h-4.5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{t("documents.visibilityPublic")}</div>
                <p className="text-sm text-muted-foreground">{t("documents.publicDesc")}</p>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <FormError error={errors.visibility} />
    </div>
  );
}
