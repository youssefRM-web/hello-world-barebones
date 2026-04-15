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
import { useDeleteMenu } from "@/hooks/useMenu";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId: string | null;
  menuName: string;
}

export function DeleteMenuDialog({ open, onOpenChange, menuId, menuName }: DeleteMenuDialogProps) {
  const { t } = useLanguage();
  const deleteMenu = useDeleteMenu();

  const handleDelete = () => {
    if (!menuId) return;
    deleteMenu.mutate(menuId, {
      onSuccess: () => {
        toast.success(t("menuDeletedSuccess"));
        onOpenChange(false);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteMenuTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteMenuConfirm")} <strong>{menuName}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMenu.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMenu.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
