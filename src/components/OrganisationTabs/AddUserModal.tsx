import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, X } from "lucide-react";
import { useBuilding } from "@/contexts/BuildingContext";
import axios from "axios";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import {
  useCurrentUserQuery,
  useOrganizationQuery,
  usePlansQuery,
} from "@/hooks/queries";
import { apiUrl } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { isValidEmail } from "@/utils/emailValidation";
import { toast } from "@/hooks/use-toast";
import { RemainingQuotaBadge } from "@/components/Common/RemainingQuotaBadge";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

const AddUserModal = ({ isOpen, onClose, onSave }: AddUserModalProps) => {
  const { t } = useLanguage();
  const { selectedBuilding } = useBuilding();
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [selectedBuildingID, setSelectedBuildingID] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { buildings } = useReferenceData();
  const { data: currentUser } = useCurrentUserQuery();
  const { organization, orgUsers } = useOrganizationQuery();
  const { data: plans = [] } = usePlansQuery();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) {
      setEmailAddresses([]);
      setCurrentEmail("");
      setSelectedBuildingID([]);
      setPermissions({
        issues: { accessNewIssues: false, acceptDeclineNewIssues: false },
        board: {
          accessTicketBoard: false,
          createTickets: false,
          manageOwnTickets: false,
          editTimeLog: false,
          editMaterialLog: false,
        },
        tasks: {
          accessTasks: false,
          createTasks: false,
          updateTasks: false,
          deleteTasks: false,
        },
        spaces: {
          accessSpaces: false,
          createSpaces: false,
          updateSpaces: false,
          deleteSpaces: false,
        },
        assets: {
          accessAssets: false,
          createAssets: false,
          updateAssets: false,
          deleteAssets: false,
        },
        documents: {
          accessDocuments: false,
          createDocuments: false,
          updateDocuments: false,
          deleteDocuments: false,
        },
        insights: { accessInsights: false },
        qrCodes: { accessQRCodes: false, createQRCodes: false },
        organisation: {
          accessOrganisation: false,
          manageSubscription: false,
          manageBillingPayment: false,
          manageInvoices: false,
          manageUsers: false,
          manageSettings: false,
        },
        buildings: {
          manageBuildings: false,
          manageCategories: false,
          manageReportFlow: false,
        },
      });
    }
  }, [isOpen]);

  const [permissions, setPermissions] = useState({
    issues: { accessNewIssues: false, acceptDeclineNewIssues: false },
    board: {
      accessTicketBoard: false,
      createTickets: false,
      manageOwnTickets: false,
      editTimeLog: false,
      editMaterialLog: false,
    },
    tasks: {
      accessTasks: false,
      createTasks: false,
      updateTasks: false,
      deleteTasks: false,
    },
    spaces: {
      accessSpaces: false,
      createSpaces: false,
      updateSpaces: false,
      deleteSpaces: false,
    },
    assets: {
      accessAssets: false,
      createAssets: false,
      updateAssets: false,
      deleteAssets: false,
    },
    documents: {
      accessDocuments: false,
      createDocuments: false,
      updateDocuments: false,
      deleteDocuments: false,
    },
    insights: { accessInsights: false },
    qrCodes: { accessQRCodes: false, createQRCodes: false },
    organisation: {
      accessOrganisation: false,
      manageSubscription: false,
      manageBillingPayment: false,
      manageInvoices: false,
      manageUsers: false,
      manageSettings: false,
    },
    buildings: {
      manageBuildings: false,
      manageCategories: false,
      manageReportFlow: false,
    },
  });

  const handlePermissionChange = (
    category: string,
    permission: string,
    value: boolean,
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [permission]: value,
      },
    }));
  };

  const handleSelectAll = (category: string) => {
    const categoryPerms = permissions[category as keyof typeof permissions];
    const allEnabled = Object.values(categoryPerms).every((val) => val);
    setPermissions((prev) => ({
      ...prev,
      [category]: Object.keys(categoryPerms).reduce(
        (acc, key) => ({ ...acc, [key]: !allEnabled }),
        {},
      ),
    }));
  };

  const handleAddEmail = () => {
    const trimmedEmail = currentEmail.trim();

    if (!trimmedEmail) {
      toast({
        title: t("organisation.emailRequiredToast"),
        description: t("organisation.enterEmailToast"),
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: t("organisation.invalidEmailToast"),
        description: t("organisation.validEmailToast"),
        variant: "destructive",
      });
      return;
    }

    if (
      currentUser?.Email &&
      trimmedEmail.toLowerCase() === currentUser.Email.toLowerCase()
    ) {
      toast({
        title: t("organisation.invalidEmailToast"),
        description: t("organisation.cannotInviteSelf"),
        variant: "destructive",
      });
      return;
    }

    if (emailAddresses.includes(trimmedEmail)) {
      toast({
        title: t("organisation.duplicateEmail"),
        description: t("organisation.duplicateEmailDesc"),
        variant: "destructive",
      });
      return;
    }

    setEmailAddresses([...emailAddresses, trimmedEmail]);
    setCurrentEmail("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailAddresses(
      emailAddresses.filter((email) => email !== emailToRemove),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSave = async () => {
    if (!currentUser?.Organization_id?._id) return;
    if (emailAddresses.length === 0) return;

    setIsLoading(true);

    const resolvedBuildingIds = selectedBuildingID.includes("all")
      ? buildings.filter((b) => !b.archived).map((b) => b._id)
      : selectedBuildingID;

    const buildingPermissions = resolvedBuildingIds.map((bId) => ({
      buildingId: bId,
      permissions: permissions,
    }));

    const userData = {
      email: emailAddresses.join(","),
      organizationId: currentUser?.Organization_id?._id,
      buildingIds: resolvedBuildingIds,
      role: "Member",
      buildingPermissions: buildingPermissions,
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.accessToken;

      // Get language from localStorage (fallback to 'en')
      const lang = localStorage.getItem("language") || "en";

      const response = await axios.post(`${apiUrl}/invite`, userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": lang,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: ["organization", currentUser?.Organization_id?._id],
      });

      const { getFirstAvailableRoute } =
        await import("@/utils/permissionRedirect");
      const userPermissions = Object.keys(permissions).filter((key) =>
        Object.values(permissions[key as keyof typeof permissions]).some(
          Boolean,
        ),
      );
      const redirectRoute = getFirstAvailableRoute(userPermissions as any);
      localStorage.setItem(
        `newUserRoute_${response.data.email}`,
        redirectRoute,
      );

      onSave(response.data);
      onClose();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      toast({
        title: t("organisation.invitationError"),
        description: backendMessage,
        variant: "destructive",
      });
      console.error("Error adding user:", backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPermissionSection = (
    title: string,
    category: string,
    permissionList: { key: string; label: string }[],
  ) => {
    const categoryPerms = permissions[category as keyof typeof permissions];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            <span className="text-sm text-gray-500">
              {Object.keys(categoryPerms).length}/
              {Object.keys(categoryPerms).length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectAll(category)}
            className="text-blue-600"
          >
            {t("organisation.selectAll")}
          </Button>
        </div>
        <div className="space-y-2">
          {permissionList.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch
                checked={
                  categoryPerms[key as keyof typeof categoryPerms] as boolean
                }
                onCheckedChange={(checked) =>
                  handlePermissionChange(category, key, checked)
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {t("organisation.createUser")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t("organisation.close")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("organisation.inviteTeamMembers")}
            <br />
            {t("organisation.newUsersProvideDetails")}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="space-y-10">
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                {t("organisation.emailAddresses")}{" "}
                <span className="text-destructive">*</span>
              </Label>

              {emailAddresses.length > 0 && (
                <div className="flex flex-wrap gap-3 p-4 border rounded-xl bg-muted/20">
                  {emailAddresses.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 px-4 py-2 bg-background border rounded-full text-sm font-medium shadow-sm hover:shadow transition-shadow"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-2 hover:bg-destructive/10 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 max-w-2xl">
                <Input
                  id="email"
                  placeholder={t("organisation.enterEmailAddress")}
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-11 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddEmail}
                  disabled={!currentEmail.trim()}
                  size="lg"
                  className="min-w-36"
                >
                  {t("organisation.addEmail")}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t("organisation.buildingAccess")}
              </Label>

              {selectedBuildingID.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
                  {selectedBuildingID.includes("all") ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium">
                      <span>{t("organisation.allBuildings")}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBuildingID([])}
                        className="hover:bg-destructive/10 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    selectedBuildingID.map((id) => {
                      const building = buildings.find((b) => b._id === id);
                      return building ? (
                        <div
                          key={id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-background border rounded-full text-sm"
                        >
                          <span>{building.label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBuildingID((prev) =>
                                prev.filter((bid) => bid !== id),
                              )
                            }
                            className="hover:bg-destructive/10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              )}

              <Select
                value=""
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedBuildingID(["all"]);
                  } else if (
                    !selectedBuildingID.includes(value) &&
                    !selectedBuildingID.includes("all")
                  ) {
                    setSelectedBuildingID((prev) => [...prev, value]);
                  }
                }}
              >
                <SelectTrigger className="w-full max-w-md h-11">
                  <SelectValue
                    placeholder={t("organisation.selectBuildings")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t("organisation.allBuildings")}
                  </SelectItem>
                  {buildings
                    .filter((building) => !building.archived)
                    .map((building) => (
                      <SelectItem
                        key={building._id}
                        value={building._id}
                        disabled={
                          selectedBuildingID.includes("all") ||
                          selectedBuildingID.includes(building._id)
                        }
                      >
                        {building.label}
                      </SelectItem>
                    ))}
                  {buildings?.length === 0 && (
                    <SelectItem value="none" disabled className="italic">
                      {t("organisation.noBuildingsAvailable")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {t("organisation.buildingAccessDesc")}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">
                {t("organisation.permissions")}
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {renderPermissionSection(
                    t("organisation.permIssues"),
                    "issues",
                    [
                      {
                        key: "accessNewIssues",
                        label: t("organisation.canAccessNewIssues"),
                      },
                      {
                        key: "acceptDeclineNewIssues",
                        label: t("organisation.canAcceptDeclineIssues"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permTasks"),
                    "tasks",
                    [
                      {
                        key: "accessTasks",
                        label: t("organisation.canAccessTasks"),
                      },
                      {
                        key: "createTasks",
                        label: t("organisation.canCreateTasks"),
                      },
                      {
                        key: "updateTasks",
                        label: t("organisation.canUpdateTasks"),
                      },
                      {
                        key: "deleteTasks",
                        label: t("organisation.canDeleteTasks"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permAssets"),
                    "assets",
                    [
                      {
                        key: "accessAssets",
                        label: t("organisation.canAccessAssets"),
                      },
                      {
                        key: "createAssets",
                        label: t("organisation.canCreateAssets"),
                      },
                      {
                        key: "updateAssets",
                        label: t("organisation.canUpdateAssets"),
                      },
                      {
                        key: "deleteAssets",
                        label: t("organisation.canDeleteAssets"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permInsights"),
                    "insights",
                    [
                      {
                        key: "accessInsights",
                        label: t("organisation.canAccessInsights"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permOrganisation"),
                    "organisation",
                    [
                      {
                        key: "accessOrganisation",
                        label: t("organisation.canAccessOrganisation"),
                      },
                      {
                        key: "manageSubscription",
                        label: t("organisation.canManageSubscription"),
                      },
                      {
                        key: "manageBillingPayment",
                        label: t("organisation.canManageBilling"),
                      },
                      {
                        key: "manageInvoices",
                        label: t("organisation.canManageInvoices"),
                      },
                      {
                        key: "manageUsers",
                        label: t("organisation.canManageUsers"),
                      },
                      {
                        key: "manageSettings",
                        label: t("organisation.canManageSettings"),
                      },
                    ],
                  )}
                </div>

                <div className="space-y-6">
                  {renderPermissionSection(
                    t("organisation.permBoard"),
                    "board",
                    [
                      {
                        key: "accessTicketBoard",
                        label: t("organisation.canAccessTicketBoard"),
                      },
                      {
                        key: "createTickets",
                        label: t("organisation.canCreateTickets"),
                      },
                      {
                        key: "manageOwnTickets",
                        label: t("organisation.canManageAllTasks"),
                      },
                      {
                        key: "editTimeLog",
                        label: t("organisation.canEditTimeLog"),
                      },
                      {
                        key: "editMaterialLog",
                        label: t("organisation.canEditMaterialLog"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permSpaces"),
                    "spaces",
                    [
                      {
                        key: "accessSpaces",
                        label: t("organisation.canAccessSpaces"),
                      },
                      {
                        key: "createSpaces",
                        label: t("organisation.canCreateSpaces"),
                      },
                      {
                        key: "updateSpaces",
                        label: t("organisation.canUpdateSpaces"),
                      },
                      {
                        key: "deleteSpaces",
                        label: t("organisation.canDeleteSpaces"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permDocuments"),
                    "documents",
                    [
                      {
                        key: "accessDocuments",
                        label: t("organisation.canAccessDocuments"),
                      },
                      {
                        key: "createDocuments",
                        label: t("organisation.canCreateDocuments"),
                      },
                      {
                        key: "updateDocuments",
                        label: t("organisation.canUpdateDocuments"),
                      },
                      {
                        key: "deleteDocuments",
                        label: t("organisation.canDeleteDocuments"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permQrCodes"),
                    "qrCodes",
                    [
                      {
                        key: "accessQRCodes",
                        label: t("organisation.canAccessQRCodes"),
                      },
                      {
                        key: "createQRCodes",
                        label: t("organisation.canCreateQRCodes"),
                      },
                    ],
                  )}
                  {renderPermissionSection(
                    t("organisation.permBuildings"),
                    "buildings",
                    [
                      {
                        key: "manageBuildings",
                        label: t("organisation.canManageBuildings"),
                      },
                      {
                        key: "manageCategories",
                        label: t("organisation.canManageCategories"),
                      },
                      {
                        key: "manageReportFlow",
                        label: t("organisation.canManageReportFlow"),
                      },
                    ],
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-32"
            >
              {t("organisation.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || emailAddresses.length === 0}
              size="lg"
              className="min-w-48 font-medium"
            >
              {isLoading
                ? t("organisation.sending")
                : t("organisation.sendInvitation")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
