import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import { useReferenceData } from "@/hooks/useReferenceData";

import { useSubscriptionStatus, useCurrentUserQuery } from "@/hooks/queries";
import { SubscriptionPlansModal } from "../modals/SubscriptionPlansModal";
import { ContactOrganizationModal } from "../modals/ContactOrganizationModal";
import CreateOrganizationOnboardingModal from "../modals/CreateOrganizationOnboardingModal";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

/** Inner component that can access OnboardingContext */
const AppLayoutInner = ({ children }: AppLayoutProps) => {
  const { isLoading } = useReferenceData();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWarningBar, setShowWarningBar] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };
  const { data: subscriptionStatus, isLoading: isLoadingSubscription } =
    useSubscriptionStatus();
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const { data: currentUser } = useCurrentUserQuery();
  const { isOnboardingVisible } = useOnboarding();
  
  const isExpired = subscriptionStatus?.status === "expired";

  // Check if user is admin (admins don't need onboarding)
  const isAdminUser = Array.isArray(currentUser?.Roles) && 
    currentUser.Roles[0]?.toLowerCase() === "admin";
  
  // Check if user is a manager (can manage subscription)
  const isManager = Array.isArray(currentUser?.Roles) && 
    currentUser.Roles[0]?.toLowerCase() === "manager";
  
  // Check if user needs to create organization (not for admins)
  const shouldShowOnboarding =
    currentUser &&
    !currentUser.Organization_id &&
    !currentUser.inviteId &&
    !isAdminUser;

  // Auto-redirect new users to Getting Started page
  useEffect(() => {
    if (
      isOnboardingVisible &&
      currentUser &&
      currentUser.Organization_id &&
      !isAdminUser &&
      location.pathname === "/dashboard"
    ) {
      navigate("/dashboard/getting-started", { replace: true });
    }
  }, [isOnboardingVisible, currentUser, isAdminUser, location.pathname, navigate]);

  React.useEffect(() => {
    if (isExpired) {
      if (isManager) {
        setShowPlansModal(true);
        setShowContactModal(false);
      } else {
        setShowContactModal(true);
        setShowPlansModal(false);
      }
    }
  }, [isExpired, isManager]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Sidebar - hidden on mobile, visible on desktop - sticky */}
      <div className="hidden z-[20] lg:block lg:sticky lg:top-0 lg:h-screen flex-shrink-0">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* TopBar - sticky */}
        <div className="sticky top-0 z-30 bg-white">
          <TopBar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>

        {/* Expired Overlay */}
        {isExpired && (
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md z-40"
          />
        )}

        {/* Subscription Plans Modal - for managers */}
        <SubscriptionPlansModal
          isOpen={showPlansModal}
          onClose={() => !isExpired && setShowPlansModal(false)}
          isExpired={isExpired}
        />

        {/* Contact Organization Modal - for members */}
        <ContactOrganizationModal
          isOpen={showContactModal}
          onClose={() => !isExpired && setShowContactModal(false)}
          isExpired={isExpired}
        />

        {/* Mandatory Organization Onboarding Modal */}
        {shouldShowOnboarding && currentUser && (
          <CreateOrganizationOnboardingModal
            open={true}
            userId={currentUser._id}
          />
        )}
      </div>
    </div>
  );
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <OnboardingProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </OnboardingProvider>
  );
};

export default AppLayout;
