import { useState } from "react";

export interface ValidationRule {
  required?: boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (fieldName: string, value: any): string => {
    const rule = rules[fieldName];
    if (!rule) return "";

    if (rule.required) {
      if (value === undefined || value === null || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return rule.message || "This field is required";
      }
    }

    return "";
  };

  const validateForm = (formData: Record<string, any>): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    validateField,
    clearError,
    clearAllErrors,
    setErrors,
  };
};