import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeleteGroupMutation } from "@/hooks/queries/useGroupsQuery";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteAssetGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
  groupId: string;
}

const DeleteAssetGroupModal = ({
  isOpen,
  onClose,
  onConfirm,
  groupName,
  groupId,
}: DeleteAssetGroupModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const deleteGroupMutation = useDeleteGroupMutation();
  const { refreshAssets } = useReferenceData();

  const handleDelete = async () => {
    try {
      await deleteGroupMutation.mutateAsync(groupId);
      toast({
        title: t("assets.title"),
        description: t("assets.assetGroupDeletedSuccess"),
        variant: "success",
      });
      onConfirm();
    } catch (error) {
      console.error("Error deleting asset group:", error);
      toast({
        title: "Error",
        description: t("assets.failedDeleteAssetGroup"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground text-center">
            {t("assets.deleteGroup")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            {t("assets.deleteGroupDesc")}
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            size="lg"
            disabled={deleteGroupMutation.isPending}
          >
            {t("assets.cancel")}
          </Button>
          <Button
            onClick={handleDelete}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            size="lg"
            disabled={deleteGroupMutation.isPending}
          >
            {deleteGroupMutation.isPending ? t("assets.deleting") : t("assets.delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAssetGroupModal;