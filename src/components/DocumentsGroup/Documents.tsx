import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, RotateCcw } from "lucide-react";
import DocumentsTable from "./DocumentsTable";
import { AddDocumentModal } from "./AddDocumentModal";
import { useDocumentsQuery } from "@/hooks/queries";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { apiService, endpoints } from "@/services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Documents = () => {
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();
  const { selectedBuilding } = useBuilding();
  const { spaces, assets } = useReferenceData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [linkedToFilter, setLinkedToFilter] = useState<string>("all");
  const { data: documents, isLoading, error } = useDocumentsQuery();
  
  const queryClient = useQueryClient();

  // Extract unique buildings and linked item names from documents
  const uniqueBuildings = React.useMemo(() => {
    const buildingsMap = new Map<string, { _id: string; name: string }>();
    documents?.forEach((doc) => {
      doc.linkedTo?.forEach((link) => {
        if (link.building?._id && link.building?.name) {
          buildingsMap.set(link.building._id, link.building);
        }
      });
    });
    return Array.from(buildingsMap.values());
  }, [documents]);

  // Build linked items from spaces and assets (like Tasks.tsx)
  const filteredSpacesAndAssets = React.useMemo(() => {
    const items: { id: string; name: string; type: "Space" | "Asset" }[] = [];

    const filteredSpacesList = selectedBuilding
      ? spaces.filter((space) => {
          const spaceBuildingId =
            typeof space.building_id === "object"
              ? (space.building_id as any)?._id
              : space.building_id;
          return spaceBuildingId === selectedBuilding._id && !space.archived;
        })
      : spaces.filter((space) => !space.archived);

    const filteredAssetsList = selectedBuilding
      ? assets.filter((asset) => {
          const assetBuildingId =
            typeof asset.building_id === "object"
              ? (asset.building_id as any)?._id
              : asset.building_id;
          return assetBuildingId === selectedBuilding._id && !asset.archived;
        })
      : assets.filter((asset) => !asset.archived);

    filteredSpacesList.forEach((space) => {
      items.push({ id: space._id, name: space.name, type: "Space" });
    });

    filteredAssetsList.forEach((asset) => {
      items.push({ id: asset._id, name: asset.name, type: "Asset" });
    });

    return items;
  }, [spaces, assets, selectedBuilding]);

  const filterDocumentsByBuilding = (docs: any[]) => {
    return docs?.filter((doc) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(searchLower) ||
        doc.linkedTo?.some((link: any) =>
          link.name?.toLowerCase().includes(searchLower),
        ) ||
        doc.linkedTo?.some((link: any) =>
          link.building?.name?.toLowerCase().includes(searchLower),
        );

      if (!matchesSearch) return false;

      if (buildingFilter !== "all") {
        const matchesBuildingFilter = doc.linkedTo?.some(
          (link: any) => link.building?._id === buildingFilter,
        );
        if (!matchesBuildingFilter) return false;
      }

      if (linkedToFilter !== "all") {
        const matchesLinkedToFilter = doc.linkedTo?.some(
          (link: any) => link._id === linkedToFilter,
        );
        if (!matchesLinkedToFilter) return false;
      }

      if (!selectedBuilding) return true;

      const belongsToBuilding = doc.linkedTo?.some((linkedItem: any) => {
        const space = spaces.find((s) => s._id === linkedItem._id);
        if (space && space.building_id?._id === selectedBuilding._id)
          return true;

        const asset = assets.find((a) => a._id === linkedItem._id);
        if (asset) {
          const assetSpace = spaces.find(
            (s) => s._id === asset.linked_space_id?._id,
          );
          if (
            assetSpace &&
            assetSpace.building_id?._id === selectedBuilding._id
          )
            return true;
        }

        return false;
      });

      return belongsToBuilding;
    });
  };

  const activeDocuments = filterDocumentsByBuilding(
    documents?.filter((doc) => !doc.archived && !doc.expired) || [],
  );
  const expiredDocuments = filterDocumentsByBuilding(
    documents?.filter((doc) => !doc.archived && doc.expired) || [],
  );
  const archivedDocuments = filterDocumentsByBuilding(
    documents?.filter((doc) => doc.archived) || [],
  );

  const handleRestoreDocument = async (documentId: string) => {
    setRestoringId(documentId);
    try {
      await apiService.patch(`${endpoints.documents}/${documentId}/unarchive`);
      toast.success(t("documents.title"), {
        description: t("documents.restoredSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.message || t("documents.failedRestore"),
      });
    } finally {
      setRestoringId(null);
    }
  };

  const tabs = [
    { name: "active", label: t("documents.activeDocuments"), count: activeDocuments.length },
    { name: "expired", label: t("documents.expiredDocuments"), count: expiredDocuments.length },
    { name: "archived", label: t("documents.archivedDocuments"), count: archivedDocuments.length },
  ];

  const CountBadge = ({ count, isActive }: { count: number; isActive: boolean }) => (
  <span
    className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center ${
      isActive
        ? "bg-primary/15 text-primary border border-primary/30"
        : "bg-muted text-muted-foreground border border-border"
    }`}
  >
    {count}
  </span>
);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            {t("documents.title")}
          </h1>

          {hasPermission("documents", "createDocuments") && (
            <Button
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1"
              data-onboarding-target="upload-document"
            >
              <Plus className="h-4 w-4" />
              {t("common.create")}
            </Button>
          )}
        </div>

        {/* Mobile Dropdown */}
        <div className="block sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full relative">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>
                    {activeTab === "active"
                      ? `${t("documents.activeDocuments")} (${activeDocuments.length})`
                      : activeTab === "expired"
                      ? `${t("documents.expiredDocuments")} (${expiredDocuments.length})`
                      : `${t("documents.archivedDocuments")} (${archivedDocuments.length})`}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
                            <SelectItem value="active">
                <div className="flex items-center justify-between w-full">
                  <span>{t("documents.activeDocuments")}</span>
                  <CountBadge count={activeDocuments.length} isActive={activeTab === "active"} />
                </div>
              </SelectItem>
              <SelectItem value="expired">
                <div className="flex items-center justify-between w-full">
                  <span>{t("documents.expiredDocuments")}</span>
                  <CountBadge count={expiredDocuments.length} isActive={activeTab === "expired"} />
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center justify-between w-full">
                  <span>{t("documents.archivedDocuments")}</span>
                  <CountBadge count={archivedDocuments.length} isActive={activeTab === "archived"} />
                </div>
</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs Header and Filters */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="w-fit gap-2 lg:gap-6 hidden sm:flex">
            <button
              onClick={() => setActiveTab("active")}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center ${
                activeTab === "active"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {t("documents.activeDocuments")}
              <CountBadge count={activeDocuments.length} isActive={activeTab === "active"} />
            </button>
            <button
              onClick={() => setActiveTab("expired")}
              className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center ${
                activeTab === "expired"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {t("documents.expiredDocuments")}
              <CountBadge count={expiredDocuments.length} isActive={activeTab === "expired"} />
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center ${
                activeTab === "archived"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {t("documents.archivedDocuments")}
              <CountBadge count={archivedDocuments.length} isActive={activeTab === "archived"} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="my-6 space-y-4 sm:space-y-0 mb-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("documents.searchDocument")}
                className="pl-10 w-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Building Filter */}
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10 hover:bg-accent/50">
                <SelectValue placeholder={t("documents.allBuildings")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("documents.allBuildings")}</SelectItem>
                {uniqueBuildings.map((building) => (
                  <SelectItem key={building._id} value={building._id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Linked To Filter */}
            <Select value={linkedToFilter} onValueChange={setLinkedToFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10 hover:bg-accent/50">
                <SelectValue placeholder={t("documents.linkedTo")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("documents.linkedTo")}</SelectItem>
                {filteredSpacesAndAssets.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        [{item.type}]
                      </span>
                      {item.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
        {activeTab === "active" && (
          <DocumentsTable
            documents={activeDocuments || []}
            isLoading={isLoading}
            error={error?.message || null}
          />
        )}

        {activeTab === "expired" && (
          <DocumentsTable
            documents={expiredDocuments || []}
            isLoading={isLoading}
            error={error?.message || null}
            isExpired={true}
          />
        )}

        {activeTab === "archived" && (
          <DocumentsTable
            documents={archivedDocuments || []}
            isLoading={isLoading}
            error={error?.message || null}
            isArchived={true}
            onRestore={handleRestoreDocument}
            restoringId={restoringId}
          />
        )}
      </div>

      <AddDocumentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
};

export default Documents;
