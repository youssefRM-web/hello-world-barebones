import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GeneralTab from "@/components/OrganisationTabs/GeneralTab";
import SubscriptionTab from "@/components/OrganisationTabs/SubscriptionTab";
import BillingTab from "@/components/OrganisationTabs/BillingTab";
import InvoicesTab from "@/components/OrganisationTabs/InvoicesTab";
import UsersTab from "@/components/OrganisationTabs/UsersTab";
import SettingsTab from "@/components/OrganisationTabs/SettingsTab";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2,
  CreditCard,
  FileText,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { useOrganizationQuery } from "@/hooks/queries";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { usePermissions } from "@/contexts/PermissionsContext";

const Organisation = () => {
  const { t } = useLanguage();
  const { hasPermission, isAdmin } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading } = useOrganizationQuery();

  // Build available tabs based on permissions
  const availableTabs = useMemo(() => {
    const tabs: { value: string; label: string; icon: React.ReactNode; permission?: boolean }[] = [
      { value: "general", label: t("organisation.general"), icon: <Building2 className="w-4 h-4" />, permission: true },
      { value: "subscription", label: t("organisation.subscription"), icon: <CreditCard className="w-4 h-4" />, permission: isAdmin || hasPermission("organisation", "manageSubscription") },
      { value: "billing", label: t("organisation.billing"), icon: <Receipt className="w-4 h-4" />, permission: isAdmin || hasPermission("organisation", "manageBillingPayment") },
      { value: "invoices", label: t("organisation.invoices"), icon: <FileText className="w-4 h-4" />, permission: isAdmin || hasPermission("organisation", "manageInvoices") },
      { value: "users", label: t("organisation.users"), icon: <Users className="w-4 h-4" />, permission: isAdmin || hasPermission("organisation", "manageUsers") },
      // { value: "settings", label: t("organisation.settings"), icon: <Settings className="w-4 h-4" />, permission: isAdmin || hasPermission("organisation", "manageSettings") },
    ];
    return tabs.filter((tab) => tab.permission);
  }, [isAdmin, hasPermission, t]);

  const defaultTab = searchParams.get("tab") || availableTabs[0]?.value || "general";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab with URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // Keep activeTab in sync with URL on mount/navigation
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || availableTabs[0]?.value || "general";
    // If the tab from URL is not available, fallback to first available
    const isTabAvailable = availableTabs.some((t) => t.value === tabFromUrl);
    const finalTab = isTabAvailable ? tabFromUrl : availableTabs[0]?.value || "general";
    if (finalTab !== activeTab) {
      setActiveTab(finalTab);
    }
  }, [searchParams, availableTabs]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <PageLoadingSkeleton variant="default" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
          {t("pages.organisation")}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Mobile: Dropdown with Icons */}
        <div className="block md:hidden mb-6">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full h-12">
              <SelectValue>
                <div className="flex items-center gap-3">
                  {availableTabs.find((t) => t.value === activeTab)?.icon}
                  <span className="font-medium">
                    {availableTabs.find((t) => t.value === activeTab)?.label}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableTabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    {tab.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop & Tablet: Tabs with Icons */}
        <TabsList className="hidden md:flex flex-none w-full max-w-none gap-2 lg:gap-6 justify-start">
          {availableTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>
        {(isAdmin || hasPermission("organisation", "manageSubscription")) && (
          <TabsContent value="subscription">
            <SubscriptionTab />
          </TabsContent>
        )}
        {(isAdmin || hasPermission("organisation", "manageBillingPayment")) && (
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
        )}
        {(isAdmin || hasPermission("organisation", "manageInvoices")) && (
          <TabsContent value="invoices">
            <InvoicesTab />
          </TabsContent>
        )}
        {(isAdmin || hasPermission("organisation", "manageUsers")) && (
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        )}
        {/* {(isAdmin || hasPermission("organisation", "manageSettings")) && (
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        )} */}
      </Tabs>
    </div>
  );
};

export default Organisation;
