import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/contexts/PermissionsContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Building,
  Upload,
  DoorClosed,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import CreateSpaceModal from "@/components/SpaceModals/CreateSpaceModal";
import SpaceDetailsModal from "@/components/SpaceModals/SpaceDetailsModal";
import DeleteSpaceModal from "@/components/SpaceModals/DeleteSpaceModal";
import RestoreSpaceModal from "@/components/SpaceModals/RestoreSpaceModal";
import LinkedItemModal from "@/components/SpaceModals/LinkedItemModal";
import { CreateSpaceGroupModal } from "@/components/SpaceModals/CreateSpaceGroupModal";
import { useBuildingData } from "@/hooks/useBuildingData";
import SpaceGroupsTable from "@/components/SpaceModals/SpaceGroupsTable";
import { useQueryClient } from "@tanstack/react-query";
import ImportSpacesModal from "@/components/SpaceModals/ImportSpacesModal";
import { useBuildingsQuery } from "@/hooks/queries/useBuildingsQuery";

const Spaces = () => {
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSpaceDetailsOpen, setIsSpaceDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isLinkedItemModalOpen, setIsLinkedItemModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [linkedItemType, setLinkedItemType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All spaces");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");

  const { filteredSpaces } = useBuildingData();
  const { affectedBuildings } = useBuildingsQuery();
  const queryClient = useQueryClient();

  // Get floors/areas for the selected building
  const availableFloors = useMemo(() => {
    if (selectedBuildingId === "all") {
      const allAreas: any[] = [];
      affectedBuildings.forEach((building: any) => {
        if (building.areas) {
          building.areas.forEach((area: any) => {
            if (!allAreas.find((a) => a._id === area._id)) {
              allAreas.push(area);
            }
          });
        }
      });
      return allAreas;
    }
    const selectedBuilding = affectedBuildings.find(
      (b: any) => b._id === selectedBuildingId,
    );
    return selectedBuilding?.areas || [];
  }, [selectedBuildingId, affectedBuildings]);

  // Reset floor when building changes
  React.useEffect(() => {
    setSelectedFloor("all");
  }, [selectedBuildingId]);

  // Filter spaces based on search term and filters
  const searchFilteredSpaces = useMemo(() => {
    return filteredSpaces.filter((space) => {
      const matchesSearch = space.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesBuilding =
        selectedBuildingId === "all" ||
        space.building_id?._id === selectedBuildingId;
      const matchesFloor =
        selectedFloor === "all" || space.area?._id === selectedFloor;
      return matchesSearch && matchesBuilding && matchesFloor;
    });
  }, [filteredSpaces, searchTerm, selectedBuildingId, selectedFloor]);

  const handleSpaceClick = (space: any) => {
    setSelectedSpace(space);
    setIsSpaceDetailsOpen(true);
  };
  const handleDeleteSpace = () => {
    setIsSpaceDetailsOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    setIsSpaceDetailsOpen(true);
    setSelectedSpace(null);
  };

  const handleLinkedItemClick = (type: string) => {
    setLinkedItemType(type);
    setIsSpaceDetailsOpen(false);
    setIsLinkedItemModalOpen(true);
  };

  const handleLinkedItemBack = () => {
    setIsLinkedItemModalOpen(false);
    setIsSpaceDetailsOpen(true);
  };

  const handleCreateSpace = (spaceData: any) => {
    // Space creation will refresh data automatically in CreateSpaceModal
  };

  const handleCreateClick = () => {
    if (activeTab === "Groups") {
      setIsCreateGroupModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleRestoreClick = (space: any) => {
    setSelectedSpace(space);
    setIsRestoreModalOpen(true);
  };

  // Tab labels mapped for display
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "All spaces": return t("spaces.allSpaces");
      case "Archived spaces": return t("spaces.archivedSpaces");
      case "Groups": return t("spaces.groups");
      default: return tab;
    }
  };

  const tabs = [
    { name: "All spaces" },
    { name: "Archived spaces" },
    { name: "Groups" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 pb-0">
        {/* Header */}
        <div className="flex lg:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
            {t("spaces.title")}
          </h1>
          <div className="flex xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-sm"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:flex">{t("spaces.import")}</span>
            </Button>
            {hasPermission("spaces", "createSpaces") && (
              <Button
                size="lg"
                onClick={handleCreateClick}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("common.create")}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="block sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full relative">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{getTabLabel(activeTab)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab.name} value={tab.name}>
                  <div className="flex items-center gap-2">
                    <span>{getTabLabel(tab.name)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-6 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.name
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {getTabLabel(tab.name)}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 sm:space-y-0 ">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("spaces.searchSpaces")}
                className="pl-10 w-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto sm:flex sm:gap-5">
              <Select
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              >
                <SelectTrigger className="w-full sm:w-36 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("spaces.building")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("spaces.allBuildings")}</SelectItem>
                  {affectedBuildings.map((building: any) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.label || building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger className="w-full sm:w-36 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder={t("spaces.area")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("spaces.allAreas")}</SelectItem>
                  {availableFloors.map((floor: any) => (
                    <SelectItem key={floor._id} value={floor._id}>
                      {floor.label || floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
        {activeTab === "All spaces" && (
          <div className="bg-card rounded-lg border border-border/50 shadow-sm">
            <div className="overflow-auto max-h-[calc(100vh-320px)]">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-muted/50 to-muted/20 sticky top-0 z-10 [&_tr]:border-b [&_tr]:border-border/50">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>{t("spaces.name")}</TableHead>
                  <TableHead>{t("spaces.group")}</TableHead>
                  <TableHead>{t("spaces.building")}</TableHead>
                  <TableHead>{t("spaces.area")}</TableHead>
                  <TableHead className="text-center">{t("spaces.tasks")}</TableHead>
                  <TableHead className="text-center">{t("spaces.inProgress")}</TableHead>
                  <TableHead className="text-center">{t("spaces.completed")}</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {searchFilteredSpaces &&
                searchFilteredSpaces.filter((s) => !s.archived).length > 0 ? (
                  searchFilteredSpaces
                    .filter((s) => !s.archived)
                    .map((space) => (
                      <TableRow
                        key={space._id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => handleSpaceClick(space)}
                      >
                        <TableCell style={{ paddingLeft: "1.2rem" }}>
                          <div className="bg-[#F1F5FE] w-10 h-10 rounded-md flex items-center justify-center">
                            <DoorClosed className="w-6 h-6" color="#4D81ED" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium first-letter:uppercase">
                          
                          {space.name}
                        </TableCell>
                        <TableCell className="first-letter:uppercase">
                          <span className="inline-flex capitalize items-center rounded border px-2.5 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#F1F8FDFF] hover:bg-[#F1F8FDFF] text-xs text-[#2E69E8FF]">
                            {!space?.spaceGroup
                              ? t("spaces.noAssignedGroup")
                              : space?.spaceGroup}
                          </span>
                        </TableCell>
                        <TableCell className="first-letter:uppercase">
                          {space?.building_id?.label}
                        </TableCell>
                        <TableCell className="first-letter:uppercase">
                          {space?.area?.label}
                        </TableCell>
                        <TableCell className="text-center">
                          {space?.taskCounts?.open || space?.openTasks || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {space?.taskCounts?.inProgress ||
                            space?.tasksInProgress ||
                            0}
                        </TableCell>
                        <TableCell className="text-center">
                          {space?.taskCounts?.completed ||
                            space?.tasksCompleted ||
                            0}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <DoorClosed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{t("spaces.noSpacesFound")}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
            </div>
          </div>
        )}

        {activeTab === "Archived spaces" && (
          <div className="bg-card rounded-lg border border-border/50 shadow-sm">
            <div className="overflow-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-muted/50 to-muted/20 sticky top-0 z-10 [&_tr]:border-b [&_tr]:border-border/50">
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>{t("spaces.name")}</TableHead>
                    <TableHead>{t("spaces.group")}</TableHead>
                    <TableHead>{t("spaces.building")}</TableHead>
                    <TableHead>{t("spaces.area")}</TableHead>
                    <TableHead className="text-center">{t("spaces.open")}</TableHead>
                    <TableHead className="text-center">{t("spaces.inProgress")}</TableHead>
                    <TableHead className="text-center">{t("spaces.completed")}</TableHead>
                  </TableRow>
                </thead>
                <TableBody>
                  {searchFilteredSpaces &&
                  searchFilteredSpaces.filter((s) => s.archived).length > 0 ? (
                    searchFilteredSpaces
                      .filter((s) => s.archived)
                      .map((space) => (
                        <TableRow
                          key={space._id}
                          className="hover:bg-accent/50 opacity-75"
                        >
                          <TableCell>
                            <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
                              <DoorClosed className="w-6 h-6" color="#4D81ED" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium first-letter:uppercase">
                            {space.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            <span className="inline-flex items-center rounded border px-2.5 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#F1F8FDFF] hover:bg-[#F1F8FDFF] text-xs text-[#2E69E8FF]">
                              {!space?.spaceGroup
                                ? t("spaces.noAssignedGroup")
                                : space?.spaceGroup}
                            </span>
                          </TableCell>
                          <TableCell className="first-letter:uppercase">
                            {space?.building_id?.label}
                          </TableCell>
                          <TableCell className="first-letter:uppercase">
                            {space?.area?.label}
                          </TableCell>
                          <TableCell className="text-center">
                            {space?.taskCounts?.open || space?.openTasks || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {space?.taskCounts?.inProgress ||
                              space?.tasksInProgress ||
                              0}
                          </TableCell>
                          <TableCell className="text-center">
                            {space?.taskCounts?.completed ||
                              space?.tasksCompleted ||
                              0}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreClick(space)}
                              className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={14}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <DoorClosed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{t("spaces.noArchivedSpaces")}</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Groups" && <SpaceGroupsTable />}
      </div>

      {/* Modals */}
      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSpace}
      />

      <SpaceDetailsModal
        isOpen={isSpaceDetailsOpen}
        onClose={() => setIsSpaceDetailsOpen(false)}
        space={selectedSpace}
        onDelete={handleDeleteSpace}
        onLinkedDocuments={() => handleLinkedItemClick("Linked documents")}
        onTasks={() => handleLinkedItemClick("Tasks")}
        onAssets={() => handleLinkedItemClick("Assets")}
        onQRCodes={() => handleLinkedItemClick("QR-Codes")}
      />

      <DeleteSpaceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        spaceName={selectedSpace?.name}
        spaceId={selectedSpace?._id}
      />

      <RestoreSpaceModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSuccess={() => setSelectedSpace(null)}
        spaceName={selectedSpace?.name}
        spaceId={selectedSpace?._id}
        buildingId={selectedSpace?.building_id?._id}
      />

      <LinkedItemModal
        isOpen={isLinkedItemModalOpen}
        onClose={() => setIsLinkedItemModalOpen(false)}
        onBack={handleLinkedItemBack}
        title={linkedItemType}
        spaceName={selectedSpace?.name || ""}
        space={selectedSpace}
      />

      <CreateSpaceGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />

      <ImportSpacesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default Spaces;
