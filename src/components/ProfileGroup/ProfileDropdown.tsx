import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Bell, LogOut, Languages, Cookie } from "lucide-react";
import { useCurrentUserQuery } from "@/hooks/queries";
import { apiUrl } from "@/services/api";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

const ProfileDropdown = () => {
  const { t } = useLanguage();
  const { data: currentUser, isLoading: userLoading } = useCurrentUserQuery();
  const [imgError, setImgError] = useState(false);

  const getInitials = (user: any) => {
    if (!user) return "";
    const firstNameInitials = user?.Name?.split(" ")
      .map((n: string) => n[0]?.toUpperCase())
      .join("");
    const lastNameInitial = user.Last_Name[0].toUpperCase() || "";
    return (firstNameInitials + lastNameInitial).toUpperCase();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100  transition-colors">
          <Avatar className="h-9 w-9">
            {currentUser?.profile_picture && (
              <AvatarImage
                src={currentUser.profile_picture}
                alt={currentUser?.Name || "Profile"}
                onError={() => setImgError(true)}
              />
            )}
            <AvatarFallback className="bg-[#0F4C7BFF] text-white">
              {getInitials(currentUser)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-58 bg-background" align="end">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            {currentUser?.profile_picture && !imgError ? (
              <AvatarImage
                src={currentUser?.profile_picture}
                alt={currentUser.Name || "Profile"}
                onError={() => setImgError(true)}
              />
            ) : (
              <AvatarFallback className="bg-[#0F4C7BFF] text-white">
                {getInitials(currentUser)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-semibold capitalize">
              {currentUser?.Name && currentUser?.Last_Name
                ? `${currentUser?.Name} ${currentUser?.Last_Name}`
                : t("buildings.unknownUser")}
            </div>
            <div className="text-sm text-gray-500 first-letter:uppercase">
              {currentUser?.Email
                ? `${currentUser?.Email}`
                : t("buildings.unknownEmail")}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/dashboard/profile?tab=profile"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>{t("buildings.profile")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/dashboard/profile?tab=password"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>{t("buildings.password")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/dashboard/profile?tab=notifications"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span>{t("buildings.notifications")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/dashboard/profile?tab=language"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Languages className="h-4 w-4" />
            <span>{t("buildings.language")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => {
            const cb = (window as any).Cookiebot;
            if (cb) {
              if (typeof cb.renew === "function") {
                cb.renew();
              } else if (typeof cb.show === "function") {
                cb.show();
              }
            }
          }}
        >
          <Cookie className="h-4 w-4" />
          <span>{t("buildings.cookieSettings")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center space-x-2 cursor-pointer text-[#DE3B40FF]"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>{t("buildings.logOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
