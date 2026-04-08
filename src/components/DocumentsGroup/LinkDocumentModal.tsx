import React, { useState, useEffect } from "react";
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
  Building,
  Printer,
  DoorClosed,
  Check,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
  LayoutGrid,
} from "lucide-react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyLinks?: (
    links: {
      id: string;
      name: string;
      type: string;
      buildingId?: string;
      buildingName?: string;
    }[],
  ) => void;
  currentLinkedIds?: string[];
  currentLinkedTypes?: string[];
  buildingId?: string | null;
  showOverviewTab?: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  type: "building" | "area" | "office" | "asset";
  expanded?: boolean;
  selected?: boolean;
  alreadyLinked?: boolean;
  children?: TreeNode[];
}

// Build tree for a specific building
const buildBuildingTree = (
  building: any,
  spaces: any[],
  assets: any[],
  currentLinkedIds: string[] = [],
): TreeNode | null => {
  if (!building || building.archived) return null;

  const buildingAreas = building.areas || [];

  return {
    id: building._id,
    name: building.label,
    type: "building",
    expanded: true,
    children: buildingAreas.map((area: any) => {
      // Filter spaces by both area_id AND building_id
      const areaSpaces = spaces.filter(
        (sp) =>
          sp.area_id === area._id &&
          sp.building_id?._id === building._id &&
          !sp.archived,
      );

      return {
        id: area._id,
        name: area.label || "Area",
        type: "area",
        expanded: false,
        children: areaSpaces.map((space: any) => {
          // Filter assets by linked_space_id
          const spaceAssets = assets.filter(
            (asset) =>
              asset.linked_space_id?._id === space._id && !asset.archived,
          );

          const isSpaceLinked = currentLinkedIds.includes(space._id);

          return {
            id: space._id,
            name: space.name,
            type: "office",
            expanded: false,
            selected: isSpaceLinked,
            alreadyLinked: isSpaceLinked,
            children: spaceAssets.map((asset: any) => {
              const isAssetLinked = currentLinkedIds.includes(asset._id);
              return {
                id: asset._id,
                name: asset.name,
                type: "asset",
                selected: isAssetLinked,
                alreadyLinked: isAssetLinked,
              };
            }),
          };
        }),
      };
    }),
  };
};

// Build tree for all buildings (overview mode)
const buildAllBuildingsTree = (
  buildings: any[],
  spaces: any[],
  assets: any[],
  currentLinkedIds: string[] = [],
): TreeNode[] => {
  return buildings
    .filter((b) => !b.archived)
    .map((building) =>
      buildBuildingTree(building, spaces, assets, currentLinkedIds),
    )
    .filter((node): node is TreeNode => node !== null);
};

