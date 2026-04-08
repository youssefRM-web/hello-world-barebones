import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Package,
  Printer,
  Check,
} from "lucide-react";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Asset {
  _id: string;
  name: string;
}

interface RestoreSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  spaceName?: string;
  spaceId?: string;
  buildingId?: string;
}

const RestoreSpaceModal = ({
  isOpen,
  onClose,
  onSuccess,
  spaceName,
  spaceId,
  buildingId,
}: RestoreSpaceModalProps) => {
  const { buildings, refreshSpaces, refreshAssets } = useReferenceData();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [isRestoring, setIsRestoring] = useState(false);
  const [isBuildingArchived, setIsBuildingArchived] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [archivedAssets, setArchivedAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    if (isOpen && buildingId) {
      const building = buildings.find((b) => b._id === buildingId);
      if (building) {
        setIsBuildingArchived(building.archived);
        setBuildingName(building.label);
      }
      fetchArchivedAssets();
    }
    if (!isOpen) {
      setArchivedAssets([]);
      setIsBuildingArchived(false);
    }
  }, [isOpen, buildingId, buildings]);

  const fetchArchivedAssets = async () => {
    if (!spaceId) return;
    setLoadingAssets(true);
    try {
      const response = await apiService.get<Asset[]>(
        `${endpoints.assets}/space/${spaceId}`,
      );
      setArchivedAssets(response.data || []);
    } catch (error) {
      console.error("Failed to fetch archived assets:", error);
      setArchivedAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleRestore = async () => {
    if (!spaceId) return;
    if (isBuildingArchived) {
      toast({
        title: t("spaces.cannotRestoreSpace"),
        description: t("spaces.cannotRestoreDesc").replace(
          "{building}",
          buildingName,
        ),
        variant: "destructive",
      });
      return;
    }
    setIsRestoring(true);
    try {
      for (const asset of archivedAssets) {
        await apiService.patch(`${endpoints.assets}/${asset._id}`, {
          archived: false,
        });
      }
      await apiService.patch(`${endpoints.spaces}/${spaceId}`, {
        archived: false,
      });
      onClose();
      toast({
        title: t("spaces.title"),
        icon: <Check className="h-4 w-4 text-green-600" />,
        description: t("spaces.spaceRestored")
          .replace("{name}", spaceName || "")
          .replace("{count}", String(archivedAssets.length)),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
      refreshSpaces();
      onSuccess?.();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("spaces.failedRestore"),
        variant: "destructive",
      });
    } finally {
      refreshAssets();
      setIsRestoring(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <button
            onClick={onClose}
            className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertDialogTitle className="flex items-center justify-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            {t("spaces.restoreSpace")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isBuildingArchived ? (
              <div className="space-y-3">
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">
                      {t("spaces.cannotRestoreSpace")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("spaces.cannotRestoreDesc").replace(
                      "{building}",
                      buildingName,
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p>
                {t("spaces.restoreConfirm")} <strong>"{spaceName}"</strong>?
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isBuildingArchived && (
          <>
            {loadingAssets ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t("spaces.checkingArchivedAssets")}
                </span>
              </div>
            ) : archivedAssets.length > 0 ? (
              <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  {t("spaces.archivedAssets")} ({archivedAssets.length})
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("spaces.assetsWillBeRestored")}
                </p>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {archivedAssets.map((asset) => (
                    <div
                      key={asset._id}
                      className="flex items-center gap-2 p-2 rounded-md bg-background"
                    >
                      <Printer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{asset.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <strong>{t("spaces.note")}:</strong> {t("spaces.restoreNote")}
            </div>
          </>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            {isBuildingArchived ? t("spaces.close") : t("spaces.cancel")}
          </Button>
          {!isBuildingArchived && (
            <Button
              onClick={handleRestore}
              disabled={isRestoring || loadingAssets}
              className="w-full"
            >
              {isRestoring ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("spaces.restoring")}
                </span>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("spaces.restoreSpace")}
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreSpaceModal;
