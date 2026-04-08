import React from "react";
import { Input } from "@/components/ui/input";
import { Menu, Search, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ProfileDropdown from "@/components/ProfileGroup/ProfileDropdown";
import NotificationDropdown from "@/components/OrganisationTabs/NotificationDropdown";
import { Sidebar } from "../Sidebar";

interface TopBarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const TopBar = ({ isSidebarCollapsed, onToggleSidebar }: TopBarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      <div className="bg-white border-b border-gray-200 p-[0.39rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile spacing for menu button */}
            <div className="w-8 lg:w-0"></div>
            {/* Sidebar collapse/expand toggle — desktop only */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors duration-200 text-muted-foreground hover:text-foreground"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="relative hidden sm:block">
             {/*  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-9 w-32 sm:w-48 lg:w-64"
              /> */}
            </div>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <Sidebar
          className={
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={closeMobileMenu}
        />
      )}
    </>
  );
};

export default TopBar;