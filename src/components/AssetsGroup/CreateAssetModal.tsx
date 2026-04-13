import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  CalendarIcon,
  Building,
  UploadCloud,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import LinkedSpaceModal from "./LinkedSpaceModalProps";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { toast } from "@/hooks/use-toast";
import { Asset } from "@/types";
import { useBuilding } from "@/contexts/BuildingContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormError } from "@/components/ui/form-error";
import { TaskDatePicker } from "../TasksGroup/TaskDatePicker";
import { RemainingQuotaBadge } from "@/components/Common/RemainingQuotaBadge";
import {
  useGroupsQuery,
  useOrganizationQuery,
  usePlansQuery,
} from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  assets?: Asset;
}

const CreateAssetModal = ({ isOpen, onClose, onSuccess }: CreateAssetModalProps) => {
  const { t } = useLanguage();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { selectedBuilding } = useBuilding();
  const [date, setDate] = useState<Date>();
  const [isLinkedSpaceModalOpen, setIsLinkedSpaceModalOpen] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<any>(null);
  const { spaces, buildings, categories, assets, refreshData, refreshAssets, refreshCategories } =
    useReferenceData();
  const { data: groups = [], isLoading: isLoadingGroups } = useGroupsQuery();
  const { organization } = useOrganizationQuery();
   const queryClient = useQueryClient();
  const { data: plans = [] } = usePlansQuery();

  const { errors, validateForm, clearError } = useFormValidation({
    name: { required: true, message: t("assets.assetName") + " " + t("assets.required") },
    building_id: { required: true, message: t("assets.building") + " " + t("assets.required") },
    linked_space_id: { required: true, message: t("assets.linkedSpace") + " " + t("assets.required") },
    purchaseDate: { required: false, message: t("assets.purchaseDate") + " " + t("assets.required") },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    building_id: selectedBuilding?._id || "",
    linked_space_id: "",
    category_id: null,
    assetGroup: null,
    id_number: "",
    brand: "",
    supplier: "",
    purchase_date: undefined as Date | undefined,
    additional_information: "",
  });

  // Auto-select building when sidebar selection changes
  useEffect(() => {
    if (selectedBuilding) {
      setFormData((prev) => ({
        ...prev,
        building_id: selectedBuilding._id,
        linked_space_id: "",
      }));
    }
  }, [selectedBuilding]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("assets.title"),
          description: t("assets.failedCreateAsset"),
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: t("fileUpload.fileTooLarge"),
          description: `"${file.name}" exceeds the maximum file size of ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    event.target.value = "";
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };
  const handleSelectLinkedSpace = (spaceId: string) => {
    setFormData((prev) => ({ ...prev, linked_space_id: spaceId }));
    setIsLinkedSpaceModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!validateForm(formData)) {
      toast({
        title: t("assets.missingRequiredFields"),
        description: t("assets.fillRequiredFields"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check asset limit based on current plan
   /*  const currentPlan = plans.find((p) => p._id === organization?.currentPlan);
    if (currentPlan && currentPlan.maxAssets) {
      const activeAssets = assets?.filter((a) => !a.archived) || [];
      const remaining = currentPlan.maxAssets - activeAssets.length;

      if (remaining <= 0) {
        toast({
          title: "Asset Limit Reached",
          description: `Your ${currentPlan.name} plan allows a maximum of ${currentPlan.maxAssets} assets. Please upgrade your plan to add more assets.`,
          variant: "destructive",
        });
        return;
      }

      // Notify user how many assets they can still create
      if (remaining <= 10) {
        toast({
          title: "Asset Limit Notice",
          description: `You have ${remaining - 1} asset${
            remaining - 1 !== 1 ? "s" : ""
          } remaining after this one on your ${currentPlan.name} plan.`,
        });
      }
    } */

    try {
      setIsLoading(true);
      const token = JSON.parse(localStorage.getItem("userInfo"))?.accessToken;

      // Use FormData to support file upload
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("building_id", formData.building_id);
      formPayload.append("linked_space_id", formData.linked_space_id);
      if (formData.category_id)
        formPayload.append("category_id", formData.category_id);
      if (formData.assetGroup)
        formPayload.append("assetGroup", formData.assetGroup);
      if (formData.id_number)
        formPayload.append("id_number", formData.id_number);
      if (formData.brand) formPayload.append("brand", formData.brand);
      if (formData.supplier) formPayload.append("supplier", formData.supplier);
      if (formData.purchase_date)
        formPayload.append(
          "purchase_date",
          new Date(formData.purchase_date).toISOString()
        );
      if (formData.additional_information)
        formPayload.append(
          "additional_information",
          formData.additional_information
        );
      if (imageFile) formPayload.append("asset_picture", imageFile);

      const response = await axios.post(`${apiUrl}/asset`, formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCreatedAsset(response.data);
      
      // Clean up all state including image preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        name: "",
        building_id: selectedBuilding?._id || "",
        linked_space_id: "",
        category_id: null,
        assetGroup: null,
        id_number: "",
        brand: "",
        supplier: "",
        purchase_date: undefined,
        additional_information: "",
      });
      setDate(undefined);
    } catch (error: any) {
      toast({
        title: t("assets.title"),
        description: `${error.response?.data?.message || t("assets.failedCreateAsset")}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onClose();
      onSuccess?.();
      toast({
        title: t("assets.title"),
        description: t("assets.assetCreatedSuccess"),
        variant: "success",
      });
      await refreshAssets();
      await refreshCategories();
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
    }
  };
  
  const availableCategories = categories.filter((cat) =>
    cat.buildingIds.some((b) => b._id === formData.building_id)
);

