import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Printer, Plus, Trash2 } from "lucide-react";
import { Asset } from "@/types";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useGroupsQuery } from "@/hooks/queries";
import { apiService, endpoints } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  groupIcon: string;
  assets: Asset[];
}

const LinkedAssetsModal = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  groupIcon,
  assets,
}: LinkedAssetsModalProps) => {
  const { t } = useLanguage();
  const { assets: allAssets, refreshData, refreshAssets } = useReferenceData();
  const { data: groups = [] } = useGroupsQuery();
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [removingAssetId, setRemovingAssetId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all asset IDs that are assigned to any group
  const assignedAssetIds = new Set(
    groups.flatMap((group: any) =>
      (group.assets || []).map((asset: any) =>
        typeof asset === "string" ? asset : asset._id,
      ),
    ),
  );

  // Filter assets that are not assigned to any group
  const unassignedAssets = allAssets.filter(
    (asset: any) => !assignedAssetIds.has(asset._id),
  );

  const handleAddAsset = async (assetId: string) => {
    setIsAdding(true);
    try {
      await apiService.put(`${endpoints.groups}/${groupId}`, {
        assets: [...assets.map((a) => a._id), assetId],
      });

      toast({
        title: t("assets.title"),
        description: t("assets.assetAddedToGroup"),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsAddAssetModalOpen(false);
    } catch (error) {
      console.error("Error adding asset to group:", error);
      toast({
        title: t("common.error"),
        description: t("assets.failedAddToGroup"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsAdding(false);
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    setRemovingAssetId(assetId);
    try {
      await apiService.put(`${endpoints.groups}/${groupId}`, {
        assets: assets.filter((a) => a._id !== assetId).map((a) => a._id),
      });

      toast({
        title: t("assets.title"),
        description: t("assets.assetRemovedFromGroup"),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (error) {
      console.error("Error removing asset from group:", error);
      toast({
        title: t("common.error"),
        description: t("assets.failedRemoveFromGroupAsset"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setRemovingAssetId(null);
    }
  };

  const CountBadge = ({ count }: { count: number }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border`}
    >
      {count}
    </span>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="relative border-b pb-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={onClose}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="#4D81ED"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <path d="M10 3H4C3.447 3 3 3.447 3 4v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C11 3.447 10.553 3 10 3zM9 9H5V5h4V9zM20 3h-6c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C21 3.447 20.553 3 20 3zM19 9h-4V5h4V9zM10 13H4c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1v-6C11 13.447 10.553 13 10 13zM9 19H5v-4h4V19zM17 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4S19.206 13 17 13zM17 19c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2S18.103 19 17 19z" />
                </svg>
              </div>
              <DialogTitle className="text-lg font-semibold text-foreground first-letter:uppercase">
                {groupName}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-foreground">
                  {t("assets.linkedAssets")}
                </h3>
                <div className="flex items-center justify-center px-2 py-1">
                  <div className="flex items-center justify-center">
                    <CountBadge count={assets.length} />
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddAssetModalOpen(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("assets.addAssetBtn")}
              </Button>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground italic text-sm">
                {t("assets.noAssetsForGroup")}
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className="p-3 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-customBlue rounded flex items-center justify-center flex-shrink-0">
                        <Printer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {asset.name}
                        </div>
                        {asset.supplier && (
                          <div className="text-xs text-muted-foreground">
                            {asset.supplier}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveAsset(asset._id)}
                        disabled={removingAssetId === asset._id}
                      >
                        {removingAssetId === asset._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Asset Modal */}
      <Dialog open={isAddAssetModalOpen} onOpenChange={setIsAddAssetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("assets.addAssetTo")} {groupName}
            </DialogTitle>
          </DialogHeader>

          {unassignedAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic text-sm">
              {t("assets.noAssetsToAssign")}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unassignedAssets.map((asset: any) => (
                <div
                  key={asset._id}
                  className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleAddAsset(asset._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-customBlue rounded flex items-center justify-center flex-shrink-0">
                      <Printer className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {asset.name}
                      </div>
                      {asset.supplier && (
                        <div className="text-xs text-muted-foreground">
                          {asset.supplier}
                        </div>
                      )}
                    </div>
                    {isAdding && (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddAssetModalOpen(false)}
            >
              {t("assets.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LinkedAssetsModal;
