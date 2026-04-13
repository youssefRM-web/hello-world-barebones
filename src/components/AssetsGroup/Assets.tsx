import React, { useState, useMemo } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { useGroupsQuery } from "@/hooks/queries/useGroupsQuery";
import GroupsTable from "./GroupsTable";
import CreateAssetModal from "./CreateAssetModal";
import CreateAssetGroupModal from "./CreateAssetGroupModal";
import AssetsTable from "./AssetsTable";
import ArchivedAssetsTable from "./ArchivedAssetsTable";
import ImportAssetsModal from "./ImportAssetsModal";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useOnboardingHighlight } from "@/hooks/useOnboardingHighlight";
import { useOnboarding } from "@/contexts/OnboardingContext";

const Assets = () => {
  const { t } = useLanguage();
  const { buildings, spaces, categories, isLoading } = useReferenceData();
  const { hasPermission } = usePermissions();
  const { activeGuide, completeStep } = useOnboarding();
  useOnboardingHighlight('create-asset');
  const { selectedBuildingId } = useBuildingSelection();
  const { data: groups = [] } = useGroupsQuery();

  const [activeView, setActiveView] = useState("assets");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedSpace, setSelectedSpace] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Get available buildings based on sidebar selection
  const availableBuildings = useMemo(() => {
    if (selectedBuildingId) {
      return buildings.filter((b) => b._id === selectedBuildingId);
    }
    return buildings;
  }, [buildings, selectedBuildingId]);

  const availableAreas = useMemo(() => {
    const targetBuildingId =
      selectedBuilding !== "all" ? selectedBuilding : selectedBuildingId;

    if (targetBuildingId) {
      const building = buildings.find((b) => b._id === targetBuildingId);
      return building?.areas || [];
    }

    return buildings.flatMap((b) => b.areas || []);
  }, [buildings, selectedBuilding, selectedBuildingId]);

  const availableSpaces = useMemo(() => {
    let filteredSpaces = spaces;

    if (selectedBuildingId) {
      filteredSpaces = filteredSpaces.filter((s) => {
        const spaceBuildingId =
          typeof s.building_id === "string"
            ? s.building_id
            : s.building_id?._id;
        return spaceBuildingId === selectedBuildingId;
      });
    }

    if (selectedBuilding !== "all") {
      filteredSpaces = filteredSpaces.filter((s) => {
        const spaceBuildingId =
          typeof s.building_id === "string"
            ? s.building_id
            : s.building_id?._id;
        return spaceBuildingId === selectedBuilding;
      });
    }

    if (selectedArea !== "all") {
      filteredSpaces = filteredSpaces.filter(
        (s) => s.area?._id === selectedArea,
      );
    }

    return filteredSpaces;
  }, [spaces, selectedBuildingId, selectedBuilding, selectedArea]);

  const availableGroups = useMemo(() => {
    const assetGroups = groups.filter((g) => g.belongTo === "assets");

    const targetBuildingId =
      selectedBuilding !== "all" ? selectedBuilding : selectedBuildingId;

    if (targetBuildingId) {
      return assetGroups.filter((group) => {
        if (!group.assets || group.assets.length === 0) return false;
        return group.assets.some((asset: any) => {
          const assetBuildingId =
            typeof asset.building_id === "string"
              ? asset.building_id
              : asset.building_id?._id;
          return assetBuildingId === targetBuildingId;
        });
      });
    }

    return assetGroups;
  }, [groups, selectedBuilding, selectedBuildingId]);

  const handleBuildingChange = (value: string) => {
    setSelectedBuilding(value);
    setSelectedArea("all");
    setSelectedSpace("all");
    setSelectedGroup("all");
  };

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    setSelectedSpace("all");
  };

  const filters = useMemo(
    () => ({
      category: selectedCategory,
      building: selectedBuilding,
      area: selectedArea,
      space: selectedSpace,
      group: selectedGroup,
    }),
    [
      selectedCategory,
      selectedBuilding,
      selectedArea,
      selectedSpace,
      selectedGroup,
    ],
  );

  if (isLoading) {
    return (
      <div className="rounded-lg p-4 lg:p-6 w-full">
        <PageLoadingSkeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="rounded-lg w-full flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 pb-0 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            {t("assets.title")}
          </h1>

          {hasPermission("assets", "createAssets") && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-sm"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:flex">Import</span>
              </Button>
              <Button
                size="lg"
                onClick={() =>
                  activeView == "groups"
                    ? setIsCreateGroupModalOpen(true)
                    : setIsCreateModalOpen(true)
                }
                className="flex items-center gap-1"
                data-onboarding-target="create-asset"
              >
                <Plus className="h-4 w-4" />
                {t("common.create")}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Dropdown */}
        <div className="block sm:hidden">
          <Select value={activeView} onValueChange={setActiveView}>
            <SelectTrigger className="w-full relative">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>
                    {activeView === "assets"
                      ? t("assets.allAssets")
                      : activeView === "archived"
                        ? t("assets.archivedAssets")
                        : t("assets.groups")}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assets">
                <div className="flex items-center gap-2">
                  <span>{t("assets.allAssets")}</span>
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center gap-2">
                  <span>{t("assets.archivedAssets")}</span>
                </div>
              </SelectItem>
              <SelectItem value="groups">
                <div className="flex items-center gap-2">
                  <span>{t("assets.groups")}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex r justify-between flex-wrap">
          <div className="hidden sm:flex h-10  items-center justify-center gap-2 lg:gap-6 rounded-md text-muted-foreground w-fit">
            <span
              className={`cursor-pointer text-sm sm:text-sm ${
                activeView === "assets"
                  ? "flex items-center gap-2 px-3 py-2 rounded-lg text-sm  transition-colors whitespace-nowrap px-3 py-2 bg-primary/10 text-[#2E69E8FF] font-medium shadow-sm"
                  : "flex items-center gap-2 font-medium px-3 py-2 hover:bg-accent/50 rounded-lg text-sm font-medium transition-colors whitespace-nowrap px-3 py-2 font-medium text-gray-600 hover:text-foreground "
              }`}
              onClick={() => setActiveView("assets")}
            >
              {t("assets.allAssets")}
            </span>
            <span
              className={`cursor-pointer text-sm sm:text-sm ${
                activeView === "archived"
                  ? "flex items-center gap-2 px-3 py-2 rounded-lg text-sm  transition-colors whitespace-nowrap px-3 py-2 bg-primary/10 text-[#2E69E8FF] font-medium shadow-sm"
                  : "flex items-center gap-2 font-medium px-3 py-2 hover:bg-accent/50 rounded-lg text-sm font-medium transition-colors whitespace-nowrap px-3 py-2 font-medium text-gray-600 hover:text-foreground "
              }`}
              onClick={() => setActiveView("archived")}
            >
              {t("assets.archivedAssets")}
            </span>
            <span
              className={`cursor-pointer text-sm sm:text-sm ${
                activeView === "groups"
                  ? "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap px-3 py-2 bg-primary/10 text-[#2E69E8FF] font-medium shadow-sm"
                  : "flex items-center gap-2 font-medium px-3 py-2 hover:bg-accent/50 rounded-lg text-sm font-medium transition-colors whitespace-nowrap px-3 py-2 font-medium text-gray-600 hover:text-foreground  "
              }`}
              onClick={() => setActiveView("groups")}
            >
              {t("assets.groups")}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="my-6 space-y-4 sm:space-y-0 mb-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("assets.searchAssets")}
                className="pl-10 w-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full sm:w-auto sm:flex sm:gap-5">
              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("assets.category")} />
                </SelectTrigger>

                <SelectContent className="min-w-[180px]">
                  <SelectItem value="all">
                    {t("assets.allCategories")}
                  </SelectItem>
                  {categories.length > 0 && <SelectSeparator />}
                  {categories.length > 0 &&
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Group Filter */}
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("assets.group")} />
                </SelectTrigger>

                <SelectContent className="min-w-[180px]">
                  <SelectItem value="all">{t("assets.allGroups")}</SelectItem>
                  {availableGroups.length > 0 && <SelectSeparator />}
                  {availableGroups.length > 0 &&
                    availableGroups.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Building Filter */}
              <Select
                value={selectedBuilding}
                onValueChange={handleBuildingChange}
              >
                <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("assets.building")} />
                </SelectTrigger>

                <SelectContent className="min-w-[180px]">
                  <SelectItem value="all">
                    {t("assets.allBuildings")}
                  </SelectItem>
                  {availableBuildings.length > 0 && <SelectSeparator />}
                  {availableBuildings.length > 0 &&
                    availableBuildings.map((building) => (
                      <SelectItem key={building._id} value={building._id}>
                        {building.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Area Filter */}
              <Select value={selectedArea} onValueChange={handleAreaChange}>
                <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("assets.allAreas")} />
                </SelectTrigger>

                <SelectContent className="min-w-[180px]">
                  <SelectItem value="all">{t("assets.allAreas")}</SelectItem>
                  {availableAreas.length > 0 && <SelectSeparator />}
                  {availableAreas.length > 0 &&
                    availableAreas.map((area) => (
                      <SelectItem key={area._id} value={area._id}>
                        {area.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Space Filter */}
              <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("assets.allSpaces")} />
                </SelectTrigger>

                <SelectContent className="min-w-[180px]">
                  <SelectItem value="all">{t("assets.allSpaces")}</SelectItem>
                  {availableSpaces.length > 0 && <SelectSeparator />}
                  {availableSpaces.length > 0 &&
                    availableSpaces.map((space) => (
                      <SelectItem key={space._id} value={space._id}>
                        {space.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
        {activeView === "assets" ? (
          <AssetsTable
            assets={[]}
            archived={false}
            searchTerm={searchTerm}
            filters={filters}
          />
        ) : activeView === "archived" ? (
          <ArchivedAssetsTable
            assets={[]}
            archived={true}
            searchTerm={searchTerm}
            filters={filters}
          />
        ) : (
          <GroupsTable searchTerm={searchTerm} filters={filters} />
        )}
      </div>

      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CreateAssetGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />

      <ImportAssetsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default Assets;