return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xl max-h-[92dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
          {/* HEADER - Professional and informative */}
          <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {t("assets.createNewAsset")}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("assets.createNewAssetDesc")}
            </p>
            {/* {(() => {
              const currentPlan = plans.find(
                (p) => p._id === organization?.currentPlan
              );
              const activeAssets = assets?.filter((a) => !a.archived) || [];
              return currentPlan?.maxAssets ? (
                <RemainingQuotaBadge
                  current={activeAssets.length}
                  max={currentPlan.maxAssets}
                  label="assets"
                  className="mt-4"
                />
              ) : null;
            })()} */}
          </DialogHeader>

          {/* SCROLLABLE BODY - Clean and spacious form */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("assets.assetName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder={t("assets.assetNamePlaceholder")}
                  className="h-11 text-sm"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                    clearError("name");
                  }}
                />
                <FormError error={errors.name} />
              </div>

              {/* Building */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("assets.building")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.building_id}
                  onValueChange={(val) => {
                    handleChange("building_id", val);
                    handleChange("linked_space_id", "");
                    clearError("building_id");
                  }}
                  disabled={!!selectedBuilding}
                >
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-3 capitalize">
                      <Building className="h-4.5 w-4.5 text-muted-foreground" />
                      <SelectValue placeholder={t("assets.selectBuilding")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBuilding ? (
                      <SelectItem value={selectedBuilding._id}>
                        <span className="font-medium capitalize">
                          {selectedBuilding.label}
                        </span>
                      </SelectItem>
                    ) : buildings.length > 0 ? (
                      buildings
                        .filter((building) => !building.archived)
                        .map((building) => (
                          <SelectItem key={building._id} value={building._id} className="capitalize">
                            {building.label}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="none" disabled>
                        <span className="italic text-muted-foreground">
                          {t("assets.noBuildingsAvailable")}
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormError error={errors.building_id} />
              </div>

              {/* Linked Space */}
              <div className="space-y-2 ">
                <Label className="text-sm font-medium">
                  {t("assets.linkedSpace")} <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-11"
                  onClick={() => setIsLinkedSpaceModalOpen(true)}
                  disabled={!formData.building_id}
                >
                  <Building className="w-4.5 h-4.5 mr-3 text-muted-foreground" />
                  {formData.linked_space_id
                    ? spaces.find((s) => s._id === formData.linked_space_id)
                        ?.name || t("assets.selectedSpace")
                    : t("assets.selectSpaceToLink")}
                </Button>
                <FormError error={errors.linked_space_id} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("assets.categoryOptional")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("assets.optional")})
                  </span>
                </Label>
                <Select
                  value={formData.category_id || undefined}
                  onValueChange={(val) => handleChange("category_id", val)}
                  disabled={
                    !formData.building_id || availableCategories.length === 0
                  }
                >
                  <SelectTrigger className="h-11 capitalize">
                    <SelectValue
                      placeholder={
                        !formData.building_id
                          ? t("assets.selectBuildingFirst")
                          : availableCategories.length === 0
                          ? t("assets.noCategoriesAvailable")
                          : t("assets.selectCategory")
                      }
                      className="capitalize"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id} className="capitalize">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError error={errors.category} />
              </div>

              {/* Asset Group */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("assets.assetGroup")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("assets.optional")})
                  </span>
                </Label>
                <Select
                  value={formData.assetGroup}
                  onValueChange={(val) => handleChange("assetGroup", val)}
                  disabled={isLoadingGroups}
                >
                  <SelectTrigger className="h-11 capitalize">
                    <SelectValue
                      placeholder={
                        isLoadingGroups
                          ? t("assets.loadingGroups")
                          : t("assets.selectAssetGroup")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.filter((g) => g.belongTo === "assets").length >
                    0 ? (
                      groups
                        .filter((g) => g.belongTo === "assets")
                        .map((group) => (
                          <SelectItem key={group._id} value={group._id} className="capitalize">
                            {group.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="none" disabled>
                        <span className="italic text-muted-foreground">
                          {t("assets.noAssetGroupsAvailable")}
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* ID Number, Brand, Supplier - Grouped in a grid for better flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("assets.idNumber")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("assets.optional")})
                    </span>
                  </Label>
                  <Input
                    placeholder={t("assets.idNumberPlaceholder")}
                    className="h-11"
                    value={formData.id_number}
                    onChange={(e) => handleChange("id_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("assets.brand")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("assets.optional")})
                    </span>
                  </Label>
                  <Input
                    placeholder={t("assets.brandPlaceholder")}
                    className="h-11"
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">
                    {t("assets.supplier")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("assets.optional")})
                    </span>
                  </Label>
                  <Input
                    placeholder={t("assets.supplierPlaceholder")}
                    className="h-11"
                    value={formData.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                  />
                </div>
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{t("assets.purchaseDate")}</Label>
                  {formData.purchase_date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          purchase_date: undefined,
                        }));
                        clearError("purchase_date");
                      }}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      {t("assets.clear")}
                    </Button>
                  )}
                </div>
                <TaskDatePicker
                  label=""
                  value={formData.purchase_date}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, purchase_date: date }));
                    clearError("purchase_date");
                  }}
                  placeholder={t("assets.selectPurchaseDate")}
                />
                <FormError error={errors.purchaseDate} />
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("assets.additionalInformation")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("assets.optional")})
                  </span>
                </Label>
                <Textarea
                  placeholder={t("assets.additionalInfoPlaceholder")}
                  className="min-h-32 resize-none text-sm"
                  value={formData.additional_information}
                  onChange={(e) =>
                    handleChange("additional_information", e.target.value)
                  }
                />
              </div>

              {/* Asset Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("assets.assetImage")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("assets.optional")})
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("assets.assetImageDesc")}
                </p>

                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border bg-muted">
                    <img
                      src={imagePreview}
                      alt="Asset preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 shadow-lg"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="block w-full rounded-xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-8 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ImageIcon className="h-10 w-10 text-[#636AE8FF]" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          {t("assets.clickToUpload")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("assets.fileTypeHint")}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>
            </form>
          </div>

          {/* FOOTER - Prominent and clean */}
          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
                className="min-w-32"
              >
                {t("assets.cancel")}
              </Button>
              <Button
                type="submit"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-36 font-medium"
              >
                {isLoading ? t("assets.creating") : t("assets.createAssetBtn")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Linked Space Modal */}
      <LinkedSpaceModal
        isOpen={isLinkedSpaceModalOpen}
        onClose={() => setIsLinkedSpaceModalOpen(false)}
        onSelect={handleSelectLinkedSpace}
        buildings={buildings}
        spaces={spaces}
        selectedBuildingId={formData.building_id} // pass selected building
      />
    </>
  );
};

export default CreateAssetModal;
