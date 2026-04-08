import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Building as BuildingIcon,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  DoorClosed,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building, Space } from "@/types";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useBuilding } from "@/contexts/BuildingContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Asset {
  _id: string;
  name: string;
  space_id: string;
}

interface LinkedSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assetId: string) => void;
  buildings: Building[];
  spaces: Space[];
  assets?: Asset[];
  selectedBuildingId?: string;
  alreadyLinkedSpaceId?: string;
  showAllBuildings?: boolean;
}

const LinkedSpaceModal = ({
  isOpen,
  onClose,
  onSelect,
  buildings,
  spaces,
  selectedBuildingId,
  alreadyLinkedSpaceId,
  showAllBuildings = false,
}: LinkedSpaceModalProps) => {
  const { t } = useLanguage();
  const { selectedBuilding: sidebarBuilding } = useBuilding();

  // Determine which buildings to show - respect sidebar selection
  const displayBuildings = showAllBuildings
    ? (sidebarBuilding ? buildings.filter((b) => b._id === sidebarBuilding._id) : buildings)
    : buildings.filter((b) => b._id === selectedBuildingId);

  // Auto-expand building and area containing the already linked space
  const initialExpanded = useMemo(() => {
    const buildingIds: string[] = selectedBuildingId ? [selectedBuildingId] : [];
    const areaIds: string[] = [];

    if (alreadyLinkedSpaceId) {
      const linkedSpace = spaces.find((s) => s._id === alreadyLinkedSpaceId && !s.archived);
      if (linkedSpace) {
        const bId = linkedSpace.building_id?._id || (typeof linkedSpace.building_id === "string" ? linkedSpace.building_id : "");
        if (bId && !buildingIds.includes(bId)) buildingIds.push(bId);
        const aId = linkedSpace.area?._id || (linkedSpace as any).area_id?._id;
        if (aId) areaIds.push(aId);
      }
    }
    return { buildingIds, areaIds };
  }, [alreadyLinkedSpaceId, selectedBuildingId, spaces]);

  const [expandedBuildings, setExpandedBuildings] = useState<string[]>(initialExpanded.buildingIds);
  const [expandedAreas, setExpandedAreas] = useState<string[]>(initialExpanded.areaIds);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setExpandedBuildings(initialExpanded.buildingIds);
      setExpandedAreas(initialExpanded.areaIds);
      setSelectedSpaceId("");
      setSearchQuery("");
    }
  }, [isOpen]);


  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings((prev) =>
      prev.includes(buildingId)
        ? prev.filter((id) => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleApply = () => {
    if (selectedSpaceId) onSelect(selectedSpaceId);
  };

  // Filter spaces based on search query
  const filteredSpaces = spaces.filter((space) =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) && !space.archived
  );

  const handleSpaceClick = (spaceId: string) => {
    // Allow selecting any space, including already linked (to re-confirm or switch)
    setSelectedSpaceId(spaceId === selectedSpaceId ? "" : spaceId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[600px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {t("assets.linkAssetTo")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("assets.linkAssetToDesc")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 rounded-sm hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("assets.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-0 focus:bg-background"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 max-h-[300px] overflow-y-auto border-b">
          {searchQuery && filteredSpaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <DoorClosed className="h-10 w-10 mb-2" />
              <span className="text-sm">{t("assets.spaceNotFound")}</span>
            </div>
          ) : displayBuildings.length > 0 ? (
            <div className="space-y-2">
              {displayBuildings.map((building) => {
                const isBuildingExpanded = searchQuery
                  ? true
                  : expandedBuildings.includes(building._id);

                // Check if building has matching spaces when searching
                const buildingHasMatchingSpaces = filteredSpaces.some(
                  (space) => space.building_id._id === building._id
                );
                if (searchQuery && !buildingHasMatchingSpaces) return null;

                return (
                  <div key={building._id}>
                    {/* Building header */}
                    <button
                      className="flex first-letter:uppercase items-center justify-between w-full text-left space-x-2 text-sm font-medium text-foreground hover:bg-accent/50 px-1 py-1 rounded"
                      onClick={() => toggleBuilding(building._id)}
                    >
                      <div className="flex gap-2 items-center">
                        <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="first-letter:uppercase">{building.label}</span>
                      </div>
                      {isBuildingExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {isBuildingExpanded && (
                      <div>
                        {/* Areas */}
                        {building.areas
                          .filter((area) => {
                            if (!searchQuery) return true;
                            return filteredSpaces.some(
                              (space) =>
                                space.building_id._id === building._id &&
                                space.area?._id === area._id
                            );
                          })
                          .map((area) => {
                            const areaSpaces = filteredSpaces.filter(
                              (space) =>
                                space.building_id._id === building._id &&
                                space.area?._id === area._id
                            );
                            const isExpanded = searchQuery
                              ? true
                              : expandedAreas.includes(area._id);

                            return (
                              <div key={area._id} className="ml-6">
                                <div className="hover:bg-accent/50 pl-1">
                                  <button
                                    className="flex first-letter:uppercase items-center justify-between w-full text-left py-2 text-sm text-foreground transition-colors"
                                    onClick={() => toggleArea(area._id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      {isExpanded ? (
                                        <AlignHorizontalSpaceAround className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <AlignVerticalSpaceAround className="w-4 h-4 text-muted-foreground" />
                                      )}
                                      <span className="first-letter:uppercase">{area.label}</span>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                                {isExpanded && (
                                  <div className="ml-6 space-y-1">
                                    {areaSpaces.length === 0 ? (
                                      <div className="flex items-center gap-2 py-3 px-2 text-sm text-muted-foreground">
                                        <DoorClosed className="h-4 w-4" />
                                        <span>{t("assets.noSpacesInFloor")}</span>
                                      </div>
                                    ) : (
                                      areaSpaces.map((space) => {
                                        const isAlreadyLinked =
                                          space._id === alreadyLinkedSpaceId;
                                        const isSelected =
                                          selectedSpaceId === space._id;
                                        const showAsSelected =
                                          isSelected ||
                                          (isAlreadyLinked && !selectedSpaceId);

                                        return (
                                          <button
                                            key={space._id}
                                            className={`flex first-letter:uppercase items-center justify-between w-full text-left py-2 px-2 text-sm rounded transition-colors ${
                                              showAsSelected
                                                ? "bg-accent/50"
                                                : "hover:bg-muted"
                                            }`}
                                            onClick={() =>
                                              handleSpaceClick(space._id)
                                            }
                                          >
                                            <div className="flex items-center space-x-2">
                                              <DoorClosed className="h-4 w-4" />
                                              <span
                                                className={
                                                  showAsSelected
                                                    ? "text-foreground first-letter:uppercase font-bold"
                                                    : "text-foreground first-letter:uppercase"
                                                }
                                              >
                                                {space.name}
                                              </span>
                                            </div>
                                            {showAsSelected && (
                                              <Check
                                                className="h-4 w-4"
                                                color="#1759E8FF"
                                              />
                                            )}
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("assets.noBuildingsAvailable")}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex  space-x-3 p-6 pt-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="px-6 w-full"
          >
            {t("assets.cancel")}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedSpaceId}
            className="text-white w-full"
            size="lg"
          >
            {t("assets.apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedSpaceModal;
