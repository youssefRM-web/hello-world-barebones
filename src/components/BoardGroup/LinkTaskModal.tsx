import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Printer,
  Check,
  DoorClosed,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
} from "lucide-react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuildingData } from "@/hooks/useBuildingData";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";

interface AlreadyLinkedItem {
  id: string;
  type: "Space" | "Asset";
}

interface LinkTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLink: (
    type: "Space" | "Asset",
    id: string,
    name: string,
    buildingId?: string,
  ) => void;
  onApplyLinks?: (links: any[]) => void;
  selectedBuildingId?: any;
  isApplying?: boolean;
  editSelectedBuildingId?: string;
  showAllBuildings?: boolean;
  alreadyLinkedItems?: AlreadyLinkedItem[];
}

interface TreeNode {
  id: string;
  name: string;
  type: "building" | "area" | "office" | "Asset";
  expanded?: boolean;
  selected?: boolean;
  children?: TreeNode[];
  buildingId?: string;
  alreadyLinked?: boolean;
}

// 🔹 Build tree (only non-archived items)
const buildOverviewTree = (
  buildings: any[],
  spaces: any[],
  assets: any[],
): TreeNode[] => {
  // Filter out archived spaces and assets
  const activeSpaces = spaces.filter((sp) => !sp.archived);
  const activeAssets = assets.filter((asset) => !asset.archived);

  return buildings.map((building) => {
    const buildingAreas = building.areas || [];

    return {
      id: building._id,
      name: building.label,
      type: "building",
      expanded: true,
      buildingId: building._id,
      children: buildingAreas.map((area: any) => {
        const areaSpaces = activeSpaces.filter((sp) => sp.area_id === area._id);

        return {
          id: area._id,
          name: area.label || "Area",
          type: "area",
          expanded: false,
          buildingId: building._id,
          children: areaSpaces.map((space: any) => {
            const spaceAssets = activeAssets.filter(
              (asset) => asset.linked_space_id?._id === space._id,
            );

            return {
              id: space._id,
              name: space.name,
              type: "office",
              expanded: false,
              selected: false,
              buildingId: building._id,
              children: spaceAssets.map((asset: any) => ({
                id: asset._id,
                name: asset.name,
                type: "Asset",
                selected: false,
                buildingId: building._id,
              })),
            };
          }),
        };
      }),
    };
  });
};

