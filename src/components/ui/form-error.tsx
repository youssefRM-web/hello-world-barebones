import React from "react";

interface FormErrorProps {
  error?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <p className="text-xs text-destructive mt-1">
      {error}
    </p>
  );
};