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
import { useDeleteRecurringTask } from "@/hooks/mutations";

interface DeleteRecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onTaskDeleted: () => void;
}

export function DeleteRecurringTaskModal({
  isOpen,
  onClose,
  task,
  onTaskDeleted,
}: DeleteRecurringTaskModalProps) {
  const { t } = useLanguage();
  const deleteTaskMutation = useDeleteRecurringTask();

  const handleDelete = async () => {
    if (!task._id) return;

    await deleteTaskMutation.mutateAsync(task._id);
    onTaskDeleted();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-destructive-foreground font-bold text-lg">!</span>
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {t("tasks.deleteRecurringTask")}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-foreground text-center">
            {t("tasks.deleteConfirm")}{" "}
            <span className="font-bold text-primary">{task.issue_summary}</span>
            {t("tasks.deleteWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("tasks.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending ? t("tasks.deleting") : t("tasks.deleteTaskBtn")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
