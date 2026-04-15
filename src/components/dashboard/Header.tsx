import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MobileMenuButton } from "./Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { restaurant } = useAuth();

  const restaurantName = restaurant?.name || t("user");
  const initials = restaurantName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <MobileMenuButton onClick={onMobileMenuClick} />
      
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              {language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("de")}>
              Deutsch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          <span className="text-xs font-medium text-muted-foreground">{initials}</span>
        </div>

        {/* User Info */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-tight">
            {t("hello")}, {restaurantName}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">{restaurant?.email || ""}</p>
        </div>
        
        {/* Notification dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="p-2 rounded-lg hover:bg-muted transition-colors relative"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="w-5 h-5 text-primary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{t("notifications")}</h3>
              </div>
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t("noNewNotifications")}</p>
              </div>
              <div className="p-3 border-t border-border">
                <button className="w-full text-sm text-primary hover:underline">
                  {t("viewAllNotifications")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