const OverviewTreeNode = ({
  node,
  level = 0,
  onToggle,
  onSelect,
  selectableTypes = ["office", "Asset"],
  alreadyLinkedIds = [],
}: {
  node: TreeNode;
  level?: number;
  onToggle: (id: string) => void;
  onSelect: (id: string, checked: boolean) => void;
  selectableTypes?: ("office" | "Asset")[];
  alreadyLinkedIds?: string[];
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.expanded;
  const isSelectable = selectableTypes.includes(node.type as any);
  const isSelected = node.selected || false;
  const isAlreadyLinked = alreadyLinkedIds.includes(node.id);

  const getIcon = () => {
    if (node.type === "building")
      return <Home className="w-4 h-4 text-muted-foreground " />;
    if (node.type === "area")
      return isExpanded ? (
        <AlignHorizontalSpaceAround className="w-4 h-4 text-muted-foreground" />
      ) : (
        <AlignVerticalSpaceAround className="w-4 h-4 text-muted-foreground" />
      );
    if (node.type === "office")
      return <DoorClosed className="w-4 h-4 text-muted-foreground" />;
    return <Printer className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-2 py-2 px-3 mx-3 rounded transition-colors first-letter:uppercase ${
          isSelectable
            ? "hover:bg-accent/50 cursor-pointer"
            : "hover:bg-accent/50 cursor-pointer"
        } ${isSelected || isAlreadyLinked ? "bg-accent/50 font-bold" : ""}`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => {
          if (isSelectable) {
            onSelect(node.id, !isSelected);
          } else if (hasChildren) {
            onToggle(node.id);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-between ">
          <span
            className={`text-sm truncate flex items-center gap-2 px-4 ${
              isSelected || isAlreadyLinked
                ? "text-foreground"
                : "text-foreground"
            }`}
          >
            {getIcon()}
            <span className="first-letter:uppercase">{node.name}</span>
          </span>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="p-0 shrink-0 text-red-600"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          {!hasChildren && node.type !== "building" && node.type !== "area" && (
            <div className="w-4 shrink-0" />
          )}
        </div>

        {(isSelected || isAlreadyLinked) && (
          <Check className="w-4 h-4 shrink-0" color="#1759E8FF" />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <OverviewTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              selectableTypes={selectableTypes}
              alreadyLinkedIds={alreadyLinkedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function LinkTaskModal({
  open,
  onOpenChange,
  onApplyLinks,
  onSelectLink,
  selectedBuildingId,
  editSelectedBuildingId,
  isApplying = false,
  showAllBuildings = false,
  alreadyLinkedItems = [],
}: LinkTaskModalProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const { t } = useLanguage();
  const [overviewNodes, setOverviewNodes] = useState<TreeNode[]>([]);
  const [activeTab, setActiveTab] = useState<"spaces" | "assets">("spaces");
  const [selectedLink, setSelectedLink] = useState<{
    id: string;
    name: string;
    type: "office" | "Asset";
    buildingId?: string;
  } | null>(null);

  const { filteredAssets, filteredSpaces } = useBuildingData();
  const {
    buildings,
    isLoading,
    spaces: allSpaces,
    assets: allAssets,
  } = useReferenceData();

  const selectedBuilding = buildings.find(
    (b: any) =>
      b._id === selectedBuildingId || b._id === editSelectedBuildingId,
  );

  // Extract IDs of already linked items for highlighting
  // Once user selects a new item, clear the old linked highlights
  const [hasOverriddenLink, setHasOverriddenLink] = useState(false);
  const alreadyLinkedIds = hasOverriddenLink
    ? []
    : alreadyLinkedItems.map((item) => item.id);

  // Helper: expand the tree path to a specific node by ID
  const expandPathToNode = (
    nodes: TreeNode[],
    targetId: string,
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return { ...node, expanded: true };
      }
      if (node.children) {
        const updatedChildren = expandPathToNode(node.children, targetId);
        const childContainsTarget = updatedChildren.some(
          (child) => child.id === targetId || child.expanded,
        );
        if (childContainsTarget) {
          return { ...node, expanded: true, children: updatedChildren };
        }
        return { ...node, children: updatedChildren };
      }
      return node;
    });
  };

  useEffect(() => {
    let tree: TreeNode[] = [];
    // Always show all buildings
    const activeBuildings = buildings.filter((b: any) => !b.archived);
    const activeSpaces = (showAllBuildings ? allSpaces : filteredSpaces).filter(
      (sp: any) => !sp.archived,
    );
    const activeAssets = (showAllBuildings ? allAssets : filteredAssets).filter(
      (as: any) => !as.archived,
    );

    if (showAllBuildings) {
      tree = buildOverviewTree(activeBuildings, activeSpaces, activeAssets);
    } else if (selectedBuilding) {
      const spaces = filteredSpaces.filter(
        (sp) => sp.building_id?._id === selectedBuilding._id && !sp.archived,
      );
      const assets = filteredAssets.filter(
        (as) => as.building_id?._id === selectedBuilding._id && !as.archived,
      );
      tree = buildOverviewTree([selectedBuilding], spaces, assets);
    }

    // Auto-expand tree path to already linked items
    if (alreadyLinkedItems.length > 0) {
      for (const item of alreadyLinkedItems) {
        tree = expandPathToNode(tree, item.id);
      }
    }

    setOverviewNodes(tree);
  }, [
    selectedBuilding,
    filteredSpaces,
    filteredAssets,
    showAllBuildings,
    buildings,
    allSpaces,
    allAssets,
    selectedBuildingId,
    editSelectedBuildingId,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setActiveTab("spaces");
      setSelectedLink(null);
      setHasOverriddenLink(false);
      // Clear all selections in tree so reopening shows only alreadyLinked items
      setOverviewNodes((prev) => {
        const clearSelections = (nodes: TreeNode[]): TreeNode[] =>
          nodes.map((node) => ({
            ...node,
            selected: false,
            children: node.children
              ? clearSelections(node.children)
              : undefined,
          }));
        return clearSelections(prev);
      });
    }
  }, [open]);

  // Reset selection when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as "spaces" | "assets");
    setSelectedLink(null);
    // Reset all selections in tree
    const resetSelections = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => ({
        ...node,
        selected: false,
        children: node.children ? resetSelections(node.children) : undefined,
      }));
    setOverviewNodes(resetSelections(overviewNodes));
  };

  const handleOverviewToggle = (nodeId: string) => {
    const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });

    setOverviewNodes(updateNodes(overviewNodes));
  };

  const handleOverviewSelect = (nodeId: string, checked: boolean) => {
    // Single selection: deselect all others first, then select the clicked one
    let selectedNode: {
      id: string;
      name: string;
      type: "office" | "Asset";
      buildingId?: string;
    } | null = null;

    const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        const isTargetNode = node.id === nodeId;
        const newSelected = isTargetNode ? checked : false;

        if (
          isTargetNode &&
          checked &&
          (node.type === "office" || node.type === "Asset")
        ) {
          selectedNode = {
            id: node.id,
            name: node.name,
            type: node.type,
            buildingId: node.buildingId,
          };
        }

        return {
          ...node,
          selected: newSelected,
          children: node.children ? updateNodes(node.children) : undefined,
        };
      });

    setOverviewNodes(updateNodes(overviewNodes));
    setSelectedLink(checked ? selectedNode : null);
    if (checked) setHasOverriddenLink(true);
  };

  const handleApply = () => {
    if (selectedLink) {
      // Only notify parent on Apply
      onSelectLink?.(
        selectedLink.type === "office" ? "Space" : "Asset",
        selectedLink.id,
        selectedLink.name,
        selectedLink.buildingId,
      );
      onApplyLinks?.([selectedLink]);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[80vh] overflow-hidden p-0 flex flex-col">
        {isLoading ? (
          <PageLoadingSkeleton variant="tree" />
        ) : (
          <>
             <DialogHeader className="p-4 pb-2 shrink-0">
               <DialogTitle className="text-lg font-semibold flex items-center justify-between">
                 {t("board.linkTaskTo")}
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => onOpenChange(false)}
                   className="h-6 w-6 p-0"
                 >
                   <X className="w-4 h-4" />
                 </Button>
               </DialogTitle>
               <p className="text-sm text-foreground">
                 {t("board.chooseSpaceOrAssetToLink")}
               </p>
            </DialogHeader>

            {/* Search */}
            <div className="px-4 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t("board.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-2 mx-4 w-auto shrink-0">
                <TabsTrigger
                  value="spaces"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-[#2E69E8FF] "
                >
                   <DoorClosed className="w-4 h-4 mr-2" />
                   {t("board.spaces")}
                </TabsTrigger>
                <TabsTrigger
                  value="assets"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-[#2E69E8FF]"
                >
                   <Printer className="w-4 h-4 mr-2" />
                   {t("board.assets")}
                </TabsTrigger>
              </TabsList>

              {/* Spaces Tree */}
              <TabsContent
                value="spaces"
                className="mt-0 flex-1 overflow-hidden"
              >
                <div className="h-full overflow-y-auto py-4">
                  {(() => {
                    const query = searchQuery.toLowerCase().trim();

                    // Filter spaces based on search
                    const filteredNodes = overviewNodes.map((building) => ({
                      ...building,
                      children: building.children
                        ?.map((area) => ({
                          ...area,
                          children: area.children
                            ?.filter(
                              (space) =>
                                !query ||
                                space.name.toLowerCase().includes(query),
                            )
                            .map((space) => ({ ...space, children: [] })),
                        }))
                        .filter(
                          (area) => area.children && area.children.length > 0,
                        ),
                    }));

                    const hasSpaces = filteredNodes.some((b) =>
                      b.children?.some(
                        (a) => a.children && a.children.length > 0,
                      ),
                    );

                    if (!hasSpaces) {
                      return (
                        <div className="p-4 border flex flex-col items-center gap-3 rounded bg-muted/50 text-center">
                          <DoorClosed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                           <p className="text-sm text-muted-foreground">
                             {query
                               ? t("board.noSpacesMatchingSearch")
                               : t("board.noAvailableSpaces")}
                          </p>
                        </div>
                      );
                    }

                    return filteredNodes.map((node) => (
                      <OverviewTreeNode
                        key={node.id}
                        node={{
                          ...node,
                          expanded: query ? true : node.expanded,
                          children: node.children?.map((area) => ({
                            ...area,
                            expanded: query ? true : area.expanded,
                          })),
                        }}
                        onToggle={handleOverviewToggle}
                        onSelect={handleOverviewSelect}
                        selectableTypes={["office"]}
                        alreadyLinkedIds={alreadyLinkedIds}
                      />
                    ));
                  })()}
                </div>
              </TabsContent>

              {/* Assets Tree */}
              <TabsContent
                value="assets"
                className="mt-0 flex-1 overflow-hidden"
              >
                <div className="h-full overflow-y-auto py-4">
                  {(() => {
                    const query = searchQuery.toLowerCase().trim();

                    // Filter assets based on search
                    const filteredNodes = overviewNodes.map((building) => ({
                      ...building,
                      children: building.children
                        ?.map((area) => ({
                          ...area,
                          children: area.children
                            ?.map((space) => ({
                              ...space,
                              selected: false,
                              children: space.children?.filter(
                                (asset) =>
                                  !query ||
                                  asset.name.toLowerCase().includes(query),
                              ),
                            }))
                            .filter(
                              (space) =>
                                space.children && space.children.length > 0,
                            ),
                        }))
                        .filter(
                          (area) => area.children && area.children.length > 0,
                        ),
                    }));

                    const hasAssets = filteredNodes.some((b) =>
                      b.children?.some((a) =>
                        a.children?.some(
                          (s) => s.children && s.children.length > 0,
                        ),
                      ),
                    );

                    if (!hasAssets) {
                      return (
                        <div className="p-4 border flex flex-col items-center gap-3 rounded bg-muted/50 text-center">
                          <Printer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                           <p className="text-sm text-muted-foreground">
                             {query
                               ? t("board.noAssetsMatchingSearch")
                               : t("board.noAvailableAssets")}
                          </p>
                        </div>
                      );
                    }

                    return filteredNodes.map((node) => (
                      <OverviewTreeNode
                        key={node.id}
                        node={{
                          ...node,
                          expanded: query ? true : node.expanded,
                          children: node.children?.map((area) => ({
                            ...area,
                            expanded: query ? true : area.expanded,
                            children: area.children?.map((space) => ({
                              ...space,
                              expanded: query ? true : space.expanded,
                            })),
                          })),
                        }}
                        onToggle={handleOverviewToggle}
                        onSelect={handleOverviewSelect}
                        selectableTypes={["Asset"]}
                        alreadyLinkedIds={alreadyLinkedIds}
                      />
                    ));
                  })()}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center gap-3 p-4 border-t shrink-0 bg-background">
               <Button
                 variant="outline"
                 className="w-full"
                 onClick={() => onOpenChange(false)}
                 disabled={isApplying}
               >
                 {t("board.cancel")}
               </Button>
               <Button
                 onClick={handleApply}
                 className="text-white hover:bg-blue-700 w-full"
                 disabled={isApplying || !selectedLink}
               >
                 {isApplying ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                     {t("board.applying")}
                   </>
                 ) : (
                   t("board.apply")
                 )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
