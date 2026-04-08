import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Building,
  Key,
  RotateCcw,
  Ban,
  Trash2,
  Home,
  Trash,
  Menu,
  Lock,
  User2,
} from "lucide-react";
import { useBuildingsQuery, useCurrentUserQuery } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { Permissions } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDate } from "@/utils/dateUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserDetailsModal = ({ isOpen, onClose, user }: UserDetailsModalProps) => {
  const { t } = useLanguage();
  const [permissions, setPermissions] = useState<Permissions>({} as Permissions);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localBuildings, setLocalBuildings] = useState<any[]>([]);
  const [buildingsToAdd, setBuildingsToAdd] = useState<string[]>([]);
  const [buildingsToRemove, setBuildingsToRemove] = useState<string[]>([]);
  const [localAccessBlocked, setLocalAccessBlocked] = useState<boolean>(false);
  const [localBuildingPermissions, setLocalBuildingPermissions] = useState<Record<string, Permissions>>({});
  const { orgBuildings } = useBuildingsQuery();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();

  const getPermissionsForBuilding = (buildingId: string): Permissions => {
    const defaultPerms: Permissions = {
      issues: { accessNewIssues: false, acceptDeclineNewIssues: false },
      board: { accessTicketBoard: false, createTickets: false, manageOwnTickets: false, editTimeLog: false, editMaterialLog: false },
      tasks: { accessTasks: false, createTasks: false, updateTasks: false, deleteTasks: false },
      spaces: { accessSpaces: false, createSpaces: false, updateSpaces: false, deleteSpaces: false },
      assets: { accessAssets: false, createAssets: false, updateAssets: false, deleteAssets: false },
      documents: { accessDocuments: false, createDocuments: false, updateDocuments: false, deleteDocuments: false },
      insights: { accessInsights: false },
      qrCodes: { accessQRCodes: false, createQRCodes: false },
      organisation: { accessOrganisation: false, manageSubscription: false, manageBillingPayment: false, manageInvoices: false, manageUsers: false, manageSettings: false },
      buildings: { manageBuildings: false, manageCategories: false, manageReportFlow: false },
    };
    const bp = user?.buildingPermissions?.find(
      (bp: any) => (bp.buildingId?._id || bp.buildingId) === buildingId
    );
    return bp?.permissions || defaultPerms;
  };

  useEffect(() => {
    if (user && isOpen) {
      setLocalBuildings(user.buildingIds || []);
      setBuildingsToAdd([]);
      setBuildingsToRemove([]);
      setLocalAccessBlocked(user.accessBlocked || false);
      
      const permMap: Record<string, Permissions> = {};
      (user.buildingPermissions || []).forEach((bp: any) => {
        const bId = bp.buildingId?._id || bp.buildingId;
        if (bId && bp.permissions) permMap[bId] = bp.permissions;
      });
      setLocalBuildingPermissions(permMap);

      const firstBuildingId = user.buildingIds?.[0]?._id || "";
      setSelectedBuilding(firstBuildingId);
      if (firstBuildingId) {
        setPermissions(permMap[firstBuildingId] || getPermissionsForBuilding(firstBuildingId));
      } else {
        setPermissions({} as Permissions);
      }
    }
  }, [user, isOpen]);

  const handlePermissionChange = (category: string, permission: string, value: boolean) => {
    const updated = { ...permissions, [category]: { ...(permissions as any)[category], [permission]: value } };
    setPermissions(updated);
    if (selectedBuilding) {
      setLocalBuildingPermissions((prev) => ({ ...prev, [selectedBuilding]: updated }));
    }
  };

  const handleSelectAll = (category: string) => {
    const categoryPerms = permissions[category];
    const allEnabled = Object.values(categoryPerms).every(Boolean);
    const updated = {
      ...permissions,
      [category]: Object.keys(categoryPerms).reduce((acc: any, key) => { acc[key] = !allEnabled; return acc; }, {}),
    };
    setPermissions(updated);
    if (selectedBuilding) {
      setLocalBuildingPermissions((prev) => ({ ...prev, [selectedBuilding]: updated }));
    }
  };

  const getPermissionCount = (category: string) => {
    const categoryPerms = permissions[category];
    if (!categoryPerms) return "0/0";
    const total = Object.keys(categoryPerms).length;
    const enabled = Object.values(categoryPerms).filter(Boolean).length;
    return `${enabled}/${total}`;
  };

  const renderPermissionSection = (
    title: string,
    category: string,
    permissionList: { key: string; label: string }[]
  ) => {
    const categoryPerms = permissions[category] || {};

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span className="font-semibold text-sm">{title}</span>
            <span className="text-xs text-muted-foreground">{getPermissionCount(category)}</span>
          </div>
          <Button variant="link" size="sm" onClick={() => handleSelectAll(category)} className="text-primary h-auto p-0 text-xs">
            {t("organisation.selectAll")}
          </Button>
        </div>
        <div className="space-y-3">
          {permissionList.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{label}</span>
              <Switch checked={categoryPerms[key] || false} onCheckedChange={(checked) => handlePermissionChange(category, key, checked)} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [open, setOpen] = useState(false);

  const handleUserAction = async (action: string) => {
    if (!user) return;
    try {
      setIsLoading(true);
      switch (action) {
        case "resend-invitation":
          await userService.resendInvitation(user._id);
          toast({ title: t("organisation.success"), description: t("organisation.invitationResent"), variant: "success" });
          break;
        case "reset-password":
          await userService.resetPassword(user?.acceptedBy);
          toast({ title: t("organisation.success"), description: t("organisation.passwordResetSent"), variant: "success" });
          break;
        case "revoke-access":
          await userService.revokeAccess(user?.acceptedBy);
          setLocalAccessBlocked(true);
          await queryClient.invalidateQueries({ queryKey: ["organization", currentUser?.Organization_id?._id] });
          toast({ title: t("organisation.success"), description: t("organisation.accessBlocked"), variant: "success" });
          break;
        case "restore-access":
          await userService.restoreAccess(user.acceptedBy);
          setLocalAccessBlocked(false);
          await queryClient.invalidateQueries({ queryKey: ["organization", currentUser?.Organization_id?._id] });
          toast({ title: t("organisation.success"), description: t("organisation.accessRestored"), variant: "success" });
          break;
        case "delete-user":
          if (confirm(t("organisation.deleteUserConfirm"))) {
            onClose();
            await userService.deleteUser(user._id);
            await queryClient.invalidateQueries({ queryKey: ["organization", currentUser?.Organization_id?._id] });
            toast({ title: t("organisation.success"), description: t("organisation.userDeleted"), variant: "success" });
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      toast({ title: t("organisation.error"), description: `Failed to ${action.replace("-", " ")}.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!user) {
      toast({ title: t("organisation.error"), description: t("organisation.userDataUpdateFailed"), variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      const allBuildingIds = localBuildings.map((b) => b._id);
      const buildingPermissions = allBuildingIds.map((bId) => ({
        buildingId: bId,
        permissions: localBuildingPermissions[bId] || getPermissionsForBuilding(bId),
      }));
      
      onClose();
      await userService.updateUserPermissions({ userId: user._id, buildingIds: allBuildingIds, buildingPermissions });
      await queryClient.invalidateQueries({ queryKey: ["organization", currentUser?.Organization_id?._id] });
      toast({ title: t("organisation.success"), description: t("organisation.userDataUpdated"), variant: "success" });
    } catch (error) {
      console.error("Failed to update user data:", error);
      toast({ title: t("organisation.error"), description: t("organisation.userDataUpdateFailed"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuildingChange = (buildingId: string) => {
    if (selectedBuilding) {
      setLocalBuildingPermissions((prev) => ({ ...prev, [selectedBuilding]: permissions }));
    }
    setSelectedBuilding(buildingId);
    const perms = localBuildingPermissions[buildingId] || getPermissionsForBuilding(buildingId);
    setPermissions(perms);
  };

  const handleAddBuilding = (building: any) => {
    if (!user) return;
    const isAlreadyAdded = localBuildings.some((b) => b._id === building._id);
    if (isAlreadyAdded) {
      toast({ title: t("organisation.error"), description: t("organisation.error"), variant: "destructive" });
      return;
    }
    setLocalBuildings((prev) => [...prev, building]);
    setBuildingsToAdd((prev) => [...prev, building._id]);
    setBuildingsToRemove((prev) => prev.filter((id) => id !== building._id));
    setOpen(false);
  };

  const handleRemoveBuilding = (buildingId: string) => {
    if (!user) return;
    setLocalBuildings((prev) => prev.filter((b) => b._id !== buildingId));
    const wasOriginalBuilding = user.buildingIds?.some((b: any) => b._id === buildingId);
    if (wasOriginalBuilding) {
      setBuildingsToRemove((prev) => [...prev, buildingId]);
    }
    setBuildingsToAdd((prev) => prev.filter((id) => id !== buildingId));
  };

  const availableBuildings = orgBuildings?.filter(
    (building) => !user?.buildingIds?.some((b) => b._id.toString() === building._id)
  );

  const handleCancel = () => {
    const permMap: Record<string, Permissions> = {};
    (user?.buildingPermissions || []).forEach((bp: any) => {
      const bId = bp.buildingId?._id || bp.buildingId;
      if (bId && bp.permissions) permMap[bId] = bp.permissions;
    });
    setLocalBuildingPermissions(permMap);
    setLocalBuildings(user?.buildingIds || []);
    setBuildingsToAdd([]);
    setBuildingsToRemove([]);
    const firstBuildingId = user?.buildingIds?.[0]?._id || "";
    setSelectedBuilding(firstBuildingId);
    setPermissions(permMap[firstBuildingId] || getPermissionsForBuilding(firstBuildingId));
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="p-0 overflow-hidden flex flex-col h-[95vh] max-h-screen w-full max-w-4xl mx-auto rounded-none sm:rounded-2xl">
        <DialogHeader className="shrink-0 px-4 py-4 sm:px-6 border-b bg-[#F8F9FAFF]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{t("organisation.userDetails")}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-r bg-background overflow-y-auto">
            <div className="p-6 space-y-8">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5">
                <Avatar className="w-24 h-24 border-2">
                  <AvatarImage src={user?.profile_picture} className="object-cover" />
                  <AvatarFallback className="bg-[#0F4C7BFF] text-white text-5xl font-medium uppercase">
                    <User2 className="w-12 h-12"/>
                  </AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-lg capitalize">
                    {user?.Name && user?.Last_Name ? `${user.Name} ${user.Last_Name}` : t("organisation.unknownUser")}
                  </h3>
                  <p className="text-sm text-muted-foreground break-all first-letter:uppercase">{user?.email}</p>
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <p>{t("organisation.created")}: {formatDate(user?.createdAt)}</p>
                    <p>{t("organisation.lastActive")}: {formatDate(user?.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t">
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent" onClick={() => handleUserAction("resend-invitation")} disabled={isLoading}>
                  <Lock className="w-4 h-4 mr-2" />
                  {t("organisation.resendInvitation")}
                </Button>

                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent" onClick={() => handleUserAction("reset-password")} disabled={isLoading}>
                  <Lock className="w-4 h-4 mr-2" />
                  {t("organisation.resetPassword")}
                </Button>

                {localAccessBlocked ? (
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent" onClick={() => handleUserAction("restore-access")} disabled={isLoading || !user.acceptedBy}>
                    <Ban className="w-4 h-4 mr-2" />
                    {t("organisation.restoreAccess")}
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full justify-start text-[#DE3B40FF] hover:bg-accent" onClick={() => handleUserAction("revoke-access")} disabled={isLoading || !user.acceptedBy}>
                    <Ban className="w-4 h-4 mr-2" />
                    {t("organisation.revokeAccess")}
                  </Button>
                )}

                <Button variant="ghost" className="w-full justify-start text-[#DE3B40FF] hover:bg-accent" onClick={() => handleUserAction("delete-user")} disabled={isLoading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("organisation.deleteUser")}
                </Button>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="building-access" className="flex-1 flex flex-col min-h-0">
              <TabsList className="shrink-0 px-6 py-4 gap-8">
                <TabsTrigger value="building-access">{t("organisation.buildingAccessTab")}</TabsTrigger>
                <TabsTrigger value="permissions">{t("organisation.permissionsTab")}</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <TabsContent value="building-access" className="mt-0 space-y-4">
                  {localBuildings?.map((b: any) => (
                    <div key={b._id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/30 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#6E7787FF] rounded-lg">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium">{b.label}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveBuilding(b._id)}>
                        <Trash className="w-4 h-4 text-[#6E7787FF]" />
                      </Button>
                    </div>
                  ))}

                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-6 hover:border-[#1759E8FF] hover:text-[#1759E8FF]" disabled={!availableBuildings?.length}>
                        {t("organisation.addBuilding")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{t("organisation.selectABuilding")}</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {availableBuildings?.map((building) => (
                          <button key={building._id} onClick={() => handleAddBuilding(building)} className="w-full text-left p-4 border rounded-lg hover:bg-accent transition">
                            {building.label}
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                <TabsContent value="permissions" className="mt-0">
                  <div className="space-y-8">
                    <div>
                      <label className="text-sm font-medium">{t("organisation.selectBuilding")}</label>
                      <Select value={selectedBuilding} onValueChange={handleBuildingChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t("organisation.chooseABuilding")} />
                        </SelectTrigger>
                        <SelectContent>
                          {localBuildings?.map((b: any) => (
                            <SelectItem key={b._id} value={b._id}>{b.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBuilding ? (
                      <>
                        {renderPermissionSection(t("organisation.permIssues"), "issues", [
                          { key: "accessNewIssues", label: t("organisation.canAccessNewIssues") },
                          { key: "acceptDeclineNewIssues", label: t("organisation.canAcceptDeclineIssues") },
                        ])}
                        {renderPermissionSection(t("organisation.permBoard"), "board", [
                          { key: "accessTicketBoard", label: t("organisation.canAccessTicketBoard") },
                          { key: "createTickets", label: t("organisation.canCreateTickets") },
                          { key: "manageOwnTickets", label: t("organisation.canManageAllTasks") },
                          { key: "editTimeLog", label: t("organisation.canEditTimeLog") },
                          { key: "editMaterialLog", label: t("organisation.canEditMaterialLog") },
                        ])}
                        {renderPermissionSection(t("organisation.permTasks"), "tasks", [
                          { key: "accessTasks", label: t("organisation.canAccessTasks") },
                          { key: "createTasks", label: t("organisation.canCreateTasks") },
                          { key: "updateTasks", label: t("organisation.canUpdateTasks") },
                          { key: "deleteTasks", label: t("organisation.canDeleteTasks") },
                        ])}
                        {renderPermissionSection(t("organisation.permSpaces"), "spaces", [
                          { key: "accessSpaces", label: t("organisation.canAccessSpaces") },
                          { key: "createSpaces", label: t("organisation.canCreateSpaces") },
                          { key: "updateSpaces", label: t("organisation.canUpdateSpaces") },
                          { key: "deleteSpaces", label: t("organisation.canDeleteSpaces") },
                        ])}
                        {renderPermissionSection(t("organisation.permAssets"), "assets", [
                          { key: "accessAssets", label: t("organisation.canAccessAssets") },
                          { key: "createAssets", label: t("organisation.canCreateAssets") },
                          { key: "updateAssets", label: t("organisation.canUpdateAssets") },
                          { key: "deleteAssets", label: t("organisation.canDeleteAssets") },
                        ])}
                        {renderPermissionSection(t("organisation.permDocuments"), "documents", [
                          { key: "accessDocuments", label: t("organisation.canAccessDocuments") },
                          { key: "createDocuments", label: t("organisation.canCreateDocuments") },
                          { key: "updateDocuments", label: t("organisation.canUpdateDocuments") },
                          { key: "deleteDocuments", label: t("organisation.canDeleteDocuments") },
                        ])}
                        {renderPermissionSection(t("organisation.permQrCodes"), "qrCodes", [
                          { key: "accessQRCodes", label: t("organisation.canAccessQRCodes") },
                          { key: "createQRCodes", label: t("organisation.canCreateQRCodes") },
                        ])}
                        {renderPermissionSection(t("organisation.permInsights"), "insights", [
                          { key: "accessInsights", label: t("organisation.canAccessInsights") },
                        ])}
                        {renderPermissionSection(t("organisation.permBuildings"), "buildings", [
                          { key: "manageBuildings", label: t("organisation.canManageBuildings") },
                          { key: "manageCategories", label: t("organisation.canManageCategories") },
                          { key: "manageReportFlow", label: t("organisation.canManageReportFlow") },
                        ])}
                        {renderPermissionSection(t("organisation.permOrganisation"), "organisation", [
                          { key: "accessOrganisation", label: t("organisation.canAccessOrganisation") },
                          { key: "manageSubscription", label: t("organisation.canManageSubscription") },
                          { key: "manageBillingPayment", label: t("organisation.canManageBilling") },
                          { key: "manageInvoices", label: t("organisation.canManageInvoices") },
                          { key: "manageUsers", label: t("organisation.canManageUsers") },
                          { key: "manageSettings", label: t("organisation.canManageSettings") },
                        ])}
                      </>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        {t("organisation.selectBuildingToManage")}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>

              <div className="shrink-0 flex justify-end gap-4 px-6 py-5 border-t bg-background">
                <Button variant="outline" size="lg" onClick={handleCancel} disabled={isSaving}>
                  {t("organisation.cancel")}
                </Button>
                <Button size="lg" onClick={handleSavePermissions} disabled={isSaving || !selectedBuilding}>
                  {isSaving ? t("organisation.saving") : t("organisation.saveChanges")}
                </Button>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
