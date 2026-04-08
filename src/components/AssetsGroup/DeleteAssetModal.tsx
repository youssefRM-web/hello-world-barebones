import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService, endpoints } from "@/services/api";
import { Archive, Trash2, AlertTriangle, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface DeleteAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

const DeleteAssetModal = ({
  isOpen,
  onClose,
  asset,
}: DeleteAssetModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<"archive" | "delete" | null>(null);
  const { refreshAssets, refreshCategories } = useReferenceData();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const handleArchive = async () => {
    setIsProcessing(true);
    setAction("archive");
    try {
      await apiService.patch(`${endpoints.assets}/${asset._id}`, { archived: true });
      onClose();
      toast({
        title: t("assets.title"),
        description: t("assets.assetArchivedSuccess"),
        variant: "success"
      });
      window.dispatchEvent(new CustomEvent('asset-deleted'));
    } catch (error: any) {
      console.error(error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedArchiveAsset"),
        variant: "destructive"
      });
    } finally {
      refreshAssets()
      refreshCategories();
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    setAction("delete");
    try {
      await apiService.delete(`${endpoints.assets}/${asset._id}`);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      
      onClose();
      toast({
        title: t("assets.title"),
        description: t("assets.assetDeletedSuccess"),
        variant: "success"
      });
      window.dispatchEvent(new CustomEvent('asset-deleted'));
    } catch (error: any) {
      console.error(error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedDeleteAsset"),
        variant: "destructive"
      });
    } finally {
      refreshAssets();
      refreshCategories();
      setIsProcessing(false);
      setAction(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("assets.deleteOrArchive")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("assets.whatToDo")} "{asset.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div 
            className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-all"
            onClick={() => !isProcessing && handleArchive()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground group-hover:text-primary">
                  {t("assets.archiveAsset30")}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("assets.archiveAssetDesc")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-2" />
            </div>
          </div>

          <div 
            className="p-4 border border-border rounded-lg hover:border-destructive/50 hover:bg-destructive/5 cursor-pointer transition-all"
            onClick={() => !isProcessing && handleDelete()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{t("assets.deletePermanently")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("assets.deletePermanentlyDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full"
          >
            {t("assets.cancel")}
          </Button>
        </DialogFooter>

        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                {action === "archive" ? t("assets.archivingAsset") : t("assets.deletingAsset")}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAssetModal;