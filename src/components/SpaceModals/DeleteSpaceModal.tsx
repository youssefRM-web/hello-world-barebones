import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Trash2,
  Pencil,
  Check,
  Package,
  Search,
  Building as BuildingIcon,
  ChevronDown,
  ChevronRight,
  DoorClosed,
  Loader2,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { toast } from "@/hooks/use-toast";
import { Building, Space } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface Asset {
  _id: string;
  name: string;
  space_id?: string | { _id: string; name: string };
}

interface DeleteSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  spaceName?: string;
  spaceId?: string;
}

interface AssetActionStatus {
  [assetId: string]: {
    status: "deleted" | "moved" | "archived" | null;
    newSpaceName?: string;
  };
}

type ActionMode = "choose" | "archive" | "delete";

const DeleteSpaceModal = ({
  isOpen,
  onClose,
  onConfirm,
  spaceName,
  spaceId,
}: DeleteSpaceModalProps) => {
  const { executeRequest, isLoading } = useApi();
  const { refreshData, buildings, spaces } = useReferenceData();
  const { t } = useLanguage();
  const { selectedBuildingId } = useBuildingSelection();
  const queryClient = useQueryClient();

  const [actionMode, setActionMode] = useState<ActionMode>("choose");
  const [connectedAssets, setConnectedAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetActionStatus, setAssetActionStatus] = useState<AssetActionStatus>({});
  const [relocateModalOpen, setRelocateModalOpen] = useState(false);
  const [selectedAssetForRelocate, setSelectedAssetForRelocate] = useState<Asset | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal opens/closes or spaceId changes
  useEffect(() => {
    if (isOpen && spaceId) {
      // Clear previous data immediately when opening for a new space
      setConnectedAssets([]);
      setAssetActionStatus({});
      setActionMode("choose");
      fetchConnectedAssets(spaceId);
    }
    if (!isOpen) {
      setConnectedAssets([]);
      setAssetActionStatus({});
      setActionMode("choose");
    }
  }, [isOpen, spaceId]);

  const fetchConnectedAssets = async (currentSpaceId: string) => {
    if (!currentSpaceId) return;
    
    setLoadingAssets(true);
    try {
      const response = await apiService.get<Asset[]>(`${endpoints.assets}/space/${currentSpaceId}`);
      setConnectedAssets(response.data || []);
    } catch (error) {
      console.error("Failed to fetch connected assets:", error);
      setConnectedAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    setDeletingAssetId(asset._id);
    try {
      await apiService.delete(`${endpoints.assets}/${asset._id}`);
      setAssetActionStatus((prev) => ({
        ...prev,
        [asset._id]: { status: "deleted" },
      }));
      toast({
        title: t("common.success"),
        description: `Asset "${asset.name}" deleted`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to delete asset",
        variant: "destructive",
      });
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleOpenRelocateModal = (asset: Asset) => {
    setSelectedAssetForRelocate(asset);
    setRelocateModalOpen(true);
  };

  const handleRelocateAsset = async (newSpaceId: string) => {
    if (!selectedAssetForRelocate) return;

    try {
      const selectedSpace = spaces.find((s) => s._id === newSpaceId);
      const buildingId = selectedSpace?.building_id?._id || selectedSpace?.building_id;

      await apiService.patch(`${endpoints.assets}/${selectedAssetForRelocate._id}`, {
        linked_space_id: newSpaceId,
        building_id: buildingId,
      });

      queryClient.invalidateQueries({ queryKey: ["referenceData"] });

      setAssetActionStatus((prev) => ({
        ...prev,
        [selectedAssetForRelocate._id]: {
          status: "moved",
          newSpaceName: selectedSpace?.name || "New Space",
        },
      }));

      toast({
        title: t("common.success"),
        description: `Asset relocated to ${selectedSpace?.name}`,
        variant: "success",
      });

      setRelocateModalOpen(false);
      setSelectedAssetForRelocate(null);
      refreshData();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to relocate asset",
        variant: "destructive",
      });
    }
  };

  // Archive space and all connected assets
  const handleArchive = async () => {
    if (!spaceId) return;
    
    setIsArchiving(true);
    try {
      // First archive all connected assets
      for (const asset of connectedAssets) {
        await apiService.patch(`${endpoints.assets}/${asset._id}`, { archived: true });
      }

      // Then archive the space
      await apiService.patch(`${endpoints.spaces}/${spaceId}`, { archived: true });

      onClose();
      toast({
        title: t("spaces.title"),
        description: `Space "${spaceName}" and ${connectedAssets.length} asset(s) archived for 30 days`,
        variant: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
      refreshData();
      onConfirm?.();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to archive space",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Permanently delete space after all assets are handled
  const handleDelete = async () => {
    if (!spaceId) return;

    setIsDeleting(true);
    try {
      // Delete any remaining connected assets that haven't been handled
      const unhandledAssets = connectedAssets.filter(
        (asset) => !assetActionStatus[asset._id]?.status
      );

      for (const asset of unhandledAssets) {
        await apiService.delete(`${endpoints.assets}/${asset._id}`);
      }

      // Then delete the space
      await apiService.delete(`${endpoints.spaces}/${spaceId}`);

      onClose();
      toast({
        title: t("spaces.title"),
        description: t("messages.success.spaceDeleted"),
        variant: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
      refreshData();
      onConfirm?.();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to delete space",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if all assets have been handled (deleted or moved)
  const allAssetsHandled = connectedAssets.length === 0 || 
    connectedAssets.every((asset) => assetActionStatus[asset._id]?.status);

  const hasUnhandledAssets = connectedAssets.length > 0 && !allAssetsHandled;

  // Render initial choice screen
  const renderChoiceScreen = () => (
    <>
      <AlertDialogHeader>
        <button
          onClick={onClose}
          className="rounded-sm  self-end ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogTitle className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {t("spaces.deleteOrArchive")}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          <p className="mb-4">
            {t("spaces.whatToDo")} <strong>"{spaceName}"</strong>?
          </p>
        </AlertDialogDescription>
      </AlertDialogHeader>

      {loadingAssets ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            {t("spaces.checkingAssets")}
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Archive Option */}
          <button
            onClick={() => setActionMode("archive")}
            className="w-full p-4 border rounded-lg hover:bg-accent/50 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground group-hover:text-primary">
                  {t("spaces.archiveSpace30")}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("spaces.archiveSpaceDesc").replace("{count}", String(connectedAssets.length))}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-2" />
            </div>
          </button>

          {/* Delete Option */}
          <button
            onClick={() => setActionMode("delete")}
            className="w-full p-4 border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-destructive">
                  {t("spaces.deletePermanently")}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("spaces.deletePermanentlyDesc")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive mt-2" />
            </div>
          </button>
        </div>
      )}

      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel className="w-full">{t("common.cancel")}</AlertDialogCancel>
      </AlertDialogFooter>
    </>
  );

  // Render archive confirmation screen
  const renderArchiveScreen = () => (
    <>
      <AlertDialogHeader>
        <button
          onClick={() => setActionMode("choose")}
          className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogTitle className="flex items-center justify-center gap-2">
          <Archive className="h-5 w-5 text-orange-600" />
          {t("spaces.archiveSpace")}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          <p>
            {t("spaces.archiveConfirm")} <strong>"{spaceName}"</strong>?
          </p>
        </AlertDialogDescription>
      </AlertDialogHeader>

      {connectedAssets.length > 0 && (
        <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Package className="h-4 w-4" />
            {t("spaces.connectedAssets")} ({connectedAssets.length})
          </h4>
          <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
            {t("spaces.assetsWillBeArchived")}
          </p>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {connectedAssets.map((asset) => (
              <div
                key={asset._id}
                className="flex items-center gap-2 p-2 rounded-md bg-background/50"
              >
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{asset.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
        <strong>{t("spaces.note")}:</strong> {t("spaces.archiveNote")}
      </div>

      <AlertDialogFooter>
        <Button
          variant="outline"
          onClick={() => setActionMode("choose")}
          className="w-full"
        >
          {t("spaces.back")}
        </Button>
        <Button
          onClick={handleArchive}
          disabled={isArchiving || loadingAssets}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isArchiving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("spaces.archiving")}
            </span>
          ) : (
            <>
              <Archive className="h-4 w-4 mr-2" />
              {t("spaces.archiveSpace")}
            </>
          )}
        </Button>
      </AlertDialogFooter>
    </>
  );

  // Render delete confirmation screen
  const renderDeleteScreen = () => (
    <>
      <AlertDialogHeader>
        <button
          onClick={() => setActionMode("choose")}
          className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogTitle className="flex items-center justify-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          {t("spaces.deleteSpacePermanently")}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center space-y-3">
          <p>{t("spaces.deleteSpaceConfirm")}</p>
          <ul className="text-sm space-y-1 list-disc list-inside text-left">
            <li>{t("spaces.deleteWarning1")}</li>
            <li>{t("spaces.deleteWarning2")}</li>
            <li>{t("spaces.deleteWarning3")}</li>
          </ul>
        </AlertDialogDescription>
      </AlertDialogHeader>

      {connectedAssets.length > 0 && (
        <div className="border rounded-lg p-4 bg-destructive/5 border-destructive/30">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t("spaces.connectedAssets")} ({connectedAssets.length})
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            {t("spaces.allAssetsMustBeHandled")}
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {connectedAssets.map((asset) => {
              const status = assetActionStatus[asset._id];
              const isDeleting = deletingAssetId === asset._id;

              return (
                <div
                  key={asset._id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    status?.status ? "bg-muted/50 opacity-70" : "bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{asset.name}</span>
                    {status?.status === "deleted" && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {t("spaces.assetDeleted")}
                      </span>
                    )}
                    {status?.status === "moved" && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {t("spaces.movedTo").replace("{space}", status.newSpaceName || "")}
                      </span>
                    )}
                  </div>
                  {!status?.status && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleOpenRelocateModal(asset)}
                        disabled={isDeleting}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteAsset(asset)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AlertDialogFooter>
        <Button
          variant="outline"
          onClick={() => setActionMode("choose")}
          className="w-full"
        >
          {t("spaces.back")}
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting || isLoading || loadingAssets || hasUnhandledAssets}
          className="w-full"
        >
          {isDeleting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("spaces.deleting")}
            </span>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("spaces.deletePermanently")}
            </>
          )}
        </Button>
      </AlertDialogFooter>
    </>
  );

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="sm:max-w-[600px]">
          {actionMode === "choose" && renderChoiceScreen()}
          {actionMode === "archive" && renderArchiveScreen()}
          {actionMode === "delete" && renderDeleteScreen()}
        </AlertDialogContent>
      </AlertDialog>

      {/* Relocate Asset Modal */}
      <RelocateAssetModal
        isOpen={relocateModalOpen}
        onClose={() => {
          setRelocateModalOpen(false);
          setSelectedAssetForRelocate(null);
        }}
        onSelect={handleRelocateAsset}
        buildings={buildings}
        spaces={spaces.filter((s) => s._id !== spaceId)}
        currentSpaceId={spaceId}
        assetName={selectedAssetForRelocate?.name}
        selectedBuildingId={selectedBuildingId}
      />
    </>
  );
};

// Relocate Asset Modal Component
interface RelocateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (spaceId: string) => void;
  buildings: Building[];
  spaces: Space[];
  currentSpaceId?: string;
  assetName?: string;
  selectedBuildingId?: string | null;
}

const RelocateAssetModal = ({
  isOpen,
  onClose,
  onSelect,
  buildings,
  spaces,
  assetName,
  selectedBuildingId,
}: RelocateAssetModalProps) => {
  const { t } = useLanguage();
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>([]);
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRelocating, setIsRelocating] = useState(false);

  // Filter buildings based on sidebar selection
  const filteredBuildings = selectedBuildingId
    ? buildings.filter((b) => b._id === selectedBuildingId)
    : buildings;

  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings((prev) =>
      prev.includes(buildingId)
        ? prev.filter((id) => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleApply = async () => {
    if (selectedSpaceId) {
      setIsRelocating(true);
      await onSelect(selectedSpaceId);
      setIsRelocating(false);
    }
  };

  const filteredSpaces = spaces.filter((space) =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSpaceId("");
      setSearchQuery("");
      setExpandedBuildings([]);
      setExpandedAreas([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[600px] p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {t("spaces.relocateAsset")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("spaces.chooseNewSpace").replace("{asset}", assetName || "")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 rounded-sm hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("spaces.searchSpacesPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-0 focus:bg-background"
            />
          </div>
        </div>

        <div className="px-6 pb-6 max-h-[300px] overflow-y-auto border-b">
          <div className="space-y-2">
            {filteredBuildings.map((building) => {
              const buildingSpaces = filteredSpaces.filter(
                (s) => s.building_id?._id === building._id
              );
              if (buildingSpaces.length === 0 && searchQuery) return null;

              return (
                <div key={building._id}>
                  <button
                    className="flex items-center justify-between w-full text-left py-2 text-sm font-medium text-foreground hover:bg-accent/50 px-2 rounded transition-colors"
                    onClick={() => toggleBuilding(building._id)}
                  >
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{building.label}</span>
                    </div>
                    {expandedBuildings.includes(building._id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {expandedBuildings.includes(building._id) && (
                    <div className="ml-4">
                      {building.areas?.map((area) => {
                        const areaSpaces = buildingSpaces.filter(
                          (s) => s.area?._id === area._id
                        );
                        if (areaSpaces.length === 0 && searchQuery) return null;

                        return (
                          <div key={area._id}>
                            <button
                              className="flex items-center justify-between w-full text-left py-2 text-sm text-foreground hover:bg-accent/50 px-2 rounded transition-colors"
                              onClick={() => toggleArea(area._id)}
                            >
                              <span>{area.label}</span>
                              {expandedAreas.includes(area._id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>

                            {expandedAreas.includes(area._id) && (
                              <div className="ml-4 space-y-1">
                                {areaSpaces.map((space) => (
                                  <button
                                    key={space._id}
                                    className={`flex items-center justify-between w-full text-left py-2 px-2 text-sm rounded hover:bg-muted transition-colors ${
                                      selectedSpaceId === space._id
                                        ? "bg-accent/50"
                                        : ""
                                    }`}
                                    onClick={() => setSelectedSpaceId(space._id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <DoorClosed className="h-4 w-4" />
                                      <span
                                        className={
                                          selectedSpaceId === space._id
                                            ? "font-bold"
                                            : ""
                                        }
                                      >
                                        {space.name}
                                      </span>
                                    </div>
                                    {selectedSpaceId === space._id && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex space-x-3 p-6 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="px-6 w-full"
          >
            {t("spaces.cancel")}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedSpaceId || isRelocating}
            className="text-white w-full"
            size="lg"
          >
            {isRelocating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("spaces.relocating")}
              </>
            ) : (
              t("spaces.apply")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSpaceModal;