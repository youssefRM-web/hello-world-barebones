import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Building,
  HelpCircle,
  Building2,
  ChevronDown,
  QrCodeIcon,
  DoorClosed,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { useBuildingsQuery } from "@/hooks/queries";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useBuildingData } from "@/hooks/useBuildingData";
import MendigoLogo from "./media/Mendigo_Logo.png";
import LogoIso from "./media/logo_solo.png";
import { useNotificationBadges } from "@/contexts/NotificationBadgesContext";
import { TrialStatusBar } from "@/components/Layout/TrialStatusBar";
import { useSubscriptionStatus } from "@/hooks/queries";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface SidebarProps {
  className?: string;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarTrialWidget({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();
  
  if (isLoading || !subscriptionStatus || subscriptionStatus.status === "active") {
    return null;
  }
  
  return (
    <TrialStatusBar
      status={subscriptionStatus.status}
      trialEndsIn={subscriptionStatus.trialEndsIn}
      isCollapsed={isCollapsed}
    />
  );
}

export function Sidebar({
  className,
  isMobileMenuOpen = false,
  onCloseMobileMenu,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isBuildingsOpen, setIsBuildingsOpen] = useState(false);
  const { selectedBuilding, setSelectedBuilding } = useBuilding();
  const { setSelectedBuildingId } = useBuildingSelection();
  const { affectedBuildings } = useBuildingsQuery();
  const { canAccess, isAdmin } = usePermissions();
  const { filteredIssues } = useBuildingData();
  const {
    newIssuesCount,
    unreadTicketsCount,
    markIssuesAsViewed,
    markTicketsAsViewed,
  } = useNotificationBadges();
  const { isOnboardingVisible } = useOnboarding();


  // Mark as viewed when navigating to respective pages
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      markIssuesAsViewed();
    }
    if (location.pathname === "/dashboard/help") {
      markTicketsAsViewed();
    }
  }, [location.pathname, markIssuesAsViewed, markTicketsAsViewed]);

  const isActive = (path: string) => {
    const normalizeUrl = (url: string) => url.replace(/\/$/, "") || "/";
    const normalizedPath = normalizeUrl(location.pathname);
    const normalizedTarget = normalizeUrl(path);
    return normalizedPath === normalizedTarget;
  };

  const menuItems = [
    {
      icon: (
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 5.5C20 5.23478 19.8946 4.98051 19.707 4.79297C19.5195 4.60543 19.2652 4.5 19 4.5L5 4.5C4.73478 4.5 4.48051 4.60543 4.29297 4.79297C4.10543 4.98051 4 5.23478 4 5.5L4 19.0859L6.29297 16.793L6.36621 16.7266C6.54417 16.5807 6.76791 16.5 7 16.5L19 16.5C19.2652 16.5 19.5195 16.3946 19.707 16.207C19.8946 16.0195 20 15.7652 20 15.5L20 5.5ZM22 15.5C22 16.2957 21.6837 17.0585 21.1211 17.6211C20.5585 18.1837 19.7957 18.5 19 18.5L7.41406 18.5L3.70703 22.207C3.42103 22.493 2.99086 22.5786 2.61719 22.4238C2.24359 22.269 2 21.9044 2 21.5L2 5.5C2 4.70435 2.3163 3.94152 2.87891 3.37891C3.44152 2.8163 4.20435 2.5 5 2.5L19 2.5C19.7956 2.5 20.5585 2.8163 21.1211 3.37891C21.6837 3.94152 22 4.70435 22 5.5L22 15.5Z"
            fill={isActive("/dashboard/") ? "#2555BB" : "currentColor"}
          />
          <path
            d="M11 9.5V7.5C11 6.94772 11.4477 6.5 12 6.5C12.5523 6.5 13 6.94772 13 7.5V9.5C13 10.0523 12.5523 10.5 12 10.5C11.4477 10.5 11 10.0523 11 9.5Z"
            fill={isActive("/dashboard/") ? "#2555BB" : "currentColor"}
          />
          <path
            d="M12.0098 12.5L12.1123 12.5049C12.6165 12.5561 13.0098 12.9822 13.0098 13.5C13.0098 14.0178 12.6165 14.4439 12.1123 14.4951L12.0098 14.5H12C11.4477 14.5 11 14.0523 11 13.5C11 12.9477 11.4477 12.5 12 12.5H12.0098Z"
            fill={isActive("/dashboard/") ? "#2555BB" : "currentColor"}
          />
        </svg>
      ),
      label: t("nav.issues"),
      count: newIssuesCount > 0 ? newIssuesCount : null,
      path: "/dashboard/",
      permission: "issues" as const,
    },
    {
      icon: (
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.46 4.78L2.53999 4.78L2.53999 9.94L21.46 9.94V4.78Z"
            stroke={isActive("/dashboard/board") ? "#2555BB" : "currentColor"}
            strokeWidth="2.064"
            strokeMiterlimit="10"
            strokeLinecap="square"
          />
          <path
            d="M2.53999 15.07L21.46 15.07"
            stroke={isActive("/dashboard/board") ? "#2555BB" : "currentColor"}
            strokeWidth="2.064"
            strokeMiterlimit="10"
            strokeLinecap="square"
          />
          <path
            d="M2.53999 20.21L21.46 20.21"
            stroke={isActive("/dashboard/board") ? "#2555BB" : "currentColor"}
            strokeWidth="2.064"
            strokeMiterlimit="10"
            strokeLinecap="square"
          />
        </svg>
      ),
      label: t("nav.board"),
      count: null,
      path: "/dashboard/board/",
      permission: "board" as const,
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 12C20 9.87827 19.1575 7.84306 17.6572 6.34277C16.1574 4.84294 14.123 4.00052 12.0019 4C9.7446 4.00896 7.57806 4.88999 5.95506 6.45898L3.70702 8.70703C3.31649 9.09756 2.68348 9.09756 2.29295 8.70703C1.90243 8.31651 1.90243 7.68349 2.29295 7.29297L4.55272 5.0332L4.94627 4.66992C6.89241 2.96203 9.39523 2.00982 11.9961 2H12L12.4961 2.0127C14.9676 2.13537 17.3132 3.17061 19.0713 4.92871C20.9466 6.80407 22 9.34784 22 12C22 12.5523 21.5523 13 21 13C20.4477 13 20 12.5523 20 12Z"
            fill={isActive("/dashboard/tasks") ? "#2555BB" : "currentColor"}
          />
          <path
            d="M2 3C2 2.44772 2.44772 2 3 2C3.55228 2 4 2.44772 4 3V7H8C8.55228 7 9 7.44772 9 8C9 8.55228 8.55228 9 8 9H3C2.44772 9 2 8.55228 2 8V3Z"
            fill={isActive("/dashboard/tasks") ? "#2555BB" : "currentColor"}
          />
          <path
            d="M2 12C2 11.4477 2.44772 11 3 11C3.55228 11 4 11.4477 4 12C4 14.1217 4.84248 16.1569 6.34277 17.6572C7.84237 19.1568 9.8764 19.9982 11.9971 19.999C14.2548 19.9903 16.4217 19.1102 18.0449 17.541L20.293 15.293C20.6835 14.9024 21.3165 14.9024 21.707 15.293C22.0976 15.6835 22.0976 16.3165 21.707 16.707L19.4473 18.9668L19.0537 19.3301C17.1076 21.038 14.6048 21.9902 12.0039 22H12C9.34784 22 6.80407 20.9467 4.92871 19.0713C3.05335 17.1959 2 14.6522 2 12Z"
            fill={isActive("/dashboard/tasks") ? "#2555BB" : "currentColor"}
          />
          <path
            d="M20 21V17H16C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15H21L21.1025 15.0049C21.6067 15.0562 22 15.4823 22 16V21C22 21.5523 21.5523 22 21 22C20.4477 22 20 21.5523 20 21Z"
            fill={isActive("/dashboard/tasks") ? "#2555BB" : "currentColor"}
          />
        </svg>
      ),
      label: t("nav.tasks"),
      count: null,
      path: "/dashboard/tasks/",
      permission: "tasks" as const,
    },
    {
      icon: (
        <DoorClosed
          color={isActive("/dashboard/spaces") ? "#2555BB" : "currentColor"}
        />
      ),
      label: t("nav.spaces"),
      count: null,
      path: "/dashboard/spaces/",
      permission: "spaces" as const,
    },
    {
      icon: (
        <Printer
          color={isActive("/dashboard/assets/") ? "#2555BB" : "currentColor"}
        />
      ),
      label: t("nav.assets"),
      count: null,
      path: "/dashboard/assets/",
      permission: "assets" as const,
    },
    {
      icon: (
        <FileText
          color={isActive("/dashboard/documents/") ? "#2555BB" : "currentColor"}
        />
      ),
      label: t("nav.documents"),
      count: null,
      path: "/dashboard/documents/",
      permission: "documents" as const,
    },
    {
      icon: (
        <QrCodeIcon
          color={isActive("/dashboard/qr-codes/") ? "#2555BB" : "currentColor"}
        />
      ),
      label: t("nav.qrcode"),
      count: null,
      path: "/dashboard/qr-codes/",
      permission: "qrCodes" as const,
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill={isActive("/dashboard/insights/") ? "#2555BB" : "currentColor"}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g>
            <path fill="none" d="M0 0H24V24H0z" />
            <path d="M5 3v16h16v2H3V3h2zm15.293 3.293l1.414 1.414L16 13.414l-3-2.999-4.293 4.292-1.414-1.414L13 7.586l3 2.999 4.293-4.292z" />
          </g>
        </svg>
      ),
      label: t("nav.insights"),
      count: null,
      path: "/dashboard/insights/",
      permission: "insights" as const,
    },
  ];

  const bottomItems = [
    {
      icon: (
        <Building
          color={
            isActive("/dashboard/organisation") ? "#2555BB" : "currentColor"
          }
        />
      ),
      label: t("nav.organisation"),
      count: null,
      path: "/dashboard/organisation/",
      permission: "organisation" as const,
    },
    {
      icon: (
        <HelpCircle
          color={isActive("/dashboard/help/") ? "#2555BB" : "currentColor"}
        />
      ),
      label: t("nav.help"),
      count: unreadTicketsCount > 0 ? unreadTicketsCount : null,
      path: "/dashboard/help/",
    },
  ];

  const handleLinkClick = () => {
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const handleBuildingSelect = (building: any) => {
    setSelectedBuilding(building);
    setSelectedBuildingId(building._id);
    handleLinkClick();
  };

  const NavItem = ({
    item,
    index,
  }: {
    item: (typeof menuItems)[0];
    index: number;
  }) => {
    const active = isActive(item.path);
    const linkEl = (
      <Link
        to={item.path}
        onClick={handleLinkClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
          isCollapsed ? "justify-center" : "",
          active
            ? "bg-primary/10 text-[#2E69E8FF] font-medium"
            : "text-sidebar-foreground hover:bg-accent/50 font-medium",
        )}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="transition-transform duration-200 flex-shrink-0">
          {item.icon}
        </div>
        {!isCollapsed && (
          <span
            className={cn(
              "flex-1 text-left truncate transition-all duration-300 whitespace-nowrap",
            )}
          >
            {item.label}
          </span>
        )}
        {!isCollapsed && item.count && (
          <span className="bg-red-500 text-white opacity-100 text-xs rounded-full px-2 transition-all duration-300 py-0.5 min-w-[20px] text-center flex-shrink-0">
            {item.count}
          </span>
        )}

        {isCollapsed && item.count && (
          <span className="bg-red-500 absolute left-7 bottom-6 text-white text-xs rounded-full px-2 transition-all duration-300 py-0.5 min-w-[20px] text-center flex-shrink-0">
            {item.count}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="z-[100] flex items-center gap-2"
          >
            <span>{item.label}</span>
            {item.count && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {item.count}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkEl;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <>
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={onCloseMobileMenu}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-50 bg-background border-r border-border h-[100dvh] flex flex-col",
            "transition-[width] duration-300 ease-in-out",
            isCollapsed ? "w-[64px]" : "w-64",
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
            className,
          )}
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            paddingLeft: "env(safe-area-inset-left, 0px)",
          }}
        >
          {/* Header with logo + toggle */}
          <div
            className={cn(
              "border-b border-border flex items-center",
              isCollapsed
                ? "px-2 py-4 justify-center"
                : "px-4 py-4 justify-between",
            )}
          >
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isCollapsed ? "w-8 h-8" : "h-8 w-36",
              )}
            >
              <img
                src={isCollapsed ? LogoIso : MendigoLogo}
                alt="Logo"
                className="h-full object-contain"
              />
            </div>

            {/* Mobile close button */}
            {!isCollapsed && (
              <button
                onClick={onCloseMobileMenu}
                className="lg:hidden flex items-center justify-center bg-white rounded-md shadow-md w-8 h-8 hover:bg-accent/50 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Buildings Section */}
          <div className="p-3  border-border relative">
            <TutorialHighlight
              isHighlighted={
                isTutorialActive && currentStep === "all-buildings"
              }
            >
              <div
                className={cn(
                  "bg-background rounded-lg overflow-visible",
                  !isCollapsed && "border border-border",
                )}
              >
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (onToggleCollapse) onToggleCollapse();
                          setTimeout(() => setIsBuildingsOpen(true), 350);
                        }}
                        className="flex items-center justify-center w-full py-2"
                      >
                        {selectedBuilding ? (
                          <Avatar className="w-8 h-8 rounded-md flex-shrink-0">
                            <AvatarImage
                              src={selectedBuilding.photo}
                              alt={selectedBuilding.label}
                              className="object-cover rounded-md"
                            />
                            <AvatarFallback className="bg-[#0F4C7BFF] text-white rounded-md text-sm font-medium">
                              {selectedBuilding.label?.[0]?.toUpperCase() ??
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 bg-[#0F4C7BFF] rounded-md text-white text-sm font-medium flex items-center justify-center">
                            <Building2 className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {selectedBuilding
                        ? selectedBuilding.label
                        : t("buildings.allBuildings")}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => {
                      if (isTutorialActive && currentStep === "all-buildings") {
                        setIsBuildingsOpen(true);
                        nextStep();
                      } else {
                        setIsBuildingsOpen(!isBuildingsOpen);
                      }
                    }}
                    className="flex items-center gap-3 w-full p-3 first-letter:uppercase transition-colors duration-200 hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {selectedBuilding ? (
                        <>
                          <Avatar className="w-8 h-8 rounded-md flex-shrink-0">
                            <AvatarImage
                              src={selectedBuilding.photo}
                              alt={selectedBuilding.label}
                              className="object-cover rounded-md"
                            />
                            <AvatarFallback className="bg-[#0F4C7BFF] text-white rounded-md text-sm font-medium">
                              {selectedBuilding.label?.[0]?.toUpperCase() ??
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-foreground text-sm">
                              {selectedBuilding.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {selectedBuilding?.organization_id?.name}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-[#0F4C7BFF] rounded-md text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-foreground text-sm">
                              {t("buildings.allBuildings")}{" "}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div
                      className={cn(
                        "ml-auto transition-transform duration-300",
                        isBuildingsOpen && "rotate-180",
                      )}
                    >
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    </div>
                  </button>
                )}

                {/* Tutorial popup */}
                {isTutorialActive && currentStep === "all-buildings" && (
                  <TutorialPopup
                    title={t("tutorial.allBuildingsTitle")}
                    description={t("tutorial.allBuildingsDesc")}
                    position="right"
                    showSkip={true}
                    buttonText={t("tutorial.next")}
                  />
                )}
              </div>
            </TutorialHighlight>

            {/* Dropdown */}
            {!isCollapsed && isBuildingsOpen && (
              <div className="absolute left-3 right-3 top-[calc(100%)] bg-background border border-border rounded-lg shadow-xl z-[102] max-h-[400px] flex flex-col animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                <div className="flex-1 overflow-y-auto min-h-0">
                  <button
                    onClick={() => {
                      setSelectedBuilding(null);
                      setSelectedBuildingId(null);
                      setIsBuildingsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 py-3 px-3 w-full text-left transition-all duration-200 hover:bg-accent/50",
                      !selectedBuilding && "bg-primary/10",
                    )}
                  >
                    <div className="w-8 h-8 bg-[#0F4C7BFF] rounded-md text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm">
                        {t("buildings.allBuildings")}
                      </span>
                    </div>
                  </button>

                  {affectedBuildings &&
                    affectedBuildings.map((building) => (
                      <button
                        key={building._id}
                        onClick={() => {
                          handleBuildingSelect(building);
                          setIsBuildingsOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 py-3 px-3 w-full text-left transition-all duration-200 hover:bg-accent/50 first-letter:uppercase",
                          selectedBuilding?._id === building._id &&
                            "bg-primary/10",
                        )}
                      >
                        <Avatar className="w-8 h-8 rounded-md flex-shrink-0">
                          <AvatarImage
                            src={building.photo}
                            alt={building.label}
                            className="object-cover rounded-md"
                          />
                          <AvatarFallback className="bg-[#0F4C7BFF] text-white rounded-md text-sm font-medium">
                            {building.label?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-sm first-letter:uppercase">
                            {building.label}
                          </span>
                          <span className="text-xs text-gray-500 first-letter:uppercase">
                            {building?.organization_id?.name}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>

                <div className="p-3 border-t border-border shrink-0">
                  <TutorialHighlight
                    isHighlighted={
                      isTutorialActive && currentStep === "manage-buildings"
                    }
                  >
                    <Link
                      to="/dashboard/building"
                      className="text-blue-600 bg-blue-50 rounded-md text-sm font-medium py-2 px-3 block text-center transition-all duration-200 hover:text-blue-700"
                      onClick={() => {
                        setIsBuildingsOpen(false);
                        if (
                          isTutorialActive &&
                          currentStep === "manage-buildings"
                        )
                          nextStep();
                      }}
                    >
                      {t("buildings.manage")}
                    </Link>
                    {isTutorialActive && currentStep === "manage-buildings" && (
                      <TutorialPopup
                        title={t("tutorial.manageBuildingsTitle")}
                        description={t("tutorial.manageBuildingsDesc")}
                        position="right"
                      />
                    )}
                  </TutorialHighlight>
                </div>
              </div>
            )}
          </div>

          {/* Getting Started - only visible when onboarding is active */}
          {isOnboardingVisible && (
            <div className={cn("border-b border-border", isCollapsed ? "p-2" : "p-3")}>
              <nav>
                {(() => {
                  const gsActive = isActive("/dashboard/getting-started");
                  const gsLink = (
                    <Link
                      to="/dashboard/getting-started"
                      onClick={handleLinkClick}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                        isCollapsed ? "justify-center" : "",
                        gsActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-sidebar-foreground hover:bg-accent/50 font-medium",
                      )}
                    >
                      <Rocket className={cn("h-5 w-5 flex-shrink-0", gsActive ? "text-primary" : "")} />
                      {!isCollapsed && (
                        <span className="flex-1 text-left truncate whitespace-nowrap">
                          {t("gettingStarted.nav")}
                        </span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>{gsLink}</TooltipTrigger>
                        <TooltipContent side="right">
                          <span>{t("gettingStarted.nav")}</span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return gsLink;
                })()}
              </nav>
            </div>
          )}

          {/* Menu Items */}
          <div
            className={cn(
              "flex-1 overflow-y-auto",
              isCollapsed ? "p-2" : "p-3",
            )}
          >
            {!isCollapsed && (
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
                {t("buildings.menu")}
              </div>
            )}
            <nav className="space-y-1">
              {menuItems
                .filter(
                  (item) =>
                    !item.permission || isAdmin || canAccess(item.permission),
                )
                .map((item, index) => (
                  <NavItem key={item.label} item={item} index={index} />
                ))}
            </nav>
          </div>

          {/* Trial Status Widget */}
          <SidebarTrialWidget isCollapsed={isCollapsed} />

          {/* Bottom Items */}
          <div
            className={cn(
              "border-t border-border shrink-0",
              isCollapsed ? "p-2 pb-4" : "p-3 pb-5",
            )}
          >
            <nav className="space-y-1">
              {bottomItems
                .filter(
                  (item) =>
                    !item.permission || isAdmin || canAccess(item.permission),
                )
                .map((item, index) => {
                  const active = isActive(item.path);
                  const linkEl = (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isCollapsed ? "justify-center" : "",
                        active
                          ? "bg-primary/10 text-[#2E69E8FF]"
                          : "text-sidebar-foreground hover:bg-accent/50",
                      )}
                    >
                      <div className="flex-shrink-0">{item.icon}</div>
                      {!isCollapsed && (
                        <span
                          className={cn(
                            "flex-1 text-left truncate transition-all duration-300 whitespace-nowrap",
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                      {!isCollapsed && item.count && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="flex items-center gap-2"
                        >
                          <span>{item.label}</span>
                          {item.count && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                              {item.count}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkEl;
                })}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}
