import { LayoutDashboard, UtensilsCrossed, Pencil, ClipboardList, LogOut, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard" },
  { icon: UtensilsCrossed, labelKey: "menuCreation", path: "/menu-creation" },
  { icon: Pencil, labelKey: "menuEditing", path: "/menu-editing" },
  { icon: ClipboardList, labelKey: "ordersManagement", path: "/orders" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <aside 
        className={cn(
          "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-50 flex-shrink-0",
          isCollapsed ? "w-16" : "w-56",
          "fixed lg:sticky lg:top-0",
          isMobileOpen ? "left-0" : "-left-full lg:left-0"
        )}
      >
        <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          <h1 
            className={cn(
              "text-xl font-bold text-foreground whitespace-nowrap transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto delay-150"
            )}
          >
            Logo
          </h1>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-muted transition-colors hidden lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.labelKey}>
                  <NavLink
                    to={item.path}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed && "justify-center px-2",
                      isActive
                        ? "bg-sidebar-accent text-[#0A2472]"
                        : "hover:text-[#0A2472] hover:bg-sidebar-accent/50"
                    )}
                    title={isCollapsed ? t(item.labelKey) : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span 
                      className={cn(
                        "whitespace-nowrap transition-all duration-300",
                        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto delay-150"
                      )}
                    >
                      {t(item.labelKey)}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? t("logOut") : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span 
              className={cn(
                "whitespace-nowrap transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto delay-150"
              )}
            >
              {t("logOut")}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
    >
      <Menu className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
