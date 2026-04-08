import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useCurrentUserQuery } from "@/hooks/queries";
import GlobalLoadingScreen from "./GlobalLoadingScreen";

export type Permission =
  | "issues"
  | "board"
  | "tasks"
  | "spaces"
  | "assets"
  | "documents"
  | "insights"
  | "qrCodes"
  | "organisation"
  | "buildings";
  

interface ProtectedRouteProps {
  children: React.ReactNode;
  section: Permission;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  section,
  fallbackPath = "/dashboard",
}) => {
  const { canAccess, isLoading, isAdmin } = usePermissions();
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error,
  } = useCurrentUserQuery();

  // Show loading while checking authentication or permissions
  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GlobalLoadingScreen isVisible={isUserLoading} />
      </div>
    );
  }

  // If no user data or error, redirect to login
  if (!currentUser || !localStorage.getItem("userInfo") || error) {
    return <Navigate to="/" replace />;
  }

  // Admin has access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user has access to this section
  if (!canAccess(section)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};