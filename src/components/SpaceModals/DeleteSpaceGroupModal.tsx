import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteGroupMutation } from "@/hooks/queries";
import { toast } from "sonner";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteSpaceGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
  groupId: string;
}

const DeleteSpaceGroupModal = ({
  isOpen,
  onClose,
  onConfirm,
  groupName,
  groupId,
}: DeleteSpaceGroupModalProps) => {
  const deleteGroupMutation = useDeleteGroupMutation();
  const { refreshData } = useReferenceData();
  const { t } = useLanguage();

  const handleDelete = async () => {
    try {
      await deleteGroupMutation.mutateAsync(groupId);
      toast.success(t("spaces.title"), { description: t("spaces.spaceGroupDeleted") });
      onConfirm();
      refreshData();
    } catch (error) {
      toast.error(t("common.error"), { description: t("spaces.failedDeleteGroup") });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("spaces.deleteSpaceGroup")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("spaces.deleteGroupConfirm").replace("{name}", groupName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("spaces.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteGroupMutation.isPending}
          >
            {deleteGroupMutation.isPending ? t("spaces.deletingGroup") : t("spaces.deleteGroup")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSpaceGroupModal;
