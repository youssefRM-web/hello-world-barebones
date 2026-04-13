import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Building, Link } from "lucide-react";
import { AddDocumentLinkPanel } from "./AddDocumentLinkPanel";
import { DocumentFormFields } from "./DocumentFormFields";
import { DocumentVisibilitySelect } from "./DocumentVisibilitySelect";
import { DocumentDatePickers } from "./DocumentDatePickers";
import { DocumentFormActions } from "./DocumentFormActions";
import { useCreateDocumentMutation } from "@/hooks/mutations";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormError } from "@/components/ui/form-error";
import {
  UploadCloud,
  FileText,
  Trash,
  Video,
  Play,
  Download,
} from "lucide-react";
import pdfIcon from "./assets/pdfIcon.png";
import docxIcon from "./assets/docxIcon.png";
import xlsxIcon from "./assets/xlsx.png";
import imageIcon from "./assets/imgIcon.png";
import {
  Dialog as VideoDialog,
  DialogContent as VideoDialogContent,
  DialogHeader as VideoDialogHeader,
  DialogTitle as VideoDialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";

interface AddDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDocument?: (documentData: any) => void;
  onSuccess?: () => void;
}

export function AddDocumentModal({
  open,
  onOpenChange,
  onAddDocument,
  onSuccess,
}: AddDocumentModalProps) {
  const { buildings, refreshData, refreshSpaces, refreshAssets } =
    useReferenceData();
  const { selectedBuildingId } = useBuildingSelection();
  const { t } = useLanguage();

  // Check if a specific building is selected in sidebar (not "all")
  const isBuildingPreSelected =
    selectedBuildingId && selectedBuildingId !== "all";

  const [formData, setFormData] = useState({
    name: "",
    linkedTo: [] as string[],
    linkedToDisplay: "",
    expirationDate: undefined as Date | undefined,
    notificationDate: undefined as Date | undefined,
    visibility: "private",
    additionalInformation: "",
    fileUrls: [] as string[],
    files: [] as File[],
    fileNames: [] as string[],
    buildingId: isBuildingPreSelected
      ? selectedBuildingId
      : (null as string | null),
  });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkedItemName, setLinkedItemName] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // File type icon helper
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return (
          <img
            src={pdfIcon}
            alt="PDF"
            className="w-full h-full object-contain"
          />
        );
      case "doc":
      case "docx":
        return (
          <img
            src={docxIcon}
            alt="DOCX"
            className="w-full h-full object-contain"
          />
        );
      case "xls":
      case "xlsx":
        return (
          <img
            src={xlsxIcon}
            alt="XLSX"
            className="w-full h-full object-contain"
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return (
          <img
            src={imageIcon}
            alt="Image"
            className="w-full h-full object-contain"
          />
        );
      case "mp4":
        return <Video className="w-6 h-6 text-primary" />;
      default:
        return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const isVideoFile = (fileName: string) =>
    fileName.toLowerCase().endsWith(".mp4");

  const createDocumentMutation = useCreateDocumentMutation();

  // Filter non-archived buildings
  const availableBuildings = buildings.filter((b) => !b.archived);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (open) {
      // When opening, set the building if pre-selected from sidebar
      setFormData({
        name: "",
        linkedTo: [],
        linkedToDisplay: "",
        expirationDate: undefined,
        notificationDate: undefined,
        visibility: "private",
        additionalInformation: "",
        fileUrls: [],
        files: [],
        fileNames: [],
        buildingId: isBuildingPreSelected ? selectedBuildingId : null,
      });
      setLinkedItemName("");
      setIsLinkModalOpen(false);
    }
  }, [open, selectedBuildingId, isBuildingPreSelected]);

  const { errors, validateForm, clearError } = useFormValidation({
    name: { required: true, message: t("documents.documentNameRequired") },
    buildingId: { required: true, message: t("documents.buildingRequired") },
    linkedToDisplay: { required: true, message: t("documents.linkedToRequired") },
    visibility: { required: true, message: t("documents.visibilityRequired") },
    fileUrls: { required: true, message: t("documents.fileRequired") },
  });

  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      toast.error(t("documents.missingRequiredFields"), {
        description: t("documents.fillRequiredFields"),
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const documentData = {
        name: formData.name,
        linkedTo: formData.linkedTo,
        visibility: formData.visibility,
        additionalInformation: formData.additionalInformation,
        expirationDate: formData.expirationDate,
        notificationDate: formData.notificationDate,
        file: formData.files[0],
        buildingId: formData.buildingId,
      };

      const result = await createDocumentMutation.mutateAsync(documentData);

      if (onAddDocument) {
        onAddDocument(result);
      }

      // Refresh data to update linked spaces/assets attachments
      await Promise.all([refreshData(), refreshSpaces(), refreshAssets()]);

      toast.success(t("documents.title"), {
        description: t("documents.documentUploaded"),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error(t("common.error"), error);
      toast.error(t("documents.operationFailed"), {
        description: t("documents.somethingWentWrong"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (files && files.length > 0) {
      const file = files[0];

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(t("documents.fileTooLarge"), {
          description: `"${file.name}" ${t("documents.fileTooLargeDesc").replace("{name}", file.name).replace("{size}", String(MAX_FILE_SIZE_MB))}`,
        });
        event.target.value = "";
        return;
      }

      if (formData.fileNames.includes(file.name)) {
        toast.error(t("documents.fileAlreadyUploaded"), {
          description: `"${file.name}" ${t("documents.fileAlreadyUploadedDesc").replace("{name}", file.name)}`,
        });
        return;
      }

      const fileUrl = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, file],
        fileUrls: [...prev.fileUrls, fileUrl],
        fileNames: [...prev.fileNames, file.name],
        name: prev.name || file.name.split(".").slice(0, -1).join("."),
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      fileUrls: prev.fileUrls.filter((_, i) => i !== index),
      fileNames: prev.fileNames.filter((_, i) => i !== index),
    }));
  };

  const handleLinkApply = (
    links: { id: string; name: string; type: string }[],
  ) => {
    const ids = links.map((link) => link.id);
    const names = links.map((link) => link.name).join(", ");

    setFormData((prev) => ({
      ...prev,
      linkedTo: ids,
      linkedToDisplay: names || `${links.length} items linked`,
    }));
    setLinkedItemName(names);
    setIsLinkModalOpen(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVisibilityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, visibility: value }));
  };

  const handleExpirationDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, expirationDate: date }));
  };

  const handleNotificationDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, notificationDate: date }));
  };

  const handleBuildingChange = (buildingId: string) => {
    // Reset linked items when building changes
    setFormData((prev) => ({
      ...prev,
      buildingId,
      linkedTo: [],
      linkedToDisplay: "",
    }));
    setLinkedItemName("");
    clearError("buildingId");
  };

  const handleOpenLinkModal = () => {
    setIsLinkModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-xl max-h-[90dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking inside AddDocumentLinkPanel
            if (isLinkModalOpen) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Prevent closing when interacting with AddDocumentLinkPanel
            if (isLinkModalOpen) {
              e.preventDefault();
            }
          }}
        >
          {/* HEADER */}
          <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {t("documents.uploadDocument")}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("documents.uploadDocumentDesc")}
            </p>
          </DialogHeader>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="space-y-6">
              <DocumentFormFields
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                clearError={clearError}
              />
              {/* Building Select */}
              <div className="space-y-2 first-letter:uppercase">
                <Label className="text-sm font-medium">
                  {t("documents.buildingLabel")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.buildingId || ""}
                  onValueChange={handleBuildingChange}
                  disabled={isBuildingPreSelected}
                >
                  <SelectTrigger className="h-11 max-w-md ">
                    <div className="flex items-center gap-3">
                      <Building className="h-4.5 w-4.5 text-muted-foreground" />
                      <SelectValue placeholder={t("documents.selectBuilding")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuildings.map((building) => (
                      <SelectItem key={building._id} value={building._id} >
                        <span className="capitalize">{building.label}</span>
                      </SelectItem>
                    ))}
                    {availableBuildings.length === 0 && (
                      <SelectItem value="none" disabled>
                        <span className="italic text-muted-foreground">
                          {t("documents.noBuildingsAvailable")}
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormError error={errors.buildingId} />
              </div>

              {/* Linked to */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("documents.linkedToLabel")} <span className="text-destructive">*</span>
                </Label>
                <Button
                  variant="outline"
                  onClick={handleOpenLinkModal}
                  className="w-full max-w-md justify-start text-left font-normal h-11"
                  disabled={!formData.buildingId}
                >
                  <div className="flex items-center gap-3">
                    <Link className="h-4.5 w-4.5 text-muted-foreground" />
                    <span
                      className={
                        !formData.buildingId
                          ? "text-muted-foreground first-letter:uppercase"
                          : "text-foreground first-letter:uppercase"
                      }
                    >
                      {!formData.buildingId
                        ? t("documents.selectBuildingFirst")
                        : linkedItemName || t("documents.chooseSpaceOrAsset")}
                    </span>
                  </div>
                </Button>
                <FormError error={errors.linkedToDisplay} />
              </div>

              <DocumentDatePickers
                expirationDate={formData.expirationDate}
                notificationDate={formData.notificationDate}
                onExpirationDateChange={handleExpirationDateChange}
                onNotificationDateChange={handleNotificationDateChange}
                errors={errors}
                clearError={clearError}
              />

              <DocumentVisibilitySelect
                value={formData.visibility}
                onChange={handleVisibilityChange}
                errors={errors}
                clearError={clearError}
              />

              {/* File Upload - Clickable Area */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  {t("documents.fileUpload")} <span className="text-destructive">*</span>
                </Label>

                {/* Uploaded Files List */}
                {formData.fileUrls.length > 0 && (
                  <div className="space-y-3">
                    {formData.fileUrls.map((file, index) => {
                      const fileName =
                        formData.fileNames[index] || `Document ${index + 1}`;
                      const isVideo = isVideoFile(fileName);
                      return (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <div className="w-8 h-8 flex items-center justify-center">
                                  {getFileIcon(fileName)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {fileName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {fileName.split(".").pop()?.toUpperCase() ||
                                    "FILE"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isVideo && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setVideoPreview(file)}
                                    className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                    title="Play video"
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = file;
                                      link.download = fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                    title="Download video"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFile(index)}
                                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {isVideo && (
                            <div className="rounded-lg overflow-hidden border bg-muted">
                              <video
                                src={file}
                                className="w-full max-h-48 object-contain bg-black"
                                muted
                                preload="metadata"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dashed Upload Area - whole area is clickable */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadCloud size={54} color="#636AE8FF" />
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      {t("documents.browseFiles")}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {t("documents.supportsFiles")}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      clearError("fileUrls");
                      handleFileUpload(e);
                    }}
                    className="hidden"
                    accept="video/*, image/*, .pdf"
                  />
                </div>
                <FormError error={errors.fileUrls} />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="min-w-32"
              >
                {t("documents.cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createDocumentMutation.isPending}
                size="lg"
                className="min-w-36 font-medium"
              >
                {createDocumentMutation.isPending
                  ? t("documents.uploading")
                  : t("documents.saveDocument")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddDocumentLinkPanel
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onApplyLinks={handleLinkApply}
        buildingId={formData.buildingId}
      />
    </>
  );
}
