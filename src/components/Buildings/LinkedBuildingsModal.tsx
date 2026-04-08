import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Plus, Trash2, Home, Tag } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { AddBuildingToCategoryModal } from "./AddBuildingToCategoryModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedBuildingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  buildings: Array<{ _id: string; label: string }>;
  onBuildingsChange: (buildings: Array<{ _id: string; label: string }>) => void;
}

export function LinkedBuildingsModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  buildings,
  onBuildingsChange,
}: LinkedBuildingsModalProps) {
  const { t } = useLanguage();
  const [localBuildings, setLocalBuildings] = useState(buildings);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { refreshData } = useReferenceData();

  const handleDelete = async (buildingId: string) => {
    setDeletingId(buildingId);

    try {
      const updatedBuildings = localBuildings.filter(
        (b) => b._id !== buildingId,
      );

      await apiService.patch(`/category/${categoryId}`, {
        buildingIds: updatedBuildings.map((b) => b._id),
      });

      setLocalBuildings(updatedBuildings);
      onBuildingsChange(updatedBuildings);
      refreshData();
      toast({
        title: t("buildings.categories"),
        description: t("buildings.buildingRemovedFromCategory"),
        variant: "success",
      });
    } catch (error) {
      console.error("Error removing building:", error);
      toast({
        title: t("common.error"),
        description: t("buildings.failedRemoveBuilding"),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddBuildings = async (
    buildings: Array<{ id: string; label: string }>,
  ) => {
    try {
      const newBuildings = buildings.map((b) => ({ _id: b.id, label: b.label }));
      const updatedBuildings = [...localBuildings, ...newBuildings];

      await apiService.patch(`/category/${categoryId}`, {
        buildingIds: updatedBuildings.map((b) => b._id),
      });

      setLocalBuildings(updatedBuildings);
      onBuildingsChange(updatedBuildings);

      toast({
        title: t("buildings.categories"),
        description: `${buildings.length} ${t("buildings.buildingsAddedToCategory")}`,
        variant: "success",
      });

      setShowAddModal(false);
      refreshData();
    } catch (error) {
      console.error("Error adding buildings:", error);
      toast({
        title: t("common.error"),
        description: t("buildings.failedAddBuildings"),
        variant: "destructive",
      });
    }
  };

  const CountBadge = ({ count }: { count: number }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border`}
    >
      {count}
    </span>
  );
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="relative border-b pb-4">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={onClose}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
                  <Tag className="h-5 w-5" color="#4D80EDFF" />
                </div>
                <DialogTitle className="text-lg font-semibold text-foreground first-letter:uppercase">
                  {categoryName}
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-foreground">
                  {t("buildings.linkedBuildings")}
                </h3>
                <div className="flex items-center justify-center">
                  <CountBadge count={localBuildings.length} />
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("buildings.addBuilding2")}
              </Button>
            </div>

            {localBuildings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground italic text-sm">
                {t("buildings.noBuildingsForCategory")}
              </div>
            ) : (
              <div className="space-y-3">
                {localBuildings.map((building) => (
                  <div
                    key={building._id}
                    className="p-3 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5" color="#4D81ED" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground first-letter:uppercase">
                          {building.label}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(building._id)}
                        disabled={deletingId === building._id}
                      >
                        {deletingId === building._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddBuildingToCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddBuildings}
        existingBuildingIds={localBuildings.map((b) => b._id)}
      />
    </>
  );
}
