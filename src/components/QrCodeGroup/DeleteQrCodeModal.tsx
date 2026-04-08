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
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteQrCodeModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteQrCodeModalProps) => {
  const { t } = useLanguage();

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
                {t("qrCodes.deleteQrCode")}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-foreground">
            {t("qrCodes.deleteQrCodeConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("qrCodes.deleting")}
              </span>
            ) : (
              t("qrCodes.deleteQrCodeBtn")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteQrCodeModal;
