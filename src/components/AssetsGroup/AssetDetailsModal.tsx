import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Trash2,
  Edit,
  ChevronRight,
  Printer,
  Calendar,
  QrCode,
  Info,
  Hash,
  Tag,
  Package,
  Building2,
  TagIcon,
  PackageIcon,
  Expand,
  RefreshCw,
  Upload,
  ImageIcon,
  Camera,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/services/api";
import { validateFileSize } from "@/utils/fileValidation";
import DeleteAssetModal from "./DeleteAssetModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { usePermissions } from "@/contexts/PermissionsContext";
import LinkedSpaceModal from "./LinkedSpaceModalProps";
import { Asset } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CustomCalendar from "@/components/ui/custom-calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import LinkedAssetItemModal from "./LinkedAssetItemModal";
import { useQrCodesForItem } from "@/hooks/queries/useQrCodesQuery";
import LinkedQrCodesModal from "@/components/QrCodeGroup/LinkedQrCodesModal";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupsQuery } from "@/hooks/queries/useGroupsQuery";

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onDelete?: () => void;
  onLinkedDocuments?: () => void;
  onTasks?: () => void;
}

const AssetDetailsModal = ({
  isOpen,
  onClose,
  asset: assetProp,
  onDelete,
  onLinkedDocuments,
  onTasks,
}: AssetDetailsModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const {
    buildings,
    spaces,
    acceptedTasks,
    categories,
    updateAsset,
    isLoading,
    refreshCategories,
    refreshAssets,
    assets,
  } = useReferenceData();

  // Get the current asset from context to get real-time updates
  const asset = assets.find((a) => a._id === assetProp?._id) || assetProp;
  const { data: groups = [] } = useGroupsQuery();
  const { hasPermission } = usePermissions();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const queryClient = useQueryClient();

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingIdNumber, setIsEditingIdNumber] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [isEditingPurchaseDate, setIsEditingPurchaseDate] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingLinkedSpace, setIsEditingLinkedSpace] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form values
  const [editedName, setEditedName] = useState(asset?.name || "");
  const [editedCategory, setEditedCategory] = useState(
    asset?.category_id?._id || "",
  );
  const [editedGroup, setEditedGroup] = useState(asset?.assetGroup || "");
  const [editedIdNumber, setEditedIdNumber] = useState(asset?.id_number || "");
  const [editedBrand, setEditedBrand] = useState(asset?.brand || "");
  const [editedSupplier, setEditedSupplier] = useState(asset?.supplier || "");
  const [editedPurchaseDate, setEditedPurchaseDate] = useState<
    Date | undefined
  >(asset?.purchase_date ? new Date(asset.purchase_date) : undefined);
  const [editedInfo, setEditedInfo] = useState(
    asset?.additional_information || "",
  );
  const [editedLinkedSpaceId, setEditedLinkedSpaceId] = useState(
    asset?.linked_space_id?._id || "",
  );
  const [isEditingBuilding, setIsEditingBuilding] = useState(false);
  const [linkedItemModalOpen, setLinkedItemModalOpen] = useState(false);
  const [linkedItemType, setLinkedItemType] = useState<string>("");
  const [isQrCodesModalOpen, setIsQrCodesModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch QR codes for this asset
  const { qrCodes, qrCodeCount } = useQrCodesForItem(
    asset?._id || "",
    "asset",
    asset?.building_id?._id,
  );

  const assetAcceptedTasks = useMemo(() => {
    if (!asset?._id) return [];
    return acceptedTasks.filter((task) => task.Linked_To?._id === asset._id);
  }, [acceptedTasks, asset?._id]);

  useEffect(() => {
    if (asset) {
      setEditedName(asset.name || "");
      setEditedCategory(asset.category_id?._id || "");
      setEditedGroup(asset.assetGroup || "");
      setEditedIdNumber(asset.id_number || "");
      setEditedBrand(asset.brand || "");
      setEditedSupplier(asset.supplier || "");
      setEditedPurchaseDate(
        asset.purchase_date ? new Date(asset.purchase_date) : undefined,
      );
      setEditedInfo(asset.additional_information || "");
      setEditedLinkedSpaceId(asset.linked_space_id?._id || "");
    }
  }, [asset]);

  if (!asset) return null;

  const handleSaveName = async () => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, { name: editedName });
      updateAsset(asset._id, { name: editedName });
      toast({
        title: t("assets.title"),
        description: t("assets.assetNameUpdated"),
        variant: "success",
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating asset name:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateName"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsUpdating(false);
    }
  };

  const handleSaveCategory = async () => {
    setIsUpdating(true);
    try {
      const newCategoryId = editedCategory === "none" ? null : editedCategory;
      await apiService.patch(`/asset/${asset._id}`, {
        category_id: newCategoryId,
      });
      const categoryObj = newCategoryId
        ? categories.find((c) => c._id === newCategoryId)
        : null;
      updateAsset(asset._id, { category_id: categoryObj || undefined } as any);
      toast({
        title: t("assets.title"),
        description:
          editedCategory === "none"
            ? t("assets.categoryRemoved")
            : t("assets.categoryUpdated"),
        variant: "success",
      });
      setIsEditingCategory(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateCategory"),
        variant: "destructive",
      });
    } finally {
      // Refresh categories to update category.assets relationships
      await refreshCategories();
      setIsUpdating(false);
    }
  };

  const handleSaveGroup = async () => {
    setIsUpdating(true);
    try {
      // Find the current group the asset belongs to
      const currentGroup = groups.find((g) =>
        g.assets?.some(
          (a: any) => (typeof a === "string" ? a : a._id) === asset._id,
        ),
      );

      if (editedGroup === "none") {
        // Remove asset from current group if it exists
        if (currentGroup) {
          const updatedAssets = currentGroup.assets
            .filter(
              (a: any) => (typeof a === "string" ? a : a._id) !== asset._id,
            )
            .map((a: any) => (typeof a === "string" ? a : a._id));
          await apiService.put(`/groups/${currentGroup._id}`, {
            assets: updatedAssets,
          });
        }
      } else {
        // First remove from current group if exists
        if (currentGroup && currentGroup._id !== editedGroup) {
          const updatedAssets = currentGroup.assets
            .filter(
              (a: any) => (typeof a === "string" ? a : a._id) !== asset._id,
            )
            .map((a: any) => (typeof a === "string" ? a : a._id));
          await apiService.put(`/groups/${currentGroup._id}`, {
            assets: updatedAssets,
          });
        }

        // Then add to the new group
        const newGroup = groups.find((g) => g._id === editedGroup);
        if (newGroup) {
          const currentAssetIds =
            newGroup.assets?.map((a: any) =>
              typeof a === "string" ? a : a._id,
            ) || [];
          if (!currentAssetIds.includes(asset._id)) {
            await apiService.put(`/groups/${editedGroup}`, {
              assets: [...currentAssetIds, asset._id],
            });
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      // Update local asset data with new group info
      const newGroup =
        editedGroup === "none"
          ? null
          : groups.find((g) => g._id === editedGroup);
      updateAsset(asset._id, {
        assetGroup: newGroup
          ? ({ _id: newGroup._id, name: newGroup.name } as any)
          : "",
      });
      toast({
        title: t("assets.title"),
        description:
          editedGroup === "none"
            ? t("assets.removedFromGroup")
            : t("assets.groupUpdated"),
        variant: "success",
      });
      setIsEditingGroup(false);
    } catch (error) {
      console.error("Error updating asset group:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateGroup"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveIdNumber = async () => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, {
        id_number: editedIdNumber,
      });
      updateAsset(asset._id, { id_number: editedIdNumber });
      toast({
        title: t("assets.title"),
        description: t("assets.idNumberUpdated"),
        variant: "success",
      });
      setIsEditingIdNumber(false);
    } catch (error) {
      console.error("Error updating ID number:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateIdNumber"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsUpdating(false);
      // await apiService.get(`/asset`);
    }
  };

  const handleSaveBrand = async () => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, { brand: editedBrand });
      updateAsset(asset._id, { brand: editedBrand });
      toast({
        title: t("assets.title"),
        description: t("assets.brandUpdated"),
        variant: "success",
      });
      setIsEditingBrand(false);
    } catch (error) {
      console.error("Error updating brand:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateBrand"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsUpdating(false);
      // await apiService.get(`/asset`);
    }
  };

  const handleSaveSupplier = async () => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, {
        supplier: editedSupplier,
      });
      updateAsset(asset._id, { supplier: editedSupplier });
      toast({
        title: t("assets.title"),
        description: t("assets.supplierUpdated"),
        variant: "success",
      });
      setIsEditingSupplier(false);
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateSupplier"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsUpdating(false);
      // await apiService.get(`/asset`);
    }
  };

  const handleSavePurchaseDate = async () => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, {
        purchase_date: editedPurchaseDate?.toISOString(),
      });
      updateAsset(asset._id, {
        purchase_date: editedPurchaseDate?.toISOString(),
      });
      toast({
        title: t("assets.title"),
        description: t("assets.purchaseDateUpdated"),
        variant: "success",
      });
      setIsEditingPurchaseDate(false);
    } catch (error) {
      console.error("Error updating purchase date:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdatePurchaseDate"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsUpdating(false);
    }
  };

  const handleSaveInfo = async () => {
    setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, {
        additional_information: editedInfo,
      });
      updateAsset(asset._id, { additional_information: editedInfo });
      toast({
        title: t("assets.title"),
        description: t("assets.infoUpdated"),
        variant: "success",
      });
      setIsEditingInfo(false);
    } catch (error) {
      console.error("Error updating additional information:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateInfo"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      setIsUpdating(false);
    }
  };

  const handleSaveLinkedSpace = async (spaceId: string) => {
    // setIsUpdating(true);
    try {
      await apiService.patch(`/asset/${asset._id}`, {
        linked_space_id: spaceId,
      });
      const spaceObj = spaces.find((s) => s._id === spaceId);
      updateAsset(asset._id, { linked_space_id: spaceObj || undefined } as any);
      setEditedLinkedSpaceId(spaceId);
      toast({
        title: t("assets.title"),
        description: t("assets.linkedSpaceUpdated"),
        variant: "success",
      });
      setIsEditingLinkedSpace(false);
    } catch (error) {
      console.error("Error updating linked space:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateLinkedSpace"),
        variant: "destructive",
      });
    } finally {
      // setIsUpdating(false);
      await refreshAssets();
      await apiService.get(`/asset`);
    }
  };

  const handleSelectSpace = async (spaceId: string) => {
    setIsUpdating(true);
    try {
      const selectedSpace = spaces.find((s) => s._id === spaceId);
      const buildingId = selectedSpace?.building_id;
      const building = buildings.find(
        (b) =>
          b._id ===
          (typeof buildingId === "string" ? buildingId : buildingId?._id),
      );

      await apiService.patch(`/asset/${asset._id}`, {
        linked_space_id: spaceId,
        building_id:
          typeof buildingId === "string" ? buildingId : buildingId?._id,
      });

      updateAsset(asset._id, {
        linked_space_id: selectedSpace || undefined,
        building_id: building || undefined,
      } as any);

      toast({
        title: t("assets.title"),
        description: t("assets.locationUpdated"),
        variant: "success",
      });
      setIsEditingBuilding(false);
    } catch (error) {
      console.error("Error updating asset location:", error);
      toast({
        title: t("assets.title"),
        description: t("assets.failedUpdateLocation"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      await apiService.get(`/asset`);
      setIsUpdating(false);
    }
  };
  const currentBuilding = buildings.find(
    (b) => b._id === asset.building_id?._id,
  );
  const currentLinkedSpace = spaces.find((s) => s._id === editedLinkedSpaceId);
  const selectedCategory = categories.find((c) => c._id === editedCategory);

  // Get groups that this asset doesn't belong to
  const availableGroups = useMemo(() => {
    return groups.filter((group) => {
      const assetIds =
        group.assets?.map((a: any) => (typeof a === "string" ? a : a._id)) ||
        [];
      return !assetIds.includes(asset._id);
    });
  }, [groups, asset._id]);
  // Get current group name
  const currentGroupName = useMemo(() => {
    const currentGroup = groups.find((g) =>
      g.assets?.some((a: any) => a._id === asset._id),
    );
    if (currentGroup?.name) return currentGroup.name;
    // Fallback: look up the group name by editedGroup ID
    if (editedGroup && editedGroup !== "none") {
      const selectedGroup = groups.find((g) => g._id === editedGroup);
      return selectedGroup?.name || "N/A";
    }
    return "N/A";
  }, [groups, asset._id, editedGroup]);

  const CountBadge = ({ count }: { count: number }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border`}
    >
      {count}
    </span>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="lg:max-w-xl sm:max-w-sm md:max-w-sm w-full max-h-[95vh] p-0 gap-0 sm:mx-auto flex flex-col">
          {/*  {isLoading || isUpdating ? (
            <PageLoadingSkeleton variant="modal" />
          ) : ( */}
          <>
            {/* Header */}
            <DialogHeader className="flex flex-row items-center justify-between p-6 border-b sticky top-0 bg-accent/50 z-10">
              <DialogTitle>{t("assets.assetDetails")}</DialogTitle>
              <div className="absolute right-4 top-2 flex items-center gap-4">
                {hasPermission("assets", "deleteAssets") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-5 overflow-y-auto flex-1 relative">
              {/* Hidden file input for image upload */}
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!validateFileSize(file, t)) {
                    e.target.value = "";
                    return;
                  }
                  setIsUploadingImage(true);
                  try {
                    const formData = new FormData();
                    formData.append("asset_picture", file);
                    const response = await apiService.post(
                      `${apiUrl}/asset/${asset._id}/picture`,
                      formData,
                    );
                    await refreshAssets();
                    toast({
                      title: t("assets.title"),
                      description: t("assets.imageUploaded"),
                      variant: "success",
                    });
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    toast({
                      title: t("assets.title"),
                      description: t("assets.failedUploadImage"),
                      variant: "destructive",
                    });
                  } finally {
                    setIsUploadingImage(false);
                    e.target.value = "";
                  }
                }}
              />

              {/* Asset Image Banner */}
              {asset.asset_picture ? (
                <div className="relative w-full h-48 px-6 bg-muted">
                  {isUploadingImage || isDeletingImage ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <img
                        src={asset.asset_picture}
                        alt={asset.name}
                        className="w-full h-full rounded-md object-cover"
                      />
                      <div className="absolute bottom-3 right-8 flex items-center gap-2">
                        {hasPermission("assets", "updateAssets") && (
                          <>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 bg-black/50 hover:bg-black/70"
                              onClick={async () => {
                                setIsDeletingImage(true);
                                try {
                                  await apiService.delete(
                                    `${apiUrl}/asset/${asset._id}/picture`,
                                  );
                                  updateAsset(asset._id, {
                                    asset_picture: undefined,
                                  } as any);
                                  await refreshAssets();
                                  toast({
                                    title: t("assets.title"),
                                    description: t("assets.imageDeleted"),
                                    variant: "success",
                                  });
                                } catch (error) {
                                  console.error("Error deleting image:", error);
                                  toast({
                                    title: t("assets.title"),
                                    description: t("assets.failedDeleteImage"),
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsDeletingImage(false);
                                }
                              }}
                              title={t("assets.deleteImage")}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 bg-black/50 hover:bg-black/70"
                              onClick={() => imageInputRef.current?.click()}
                              title={t("assets.uploadNewImage")}
                            >
                              <Upload className="h-4 w-4 text-white" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70"
                          onClick={() => setImageViewerOpen(true)}
                        >
                          <Expand className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                hasPermission("assets", "updateAssets") && (
                  <div
                    className="mx-6 mt-4 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() =>
                      !isUploadingImage && imageInputRef.current?.click()
                    }
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {t("assets.uploadImage")}
                        </span>
                      </>
                    )}
                  </div>
                )
              )}

              {/* Asset Icon and Name */}
              <div className="flex items-center gap-3 px-6 pt-6 group">
                <div className="w-10 h-10 bg-[#F1F5FE] rounded flex items-center justify-center">
                  <Printer className="w-7 h-7 text-[#4D81ED]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="first-letter:uppercase">
                      <span className="font-medium first-letter:uppercase ">
                        {editedName}
                      </span>
                    </div>
                    {hasPermission("assets", "updateAssets") && (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className=" transition-opacity"
                      >
                        <Edit
                          className="w-4 h-4 cursor-pointer"
                          color="#565E6CFF"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Edit: Name */}
                {isEditingName && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingName(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editAssetName")}
                      </Label>
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        autoFocus
                        className="mt-3 h-12 font-medium"
                        placeholder={t("assets.enterAssetName")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") {
                            setEditedName(asset.name);
                            setIsEditingName(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => {
                            setEditedName(asset.name);
                            setIsEditingName(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveName}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Building Info */}
              <div className="flex items-center gap-3 p-3 border rounded-md mx-6 group">
                <div className="bg-[#0F4C7BFF] w-10 h-10 flex items-center justify-center rounded-md">
                  <svg className="w-6 h-6" fill="#FFFFFF" viewBox="0 0 24 24">
                    <path d="M21 20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.314a1 1 0 0 1 .38-.785l8-6.311a1 1 0 0 1 1.24 0l8 6.31a1 1 0 0 1 .38.786V20zM7 12a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z" />
                  </svg>
                </div>
                <div className="flex-1 ">
                  <span className="text-sm capitalize">
                    {asset.chainLocation}
                  </span>
                </div>
                {hasPermission("assets", "updateAssets") && (
                  <button
                    onClick={() => setIsEditingBuilding(true)}
                    className="transition-opacity"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Vertical Fields List — EXACT MATCH */}
              <div className="space-y-4 mx-6 border rounded-md">
                <div className="px-2"></div>
                {/* ID Number */}
                <div className="flex items-center justify-between group px-3">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-foreground">
                      {t("assets.idNumber")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded">
                      {editedIdNumber || "N/A"}
                    </span>
                    {hasPermission("assets", "updateAssets") && (
                      <button
                        onClick={() => setIsEditingIdNumber(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Edit: ID Number */}
                {isEditingIdNumber && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingIdNumber(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editIdNumber")}
                      </Label>
                      <Input
                        value={editedIdNumber}
                        onChange={(e) => setEditedIdNumber(e.target.value)}
                        autoFocus
                        className="mt-3 h-12 font-medium"
                        placeholder={t("assets.enterIdNumber")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveIdNumber();
                          if (e.key === "Escape") {
                            setEditedIdNumber(asset.id_number || "");
                            setIsEditingIdNumber(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedIdNumber(asset.id_number || "");
                            setIsEditingIdNumber(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveIdNumber}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center justify-between group px-3">
                  <div className="flex items-center gap-3">
                    <TagIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-foreground">
                      {t("assets.category")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDeletingCategory ? (
                      <Skeleton className="h-6 w-20 rounded" />
                    ) : (
                      <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                        {selectedCategory?.label || "N/A"}
                      </span>
                    )}
                    {hasPermission("assets", "updateAssets") && (
                      <>
                        {selectedCategory && !isDeletingCategory && (
                          <button
                            onClick={async () => {
                              setIsDeletingCategory(true);
                              try {
                                await apiService.patch(`/asset/${asset._id}`, {
                                  category_id: null,
                                });
                                setEditedCategory("");
                                updateAsset(asset._id, {
                                  category_id: undefined,
                                } as any);
                                toast({
                                  title: "Assets",
                                  description: "Category removed successfully",
                                  variant: "success",
                                });
                              } catch (error) {
                                console.error(
                                  "Error removing category:",
                                  error,
                                );
                                toast({
                                  title: "Error",
                                  description: "Failed to remove category",
                                  variant: "destructive",
                                });
                              } finally {
                                await refreshCategories();
                                setIsDeletingCategory(false);
                              }
                            }}
                            className="transition-opacity hover:opacity-70"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                        {!isDeletingCategory && (
                          <button
                            onClick={() => setIsEditingCategory(true)}
                            className="transition-opacity"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Floating Edit: Category */}
                {isEditingCategory && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingCategory(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editCategory")}
                      </Label>
                      <Select
                        value={editedCategory}
                        onValueChange={setEditedCategory}
                      >
                        <SelectTrigger className="mt-3 h-12">
                          <SelectValue
                            placeholder={t("assets.selectCategory")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedCategory(asset.category_id?._id || "");
                            setIsEditingCategory(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveCategory}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Asset Group */}
                <div className="flex items-center justify-between group px-3">
                  <div className="flex items-center gap-3">
                    <PackageIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-foreground">
                      {t("assets.assetGroup")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDeletingGroup ? (
                      <Skeleton className="h-6 w-20 rounded" />
                    ) : (
                      <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                        {currentGroupName}
                      </span>
                    )}
                    {hasPermission("assets", "updateAssets") && (
                      <>
                        {currentGroupName !== "N/A" && !isDeletingGroup && (
                          <button
                            onClick={async () => {
                              setIsDeletingGroup(true);
                              try {
                                // Find the current group and remove the asset from it
                                const currentGroup = groups.find((g) =>
                                  g.assets?.some(
                                    (a: any) =>
                                      (typeof a === "string" ? a : a._id) ===
                                      asset._id,
                                  ),
                                );
                                if (currentGroup) {
                                  const updatedAssets = currentGroup.assets
                                    .filter(
                                      (a: any) =>
                                        (typeof a === "string" ? a : a._id) !==
                                        asset._id,
                                    )
                                    .map((a: any) =>
                                      typeof a === "string" ? a : a._id,
                                    );
                                  await apiService.put(
                                    `/groups/${currentGroup._id}`,
                                    {
                                      assets: updatedAssets,
                                    },
                                  );
                                  setEditedGroup("");
                                  // refreshData()
                                  updateAsset(asset._id, { assetGroup: "" });
                                  await queryClient.invalidateQueries({
                                    queryKey: ["groups"],
                                  });
                                  await queryClient.refetchQueries({
                                    queryKey: ["groups"],
                                  });
                                  toast({
                                    title: "Assets",
                                    description:
                                      "Asset removed from group successfully",
                                    variant: "success",
                                  });
                                }
                              } catch (error) {
                                console.error(
                                  "Error removing from group:",
                                  error,
                                );
                                toast({
                                  title: "Error",
                                  description: "Failed to remove from group",
                                  variant: "destructive",
                                });
                              } finally {
                                setIsDeletingGroup(false);
                              }
                            }}
                            className="transition-opacity hover:opacity-70"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                        {!isDeletingGroup && (
                          <button
                            onClick={() => setIsEditingGroup(true)}
                            className=" transition-opacity"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Floating Edit: Asset Group */}
                {isEditingGroup && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingGroup(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editAssetGroup")}
                      </Label>
                      <Select
                        value={editedGroup}
                        onValueChange={setEditedGroup}
                      >
                        <SelectTrigger className="mt-3 h-12">
                          <SelectValue
                            placeholder={t("assets.selectAssetGroupLabel")}
                          >
                            {editedGroup === "none"
                              ? "None"
                              : groups.find((g) => g._id === editedGroup)
                                  ?.name || t("assets.selectAssetGroupLabel")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="none">None</SelectItem> */}
                          {availableGroups.length == 0 && (
                            <SelectItem value="none" disabled>
                              {t("assets.assetsGroup")}
                            </SelectItem>
                          )}
                          {availableGroups
                            .filter((g) => g.belongTo === "assets")
                            .map((group) => (
                              <SelectItem key={group._id} value={group._id}>
                                {group.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedGroup(asset.assetGroup || "");
                            setIsEditingGroup(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveGroup}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand */}
                <div className="flex items-center justify-between group px-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-foreground">
                      {t("assets.brand")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                      {editedBrand || "N/A"}
                    </span>
                    {hasPermission("assets", "updateAssets") && (
                      <button
                        onClick={() => setIsEditingBrand(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Edit: Brand */}
                {isEditingBrand && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingBrand(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editBrand")}
                      </Label>
                      <Input
                        value={editedBrand}
                        onChange={(e) => setEditedBrand(e.target.value)}
                        autoFocus
                        className="mt-3 h-12 font-medium"
                        placeholder={t("assets.enterBrand")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveBrand();
                          if (e.key === "Escape") {
                            setEditedBrand(asset.brand || "");
                            setIsEditingBrand(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedBrand(asset.brand || "");
                            setIsEditingBrand(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveBrand}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Supplier */}
                <div className="flex items-center justify-between group px-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-foreground">
                      {t("assets.supplier")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                      {editedSupplier || "N/A"}
                    </span>
                    {hasPermission("assets", "updateAssets") && (
                      <button
                        onClick={() => setIsEditingSupplier(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Edit: Supplier */}
                {isEditingSupplier && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingSupplier(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editSupplier")}
                      </Label>
                      <Input
                        value={editedSupplier}
                        onChange={(e) => setEditedSupplier(e.target.value)}
                        autoFocus
                        className="mt-3 h-12 font-medium"
                        placeholder={t("assets.enterSupplier")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveSupplier();
                          if (e.key === "Escape") {
                            setEditedSupplier(asset.supplier || "");
                            setIsEditingSupplier(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedSupplier(asset.supplier || "");
                            setIsEditingSupplier(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveSupplier}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchase Date */}
                <div className="flex items-center justify-between group px-3 pb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-foreground">
                      {t("assets.purchaseDate")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      {editedPurchaseDate
                        ? format(editedPurchaseDate, "dd.MM.yyyy")
                        : "—"}
                    </span>
                    {hasPermission("assets", "updateAssets") && (
                      <button
                        onClick={() => setIsEditingPurchaseDate(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Edit: Purchase Date */}
                {isEditingPurchaseDate && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() =>
                        !isUpdating && setIsEditingPurchaseDate(false)
                      }
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editPurchaseDate")}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full mt-3 h-12 justify-start text-left font-normal",
                              !editedPurchaseDate && "text-muted-foreground",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {editedPurchaseDate
                              ? format(editedPurchaseDate, "dd.MM.yyyy")
                              : t("assets.pickDate")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CustomCalendar
                            selected={editedPurchaseDate}
                            onSelect={setEditedPurchaseDate}
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedPurchaseDate(
                              asset.purchase_date
                                ? new Date(asset.purchase_date)
                                : undefined,
                            );
                            setIsEditingPurchaseDate(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSavePurchaseDate}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="mx-6 group">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    {t("assets.additionalInformation")}
                  </Label>
                  {hasPermission("assets", "updateAssets") && (
                    <button
                      onClick={() => setIsEditingInfo(true)}
                      className=" transition-opacity"
                    >
                      <Edit
                        className="w-4 h-4 cursor-pointer"
                        color="#565E6CFF"
                      />
                    </button>
                  )}
                </div>
                <Textarea
                  className="mt-2 min-h-[100px]"
                  value={editedInfo}
                  readOnly
                  placeholder={t("assets.noAdditionalInfo")}
                />

                {/* Floating Edit: Info */}
                {isEditingInfo && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() => !isUpdating && setIsEditingInfo(false)}
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-sm font-medium">
                        {t("assets.editAdditionalInfo")}
                      </Label>
                      <Textarea
                        value={editedInfo}
                        onChange={(e) => setEditedInfo(e.target.value)}
                        autoFocus
                        className="mt-3 min-h-[200px] resize-none"
                        placeholder={t("assets.addNotesPlaceholder")}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditedInfo(asset.additional_information || "");
                            setIsEditingInfo(false);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-3 mt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedInfo(asset.additional_information || "");
                            setIsEditingInfo(false);
                          }}
                        >
                          {t("documents.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveInfo}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("assets.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Items — EXACT SAME AS SpaceDetailsModal */}
              <div className="bg-accent/50">
                <div className="space-y-1 pt-4 pb-4 mx-6">
                  {/* Linked documents */}
                  <button
                    onClick={() => {
                      setLinkedItemType("Linked documents");
                      setLinkedItemModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FDF5F1] w-8 h-8 rounded-md flex justify-center items-center">
                        <svg
                          className="w-5 h-5"
                          fill="#EA916EFF"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                      </div>
                      <span className="text-sm">
                        {t("assets.linkedDocuments")}
                      </span>

                      <CountBadge count={asset.attachments?.length} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Tasks */}
                  <button
                    onClick={() => {
                      setLinkedItemType("Tasks");
                      setLinkedItemModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F5F2FD] w-8 h-8 rounded-md flex justify-center items-center">
                        <svg
                          className="w-5 h-5"
                          fill="#636AE8FF"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5S5.5 6.83 5.5 6S4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5s1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                        </svg>
                      </div>
                      <span className="text-sm">{t("assets.tasks")}</span>

                      <CountBadge count={(asset as any).linkedTasks?.length} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* QR-Codes */}
                  <button
                    onClick={() => setIsQrCodesModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F8F9FA] w-8 h-8 rounded-md flex justify-center items-center">
                        <QrCode className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-foreground">
                        {t("assets.qrCodes")}
                      </span>

                      <CountBadge count={qrCodeCount} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </>
          {/* )} */}
        </DialogContent>
      </Dialog>

      {/* Delete Asset Modal */}
      {isDeleteModalOpen && (
        <DeleteAssetModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          asset={asset}
        />
      )}

      {/* Linked Space Modal */}
      {isEditingLinkedSpace && (
        <LinkedSpaceModal
          isOpen={isEditingLinkedSpace}
          onClose={() => setIsEditingLinkedSpace(false)}
          onSelect={handleSaveLinkedSpace}
          buildings={buildings}
          spaces={spaces}
          selectedBuildingId={asset.building_id?._id}
          alreadyLinkedSpaceId={asset.linked_space_id?._id}
          showAllBuildings
        />
      )}

      {/* Change Building/Location Modal */}
      {isEditingBuilding && (
        <LinkedSpaceModal
          isOpen={isEditingBuilding}
          onClose={() => setIsEditingBuilding(false)}
          onSelect={handleSelectSpace}
          buildings={buildings}
          spaces={spaces}
          selectedBuildingId={asset.building_id?._id}
          alreadyLinkedSpaceId={asset.linked_space_id?._id}
          showAllBuildings
        />
      )}

      {/* Linked Items Modal */}
      {linkedItemModalOpen && (
        <LinkedAssetItemModal
          isOpen={linkedItemModalOpen}
          onClose={() => setLinkedItemModalOpen(false)}
          onBack={() => {
            setLinkedItemModalOpen(false);
          }}
          title={linkedItemType}
          assetName={asset.name}
          asset={{
            ...asset,
            linkedTasks: (asset as any).linkedTasks || [],
          }}
        />
      )}

      {/* QR Codes Modal */}
      {isQrCodesModalOpen && (
        <LinkedQrCodesModal
          isOpen={isQrCodesModalOpen}
          onClose={() => setIsQrCodesModalOpen(false)}
          onBack={() => setIsQrCodesModalOpen(false)}
          itemId={asset._id}
          itemName={asset.name}
          itemType="asset"
          qrCodes={qrCodes}
        />
      )}

      {/* Image Viewer Modal */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{asset?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {asset?.asset_picture && (
              <img
                src={asset?.asset_picture}
                alt={asset?.name}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssetDetailsModal;
