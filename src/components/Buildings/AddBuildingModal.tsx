import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Plus, Trash2, UploadCloud } from "lucide-react";
import { RemainingQuotaBadge } from "@/components/Common/RemainingQuotaBadge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { apiService, endpoints } from "@/services/api";
import type { BuildingFormData } from "@/types";
import {
  useBuildingsQuery,
  useCurrentUserQuery,
  useOrganizationQuery,
  usePlansQuery,
} from "@/hooks/queries";
import { useMyIndividualPlansQuery } from "@/hooks/queries/useIndividualPlansQuery";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormError } from "@/components/ui/form-error";
import { useQueryClient } from "@tanstack/react-query";
import { validateFileSize } from "@/utils/fileValidation";

interface AreaForm {
  label: string;
}

interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBuildingModal({ isOpen, onClose }: AddBuildingModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { refreshData, isLoading: referenceDataLoading, refreshBuildings } = useReferenceData();
  const queryClient = useQueryClient();
  const { organization } = useOrganizationQuery();
  const { buildings = [], refetch: fetchBuildings } = useBuildingsQuery();
  const { data: currentUser } = useCurrentUserQuery();
  const { data: plans = [] } = usePlansQuery();

  const [areas, setAreas] = useState<AreaForm[]>([{ label: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errors, validateForm, clearError } = useFormValidation({
    label: { required: true, message: t("buildings.buildingNameLabel") },
    organization_id: { required: true, message: t("buildings.organization") },
    contactType: {
      required: true,
      message: "Contact type to field is required",
    },
    areas: { required: false, message: "Areas is required" },
    zipCode: { required: false, message: "Zip code is required" },
    address: { required: false, message: "Address is required" },
    photo: { required: false, message: "Please upload a document file" },
  });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const form = useForm<BuildingFormData>({
    defaultValues: {
      label: "",
      areas: [],
      organization_id: null,
      address: "",
      zipCode: "",
      city: "",
      requireContactDetails: false,
      contactType: "email",
      askForName: false,
      autoAccept: false,
    },
  });

  useEffect(() => {
    if (isOpen && currentUser?.Organization_id?._id) {
      form.setValue("organization_id", currentUser.Organization_id._id);
    }
  }, [currentUser, form, isOpen]);

  const handleAddArea = () => {
    setAreas([...areas, { label: "" }]);
  };

  const handleRemoveArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  const handleAreaChange = (index: number, value: string) => {
    const updated = [...areas];
    updated[index].label = value;
    setAreas(updated);
  };

  const handleCreate = async (data: BuildingFormData) => {
    if (isSubmitting) return;

    const currentPlan = plans.find((p) => p._id === organization?.currentPlan);
    if (currentPlan && currentPlan.maxBuildings) {
      const activeBuildings = buildings.filter((b) => !b.archived);
      const remaining = currentPlan.maxBuildings - activeBuildings.length;

      if (remaining <= 0) {
        toast({
          title: t("buildings.buildingLimitReached"),
          description: `Your ${currentPlan.name} plan allows a maximum of ${currentPlan.maxBuildings
            } building${currentPlan.maxBuildings > 1 ? "s" : ""
            }. Please upgrade your plan to add more buildings.`,
          variant: "destructive",
        });
        return;
      }

      if (remaining <= 3) {
        toast({
          title: t("buildings.buildingLimitNotice"),
          description: t("buildings.buildingsRemainingAfter")
            .replace("{remaining}", String(remaining - 1))
            .replace("{plan}", currentPlan.name),
        });
      }
    }

    if (!validateForm(data)) {
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
      return;
    }

    const filteredAreas = areas.filter((a) => a.label.trim() !== "");
    if (filteredAreas.length === 0) {
      toast({
        title: t("common.error"),
        description: t("buildings.pleaseAddOneArea"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("label", data.label);
      formData.append("address", data.address || "");
      formData.append("zipCode", data.zipCode || "");
      formData.append(
        "organization_id",
        currentUser?.Organization_id?._id || ""
      );
      formData.append("city", data.city || "");
      formData.append("createdBy", currentUser?._id || "");
      formData.append(
        "requireContactDetails",
        data.requireContactDetails ? "true" : "false"
      );
      formData.append("contactType", data.contactType || "email");
      formData.append("askForName", data.askForName ? "true" : "false");
      formData.append("autoAccept", data.autoAccept ? "true" : "false");

      const filteredAreasPayload = filteredAreas.map((a) => ({
        label: a.label.trim(),
      }));
      formData.append("areas", JSON.stringify(filteredAreasPayload));

      if (selectedPhotoFile) {
        formData.append("photo", selectedPhotoFile);
      }

      await apiService.post(endpoints.buildings, formData);
      onClose();
      await refreshData();
      toast({
        title: t("pages.building"),
        description: `${t("pages.building")} "${data.label}" ${t("buildings.createdSuccessfully")}`,
        variant: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ['paginatedBuildings'] });
      await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });

      form.reset();
      setAreas([{ label: "" }]);

    } catch (error) {
      console.error("Error creating building:", error);
      toast({
        title: t("common.error"),
        description: t("messages.error.failedToCreate"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        {/* HEADER */}
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t("buildings.createBuildingTitle")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t("buildings.close")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("buildings.createBuildingDesc")}
          </p>
          {(() => {
            const currentPlan = plans.find(
              (p) => p._id === organization?.currentPlan
            );
            const activeBuildings = buildings.filter((b) => !b.archived);
            return currentPlan?.maxBuildings ? (
              <RemainingQuotaBadge
                current={activeBuildings.length}
                max={currentPlan.maxBuildings}
                label={t("pages.building").toLowerCase()}
                className="mt-4"
              />
            ) : null;
          })()}
        </DialogHeader>

        {/* BODY - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="space-y-8"
            >
              {/* Building Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      {t("buildings.buildingNameLabel")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.enterBuildingLabel")}
                        className="h-11 text-sm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          clearError("label");
                        }}
                      />
                    </FormControl>
                    <FormError error={errors.label} />
                  </FormItem>
                )}
              />

              {/* Organization */}
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      {t("buildings.organization")}<span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        clearError("organization_id");
                      }}
                      disabled={true}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue
                            placeholder={
                              referenceDataLoading
                                ? t("messages.loading.loadingOrganizations")
                                : t("fields.selectOrganization")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {referenceDataLoading ? (
                          <SelectItem value="loading" disabled>
                            {t("common.loading")}
                          </SelectItem>
                        ) : organization ? (
                          <SelectItem
                            key={organization._id}
                            value={organization._id}
                          >
                            <span className="font-medium">
                              {organization?.name}
                            </span>
                          </SelectItem>
                        ) : (
                          <SelectItem
                            className="italic"
                            value="no-data"
                            disabled
                          >
                            {t("placeholders.noOrganizationsFound")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormError error={errors.organization_id} />
                  </FormItem>
                )}
              />

              {/* Photo Upload */}
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm font-medium">
                      {t("buildings.buildingPhoto")}{" "}
                      <span className="text-muted-foreground text-sm">
                        ({t("buildings.optional")})
                      </span>
                    </FormLabel>

                    {(selectedPhotoFile || field.value) && (
                      <div className="flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={
                                selectedPhotoFile
                                  ? URL.createObjectURL(selectedPhotoFile)
                                  : field.value
                              }
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{t("buildings.buildingPhoto")}</p>
                            <p className="text-sm text-muted-foreground">
                              IMAGE
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => {
                            setSelectedPhotoFile(null);
                            field.onChange("");
                          }}
                        >
                          <X className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    )}

                    <div className="relative">
                      <FormControl>
                        <div
                          onClick={handleClickUploadArea}
                          className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <UploadCloud size={54} color="#636AE8FF" />
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClickUploadArea();
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                            >
                              {t("buildings.browseFiles")}
                            </Button>
                          </div>
                        </div>
                      </FormControl>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!validateFileSize(file, t)) {
                              e.target.value = "";
                              return;
                            }
                            setSelectedPhotoFile(file);
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Areas */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("buildings.areasLabel")}<span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("buildings.defineAreas")}
                </p>
                <div className="space-y-3">
                  {areas.map((area, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder={t("buildings.areaPlaceholder").replace("{index}", String(index + 1))}
                        value={area.label}
                        onChange={(e) =>
                          handleAreaChange(index, e.target.value)
                        }
                        className="h-11"
                      />
                      {areas.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveArea(index)}
                          className="h-11 w-11 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleAddArea}
                    className="w-full gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    {t("fields.addArea")}
                  </Button>
                </div>
                <FormError error={errors.areas} />
              </div>
            </form>
          </Form>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {t("buildings.cancel")}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              onClick={form.handleSubmit(handleCreate)}
              className="min-w-36 font-medium"
            >
              {isSubmitting
                ? t("messages.loading.creating")
                : t("buildings.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
