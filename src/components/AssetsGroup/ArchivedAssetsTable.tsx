import React, { useState } from "react";
import { useBuildingData } from "@/hooks/useBuildingData";
import { Button } from "../ui/button";
import { Printer, Trash2, RotateCcw } from "lucide-react";
import { Asset } from "@/types";
import DeleteAssetModal from "./DeleteAssetModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiService, endpoints } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AssetFilters {
  category: string;
  building: string;
  area: string;
  space: string;
  group?: string;
}

interface AssetsTableProps {
  assets: Asset[];
  archived: boolean;
  searchTerm?: string;
  filters?: AssetFilters;
}

const ArchivedAssetsTable = ({ assets, searchTerm = "", filters }: AssetsTableProps) => {
  const { filteredAssets } = useBuildingData();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { buildings, spaces, categories, isLoading, refreshAssets } = useReferenceData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
      <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
      <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
  );

  const getBuildingName = (buildingId: any) => {
    if (typeof buildingId === "string") {
      const building = buildings.find((b) => b._id === buildingId);
      return building?.label || "Unknown";
    }
    return buildingId?.label || "Unknown";
  };

  const getCategoryName = (categoryId: any) => {
    if (typeof categoryId === "string") {
      const category = categories.find((c) => c._id === categoryId);
      return category?.label || "Unknown";
    }
    return categoryId?.label || "Unknown";
  };

  const getSpaceName = (spaceId: any) => {
    if (typeof spaceId === "string") {
      const space = spaces.find((s) => s._id === spaceId);
      return space?.name || "Unknown";
    }
    return spaceId?.name || "Unknown";
  };

  const handleDelete = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleRestore = async (asset: Asset) => {
    const buildingId = typeof asset.building_id === "string" 
      ? asset.building_id 
      : asset.building_id?._id;
    const building = buildings.find((b) => b._id === buildingId);
    
    if (building?.archived) {
      toast({
        title: t("assets.cannotRestoreAsset"),
        description: t("assets.restoreBuildingFirst"),
        variant: "destructive",
      });
      return;
    }

    const spaceId = typeof asset.linked_space_id === "string" 
      ? asset.linked_space_id 
      : asset.linked_space_id?._id;
    
    if (spaceId) {
      const space = spaces.find((s) => s._id === spaceId);
      if (space?.archived) {
        toast({
          title: t("assets.cannotRestoreAsset"),
          description: t("assets.restoreSpaceFirst"),
          variant: "destructive",
        });
        return;
      }
    }

    setRestoringId(asset._id);
    try {
      await apiService.patch(`${endpoints.assets}/${asset._id}`, { archived: false });
      toast({
        title: t("assets.title"),
        description: t("assets.assetRestoredSuccess"),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
    } catch (error: any) {
      toast({
        title: t("assets.title"),
        description: error.message || t("assets.failedRestoreAsset"),
        variant: "destructive",
      });
    } finally {
      refreshAssets();
      setRestoringId(null);
    }
  };

  const searchFilteredAssets = filteredAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBuildingName(asset.building_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(asset.category_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card rounded-lg border border-border rounded-md w-full">
      <div className="overflow-x-auto rounded-lg ">
        <div className=" rounded-lg overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>{t("assets.name")}</TableHead>
                <TableHead>{t("assets.category")}</TableHead>
                <TableHead>{t("assets.group")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("assets.purchaseDate")}</TableHead>
                <TableHead className="text-center">{t("assets.openTasks")}</TableHead>
                <TableHead className="text-center">{t("assets.inProgress")}</TableHead>
                <TableHead className="text-center">{t("assets.completed")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
              ) : searchFilteredAssets &&
              searchFilteredAssets.filter((s) => s.archived).length > 0 ? (
                searchFilteredAssets
                  .filter((s) => s.archived)
                  .map((asset, index) => (
                    <TableRow
                      key={`${asset?._id}-${index}`}
                      className="hover:bg-accent/50 opacity-75"
                    >
                      <TableCell>
                        <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
                          <Printer className="w-6 h-6" color="#4D81ED" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-foreground">
                        {asset?.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium transition-colors border-transparent bg-primary/10 hover:bg-primary/20 text-primary">
                          {asset?.category_id?.label ? asset?.category_id?.label : t("assets.noCategory")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {typeof asset?.assetGroup === 'object' && asset?.assetGroup !== null 
                          ? (asset.assetGroup as { name?: string }).name || "N/A"
                          : asset?.assetGroup || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-foreground hidden lg:table-cell">
                        {asset?.purchase_date
                          ? new Date(asset?.purchase_date).toLocaleDateString("de-GR", { day: "2-digit", month: "2-digit", year: "numeric" })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {asset?.taskCounts?.open || asset?.open_tasks || 0}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {asset?.taskCounts?.inProgress || asset?.tasks_in_progress || 0}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {asset?.taskCounts?.completed || asset?.tasks_completed || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(asset)}
                            disabled={restoringId === asset._id}
                            className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                          >
                            <RotateCcw className={`h-4 w-4 ${restoringId === asset._id ? "animate-spin" : ""}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-8 text-muted-foreground ">
                    <Printer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    {t("assets.noArchivedAssets")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedAsset && (
        <DeleteAssetModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          asset={selectedAsset}
        />
      )}
    </div>
  );
};

export default ArchivedAssetsTable;
