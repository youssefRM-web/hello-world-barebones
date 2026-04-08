import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search } from "lucide-react";
import { useBuildingsQuery } from "@/hooks/queries/useBuildingsQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddBuildingToCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (buildings: Array<{ id: string; label: string }>) => Promise<void>;
  existingBuildingIds: string[];
}

export function AddBuildingToCategoryModal({
  isOpen,
  onClose,
  onAdd,
  existingBuildingIds,
}: AddBuildingToCategoryModalProps) {
  const { t } = useLanguage();
  const { orgBuildings, isLoading, refetch } = useBuildingsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuildings, setSelectedBuildings] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isAdding, setIsAdding] = useState(false);

  const availableBuildings = orgBuildings.filter(
    (b: any) => !existingBuildingIds.includes(b._id)
  );

  const filteredBuildings = availableBuildings.filter((b: any) =>
    b.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
    } else {
      setSearchQuery("");
      setSelectedBuildings([]);
    }
  }, [isOpen]);

  const toggleBuilding = (buildingId: string, buildingLabel: string) => {
    setSelectedBuildings((prev) => {
      const exists = prev.some((b) => b.id === buildingId);
      if (exists) {
        return prev.filter((b) => b.id !== buildingId);
      }
      return [...prev, { id: buildingId, label: buildingLabel }];
    });
  };

  const handleAdd = async () => {
    if (selectedBuildings.length === 0) return;

    setIsAdding(true);
    try {
      onClose();
      await onAdd(selectedBuildings);
    } catch (error) {
      console.error("Error adding buildings:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("buildings.addBuildings")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("buildings.searchBuildings")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                  >
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </>
            ) : filteredBuildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {searchQuery
                    ? t("buildings.noBuildingsFoundSearch")
                    : t("buildings.allBuildingsLinked")}
                </p>
              </div>
            ) : (
              filteredBuildings.map((building: any) => {
                const isSelected = selectedBuildings.some(
                  (b) => b.id === building._id
                );
                return (
                  <button
                    key={building._id}
                    onClick={() =>
                      toggleBuilding(building._id, building.label)
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-accent/30 hover:bg-accent/50 border-2 border-transparent"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                    <div className="w-8 h-8 bg-[#6B7280] rounded flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {building.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t("buildings.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedBuildings.length === 0 || isAdding}
              className="flex-1"
            >
              {isAdding
                ? t("buildings.adding")
                : `${t("buildings.add")} ${selectedBuildings.length > 0 ? `(${selectedBuildings.length})` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
