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
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/contexts/ReferenceDataContext";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  categoryId: string;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  categoryId,
}: DeleteCategoryModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { refreshData } = useReferenceData();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiService.delete(`${endpoints.categories}/${categoryId}`);
      toast({
        title: t("buildings.categories"),
        description: t("buildings.categoryCreatedSuccess"),
        variant: "success",
      });
      refreshData();
      onConfirm();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('buildings.deleteCategory')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('buildings.deleteCategoryWarning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            {t('buildings.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? t("buildings.deleting") : t('buildings.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
