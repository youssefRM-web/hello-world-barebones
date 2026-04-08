
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ 
  size = 24, 
  className = "",
  text = "Loading..."
}: {
  size?: number;
  className?: string;
  text?: string;
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[600px] ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
