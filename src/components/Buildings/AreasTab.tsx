import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Plus, Trash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { apiService } from "@/services/api";
import { DeleteAreaModal } from "./DeleteAreaModal";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useReferenceData } from "@/contexts/ReferenceDataContext";

interface AreaForm {
  label: string;
  _id: string;
}

interface Organization {
  _id: string;
  name: string;
}

interface building {
  _id: string;
  label: string;
  areas: AreaForm[];
  organization_id: Organization;
  photo: string;
  address: string;
  zipCode: string;
  city: string;
  requireContactDetails: boolean;
  contactType: string;
  askForName: boolean;
  autoAccept: boolean;
}

type AreasTabProps = {
  building: building;
  onBuildingUpdated?: (updatedBuilding: any) => void;
  id: string;
};

interface SortableAreaItemProps {
  area: AreaForm;
  onDelete: (areaId: string) => void;
  onDragStart: (e: React.DragEvent, areaId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, areaId: string) => void;
}

function SortableAreaItem({
  area,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: SortableAreaItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, area._id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, area._id)}
      className="flex items-center gap-3 py-2 px-3 border rounded-lg bg-background cursor-move hover:bg-accent/50 transition-colors"
    >
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <span className="flex-1 text-foreground">{area.label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-[#DE3B40FF]"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(area._id);
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AreasTab({ building, id, onBuildingUpdated }: AreasTabProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { executeRequest, isLoading } = useApi();
  const [newAreaName, setNewAreaName] = useState("");
  const [areas, setAreas] = useState<AreaForm[]>(building.areas || []);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);
  const { refreshData } = useReferenceData();

  useEffect(() => {
    setAreas(building.areas || []);
  }, [building]);

  const addArea = async () => {
    if (!newAreaName.trim()) return;

    const result = await executeRequest(() =>
      apiService.post(`/building/${id}/areas`, { label: newAreaName.trim() }),
    );

    toast({
      title: t("buildings.areas"),
      description: t("buildings.areaAddedSuccess"),
      variant: "success",
    });

    if (result) {
      const updatedBuildingResult = await executeRequest(
        () => apiService.get(`/building/${id}`),
        {},
      );

      if (
        updatedBuildingResult &&
        typeof updatedBuildingResult === "object" &&
        "areas" in updatedBuildingResult
      ) {
        const newAreas = (updatedBuildingResult as any).areas || [];
        setAreas(newAreas);
        setNewAreaName("");

        if (onBuildingUpdated) {
          onBuildingUpdated(updatedBuildingResult);
        }
      }
    }
  };

  const openDeleteModal = (areaId: string) => {
    const area = areas.find((a) => a._id === areaId);
    if (area) {
      setAreaToDelete(area);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!areaToDelete) return;

    const index = areas.findIndex((area) => area._id === areaToDelete._id);
    if (index === -1) return;

    setIsDeleting(true);

    const result = await executeRequest(() =>
      apiService.delete(`/building/areas/${id}/${index}`),
    );
    refreshData();
    toast({
      title: t("buildings.areas"),
      description: t("buildings.areaDeletedSuccess"),
      variant: "success",
    });

    setIsDeleting(false);
    setDeleteModalOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, areaId: string) => {
    setDraggedAreaId(areaId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetAreaId: string) => {
    e.preventDefault();

    if (!draggedAreaId || draggedAreaId === targetAreaId) {
      setDraggedAreaId(null);
      return;
    }

    const oldIndex = areas.findIndex((area) => area._id === draggedAreaId);
    const newIndex = areas.findIndex((area) => area._id === targetAreaId);

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedAreaId(null);
      return;
    }

    const newAreas = [...areas];
    const [movedItem] = newAreas.splice(oldIndex, 1);
    newAreas.splice(newIndex, 0, movedItem);

    setAreas(newAreas);
    setDraggedAreaId(null);

    try {
      await apiService.patch(`/building/${id}/areas/reorder`, {
        areas: newAreas,
      });

      if (onBuildingUpdated) {
        const updatedBuilding = { ...building, areas: newAreas };
        onBuildingUpdated(updatedBuilding);
      }
    } catch (error) {
      setAreas(areas);
      console.error("Failed to reorder areas:", error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-foreground text-sm">
          {t("buildings.areasDescription")}
        </p>
        <p className="text-foreground text-sm">
          {t("buildings.areaAssignment")}
        </p>
      </div>

      <div className="space-y-3">
        {areas.map((area) => (
          <SortableAreaItem
            key={area._id}
            area={area}
            onDelete={openDeleteModal}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

        <div className="flex items-center gap-3">
          <Input
            placeholder={t("buildings.enterFloor")}
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && addArea()}
          />

          <Button
            size="lg"
            onClick={addArea}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            {isLoading ? t("buildings.adding") : t("buildings.add")}
          </Button>
        </div>
      </div>

      <DeleteAreaModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAreaToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        areaName={areaToDelete?.label || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
