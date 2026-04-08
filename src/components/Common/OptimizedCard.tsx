
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const OptimizedCard = React.memo(({ 
  title, 
  children, 
  className = "", 
  headerClassName = "",
  contentClassName = ""
}: OptimizedCardProps) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className={headerClassName}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
});

OptimizedCard.displayName = "OptimizedCard";

export default OptimizedCard;
