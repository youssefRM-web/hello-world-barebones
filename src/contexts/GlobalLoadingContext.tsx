import React, { createContext, useContext, useMemo } from "react";
import { useCurrentUserQuery, useReferenceDataQuery, useBuildingsQuery, useOrganizationQuery } from "@/hooks/queries";

interface GlobalLoadingState {
  isLoading: boolean;
  isInitialLoad: boolean;
  errors: (string | null)[];
  hasErrors: boolean;
}

const GlobalLoadingContext = createContext<GlobalLoadingState | undefined>(
  undefined
);

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error(
      "useGlobalLoading must be used within a GlobalLoadingProvider"
    );
  }
  return context;
};

export const GlobalLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Only fetch data if user is authenticated
  const isAuthenticated = !!localStorage.getItem("userInfo");
  
  const currentUserQuery = useCurrentUserQuery();
  const referenceDataQuery = useReferenceDataQuery();
  const buildingsQuery = useBuildingsQuery();
  const organizationQuery = useOrganizationQuery();

  const value = useMemo<GlobalLoadingState>(() => {
    // If not authenticated, don't show loading
    if (!isAuthenticated) {
      return {
        isLoading: false,
        isInitialLoad: false,
        errors: [],
        hasErrors: false,
      };
    }

    const isLoading =
      currentUserQuery.isLoading ||
      referenceDataQuery.isLoading ||
      buildingsQuery.isLoading ||
      organizationQuery.isLoading;

    const errors = [
      currentUserQuery.error?.message,
      referenceDataQuery.error?.message,
    ].filter(Boolean);

    return {
      isLoading,
      isInitialLoad: isLoading,
      errors,
      hasErrors: errors.length > 0,
    };
  }, [
    isAuthenticated,
    currentUserQuery.isLoading,
    currentUserQuery.error,
    referenceDataQuery.isLoading,
    referenceDataQuery.error,
    buildingsQuery.isLoading,
    organizationQuery.isLoading,
  ]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};