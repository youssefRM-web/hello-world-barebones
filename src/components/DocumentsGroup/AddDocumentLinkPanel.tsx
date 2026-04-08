import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddDocumentLinkPanelProps {
  open: boolean;
  onClose: () => void;
  onApplyLinks: (links: { id: string; name: string; type: string }[]) => void;
  buildingId: string | null;
}

interface TreeNode {
  id: string;
  name: string;
  type: "building" | "area" | "office" | "asset";
  expanded?: boolean;
  selected?: boolean;
  children?: TreeNode[];
}

// Build tree for a specific building
const buildBuildingTree = (
  building: any,
  spaces: any[],
  assets: any[],
): TreeNode | null => {
  if (!building || building.archived) return null;

  const buildingAreas = building.areas || [];

  return {
    id: building._id,
    name: building.label,
    type: "building",
    expanded: true,
    children: buildingAreas.map((area: any) => {
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
          const spaceAssets = assets.filter(
            (asset) =>
              asset.linked_space_id?._id === space._id && !asset.archived,
          );

          return {
            id: space._id,
            name: space.name,
            type: "office",
            expanded: false,
            selected: false,
            children: spaceAssets.map((asset: any) => ({
              id: asset._id,
              name: asset.name,
              type: "asset",
              selected: false,
            })),
          };
        }),
      };
    }),
  };
};

const TreeNodeItem = ({
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

  const getIcon = () => {
    if (node.type === "building")
      return <Building className="w-4 h-4 text-muted-foreground" />;
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
        className={`flex items-center justify-between gap-2 py-2 px-3 mx-3 rounded cursor-pointer transition-colors hover:bg-accent/50 ${
          isSelected ? "bg-accent/50 font-bold" : ""
        }`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (isSelectable) {
            onSelect(node.id, !isSelected, node.type);
          } else if (hasChildren) {
            onToggle(node.id);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-between">
          <span className="text-sm truncate flex items-center gap-2 px-4 first-letter:uppercase">
            {getIcon()}
            <span className="first-letter:uppercase">{node.name}</span>
          </span>
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="p-1 shrink-0 hover:bg-accent rounded"
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

        {isSelected && <Check className="w-4 h-4 shrink-0" color="#1759E8FF" />}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <TreeNodeItem
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

export function AddDocumentLinkPanel({
  open,
  onClose,
  onApplyLinks,
  buildingId,
}: AddDocumentLinkPanelProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<
    Map<string, { id: string; name: string; type: string }>
  >(new Map());
  const [activeTab, setActiveTab] = useState<"spaces" | "assets">("spaces");

  const { buildings, spaces, assets, isLoading } = useReferenceData();

  const selectedBuilding = buildingId
    ? buildings.find((b) => b._id === buildingId)
    : null;

  useEffect(() => {
    if (open && selectedBuilding) {
      const tree = buildBuildingTree(selectedBuilding, spaces, assets);
      setTreeNodes(tree ? [tree] : []);
      setSearchQuery("");
      setSelectedLinks(new Map());
      setActiveTab("spaces");
    }
  }, [open, selectedBuilding, spaces, assets]);

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

  const filteredNodes = treeNodes
    .map((node) => filterNode(node, searchQuery))
    .filter((node): node is TreeNode => node !== null);

  const handleToggle = (nodeId: string) => {
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

    setTreeNodes(treeNodes.map(updateNode));
  };

  const handleSelect = (nodeId: string, checked: boolean, type: string) => {
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

    const nodeName = findNodeName(treeNodes, nodeId);

    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, selected: checked };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map((child) => updateNode(child)),
        };
      }
      return node;
    };

    setSelectedLinks((prev) => {
      const newMap = new Map(prev);
      if (checked) {
        newMap.set(nodeId, { id: nodeId, name: nodeName, type });
      } else {
        newMap.delete(nodeId);
      }
      return newMap;
    });

    setTreeNodes(treeNodes.map(updateNode));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "spaces" | "assets");
    setSelectedLinks(new Map());
    const resetSelections = (node: TreeNode): TreeNode => ({
      ...node,
      selected: false,
      children: node.children?.map((child) => resetSelections(child)),
    });
    setTreeNodes(treeNodes.map(resetSelections));
  };

  const handleApply = () => {
    onApplyLinks(Array.from(selectedLinks.values()));
    onClose();
  };

  // Check if there are spaces or assets
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

  // Prepare nodes for spaces tab (remove assets)
  const spacesNodes = filteredNodes.map((node) => ({
    ...node,
    children: node.children
      ?.filter((area) => area.children && area.children.length > 0)
      .map((area) => ({
        ...area,
        children: area.children?.map((space) => ({
          ...space,
          children: [],
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
            selected: false,
            children: space.children || [],
          })),
      })),
  }));

  const newSelectionsCount = selectedLinks.size;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-background rounded-lg shadow-xl max-w-lg w-full mx-4 flex flex-col max-h-[80vh] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6">
            <PageLoadingSkeleton variant="tree" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b">
              <div className="text-xl font-semibold flex items-center justify-between">
                {t("documents.linkFileTo")}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("documents.chooseSpacesOrAssets")}{" "}
                {selectedBuilding?.label || t("documents.selectedBuilding")}
              </p>
            </div>

            {/* Search Bar */}
            <div className="p-4">
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
                <TabsList className="grid w-full px-4 rounded-none grid-cols-2">
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
                <div className="flex-1 overflow-y-auto px-4 py-4 max-h-[300px]">
                  <TabsContent value="spaces" className="mt-0">
                    <div className="space-y-1">
                      {hasSpaces ? (
                        spacesNodes.map((node) => (
                          <TreeNodeItem
                            key={node.id}
                            node={node}
                            onToggle={handleToggle}
                            onSelect={handleSelect}
                            selectableTypes={["office"]}
                          />
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground italic py-8">
                          {searchQuery
                            ? t("documents.noMatchingSpaces")
                            : t("documents.noSpacesInThisBuilding")}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="assets" className="mt-0">
                    <div className="space-y-1">
                      {hasAssets ? (
                        assetsNodes.map((node) => (
                          <TreeNodeItem
                            key={node.id}
                            node={node}
                            onToggle={handleToggle}
                            onSelect={handleSelect}
                            selectableTypes={["asset"]}
                          />
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground italic py-8">
                          {searchQuery
                            ? t("documents.noMatchingAssets")
                            : t("documents.noAssetsInThisBuilding")}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Fixed Footer with Buttons */}
            <div className="flex justify-end gap-3 p-4 border-t bg-background">
              <Button variant="outline" size="lg" onClick={onClose}>
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
      </div>
    </div>
  );
}
