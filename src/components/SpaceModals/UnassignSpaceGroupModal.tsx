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
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface UnassignSpaceGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  spaceName: string;
  spaceId: string;
  groupName: string;
}

const UnassignSpaceGroupModal = ({
  isOpen,
  onClose,
  onConfirm,
  spaceName,
  spaceId,
  groupName,
}: UnassignSpaceGroupModalProps) => {
  const { t } = useLanguage();
  const { refreshData } = useReferenceData();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUnassign = async () => {
    setIsLoading(true);
    try {
      await apiService.patch(`/space/${spaceId}`, { spaceGroup: null });
      onClose();
      toast.success(t("spaces.title"), { description: t("spaces.spaceUnassigned") });
      await refreshData();
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      onConfirm();
    } catch (error) {
      console.error("Error unassigning space from group:", error);
      toast.error(t("common.error"), { description: t("spaces.failedUnassign") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("spaces.unassignFromGroup")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("spaces.unassignConfirm").replace("{space}", spaceName).replace("{group}", groupName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>{t("spaces.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnassign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isLoading}>
            {isLoading ? t("spaces.unassigning") : t("spaces.unassign")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnassignSpaceGroupModal;
