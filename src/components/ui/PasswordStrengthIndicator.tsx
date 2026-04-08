import React from "react";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { t } = useLanguage();
  const hasMinLength = password.length >= 8;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const rules = [
    { label: t("profile.passwordMinLength"), met: hasMinLength },
    { label: t("profile.passwordCapitalLetter"), met: hasCapitalLetter },
    { label: t("profile.passwordNumber"), met: hasNumber },
  ];

  return (
    <div className="space-y-2 mt-2">
      {rules.map((rule, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {rule.met ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={rule.met ? "text-green-600" : "text-muted-foreground"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export const isPasswordValid = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
};
