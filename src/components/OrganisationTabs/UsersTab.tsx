import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, X, Building2, UserX, Shield, User2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./UserDetailsModal";
import { useOrganizationQuery } from "@/hooks/queries";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { formatDate } from "@/utils/dateUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface User {
  name: string;
  email: string;
  status: string;
  lastActive: string;
  created: string;
  buildingAccess: string;
  permissions: string;
  isActive?: boolean;
  lastLogin?: string;
}

const UsersTab = () => {
  const { t } = useLanguage();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { orgUsers } = useOrganizationQuery();

  const { toast } = useToast();
  const filteredUsers = orgUsers?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${user?.Name || ""} ${user?.Last_Name || ""}`.toLowerCase();
    const email = user?.email?.toLowerCase() || "";
    return fullName.includes(searchLower) || email.includes(searchLower);
  });
  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleUserRowClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);
  };

  const handleAddUserSave = (userData: any) => {
    setShowSuccessMessage(true);
    toast({
      title: t("organisation.userAddedSuccess"),
      description: t("organisation.userAddedDesc"),
      variant: "success",
    });
  };

  const closeSuccessMessage = () => {
    setShowSuccessMessage(false);
  };

  return (
    <div className="space-y-4">
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <div className="font-medium text-green-800">
                {t("organisation.userAddedSuccess")}
              </div>
              <div className="text-sm text-green-600">
                {t("organisation.userAddedDesc")}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={closeSuccessMessage}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Card className="border-none px-0 space-y-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              {t("organisation.users")}{" "}
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {orgUsers?.length}
              </span>
            </CardTitle>

            <Button
              size="lg"
              onClick={handleAddUser}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("organisation.addUser")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t("organisation.searchByNameOrEmail")}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">
                      {t("organisation.user")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("organisation.status")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("organisation.lastActive")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("organisation.joined")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("organisation.buildings")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("organisation.permissions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => handleUserRowClick(user)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                              {user?.profile_picture && (
                                <AvatarImage
                                  src={user.profile_picture}
                                  className="object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              )}
                              <AvatarFallback className="bg-[#0F4C7BFF] text-white text-lg rounded-md uppercase">
                                <User2 />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground capitalize">
                                {user?.Name && user?.Last_Name
                                  ? `${user.Name} ${user.Last_Name}`
                                  : t("organisation.unknownUser")}
                              </p>
                              <p className="text-sm text-muted-foreground first-letter:uppercase">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                              user?.accessBlocked
                                ? "bg-red-100 text-red-800"
                                : user?.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user?.accessBlocked
                              ? t("organisation.inactive")
                              : user?.status === "ACCEPTED"
                                ? t("organisation.active")
                                : t("organisation.pending")}
                          </span>
                        </TableCell>

                        <TableCell className="font-medium">
                          {user?.lastLogin ? (
                            <div className="flex flex-col leading-tight">
                              <time className="text-sm text-foreground">
                                {formatDate(user.lastLogin)}
                              </time>
                              <time className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(user.lastLogin).toLocaleTimeString(
                                    "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: false
                                  },
                                )}
                              </time>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("organisation.never")}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="text-sm">
                            {formatDate(user?.createdAt)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">
                              {user?.buildingIds?.length || 0}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-start">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">
                              {(() => {
                                if (
                                  !user.buildingPermissions ||
                                  !Array.isArray(user.buildingPermissions)
                                ) {
                                  return "0";
                                }

                                let count = 0;

                                for (const entry of user.buildingPermissions) {
                                  if (entry?.permissions) {
                                    const allValues = Object.values(
                                      entry.permissions,
                                    ) // {assets: obj, board: obj, ...}
                                      .flatMap((group) => Object.values(group)); // flatten all boolean fields
                                    count += allValues.filter(Boolean).length;
                                  }
                                }

                                return count;
                              })()}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{t("organisation.noUsersFound")}</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="lg:hidden py-4 space-y-4">
              {filteredUsers?.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserRowClick(user)}
                    className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                          {user?.profile_picture && (
                            <AvatarImage
                              src={user.profile_picture}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                          <AvatarFallback className="bg-[#0F4C7BFF] text-white text-lg rounded-md uppercase">
                            {user?.Name?.[0] || user?.email?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">
                            {user?.Name && user?.Last_Name
                              ? `${user.Name} ${user.Last_Name}`
                              : t("organisation.unknownUser")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user?.accessBlocked
                            ? "bg-red-100 text-red-800"
                            : user?.status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {user?.accessBlocked
                          ? t("organisation.inactive")
                          : user?.status === "ACCEPTED"
                            ? t("organisation.active")
                            : t("organisation.invited")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          {t("organisation.lastActive")}
                        </p>
                        <p className="font-medium">
                          {user?.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString(
                                "en-GB",
                              )
                            : t("organisation.never")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {t("organisation.joined")}
                        </p>
                        <p className="font-medium">
                          {new Date(user?.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {t("organisation.buildings")}
                        </p>
                        <p className="font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {user?.buildingIds?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {t("organisation.permissions")}
                        </p>
                        <p className="font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          {(() => {
                            if (
                              !user.buildingPermissions ||
                              !Array.isArray(user.buildingPermissions)
                            ) {
                              return "0";
                            }

                            let count = 0;

                            for (const entry of user.buildingPermissions) {
                              if (entry?.permissions) {
                                const allValues = Object.values(
                                  entry.permissions,
                                ) // {assets: obj, board: obj, ...}
                                  .flatMap((group) => Object.values(group)); // flatten all boolean fields
                                count += allValues.filter(Boolean).length;
                              }
                            }

                            return count;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">
                    {t("organisation.noUsersYet")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSave={handleAddUserSave}
      />

      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersTab;
