import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  FolderOpen,
  Circle,
  User,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import axios from "axios";
import { apiUrl } from "@/services/api";
import { useCurrentUserQuery } from "@/hooks/queries";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ticketCategories = [
  {
    id: "all",
    label: "All Tickets",
    icon: MessageSquare,
    count: 5,
    path: "/admin",
  },
  {
    id: "open",
    label: "Open",
    icon: FolderOpen,
    count: 4,
    path: "/admin?filter=open",
  },
  {
    id: "unassigned",
    label: "Unassigned",
    icon: Circle,
    count: 2,
    path: "/admin?filter=unassigned",
  },
  {
    id: "my-tickets",
    label: "My Tickets",
    icon: User,
    count: 2,
    path: "/admin?filter=my-tickets",
  },
  {
    id: "resolved",
    label: "Resolved",
    icon: CheckSquare,
    count: 1,
    path: "/admin?filter=resolved",
  },
];

const analyticsItems = [
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    path: "/admin/reports",
    badge: "webview",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    path: "/admin/customers",
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: currentUser } = useCurrentUserQuery();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin" && !location.search;
    }
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return currentPath.startsWith(path);
  };

  const NavItem = ({
    item,
    showBadge = false,
  }: {
    item: (typeof ticketCategories)[0] & { badge?: string };
    showBadge?: boolean;
  }) => {
    const content = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
          isActive(item.path)
            ? "bg-primary text-primary-foreground"
            : "text-gray-400 hover:text-white hover:bg-white/10",
          isCollapsed && "justify-center px-2",
        )}
      >
        <div className={cn("flex items-center gap-2", isCollapsed && "gap-0")}>
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>{item.label}</span>}
        </div>
        {!isCollapsed && "count" in item && item.count > 0 && (
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              isActive(item.path) ? "bg-white/20" : "bg-gray-700",
            )}
          >
            {item.count}
          </span>
        )}
        {!isCollapsed && showBadge && item.badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-gray-800 text-white border-gray-700"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = user?.accessToken;

      if (token) {
        await axios.post(
          `${apiUrl}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      ["userInfo", "selectedBuilding", "selectedBuildingId"].forEach((key) =>
        localStorage.removeItem(key),
      );

      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);

      ["userInfo", "selectedBuilding", "selectedBuildingId"].forEach((key) =>
        localStorage.removeItem(key),
      );
      window.location.href = "/";
    }
  };
  
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-[#1a2332] flex flex-col transition-all duration-300",
            isCollapsed ? "w-[60px]" : "w-[200px]",
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "p-4 flex items-center gap-2",
              isCollapsed && "justify-center p-3",
            )}
          >
            {!isCollapsed && (
              <span className="text-white font-semibold">AdminPanel</span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mx-3  p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Collapse Button */}

          {/* Tickets Section */}
          <div className="px-3 mt-2">
            {!isCollapsed && (
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                Tickets
              </p>
            )}
            <nav className="space-y-1">
              {ticketCategories.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>
          </div>

          {/* Analytics Section */}
          <div className="px-3 mt-6">
            {!isCollapsed && (
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                Analytics
              </p>
            )}
            <nav className="space-y-1">
              {analyticsItems.map((item) => (
                <NavItem key={item.id} item={item as any} showBadge />
              ))}
            </nav>
          </div>

          {/* User Profile at Bottom */}
          <div
            className={cn(
              "mt-auto p-4 border-t border-gray-700",
              isCollapsed && "p-2",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center",
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
                  {currentUser?.Name[0]}
                  {currentUser?.Last_Name[0]}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate capitalize">
                      {currentUser?.Name} {currentUser?.Last_Name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser?.Roles[0]} </p>
                  </div>

                  {/* Settings Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-500 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors">
                        <Settings className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </TooltipProvider>
  );
}
