import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Trash2,
  Edit,
  QrCode,
  Info,
  ChevronRight,
  DoorClosed,
  Printer,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import ChangeBuildingFloorModal from "@/components/SpaceModals/ChangeBuildingFloorModal";
import DeleteSpaceModal from "@/components/SpaceModals/DeleteSpaceModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import SpaceGroupEditModal from "./SpaceGroupEditModal";
import UnassignSpaceGroupModal from "./UnassignSpaceGroupModal";
import { useGroupsQuery } from "@/hooks/queries";
import { useQrCodesForItem } from "@/hooks/queries/useQrCodesQuery";
import LinkedQrCodesModal from "@/components/QrCodeGroup/LinkedQrCodesModal";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import LinkedSpaceDocumentsModal from "./LinkedSpaceDocumentsModal";
import LinkedItemModal from "./LinkedItemModal";

interface SpaceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: any;
  onDelete: () => void;
  onLinkedDocuments: () => void;
  onTasks: () => void;
  onAssets: () => void;
  onQRCodes: () => void;
}

const SpaceDetailsModal = ({
  isOpen,
  onClose,
  space,
  onDelete,
  onLinkedDocuments,
  onTasks,
  onAssets,
  onQRCodes,
}: SpaceDetailsModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { buildings, acceptedTasks, refreshData, isLoading, refreshSpaces, refreshAssets } =
    useReferenceData();
  const { hasPermission } = usePermissions();
  const { data: groups = [] } = useGroupsQuery();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangeBuildingFloorModalOpen, setIsChangeBuildingFloorModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQrCodesModalOpen, setIsQrCodesModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);

  const {
    qrCodes,
    qrCodeCount,
    isLoading: isLoadingQrCodes,
  } = useQrCodesForItem(space?._id || "", "space", space?.building_id?._id);
  const [isUnassignGroupModalOpen, setIsUnassignGroupModalOpen] =
    useState(false);

  const [editedName, setEditedName] = useState(space?.name || "");
  const [editedGroup, setEditedGroup] = useState(space?.group || "");
  const [editedInfo, setEditedInfo] = useState(
    space?.additionalInformation || "",
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState(
    space?.building_id?._id || "",
  );
  const [selectedAreaId, setSelectedAreaId] = useState(space?.area?._id || "");

  const spaceAcceptedTasks = useMemo(() => {
    if (!space?._id) return [];
    return acceptedTasks.filter((task) => task.Linked_To?._id === space._id);
  }, [acceptedTasks, space?._id]);

  useEffect(() => {
    if (space) {
      setEditedName(space.name || "");
      setEditedGroup(space.spaceGroup || "");
      setEditedInfo(space.additionalInformation || "");
      setSelectedBuildingId(space.building_id?._id || "");
      setSelectedAreaId(space.area?._id || "");
    }
  }, [space]);

  if (!space) return null;

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      await apiService.patch(`/space/${space._id}`, { name: editedName });
      toast({
        title: t("spaces.title"),
        description: t("spaces.spaceNameUpdated"),
        variant: "success",
      });
      refreshSpaces();
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating space name:", error);
      toast({
        title: t("common.error"),
        description: t("spaces.failedUpdateName"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      await apiService.patch(`/space/${space._id}`, {
        additionalInformation: editedInfo,
      });
      toast({
        title: t("spaces.title"),
        description: t("spaces.additionalInfoUpdated"),
        variant: "success",
      });
      refreshSpaces();
      setIsEditingInfo(false);
    } catch (error) {
      console.error("Error updating additional information:", error);
      toast({
        title: t("common.error"),
        description: t("spaces.failedUpdateInfo"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuildingFloorChange = async (
    buildingId: string,
    areaId: string,
  ) => {
    try {
      await apiService.patch(`/space/${space._id}`, { building_id: buildingId, area_id: areaId });
      setSelectedBuildingId(buildingId);
      setSelectedAreaId(areaId);
      toast({
        title: t("spaces.title"),
        description: t("spaces.areaUpdated"),
        variant: "success",
      });
      refreshSpaces();
      refreshAssets();
    } catch (error) {
      console.error("Error updating area:", error);
      toast({
        title: t("common.error"),
        description: t("spaces.failedUpdateArea"),
        variant: "destructive",
      });
    }
  };
  
  const currentBuilding = buildings.find((b) => b._id === selectedBuildingId);
  const currentArea = currentBuilding?.areas.find(
    (a) => a._id === selectedAreaId,
  );

  const CountBadge = ({ count }: { count: number }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border`}
    >
      {count}
    </span>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-xl sm:max-w-sm md:max-w-sm w-full max-h-[95vh] p-0 gap-0 sm:mx-auto flex flex-col">
        {isLoading ? (
          <PageLoadingSkeleton variant="modal" />
        ) : (
          <>
            <DialogHeader className="flex flex-row items-center justify-between p-6 border-b sticky top-0 bg-accent/50 z-10">
              <DialogTitle>{t("spaces.spaceDetails")}</DialogTitle>
              <div className="absolute right-4 top-2 flex items-center gap-4">
                {hasPermission("spaces", "deleteSpaces") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-5 overflow-y-auto flex-1 relative">
              {/* Space Icon and Name */}
              <div className="flex items-center gap-3 px-6 pt-6 group">
                <div className="w-10 h-10 bg-customBlue rounded flex items-center justify-center">
                  <DoorClosed className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 first-letter:uppercase">
                    <div className="first-letter:uppercase">
                      <span className="font-medium">{editedName}</span>
                      <div className="text-sm text-foreground first-letter:uppercase">
                        {t("spaces.created")} {formatDate(space.createdAt)}
                      </div>
                    </div>
                    {hasPermission("spaces", "updateSpaces") && (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="transition-opacity"
                      >
                        <Edit
                          className="w-4 h-4 cursor-pointer"
                          color="#565E6CFF"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {isEditingName && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isSaving && setIsEditingName(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("spaces.editSpaceName")}
                      </Label>
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        autoFocus
                        className="mt-3 h-12 font-medium"
                        placeholder={t("spaces.enterSpaceName")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") {
                            setEditedName(space.name);
                            setIsEditingName(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedName(space.name);
                            setIsEditingName(false);
                          }}
                          disabled={isSaving}
                        >
                          {t("spaces.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveName}
                          disabled={isSaving}
                        >
                          {isSaving && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("spaces.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Building Info */}
              <div className="flex items-center gap-3 p-3 border rounded-md mx-6 group">
                <div className="bg-[#0F4C7BFF] w-10 h-10 flex items-center justify-center rounded-md">
                  <svg className="w-6 h-6" fill="#FFFFFF" viewBox="0 0 24 24">
                    <path d="M21 20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.314a1 1 0 0 1 .38-.785l8-6.311a1 1 0 0 1 1.24 0l8 6.31a1 1 0 0 1 .38.786V20zM7 12a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm first-letter:uppercase">
                      {currentBuilding?.label || space?.building_id?.label}{" "}
                      {" > "} {currentArea?.label || space?.area?.label}
                    </span>
                    {hasPermission("spaces", "updateSpaces") && (
                      <button
                        onClick={() => setIsChangeBuildingFloorModalOpen(true)}
                        className="transition-opacity"
                      >
                        <Edit
                          className="w-4 h-4 cursor-pointer"
                          color="#565E6CFF"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Space Group */}
              <div className="flex items-center justify-between p-3 border rounded-md mx-6 group">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <svg className="w-5 h-5" fill="#686583" viewBox="0 0 24 24">
                    <path d="M10 3H4C3.447 3 3 3.447 3 4v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C11 3.447 10.553 3 10 3zM9 9H5V5h4V9zM20 3h-6c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C21 3.447 20.553 3 20 3zM19 9h-4V5h4V9zM10 13H4c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1v-6C11 13.447 10.553 13 10 13zM9 19H5v-4h4V19zM17 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4S19.206 13 17 13zM17 19c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2S18.103 19 17 19z" />
                  </svg>
                  {t("spaces.spaceGroup")}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-[#F1F8FDFF] text-[#2E69E8FF] px-2.5 first-letter:uppercase">
                    {editedGroup
                      ? groups.find((g) => g._id === editedGroup)?.name ||
                        editedGroup
                      : t("spaces.noSpaceGroup")}
                  </span>
                  {hasPermission("spaces", "updateSpaces") && (
                    <div className="flex items-center gap-2">
                      {editedGroup && (
                        <button
                          onClick={() => setIsUnassignGroupModalOpen(true)}
                          className="transition-opacity hover:opacity-70"
                        >
                          <Trash2 className="w-4 h-4 cursor-pointer text-destructive" />
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditingGroup(true)}
                        className="transition-opacity"
                      >
                        <Edit
                          className="w-4 h-4 cursor-pointer"
                          color="#565E6CFF"
                        />
                      </button>
                    </div>
                  )}
                </div>

                {isEditingGroup && (
                  <SpaceGroupEditModal
                    isOpen={isEditingGroup}
                    onClose={() => setIsEditingGroup(false)}
                    currentGroup={editedGroup}
                    onSave={(newGroup) => {
                      setEditedGroup(newGroup);
                      setIsEditingGroup(false);
                    }}
                    spaceId={space._id}
                  />
                )}
              </div>

              {/* Additional Information */}
              <div className="mx-6 group">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    {t("spaces.additionalInformation")}
                  </Label>
                  {hasPermission("spaces", "updateSpaces") && (
                    <button
                      onClick={() => setIsEditingInfo(true)}
                      className="transition-opacity"
                    >
                      <Edit
                        className="w-4 h-4 cursor-pointer"
                        color="#565E6CFF"
                      />
                    </button>
                  )}
                </div>
                <Textarea
                  className="mt-2 min-h-[100px]"
                  value={editedInfo}
                  readOnly
                  placeholder={t("spaces.noAdditionalInfo")}
                />

                {isEditingInfo && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isSaving && setIsEditingInfo(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("spaces.editAdditionalInfo")}
                      </Label>
                      <Textarea
                        value={editedInfo}
                        onChange={(e) => setEditedInfo(e.target.value)}
                        autoFocus
                        className="mt-3 min-h-[200px] resize-none"
                        placeholder={t("spaces.addNotesPlaceholder")}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditedInfo(space.additionalInformation || "");
                            setIsEditingInfo(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedInfo(space.additionalInformation || "");
                            setIsEditingInfo(false);
                          }}
                          disabled={isSaving}
                        >
                          {t("spaces.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveInfo}
                          disabled={isSaving}
                        >
                          {isSaving && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("spaces.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Items */}
              <div className="bg-accent/50">
                <div className="space-y-1 pt-4 pb-4 mx-6">
                  <button
                    onClick={() => setIsDocumentsModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FDF5F1] w-8 h-8 rounded-md flex justify-center items-center">
                        <svg
                          className="w-5 h-5"
                          fill="#EA916EFF"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                      </div>
                      <span className="text-sm">
                        {t("spaces.linkedDocuments")}
                      </span>
                      <CountBadge count={space?.attachments?.length} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setIsTasksModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F5F2FD] w-8 h-8 rounded-md flex justify-center items-center">
                        <svg
                          className="w-5 h-5"
                          fill="#636AE8FF"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5S5.5 6.83 5.5 6S4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5s1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                        </svg>
                      </div>
                      <span className="text-sm">{t("spaces.linkedTasks")}</span>
                      <CountBadge count={space?.linkedTasks?.length} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setIsAssetsModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex justify-center items-center">
                        <Printer className="w-4 h-4" color="#4D80ED" />
                      </div>
                      <span className="text-sm">{t("spaces.assets")}</span>
                      <CountBadge count={space?.assets?.length} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setIsQrCodesModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F8F9FA] w-8 h-8 rounded-md flex justify-center items-center">
                        <QrCode className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-foreground">
                        {t("spaces.qrCodes")}
                      </span>
                      <CountBadge count={qrCodeCount} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 p-5 sm:p-6 border-t rounded-bl-md rounded-br-md bg-background">
              <Button variant="outline" size="lg" onClick={onClose}>
                {t("spaces.close")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>

      {isDeleteModalOpen && (
        <DeleteSpaceModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            setIsDeleteModalOpen(false);
            onDelete();
            onClose();
          }}
          spaceName={space.name}
          spaceId={space._id}
        />
      )}
      {isChangeBuildingFloorModalOpen && (
        <ChangeBuildingFloorModal
          isOpen={isChangeBuildingFloorModalOpen}
          onClose={() => setIsChangeBuildingFloorModalOpen(false)}
          onSelect={handleBuildingFloorChange}
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          selectedAreaId={selectedAreaId}
        />
      )}
      {isUnassignGroupModalOpen && (
        <UnassignSpaceGroupModal
          isOpen={isUnassignGroupModalOpen}
          onClose={() => setIsUnassignGroupModalOpen(false)}
          onConfirm={() => {
            setEditedGroup("");
            setIsUnassignGroupModalOpen(false);
          }}
          spaceName={space.name}
          spaceId={space._id}
          groupName={groups.find((g) => g._id === editedGroup)?.name || ""}
        />
      )}
      {isQrCodesModalOpen && (
        <LinkedQrCodesModal
          isOpen={isQrCodesModalOpen}
          onClose={() => setIsQrCodesModalOpen(false)}
          onBack={() => setIsQrCodesModalOpen(false)}
          itemId={space._id}
          itemName={space.name}
          itemType="space"
          qrCodes={qrCodes}
        />
      )}
      {isDocumentsModalOpen && (
        <LinkedSpaceDocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => setIsDocumentsModalOpen(false)}
          onBack={() => setIsDocumentsModalOpen(false)}
          spaceName={space.name}
          attachments={space?.attachments || []}
        />
      )}
      {isTasksModalOpen && (
        <LinkedItemModal
          isOpen={isTasksModalOpen}
          onClose={() => setIsTasksModalOpen(false)}
          onBack={() => setIsTasksModalOpen(false)}
          title="Tasks"
          spaceName={space.name}
          space={{ ...space, linkedTasks: space?.linkedTasks || [] }}
        />
      )}
      {isAssetsModalOpen && (
        <LinkedItemModal
          isOpen={isAssetsModalOpen}
          onClose={() => setIsAssetsModalOpen(false)}
          onBack={() => setIsAssetsModalOpen(false)}
          title="Assets"
          spaceName={space.name}
          space={space}
        />
      )}
    </Dialog>
  );
};

export default SpaceDetailsModal;
