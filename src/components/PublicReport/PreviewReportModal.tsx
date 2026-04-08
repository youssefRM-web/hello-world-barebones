import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  X,
  Loader2,
  Trash2,
  UploadCloud,
  Play,
  FileText,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, apiService, endpoints } from "@/services/api";
import { TermsModal } from "@/components/modals/TermsModal";
import { PrivacyModal } from "@/components/modals/PrivacyModal";
import { LanguageSelector } from "@/components/Common/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface BuildingSettings {
  requireContactDetails?: boolean;
  askForName?: boolean;
  contactType?: string;
}

interface LinkedAttachment {
  _id: string;
  name: string;
  url: string;
  visibility: string;
  createdAt: string;
}

interface PublicReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkedToType: "space" | "asset";
  linkedToId: string;
  organizationId: string;
  buildingId?: string;
  name?: string;
  previewMode?: boolean;
  previewSettings?: BuildingSettings;
}

export function PreviewReportModal({
  open,
  onOpenChange,
  linkedToType,
  linkedToId,
  organizationId,
  buildingId,
  name,
  previewMode = false,
  previewSettings,
}: PublicReportModalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [buildingSettings, setBuildingSettings] =
    useState<BuildingSettings | null>(null);

  const [formData, setFormData] = useState({
    issue_summary: "",
    additional_info: "",
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    organizationId: organizationId,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [linkedAttachments, setLinkedAttachments] = useState<
    LinkedAttachment[]
  >([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  // Fetch building settings for contact requirements (or use preview settings)
  useEffect(() => {
    // In preview mode, use the provided settings directly
    if (previewMode && previewSettings) {
      setBuildingSettings(previewSettings);
      return;
    }

    const fetchBuildingSettings = async () => {
      if (!buildingId) return;
      try {
        const response = await apiService.get(
          `${endpoints.buildings}/${buildingId}`,
        );
        const building = response.data as BuildingSettings;
        setBuildingSettings({
          requireContactDetails: building.requireContactDetails ?? false,
          askForName: building.askForName ?? false,
          contactType: building.contactType ?? "email",
        });
      } catch (error) {
        console.error("Error fetching building settings:", error);
      }
    };

    if (open && buildingId && !previewMode) {
      fetchBuildingSettings();
    }
  }, [open, buildingId, previewMode, previewSettings]);

  // Fetch linked attachments for the space or asset
  useEffect(() => {
    const fetchLinkedAttachments = async () => {
      if (!linkedToId || !linkedToType || previewMode) return;

      setLoadingAttachments(true);
      try {
        const endpoint =
          linkedToType === "space"
            ? `${endpoints.spaces}/${linkedToId}?org=${organizationId}`
            : `${endpoints.assets}/${linkedToId}?org=${organizationId}`;

        const response = await apiService.get(endpoint);
        const data = response.data as { attachments?: LinkedAttachment[] };

        // Filter only public attachments
        const publicAttachments = (data.attachments || []).filter(
          (attachment) => attachment.visibility === "public",
        );
        setLinkedAttachments(publicAttachments);
      } catch (error) {
        console.error("Error fetching linked attachments:", error);
        setLinkedAttachments([]);
      } finally {
        setLoadingAttachments(false);
      }
    };

    if (open && linkedToId) {
      fetchLinkedAttachments();
    }
  }, [open, linkedToId, linkedToType, organizationId, previewMode]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (files) {
      const newFiles = Array.from(files);

      newFiles.forEach((file) => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: t("common.error"),
            description: `"${file.name}" exceeds the maximum file size of ${MAX_FILE_SIZE_MB}MB.`,
            variant: "destructive",
          });
          return;
        }

        setAttachments((prev) => [...prev, file]);

        // Create preview URLs for images and videos
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          const url = URL.createObjectURL(file);
          setPreviewUrls((prev) => [...prev, url]);
        } else {
          setPreviewUrls((prev) => [...prev, ""]);
        }
      });
    }
    // Reset input value to allow re-adding same file
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    // Revoke the URL to free memory
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.issue_summary.trim()) {
      toast({
        title: t("common.error"),
        description:
          t("publicReport.issueSummary") +
          " " +
          t("common.required").toLowerCase(),
        variant: "destructive",
      });
      return;
    }

    // Validate contact details if required by building settings
    if (buildingSettings?.requireContactDetails) {
      const contactType = buildingSettings.contactType;
      if (
        (contactType === "email" || contactType === "email-and-phone") &&
        !formData.reporter_email.trim()
      ) {
        toast({
          title: t("common.error"),
          description:
            t("publicReport.yourEmail") +
            " " +
            t("common.required").toLowerCase(),
          variant: "destructive",
        });
        return;
      }
      if (
        (contactType === "phone" || contactType === "email-and-phone") &&
        !formData.reporter_phone.trim()
      ) {
        toast({
          title: t("common.error"),
          description:
            t("publicReport.yourPhone") +
            " " +
            t("common.required").toLowerCase(),
          variant: "destructive",
        });
        return;
      }
    }

    if (buildingSettings?.askForName && !formData.reporter_name.trim()) {
      toast({
        title: t("common.error"),
        description:
          t("publicReport.yourName") + " " + t("common.required").toLowerCase(),
        variant: "destructive",
      });
      return;
    }

    // In preview mode, just show success without API call
    if (previewMode) {
      toast({
        title: t("publicReport.previewMode"),
        description: t("publicReport.formValidationPassed"),
        variant: "success"
      });
      setShowSuccess(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append("issue_summary", formData.issue_summary);
      formPayload.append("additional_info", formData.additional_info);
      formPayload.append("Linked_To", linkedToId);
      formPayload.append(
        "Linked_To_Model",
        linkedToType === "space" ? "Space" : "Asset",
      );

      if (formData.reporter_name) {
        formPayload.append("reporter_name", formData.reporter_name);
      }
      if (formData.reporter_email) {
        formPayload.append("reporter_email", formData.reporter_email);
      }
      if (formData.reporter_phone) {
        formPayload.append("reporter_phone", formData.reporter_phone);
        formPayload.append("phone", formData.reporter_phone);
      }
      if (formData.organizationId) {
        formPayload.append("organization", formData.organizationId);
      }

      attachments.forEach((file) => {
        formPayload.append("attachments", file);
      });

      const buildingParam = buildingId ? `&building=${buildingId}` : "";
      const response = await fetch(
        `${apiUrl}/issue/public-report?org=${organizationId}${buildingParam}`,
        {
          method: "POST",
          body: formPayload,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("messages.error.somethingWentWrong"));
      }

      // Show success view instead of closing modal
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: t("common.error"),
        description: error.message || t("messages.error.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAnother = () => {
    setFormData({
      issue_summary: "",
      additional_info: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      organizationId: organizationId,
    });
    setAttachments([]);
    setPreviewUrls([]);
    setShowSuccess(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowSuccess(false);
      setFormData({
        issue_summary: "",
        additional_info: "",
        reporter_name: "",
        reporter_email: "",
        reporter_phone: "",
        organizationId: organizationId,
      });
      setAttachments([]);
      setPreviewUrls([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="mb-6 h-32 w-32">
              <img
                src="https://i.postimg.cc/2y8Hw12m/76e1253d-8c55-4b88-801b-e9ba18eae11e.png"
                className="object-cover"
                alt="Success"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              {t("publicReport.thankYou")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {t("publicReport.thankYouMessage")}
            </p>
            <Button
              variant="outline"
              onClick={handleReportAnother}
              className="w-full max-w-xs text-primary border-primary/30 hover:bg-primary/5"
            >
              {t("publicReport.reportAnother")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg text-left sm:text-xl font-semibold">
                    {previewMode ? t("publicReport.previewMode") + ": " : ""}
                    {t("publicReport.title")} ({name})
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-left text-muted-foreground mt-1">
                {t("publicReport.subtitleQR")}
              </p>
            </DialogHeader>

            {/* Public Attachments Section */}
            {linkedAttachments.length > 0 && (
              <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
                <Label className="text-sm font-medium mb-3 block">
                  {t("publicReport.linkedAttachments")} ({linkedAttachments.length})
                </Label>
                <div className="space-y-2">
                  {linkedAttachments.map((attachment) => {
                    const isImage = attachment.url.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i,
                    );
                    const isPdf = attachment.url.match(/\.pdf$/i);

                    return (
                      <div
                        key={attachment._id}
                        className="flex items-center gap-3 p-2 bg-background rounded-md border hover:border-primary/50 transition-colors"
                      >
                        {isImage ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              attachment.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {loadingAttachments && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Summary */}
              <div>
                <Label htmlFor="issue_summary" className="text-sm font-medium">
                  {t("publicReport.issueSummary")}<span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="issue_summary"
                  placeholder={t("publicReport.describeIssueBriefly")}
                  value={formData.issue_summary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      issue_summary: e.target.value,
                    }))
                  }
                  className="mt-1 min-h-[80px]"
                  required
                />
              </div>

              {/* Additional Info */}
              {/*  <div>
                <Label
                  htmlFor="additional_info"
                  className="text-sm font-medium"
                >
                  {t("publicReport.additionalInfo")}
                </Label>
                <Textarea
                  id="additional_info"
                  placeholder={t("publicReport.provideMoreDetails")}
                  value={formData.additional_info}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additional_info: e.target.value,
                    }))
                  }
                  className="mt-1 min-h-[80px]"
                />
              </div> */}

              {/* Reporter Name - always shown, required based on settings */}
              {buildingSettings?.askForName && (
                <div>
                  <Label
                    htmlFor="reporter_name"
                    className="text-sm font-medium"
                  >
                    {t("publicReport.yourName")}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reporter_name"
                    placeholder={t("publicReport.enterYourName")}
                    value={formData.reporter_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reporter_name: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              )}

              {/* Reporter Email - shown based on contactType, required based on settings */}
              {(buildingSettings?.contactType === "email" ||
                buildingSettings?.contactType === "email-and-phone") && (
                <div>
                  <Label
                    htmlFor="reporter_email"
                    className="text-sm font-medium"
                  >
                    {t("publicReport.yourEmail")}
                    {buildingSettings?.requireContactDetails && (
                      <span className="text-destructive">*</span>
                    )}
                    {!buildingSettings?.requireContactDetails && (
                      <span className="text-muted-foreground text-sm capitalize">
                        {" "}
                        (optional)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="reporter_email"
                    type="email"
                    placeholder={t("publicReport.enterYourEmail")}
                    value={formData.reporter_email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reporter_email: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("publicReport.emailInfoMessage")}
                  </span>
                </div>
              )}

              {/* Reporter Phone - shown based on contactType, required based on settings */}
              {(buildingSettings?.contactType === "phone" ||
                buildingSettings?.contactType === "email-and-phone") && (
                <div>
                  <Label
                    htmlFor="reporter_phone"
                    className="text-sm font-medium"
                  >
                    {t("publicReport.yourPhone")}
                    {buildingSettings?.requireContactDetails && (
                      <span className="text-destructive">*</span>
                    )}
                    {!buildingSettings?.requireContactDetails && (
                      <span className="text-muted-foreground text-sm capitalize">
                        {" "}
                        (optional)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="reporter_phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("publicReport.enterYourPhone")}
                    value={formData.reporter_phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        reporter_phone: onlyNumbers,
                      }));
                    }}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Attachments */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("publicReport.attachments")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("common.optional")})
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("publicReport.addPhotos")}
                </p>

                {/* Preview Grid */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {attachments.map((file, index) => {
                      const isVideo = file.type.startsWith("video/");
                      return (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="aspect-square bg-muted/20">
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-muted relative">
                                <video
                                  src={previewUrls[index]}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : previewUrls[index] ? (
                              <img
                                src={previewUrls[index]}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground text-center px-1 truncate">
                                  {file.name.split(".").pop()?.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => removeAttachment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Area */}
                {/* Entire upload zone is clickable */}
                <label
                  htmlFor="file-upload-input"
                  className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadCloud size={54} color="#636AE8FF" />

                    {/* Button is now just visual + manual trigger */}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the label from triggering twice
                        document.getElementById("file-upload-input")?.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                    >
                      {t("publicReport.browseFiles")}
                    </Button>
                  </div>
                </label>

                {/* Hidden file input - placed outside the label */}
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden" // or sr-only if you prefer screen-reader visibility
                />
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-muted-foreground text-start">
                {t("publicReport.termsAgreement")}{" "}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-primary underline hover:text-primary/80"
                >
                  {t("publicReport.termsOfService")}
                </button>{" "}
                {t("publicReport.and")}{" "}
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="text-primary underline hover:text-primary/80"
                >
                  {t("publicReport.privacyPolicy")}
                </button>
                <span> {t("publicReport.zu")}.</span>
              </p>

              <LanguageSelector className="w-32" />

              {/* Submit Button */}
              {/* <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {t("publicReport.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("publicReport.submitting")}
                    </>
                  ) : (
                    t("publicReport.submitReport")
                  )}
                </Button>
              </div> */}
            </form>
          </>
        )}
      </DialogContent>

      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </Dialog>
  );
}
