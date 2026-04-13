import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, LayoutGrid, Tag, X } from "lucide-react";
import axios from "axios";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { apiUrl } from "@/services/api";
import { useBuilding } from "@/contexts/BuildingContext";
import QrGenerateModal from "@/components/QrCodeGroup/QrGenerateModal";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormError } from "@/components/ui/form-error";
import { useGroupsQuery } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spaceData: any) => void;
  onSuccess?: () => void;
}

const CreateSpaceModal = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
}: CreateSpaceModalProps) => {
  const { selectedBuilding } = useBuilding();
  const { buildings, refreshSpaces } = useReferenceData();
  const { t } = useLanguage();
  const { data: groups = [], isLoading: isLoadingGroups } = useGroupsQuery();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    building_id: selectedBuilding?._id || null,
    area_id: null,
    spaceGroup: null,
    additionalInformation: "",
  });

  React.useEffect(() => {
    if (selectedBuilding) {
      setFormData((prev) => ({
        ...prev,
        building_id: selectedBuilding._id,
        area_id: null,
      }));
    }
  }, [selectedBuilding]);
  const [isLoading, setIsLoading] = useState(false);

  const { errors, validateForm, clearError } = useFormValidation({
    name: { required: true, message: t("spaces.spaceName") },
    building_id: { required: true, message: t("spaces.building") },
    area_id: { required: true, message: t("spaces.area") },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm(formData)) {
      toast({
        title: t("issues.missingRequiredFields"),
        description: t("issues.fillIn"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        building_id: formData.building_id,
        area_id: formData.area_id || null,
        spaceGroup: formData.spaceGroup || null,
        additionalInformation: formData.additionalInformation || null,
      };

      const token = JSON.parse(localStorage.getItem("userInfo"))?.accessToken;
      const response = await axios.post(`${apiUrl}/space`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      onClose();
      onSuccess?.();
      toast({
        title: t("spaces.title"),
        description: t("messages.success.spaceCreated"),
        variant: "success",
      });

      setFormData({
        name: "",
        building_id: null,
        area_id: null,
        spaceGroup: null,
        additionalInformation: "",
      });

      onSubmit(response.data);
    } catch (error: any) {
      console.error("Error creating space:", error);
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("common.error"),
        variant: "destructive",
      });
    } finally {
      await refreshSpaces();
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-6 border-b bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t("spaces.createNewSpace")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t("spaces.close")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("spaces.createNewSpaceDesc")}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("spaces.spaceName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t("spaces.spaceNamePlaceholder")}
                className="h-11 text-sm"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearError("name");
                }}
              />
              <FormError error={errors.name} />
            </div>

            {/* Building */}
            <div className="space-y-2">
              <Label htmlFor="building" className="text-sm font-medium">
                {t("spaces.building")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.building_id || ""}
                onValueChange={(value) => {
                  setFormData({ ...formData, building_id: value, area_id: null });
                  clearError("building_id");
                }}
                disabled={!!selectedBuilding}
              >
                <SelectTrigger className="h-11">
                  <div className="flex items-center gap-3 capitalize">
                    <Building className="h-4.5 w-4.5 text-muted-foreground" />
                    <SelectValue placeholder={t("spaces.selectBuilding")} className="capitalize" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {selectedBuilding ? (
                    <SelectItem value={selectedBuilding._id}>
                      <span className="font-medium capitalize">{selectedBuilding.label}</span>
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
                      <span className="italic text-muted-foreground">{t("spaces.noBuildingsAvailable")}</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormError error={errors.building_id} />
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium">
                {t("spaces.area")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.area_id || ""}
                onValueChange={(value) => setFormData({ ...formData, area_id: value })}
                disabled={!formData.building_id}
              >
                <SelectTrigger className="h-11">
                  <div className="flex items-center gap-3 capitalize">
                    <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground" />
                    <SelectValue placeholder={t("spaces.selectArea")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {formData.building_id &&
                    buildings
                      .find((b) => b._id === formData.building_id)
                      ?.areas?.map((area) => (
                        <SelectItem key={area._id} value={area._id} className="capitalize">
                          {area.label}
                        </SelectItem>
                      ))}
                  {!formData.building_id && (
                    <SelectItem value="none" disabled>
                      <span className="italic text-muted-foreground">{t("spaces.selectBuildingFirst")}</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormError error={errors.area_id} />
            </div>

            {/* Space Group */}
            <div className="space-y-2">
              <Label htmlFor="spaceGroup" className="text-sm font-medium">
                {t("spaces.spaceGroup")}{" "}
                <span className="text-muted-foreground text-sm">({t("spaces.optional")})</span>
              </Label>
              <Select
                value={formData.spaceGroup || ""}
                onValueChange={(value) => setFormData({ ...formData, spaceGroup: value || null })}
              >
                <SelectTrigger className="h-11">
                  <div className="flex items-center gap-3 capitalize">
                    <Tag className="h-4.5 w-4.5 text-muted-foreground" />
                    <SelectValue placeholder={t("spaces.selectSpaceGroup")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {isLoadingGroups ? (
                    <SelectItem value="" disabled>{t("spaces.loadingGroups")}</SelectItem>
                  ) : groups?.filter((g) => g.belongTo === "spaces").length > 0 ? (
                    groups
                      .filter((g) => g.belongTo === "spaces")
                      .map((group) => (
                        <SelectItem key={group._id} value={group._id} className="capitalize">
                          {group.name}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="none" disabled>
                      <span className="italic text-muted-foreground">{t("spaces.noSpaceGroupsAvailable")}</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInformation" className="text-sm font-medium">
                {t("spaces.additionalInformation")}{" "}
                <span className="text-muted-foreground text-sm">({t("spaces.optional")})</span>
              </Label>
              <Textarea
                id="additionalInformation"
                placeholder={t("spaces.additionalInfoPlaceholder")}
                className="min-h-32 resize-none text-sm"
                value={formData.additionalInformation}
                onChange={(e) => setFormData({ ...formData, additionalInformation: e.target.value })}
              />
            </div>
          </form>
        </div>

        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" size="lg" onClick={onClose} className="min-w-32">
              {t("spaces.cancel")}
            </Button>
            <Button type="submit" size="lg" disabled={isLoading} onClick={handleSubmit} className="min-w-32 font-medium">
              {isLoading ? t("spaces.creating") : t("spaces.createSpace")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSpaceModal;
