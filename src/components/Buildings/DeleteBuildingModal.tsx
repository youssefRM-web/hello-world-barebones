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
import { useApi } from "@/hooks/useApi";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { apiService, endpoints } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface DeleteBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  buildingName: string;
}

export function DeleteBuildingModal({
  isOpen,
  onClose,
  buildingId,
  buildingName,
}: DeleteBuildingModalProps) {
  const { t } = useLanguage();
  const { executeRequest, isLoading } = useApi();
  const { refreshData } = useReferenceData();

  const handleDelete = async () => {
    if (!buildingId) return;

    await executeRequest(
      () => apiService.patch(`${endpoints.buildings}/${buildingId}/archive`),
      {
        onSuccess: () => {
          onClose();
          toast({
            title: t("board.building"),
            description: t("messages.success.buildingDeleted"),
            variant: "success",
          });
          refreshData();
          window.location.reload();
        },
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg ">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 justify-center mb-4">
            <div>
              <AlertDialogTitle className="text-lg font-bold">
                {t("buildings.deleteBuilding")} {buildingName}?
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-foreground text-center">
            {t("buildings.deleteBuildingWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose} variant="outline" size="lg">
            {t("buildings.cancel")}
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? t("common.deleting") : t("buildings.deleteBuilding")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