const OverviewTreeNode = ({
  node,
  level = 0,
  onToggle,
  onSelect,
  selectableTypes = ["office", "asset"],
}: {
  node: TreeNode;
  level?: number;
  onToggle: (id: string) => void;
  onSelect: (id: string, checked: boolean, type: string) => void;
  selectableTypes?: ("office" | "asset")[];
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.expanded;
  const isSelectable = selectableTypes.includes(node.type as any);
  const isSelected = node.selected || false;
  const isAlreadyLinked = node.alreadyLinked || false;

  const getIcon = () => {
    if (node.type === "building")
      return <Building className="w-4 h-4 text-muted-foreground " />;
    if (node.type === "area")
      return isExpanded ? (
        <AlignHorizontalSpaceAround className="w-4 h-4 text-muted-foreground " />
      ) : (
        <AlignVerticalSpaceAround className="w-4 h-4 text-muted-foreground" />
      );
    if (node.type === "office")
      return <DoorClosed className="w-4 h-4 text-muted-foreground " />;
    return <Printer className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-2 py-2 px-3 mx-3  rounded cursor-pointer transition-colors ${
          isSelectable ? "hover:bg-accent/50" : "hover:bg-accent/50"
        } ${isSelected ? "bg-accent/50 font-bold" : ""}`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => {
          if (isSelectable) {
            onSelect(node.id, !isSelected, node.type);
          } else if (hasChildren) {
            onToggle(node.id);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-between ">
          <span
            className={`text-sm truncate flex items-center gap-2 px-4 first-letter:uppercase${
              isSelected ? "text-foreground" : "text-foreground"
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
              className="p-0 shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground " />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          {!hasChildren && node.type !== "building" && node.type !== "area" && (
            <div className="w-4 shrink-0" />
          )}
        </div>

        {isSelected && <Check className="w-4 h-4 shrink-0" color="#1759E8FF" />}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function LinkDocumentModal({
  open,
  onOpenChange,
  onApplyLinks,
  currentLinkedIds = [],
  currentLinkedTypes = [],
  buildingId,
  showOverviewTab,
}: LinkDocumentModalProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [overviewNodes, setOverviewNodes] = useState<TreeNode[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<
    Map<
      string,
      {
        id: string;
        name: string;
        type: string;
        buildingId?: string;
        buildingName?: string;
      }
    >
  >(new Map());

  const { buildings, spaces, assets, isLoading } = useReferenceData();
  const { selectedBuildingId } = useBuildingSelection();

  // Determine if we should show overview tab:
  // - If showOverviewTab is explicitly set, use that
  // - If buildingId prop is provided, hide overview (AddDocumentModal case)
  // - Otherwise show overview (DocumentDetailModal case)
  const shouldShowOverviewTab =
    showOverviewTab !== undefined ? showOverviewTab : !buildingId;

  // Determine which building to use:
  // - If buildingId prop is provided, use that (AddDocumentModal case)
  // - Otherwise use sidebar selection (DocumentDetailModal case)
  const effectiveBuildingId = buildingId || selectedBuildingId;
  const isAllBuildings = !effectiveBuildingId || effectiveBuildingId === "all";
  const selectedBuilding = isAllBuildings
    ? null
    : buildings.find((b) => b._id === effectiveBuildingId);

  // Set default tab based on whether overview is shown
  const [activeTab, setActiveTab] = useState<"overview" | "spaces" | "assets">(
    shouldShowOverviewTab ? "overview" : "spaces",
  );

  useEffect(() => {
    if (isAllBuildings) {
      // Show all buildings
      const trees = buildAllBuildingsTree(
        buildings,
        spaces,
        assets,
        currentLinkedIds,
      );
      setOverviewNodes(trees);
    } else if (selectedBuilding) {
      // Show single building
      const tree = buildBuildingTree(
        selectedBuilding,
        spaces,
        assets,
        currentLinkedIds,
      );
      setOverviewNodes(tree ? [tree] : []);
    } else {
      setOverviewNodes([]);
    }
  }, [
    isAllBuildings,
    selectedBuilding,
    buildings,
    spaces,
    assets,
    currentLinkedIds,
  ]);

  // Filter tree based on search query
  const filterNode = (
    node: TreeNode | null,
    query: string,
  ): TreeNode | null => {
    if (!node || !query) return node;

    const lowerQuery = query.toLowerCase();

    const filterChildren = (children: TreeNode[] | undefined): TreeNode[] => {
      if (!children) return [];

      return children
        .map((child) => {
          const matchesName = child.name.toLowerCase().includes(lowerQuery);
          const filteredChildren = filterChildren(child.children);

          if (matchesName || filteredChildren.length > 0) {
            return {
              ...child,
              children:
                filteredChildren.length > 0 ? filteredChildren : child.children,
              expanded: filteredChildren.length > 0 ? true : child.expanded,
            };
          }
          return null;
        })
        .filter((child) => child !== null) as TreeNode[];
    };

    const matchesName = node.name.toLowerCase().includes(lowerQuery);
    const filteredChildren = filterChildren(node.children);

    if (matchesName || filteredChildren.length > 0) {
      return {
        ...node,
        children:
          filteredChildren.length > 0 ? filteredChildren : node.children,
        expanded: filteredChildren.length > 0 ? true : node.expanded,
      };
    }

    return null;
  };

  const filteredNodes = overviewNodes
    .map((node) => filterNode(node, searchQuery))
    .filter((node): node is TreeNode => node !== null);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (open) {
      // Reset to appropriate default tab when opening
      setActiveTab(shouldShowOverviewTab ? "overview" : "spaces");
      setSearchQuery("");
      setSelectedLinks(new Map());
    }
  }, [open, shouldShowOverviewTab]);

  // Reset modal state when closed
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedLinks(new Map());
      // Reset tree to initial state
      if (isAllBuildings) {
        const trees = buildAllBuildingsTree(
          buildings,
          spaces,
          assets,
          currentLinkedIds,
        );
        setOverviewNodes(trees);
      } else if (selectedBuilding) {
        const tree = buildBuildingTree(
          selectedBuilding,
          spaces,
          assets,
          currentLinkedIds,
        );
        setOverviewNodes(tree ? [tree] : []);
      }
    }
  }, [
    open,
    isAllBuildings,
    selectedBuilding,
    buildings,
    spaces,
    assets,
    currentLinkedIds,
  ]);

  // Reset selection when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as "overview" | "spaces" | "assets");
    setSelectedLinks(new Map());
    // Reset all selections in tree (but keep alreadyLinked state)
    const resetSelections = (node: TreeNode): TreeNode => {
      return {
        ...node,
        selected: node.alreadyLinked || false,
        children: node.children?.map((child) => resetSelections(child)),
      };
    };
    setOverviewNodes(overviewNodes.map(resetSelections));
  };

  const handleOverviewToggle = (nodeId: string) => {
    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map((child) => updateNode(child)),
        };
      }
      return node;
    };

    setOverviewNodes(overviewNodes.map(updateNode));
  };

  const handleOverviewSelect = (
    nodeId: string,
    checked: boolean,
    type: string,
  ) => {
    // Find the building that contains this node
    const findBuildingForNode = (
      nodes: TreeNode[],
      targetId: string,
    ): TreeNode | null => {
      for (const node of nodes) {
        if (node.type === "building") {
          const findInChildren = (
            children: TreeNode[] | undefined,
          ): boolean => {
            if (!children) return false;
            for (const child of children) {
              if (child.id === targetId) return true;
              if (findInChildren(child.children)) return true;
            }
            return false;
          };
          if (node.id === targetId || findInChildren(node.children)) {
            return node;
          }
        }
      }
      return null;
    };

    const parentBuilding = findBuildingForNode(overviewNodes, nodeId);

    // Find node name
    const findNodeName = (nodes: TreeNode[], targetId: string): string => {
      for (const node of nodes) {
        if (node.id === targetId) return node.name;
        if (node.children) {
          const found = findNodeName(node.children, targetId);
          if (found) return found;
        }
      }
      return "";
    };

    const nodeName = findNodeName(overviewNodes, nodeId);

    // Multi-selection: toggle the clicked node
    const updateNode = (node: TreeNode): TreeNode => {
      const isTargetNode = node.id === nodeId;

      if (isTargetNode) {
        return {
          ...node,
          selected: checked,
          children: node.children?.map((child) => updateNode(child)),
        };
      }

      return {
        ...node,
        children: node.children?.map((child) => updateNode(child)),
      };
    };

    // Update selected links map
    setSelectedLinks((prev) => {
      const newMap = new Map(prev);
      if (checked) {
        newMap.set(nodeId, {
          id: nodeId,
          name: nodeName,
          type,
          buildingId: parentBuilding?.id,
          buildingName: parentBuilding?.name,
        });
      } else {
        newMap.delete(nodeId);
      }
      return newMap;
    });

    setOverviewNodes(overviewNodes.map(updateNode));
  };

  const handleApply = () => {
    if (onApplyLinks) {
      // Filter out already linked items, only return newly selected ones
      const newLinks = Array.from(selectedLinks.values()).filter(
        (link) => !currentLinkedIds.includes(link.id),
      );
      onApplyLinks(newLinks);
    }
    onOpenChange(false);
  };

  // Count new selections (excluding already linked)
  const newSelectionsCount = Array.from(selectedLinks.values()).filter(
    (link) => !currentLinkedIds.includes(link.id),
  ).length;

  // Check if there are spaces or assets available across all nodes
  const hasSpaces = filteredNodes.some((node) =>
    node.children?.some((area) =>
      area.children?.some((space) => space.type === "office"),
    ),
  );
  const hasAssets = filteredNodes.some((node) =>
    node.children?.some((area) =>
      area.children?.some((space) =>
        space.children?.some((asset) => asset.type === "asset"),
      ),
    ),
  );

  // Prepare nodes for overview tab (show both spaces and assets)
  const overviewTabNodes = filteredNodes;

  // Prepare nodes for spaces tab (remove assets from children)
  const spacesNodes = filteredNodes.map((node) => ({
    ...node,
    children: node.children
      ?.filter((area) => area.children && area.children.length > 0)
      .map((area) => ({
        ...area,
        children: area.children?.map((space) => ({
          ...space,
          children: [], // no assets in spaces tab
        })),
      })),
  }));

  // Prepare nodes for assets tab (only show spaces with assets)
  const assetsNodes = filteredNodes.map((node) => ({
    ...node,
    children: node.children
      ?.filter((area) =>
        area.children?.some(
          (space) => space.children && space.children.length > 0,
        ),
      )
      .map((area) => ({
        ...area,
        children: area.children
          ?.filter((space) => space.children && space.children.length > 0)
          .map((space) => ({
            ...space,
            selected: false, // spaces not selectable in assets tab
            children: space.children || [],
          })),
      })),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col p-0 gap-0">
        {isLoading ? (
          <PageLoadingSkeleton variant="tree" />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-xl font-semibold flex items-center justify-between">
                {t("documents.linkFileTo")}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isAllBuildings
                  ? t("documents.chooseFromAnyBuilding")
                  : `${t("documents.chooseSpacesOrAssets")} ${selectedBuilding?.label || t("documents.selectedBuilding")}`}
              </p>
            </DialogHeader>

            {/* Search Bar */}
            <div className="p-4 ">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("documents.searchSpacesAssets")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs + Scrollable Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="h-full flex flex-col"
              >
                <TabsList
                  className={`grid w-full px-4 rounded-none ${shouldShowOverviewTab ? "grid-cols-3" : "grid-cols-2"}`}
                >
                  {shouldShowOverviewTab && (
                    <TabsTrigger value="overview">
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      {t("documents.overview2")}
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="spaces">
                    <DoorClosed className="w-4 h-4 mr-2" />
                    {t("documents.spacesTab")}
                  </TabsTrigger>
                  <TabsTrigger value="assets">
                    <Printer className="w-4 h-4 mr-2" />
                    {t("documents.assetsTab")}
                  </TabsTrigger>
                </TabsList>

                {/* Scrollable Tab Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 max-h-[400px]">
                  {shouldShowOverviewTab && (
                    <TabsContent value="overview" className="mt-0">
                      <div className="space-y-1">
                        {overviewTabNodes.length > 0 ? (
                          overviewTabNodes.map((node) => (
                            <OverviewTreeNode
                              key={node.id}
                              node={node}
                              onToggle={handleOverviewToggle}
                              onSelect={handleOverviewSelect}
                              selectableTypes={["office", "asset"]}
                            />
                          ))
                        ) : (
                          <p className="text-center text-sm text-muted-foreground italic py-8">
                            {searchQuery
                              ? t("documents.noMatchingItems")
                              : isAllBuildings
                                ? t("documents.noBuildingsFound")
                                : t("documents.noItemsInBuilding")}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="spaces" className="mt-0">
                    <div className="space-y-1 ">
                      {hasSpaces ? (
                        spacesNodes.map((node) => (
                          <OverviewTreeNode
                            key={node.id}
                            node={node}
                            onToggle={handleOverviewToggle}
                            onSelect={handleOverviewSelect}
                            selectableTypes={["office"]}
                          />
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground italic py-8">
                          {searchQuery
                            ? t("documents.noMatchingSpaces")
                            : isAllBuildings
                              ? t("documents.noSpacesFound")
                              : t("documents.noSpacesInBuilding")}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="assets" className="mt-0">
                    <div className="space-y-1">
                      {hasAssets ? (
                        assetsNodes.map((node) => (
                          <OverviewTreeNode
                            key={node.id}
                            node={node}
                            onToggle={handleOverviewToggle}
                            onSelect={handleOverviewSelect}
                            selectableTypes={["asset"]}
                          />
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground italic py-8">
                          {searchQuery
                            ? t("documents.noMatchingAssets")
                            : isAllBuildings
                              ? t("documents.noAssetsFound")
                              : t("documents.noAssetsInBuilding")}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Fixed Footer with Buttons */}
            <div className="flex justify-end gap-3 p-4 border-t bg-background">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
              >
                {t("documents.cancel")}
              </Button>
              <Button
                size="lg"
                onClick={handleApply}
                className="min-w-24"
                disabled={newSelectionsCount === 0}
              >
                {t("documents.apply")}{" "}
                {newSelectionsCount > 0 ? `(${newSelectionsCount})` : "(0)"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
