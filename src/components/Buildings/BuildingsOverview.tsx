import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  ArchiveRestore,
  MapPin,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Building,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesTab } from "./CategoriesTab";
import { AddBuildingModal } from "./AddBuildingModal";
import { DeleteBuildingModal } from "./DeleteBuildingModal";
import { ArchiveBuildingModal } from "./ArchiveBuildingModal";
import { RestoreBuildingModal } from "./RestoreBuildingModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useBuildingsQuery, usePaginatedBuildingsQuery, useOrganizationQuery, usePlansQuery } from "@/hooks/queries";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useTutorial } from "@/contexts/TutorialContext";
import { TutorialHighlight, TutorialPopup } from "@/components/Tutorial";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/contexts/PermissionsContext";

export function BuildingsOverview() {
  const { t } = useLanguage();
  const { executeRequest } = useApi();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const { hasPermission, isAdmin } = usePermissions();
  
  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const pageSize = 8;

  // Persist tab state in URL
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
    if (tab === "overview") setActivePage(1);
    if (tab === "archived") setArchivedPage(1);
  };

  const { refreshData } = useReferenceData();
  const { refetch: refetchBuildings } = useBuildingsQuery();
  const { isActive: isTutorialActive, currentStep, nextStep } = useTutorial();
  
  const { organization } = useOrganizationQuery();
  const { data: plans = [] } = usePlansQuery();

  const {
    data: activeBuildingsData,
    isLoading: activeLoading,
    refetch: refetchActiveBuildings,
  } = usePaginatedBuildingsQuery({
    page: activePage,
    limit: pageSize,
    archived: false,
  });

  const {
    data: archivedBuildingsData,
    isLoading: archivedLoading,
    refetch: refetchArchivedBuildings,
  } = usePaginatedBuildingsQuery({
    page: archivedPage,
    limit: pageSize,
    archived: true,
  });

  const activeBuildings = activeBuildingsData?.data || [];
  const activePagination = activeBuildingsData?.pagination;
  const archivedBuildings = archivedBuildingsData?.data || [];
  const archivedPagination = archivedBuildingsData?.pagination;

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    buildingId: string;
    buildingName: string;
  }>({
    isOpen: false,
    buildingId: "",
    buildingName: "",
  });

  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    buildingId: string;
    buildingName: string;
  }>({
    isOpen: false,
    buildingId: "",
    buildingName: "",
  });

  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    buildingId: string;
    buildingName: string;
  }>({
    isOpen: false,
    buildingId: "",
    buildingName: "",
  });

  const handleDeleteClick = (buildingId: string, buildingName: string) => {
    setDeleteModal({ isOpen: true, buildingId, buildingName });
  };

  const handleArchiveClick = (buildingId: string, buildingName: string) => {
    setArchiveModal({ isOpen: true, buildingId, buildingName });
  };

  const handleRestoreClick = (buildingId: string, buildingName: string) => {
    setRestoreModal({ isOpen: true, buildingId, buildingName });
  };

  const handleDuplicateBuilding = async (buildingId: string) => {
    const allBuildings = [...activeBuildings, ...archivedBuildings];
    const building = allBuildings.find((b) => b._id === buildingId);
    if (!building) return;

    const duplicatedAreas = (building.areas || []).map((area: any) => area.label);

    const duplicateData = {
      ...building,
      label: `${building.label} (Copy)`,
      _id: undefined,
      areas: duplicatedAreas,
    };

    await executeRequest(() =>
      apiService.post(endpoints.buildings, duplicateData),
    );
    toast({
      title: t("pages.building"),
      description: t("buildings.duplicatedSuccess"),
      variant: "success",
    });
    
    await refreshData();
    await queryClient.invalidateQueries({ queryKey: ["buildings"] });
    await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });
    await queryClient.invalidateQueries({ queryKey: ["orgBuildings"] });
    refetchActiveBuildings();
  };

  const isLoading = activeTab === "overview" ? activeLoading : archivedLoading;

  const currentPlan = plans.find((p) => p._id === organization?.currentPlan);
  const activeCount = activeBuildings.length;
  const isBuildingLimitExceeded = currentPlan?.maxBuildings ? activeCount >= currentPlan.maxBuildings : false;

  if (
    isLoading &&
    activeBuildings.length === 0 &&
    archivedBuildings.length === 0
  ) {
    return (
      <div className="mx-auto p-4 lg:p-6">
        <PageLoadingSkeleton variant="grid" />
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Building2 className="h-6 w-6" />
          {t("pages.building")}
        </div>
        {activeTab === "overview" && (
          <div className="relative">
            <TutorialHighlight
              isHighlighted={isTutorialActive && currentStep === "add-building"}
            >
              <div className="flex flex-col gap-2 items-end">
                <Button
                  size="lg"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1"
                  disabled={isBuildingLimitExceeded}
                >
                  <Plus className="h-4 w-4" />
                  {t("buildings.addBuilding")}
                </Button>
                
                {isBuildingLimitExceeded && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {t("buildings.noBuildingsRemaining")}
                  </p>
                )}
              </div>

              {isTutorialActive && currentStep === "add-building" && (
                <TutorialPopup
                  title={t("tutorial.addBuildingTitle")}
                  description={t("tutorial.addBuildingDesc")}
                  position="bottom"
                  buttonText={t("tutorial.gotIt")}
                  showSkip={false}
                />
              )}
            </TutorialHighlight>
          </div>
        )}

        {activeTab === "categories" && (isAdmin || hasPermission("buildings", "manageCategories")) && (
          <Button
            size="lg"
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            {t("buildings.addCategory")}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6 gap-2 lg:gap-6 relative">
          <div className="relative">
            <TutorialHighlight
              isHighlighted={isTutorialActive && currentStep === "overview-tab"}
            >
              <TabsTrigger value="overview">
                {t("dashboard.overview")}
              </TabsTrigger>

              {isTutorialActive && currentStep === "overview-tab" && (
                <TutorialPopup
                  title={t("tutorial.overviewTabTitle")}
                  description={t("tutorial.overviewTabDesc")}
                  position="bottom"
                />
              )}
            </TutorialHighlight>
          </div>

          <div className="relative">
            <TutorialHighlight
              isHighlighted={isTutorialActive && currentStep === "archived-tab"}
            >
              <TabsTrigger value="archived">{t("buildings.archived")}</TabsTrigger>

              {isTutorialActive && currentStep === "archived-tab" && (
                <TutorialPopup
                  title={t("tutorial.archivedTabTitle")}
                  description={t("tutorial.archivedTabDesc")}
                  position="bottom"
                />
              )}
            </TutorialHighlight>
          </div>

          <div className="relative">
            <TutorialHighlight
              isHighlighted={
                isTutorialActive && currentStep === "categories-tab"
              }
            >
              <TabsTrigger value="categories">
                {t("buildings.categories")}
              </TabsTrigger>

              {isTutorialActive && currentStep === "categories-tab" && (
                <TutorialPopup
                  title={t("tutorial.categoriesTabTitle")}
                  description={t("tutorial.categoriesTabDesc")}
                  position="bottom"
                />
              )}
            </TutorialHighlight>
          </div>
        </TabsList>

        <TabsContent value="overview">
          {activeBuildings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {activeBuildings.map((building) => (
                <div
                  key={building._id}
                  className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() =>
                    navigate(`/dashboard/building/${building._id}`)
                  }
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
                    {building.photo && !imgError ? (
                      <img
                        src={building.photo}
                        alt={building.label}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 bg-[#0F4C7BFF] rounded-md flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {building.label?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold first-letter:uppercase text-lg text-gray-900 dark:text-white truncate">
                          {building.label}
                        </h3>
                        <p className="text-sm text-gray-500 first-letter:uppercase dark:text-gray-400 mt-1">
                          {building?.organization_id?.name || t("buildings.noOrganization")}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBuilding(building._id);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            {t("buildings.duplicate")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-orange-600 dark:text-orange-400 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveClick(building._id, building.label);
                            }}
                          >
                            <ArchiveRestore className="h-4 w-4" />
                            {t("buildings.archiveBuilding")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {building.address && (
                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="space-y-0.5">
                          <p className="font-medium first-letter:uppercase">
                            {building.address}
                          </p>
                          {building.city && (
                            <p className="text-gray-500 dark:text-gray-400 first-letter:uppercase">
                              {building.city}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="font-medium">
                          {building?.areas?.length || 0} {t("buildings.areas_count")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-lg text-muted-foreground">
                {t("buildings.noBuildingsFound")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("buildings.createFirstBuilding")}
              </p>
            </div>
          )}

          {activePagination && activePagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                disabled={!activePagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("buildings.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("buildings.page")} {activePagination.page} {t("buildings.of")} {activePagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePage((prev) => prev + 1)}
                disabled={!activePagination.hasNext}
              >
                {t("buildings.next")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived">
          {archivedBuildings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {archivedBuildings.map((building) => (
                <div
                  key={building._id}
                  className="group relative bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-sm"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 rounded-full border border-gray-300/50 dark:border-gray-600/50 backdrop-blur">
                      {t("buildings.archived")}
                    </span>
                  </div>

                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 grayscale opacity-80">
                    {building.photo && !imgError ? (
                      <img
                        src={building.photo}
                        alt={building.label}
                        className="w-full h-full object-cover grayscale"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                          {building.label?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold first-letter:uppercase text-lg text-gray-700 dark:text-gray-300 truncate">
                          {building.label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {building?.organization_id?.name || t("buildings.noOrganization")}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-green-600 dark:text-green-400 cursor-pointer font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(building._id, building.label);
                            }}
                          >
                            <ArchiveRestore className="h-4 w-4" />
                            {t("buildings.restoreBuilding")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {building.address && (
                      <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-medium">{building.address}</p>
                          {building.city && <p>{building.city}</p>}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <LayoutGrid className="h-4 w-4" />
                        <span>{building?.areas?.length || 0} {t("buildings.areas_count")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <Archive className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-lg text-muted-foreground">
                {t("buildings.noArchivedBuildings")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("buildings.archivedBuildingsHint")}
              </p>
            </div>
          )}

          {archivedPagination && archivedPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchivedPage((prev) => Math.max(1, prev - 1))}
                disabled={!archivedPagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("buildings.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("buildings.page")} {archivedPagination.page} {t("buildings.of")}{" "}
                {archivedPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchivedPage((prev) => prev + 1)}
                disabled={!archivedPagination.hasNext}
              >
                {t("buildings.next")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab
            isAddCategoryModalOpen={isAddCategoryModalOpen}
            setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
          />
        </TabsContent>
      </Tabs>

      <AddBuildingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeleteBuildingModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, buildingId: "", buildingName: "" })
        }
        buildingId={deleteModal.buildingId}
        buildingName={deleteModal.buildingName}
      />

      <ArchiveBuildingModal
        isOpen={archiveModal.isOpen}
        onClose={() =>
          setArchiveModal({ isOpen: false, buildingId: "", buildingName: "" })
        }
        buildingId={archiveModal.buildingId}
        buildingName={archiveModal.buildingName}
        onSuccess={() => {
          refreshData();
          refetchBuildings();
          refetchActiveBuildings();
          refetchArchivedBuildings();
        }}
      />

      <RestoreBuildingModal
        isOpen={restoreModal.isOpen}
        onClose={() =>
          setRestoreModal({ isOpen: false, buildingId: "", buildingName: "" })
        }
        buildingId={restoreModal.buildingId}
        buildingName={restoreModal.buildingName}
        onSuccess={() => {
          refreshData();
          refetchBuildings();
          refetchActiveBuildings();
          refetchArchivedBuildings();
        }}
      />
    </div>
  );
}
