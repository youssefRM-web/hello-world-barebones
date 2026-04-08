import React, { useState, useMemo } from "react";
import { useBuildingData } from "@/hooks/useBuildingData";
import { Button } from "../ui/button";
import { Printer, Trash2, DoorClosed } from "lucide-react";
import { Asset } from "@/types";
import DeleteAssetModal from "./DeleteAssetModal";
import AssetDetailsModal from "./AssetDetailsModal";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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

const AssetsTable = ({
  assets,
  searchTerm = "",
  filters,
}: AssetsTableProps) => {
  const { filteredAssets } = useBuildingData();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { t } = useLanguage();
  const { buildings, spaces, categories, groups, isLoading } = useReferenceData();

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

  React.useEffect(() => {
    const handleAssetDeleted = () => {
      setIsDetailsModalOpen(false);
      setSelectedAsset(null);
    };
    window.addEventListener("asset-deleted", handleAssetDeleted);
    return () =>
      window.removeEventListener("asset-deleted", handleAssetDeleted);
  }, []);

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

  const handleDelete = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleRowClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailsModalOpen(true);
  };
  
  const filteredAssetsData = useMemo(() => {
    let result = filteredAssets.filter((asset) => !asset.archived);

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchLower) ||
          getBuildingName(asset.building_id).toLowerCase().includes(searchLower) ||
          getCategoryName(asset.category_id).toLowerCase().includes(searchLower)
      );
    }

    if (filters?.category && filters.category !== "all") {
      result = result.filter((asset) => {
        const categoryId = typeof asset.category_id === "string" ? asset.category_id : asset.category_id?._id;
        return categoryId === filters.category;
      });
    }

    if (filters?.group && filters.group !== "all") {
      result = result.filter((asset) => {
        const group = groups.find((g) => g._id === filters.group);
        if (!group) return false;
        const assetIdsInGroup = group.assets?.map((a: any) => typeof a === "string" ? a : a._id) || [];
        return assetIdsInGroup.includes(asset._id);
      });
    }

    if (filters?.building && filters.building !== "all") {
      result = result.filter((asset) => {
        const buildingId = typeof asset.building_id === "string" ? asset.building_id : asset.building_id?._id;
        return buildingId === filters.building;
      });
    }

    if (filters?.area && filters.area !== "all") {
      result = result.filter((asset) => {
        const linkedSpaceId = typeof asset.linked_space_id === "string" ? asset.linked_space_id : asset.linked_space_id?._id;
        if (linkedSpaceId) {
          const space = spaces.find((s) => s._id === linkedSpaceId);
          return space?.area?._id === filters.area;
        }
        return false;
      });
    }

    if (filters?.space && filters.space !== "all") {
      result = result.filter((asset) => {
        const linkedSpaceId = typeof asset.linked_space_id === "string" ? asset.linked_space_id : asset.linked_space_id?._id;
        return linkedSpaceId === filters.space;
      });
    }

    return result;
  }, [filteredAssets, searchTerm, filters, spaces, groups]);

  return (
    <div className="bg-card rounded-lg w-full border border-border/50 shadow-sm">
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gradient-to-r from-muted/50 to-muted/20 sticky top-0 z-10 [&_tr]:border-b [&_tr]:border-border/50">
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>{t("assets.name")}</TableHead>
                <TableHead>{t("assets.category")}</TableHead>
                <TableHead>{t("assets.group")}</TableHead>
                <TableHead>{t("assets.id")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("assets.building")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("assets.linkedTo")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("assets.brand")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("assets.supplier")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("assets.purchaseDate")}</TableHead>
                <TableHead className="text-center">{t("assets.openTasks")}</TableHead>
                <TableHead className="text-center">{t("assets.inProgress")}</TableHead>
                <TableHead className="text-center">{t("assets.completed")}</TableHead>
              </TableRow>
            </thead>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : filteredAssetsData.length > 0 ? (
                filteredAssetsData.map((asset, u) => (
                  <TableRow
                    key={asset?._id}
                    className="hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleRowClick(asset)}
                  >
                    <TableCell>
                      <div className="bg-primary/5 w-8 h-8 rounded-md flex items-center justify-center">
                        <Avatar className="h-10 w-10">
                          {asset.asset_picture ? (
                            <AvatarImage src={asset.asset_picture} />
                          ) : (
                            <AvatarFallback>
                              <Printer className="w-6 h-6 text-primary" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-foreground first-letter:uppercase">
                      {asset?.name}
                    </TableCell>
                    <TableCell className="first-letter:uppercase">
                      <span className="bg-primary/5 text-primary text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                        {asset?.category_id?.label ? asset?.category_id?.label : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground first-letter:uppercase">
                      {asset?.assetGroup ? (
                        <span className="bg-primary/5 text-primary text-xs font-medium px-4 py-1 rounded">
                          {typeof asset?.assetGroup === "object"
                            ? (asset?.assetGroup as any)?.name
                            : asset?.assetGroup}{" "}
                        </span>
                      ) : (
                        <span className="bg-primary/5 text-primary text-xs font-medium px-4 py-1 rounded">
                          {" "}N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {asset?.id_number ? asset?.id_number : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground hidden md:table-cell first-letter:uppercase">
                      {asset?.building_id?.label}
                    </TableCell>
                    <TableCell className="text-sm text-foreground hidden md:table-cell first-letter:uppercase">
                      {asset?.linked_space_id?.name}
                    </TableCell>
                    <TableCell className="text-sm text-foreground hidden lg:table-cell first-letter:uppercase">
                      {asset?.brand ? asset?.brand : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground hidden lg:table-cell first-letter:uppercase">
                      {asset?.supplier ? asset?.supplier : "N/A"}
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-12 text-muted-foreground">
                    <Printer className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p>{t("assets.noAssetsFound")}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
      </div>
      {selectedAsset && (
        <DeleteAssetModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          asset={selectedAsset}
        />
      )}
      {selectedAsset && (
        <AssetDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          asset={selectedAsset}
        />
      )}
    </div>
  );
};


export default AssetsTable;
