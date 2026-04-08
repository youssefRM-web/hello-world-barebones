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
import { Loader2 } from "lucide-react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useDeleteDocumentMutation } from "@/hooks/mutations";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Document } from "@/types";
import { toast } from "sonner";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  document,
}: DeleteDocumentModalProps) {
  const deleteDocumentMutation = useDeleteDocumentMutation();
  const { refreshData } = useReferenceData();
  const { t } = useLanguage();

  const handleDelete = async () => {
    if (!document._id) return;

    try {
      await deleteDocumentMutation.mutateAsync({
        documentId: document._id,
        linkedToId: document?.linkedTo?.[0]?._id,
        linkedToType: document?.linkedTo?.[0]?.type,
      });
      onClose();
      refreshData();
      toast.success(t("documents.title"), {
        description: "Document deleted successfully",
      });

    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {t("documents.deleteDocumentQuestion")}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-foreground">
            {t("documents.deleteDocumentConfirm")}{" "}
            <span className="font-bold text-foreground">{document.name}</span>
            {t("documents.deleteDocumentWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("documents.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={deleteDocumentMutation.isPending}
          >
            {deleteDocumentMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("documents.deleting")}
              </span>
            ) : (
              t("documents.deleteDocumentBtn")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
