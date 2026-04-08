import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Building as BuildingIcon,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building } from "@/types";
import { useBuilding } from "@/contexts/BuildingContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChangeBuildingFloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (buildingId: string, areaId: string) => void;
  buildings: Building[];
  selectedBuildingId?: string;
  selectedAreaId?: string;
}

interface TreeNode {
  id: string;
  name: string;
  type: "building" | "area";
  expanded?: boolean;
  selected?: boolean;
  children?: TreeNode[];
  buildingId?: string;
}

const ChangeBuildingFloorModal = ({
  isOpen,
  onClose,
  onSelect,
  buildings,
  selectedBuildingId,
  selectedAreaId,
}: ChangeBuildingFloorModalProps) => {
  const { selectedBuilding: sidebarBuilding } = useBuilding();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<{ buildingId: string; areaId: string } | null>(null);

  const displayBuildings = useMemo(() => {
    if (sidebarBuilding) {
      return buildings.filter((b) => b._id === sidebarBuilding._id);
    }
    return buildings;
  }, [buildings, sidebarBuilding]);

  useEffect(() => {
    if (!isOpen) return;
    const tree: TreeNode[] = displayBuildings.map((building) => {
      const hasSelectedArea = building.areas?.some((a) => a._id === selectedAreaId);
      return {
        id: building._id,
        name: building.label,
        type: "building" as const,
        expanded: building._id === selectedBuildingId || hasSelectedArea || displayBuildings.length === 1,
        buildingId: building._id,
        children: (building.areas || []).map((area) => ({
          id: area._id,
          name: area.label,
          type: "area" as const,
          selected: false,
          buildingId: building._id,
        })),
      };
    });
    setTreeNodes(tree);
    setSelectedNode(null);
    setSearchQuery("");
  }, [isOpen, displayBuildings, selectedBuildingId, selectedAreaId]);

  const handleToggle = (nodeId: string) => {
    const update = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((n) =>
        n.id === nodeId
          ? { ...n, expanded: !n.expanded }
          : { ...n, children: n.children ? update(n.children) : undefined }
      );
    setTreeNodes(update(treeNodes));
  };

  const handleAreaSelect = (buildingId: string, areaId: string) => {
    const update = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((n) => ({
        ...n,
        selected: false,
        children: n.children?.map((child) => ({
          ...child,
          selected: child.id === areaId,
        })),
      }));
    setTreeNodes(update(treeNodes));
    setSelectedNode({ buildingId, areaId });
  };

  const handleApply = () => {
    if (selectedNode) {
      onSelect(selectedNode.buildingId, selectedNode.areaId);
      onClose();
    }
  };

  const filteredTree = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return treeNodes;
    return treeNodes
      .map((building) => ({
        ...building,
        expanded: true,
        children: building.children?.filter((area) =>
          area.name.toLowerCase().includes(query)
        ),
      }))
      .filter((building) => building.children && building.children.length > 0);
  }, [treeNodes, searchQuery]);

  const isAlreadySelected = (areaId: string) =>
    !selectedNode && areaId === selectedAreaId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[80vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="p-4 pb-2 shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center justify-between">
            {t("spaces.changeArea")}
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-foreground">{t("spaces.selectNewArea")}</p>
        </DialogHeader>

        <div className="px-4 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("spaces.searchAreas")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {filteredTree.length === 0 ? (
            <div className="p-4 flex flex-col items-center gap-3 rounded text-center">
              <AlignVerticalSpaceAround className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? t("spaces.noAreasFound") : t("spaces.noAreasAvailable")}
              </p>
            </div>
          ) : (
            filteredTree.map((building) => (
              <div key={building.id}>
                <div
                  className="flex items-center justify-between gap-2 py-2 px-3 mx-3 rounded transition-colors hover:bg-accent/50 cursor-pointer first-letter:uppercase"
                  onClick={() => handleToggle(building.id)}
                >
                  <span className="text-sm truncate flex items-center gap-2 px-4">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    {building.name}
                  </span>
                  {building.expanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
                {building.expanded &&
                  building.children?.map((area) => {
                    const isSelected = selectedNode?.areaId === area.id;
                    const isCurrentlyLinked = isAlreadySelected(area.id);
                    const showAsSelected = isSelected || isCurrentlyLinked;
                    return (
                      <div
                        key={area.id}
                        className={`flex items-center justify-between gap-2 py-2 px-3 mx-3 rounded transition-colors hover:bg-accent/50 cursor-pointer first-letter:uppercase ${showAsSelected ? "bg-accent/50 font-bold" : ""}`}
                        style={{ marginLeft: "24px" }}
                        onClick={() => handleAreaSelect(area.buildingId!, area.id)}
                      >
                        <span className="text-sm truncate flex items-center gap-2 px-4">
                          {showAsSelected ? (
                            <AlignHorizontalSpaceAround className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <AlignVerticalSpaceAround className="w-4 h-4 text-muted-foreground" />
                          )}
                          {area.name}
                        </span>
                        {showAsSelected && <Check className="w-4 h-4 shrink-0" color="#1759E8FF" />}
                      </div>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        <div className="flex space-x-3 p-4 pt-2 border-t shrink-0">
          <Button variant="outline" size="lg" onClick={onClose} className="px-6 w-full">
            {t("spaces.cancel")}
          </Button>
          <Button onClick={handleApply} disabled={!selectedNode} className="text-white w-full" size="lg">
            {t("spaces.apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeBuildingFloorModal;
