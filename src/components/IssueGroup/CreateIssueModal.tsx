import { useState, useEffect } from "react";
import { ImageViewerModal } from "@/components/Common/ImageViewerModal";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building,
  User,
  Upload,
  Trash2,
  X,
  Loader2,
  Flag,
  AlertTriangle,
  AlertCircle,
  ArrowDown,
  ChevronsDown,
  Tag,
  UploadCloud,
  Video,
  FileText,
  GripVertical,
} from "lucide-react";
import { TaskDatePicker } from "@/components/TasksGroup/TaskDatePicker";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { apiService } from "@/services/api";
import { useBuilding } from "@/contexts/BuildingContext";
import { formatLocationChain } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";

interface CreateIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateIssue: (issueData: any) => void;
  initialData?: any;
}

export function CreateIssueModal({
  open,
  onOpenChange,
  onCreateIssue,
  initialData,
}: CreateIssueModalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const {
    users,
    buildings,
    categories,
    isLoading: referenceDataLoading,
  } = useReferenceData();
  const { data: currentUser } = useCurrentUserQuery();
  const { selectedBuilding } = useBuilding();
  const { executeRequest, isLoading: apiLoading } = useApi();
  const formatedLocation = formatLocationChain(initialData?.locationChain);

  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    status: "TO_DO",
    building: selectedBuilding?._id,
    linkedToModel: "",
    linkedTo: "",
    linkedToName: "", // Store the name for display when locked
    priority: "Medium",
    category: "",
    isAccepted: null as boolean | null,
    assignedTo: [] as string[],
    dueDate: undefined as Date | undefined,
    checklist: [] as { id: string; text: string; checked: boolean }[],
    attachments: [] as { id: string; name: string; url: string; file : any }[],
    reporter : initialData?.reporter
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const isFromIssue = !!initialData;
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Pre-populate form when accepting an issue
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        summary: initialData.issue_summary || "",
        description: initialData.additional_info || "",
        status: "TO_DO",
        building: initialData.buildingId?._id || selectedBuilding?._id,
        linkedToModel: initialData.Linked_To_Model || "",
        linkedTo: initialData.Linked_To?._id || "",
        linkedToName: initialData.Linked_To?.name || "", // Store the name
        priority: initialData.priority || "Medium",
        category: null,
        isAccepted: true,
        assignedTo: [],
        dueDate: undefined,
        checklist: [],
        attachments: (initialData.attachements || []).map(
          (url: string, index: number) => ({
            id: `issue-${index}`,
            name: `Attachment ${index + 1}`,
            url: url,
          })
        ),
        reporter : initialData?.reporter
      });
    } else if (!initialData && open) {
      // Reset form for new issue
      setFormData({
        summary: "",
        description: "",
        status: "TO_DO",
        building: selectedBuilding?._id,
        linkedToModel: "",
        linkedTo: "",
        linkedToName: "",
        priority: "Medium",
        category: null,
        isAccepted: null,
        assignedTo: [],
        dueDate: undefined,
        checklist: [],
        attachments: [],
        reporter : initialData?.reporter
      });
    }
  }, [initialData, open, selectedBuilding]);

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: t("common.error"),
        description: t("messages.error.unableToPerformAction"),
        variant: "destructive",
      });
      return;
    }
    // Validate required fields
    const requiredFields = {
      summary: t("issues.issueSummaryRequired"),
      building: t("issues.buildingRequired"),
      priority: t("issues.priorityRequired"),
      linkedToModel: t("issues.linkedToModelRequired"),
      linkedTo: t("issues.linkedToRequired"),
      assignedTo: t("issues.assignedToRequired"),
    };

    const missingFields = [];
    for (const [field, message] of Object.entries(requiredFields)) {
      const fieldValue = formData[field as keyof typeof formData];
      if (
        !fieldValue ||
        (Array.isArray(fieldValue) && fieldValue.length === 0) ||
        (typeof fieldValue === "string" && fieldValue.trim() === "")
      ) {
        missingFields.push(message);
      }
    }

    if (missingFields.length > 0) {
      toast({
        title: t("issues.missingRequiredFields"),
        description: `${t("issues.fillIn")} ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const submitFormData = new FormData();

  // Append basic fields (JSON-friendly)
  submitFormData.append("created_by", currentUser._id);
  submitFormData.append("issue_summary", formData.summary);
  submitFormData.append("additional_info", formData.description);
  submitFormData.append("Building_id", formData.building || "");
  if (formData.linkedToModel) submitFormData.append("Linked_To_Model", formData.linkedToModel);
  if (formData.linkedTo) submitFormData.append("Linked_To", formData.linkedTo);
  submitFormData.append("priority", formData.priority);
  if (formData.category) submitFormData.append("category_id", formData.category);
  formData.assignedTo.forEach((id) => submitFormData.append("Assigned_to", id));
  if (formData.isAccepted !== null) submitFormData.append("isAccepted", String(formData.isAccepted));
  submitFormData.append("Status", formData.status);
  if (formData.dueDate) submitFormData.append("Due_date", new Date(formData.dueDate).toISOString());

  // Checklist
  formData.checklist.forEach((item, i) => {
    submitFormData.append(`Checklist[${i}][text]`, item.text);
    submitFormData.append(`Checklist[${i}][completed]`, String(item.checked));
  });

  if (initialData?._id) submitFormData.append("linked_to_task_id", initialData._id);
  submitFormData.append("isPublicReport", "true");
  if (initialData?.reporter) {
  // Send only the allowed fields — clean object, no _id / timestamps
  submitFormData.append("reporter[email]", initialData.reporter.email || "");
  submitFormData.append("reporter[name]", initialData.reporter.name || "");
  // If you have phone in the original Issue reporter:
  // submitFormData.append("reporter[phone]", initialData.reporter.phone || "");
}

  // ────────────────────────────────────────────────
  // ATTACHMENTS: only send existing S3 URLs + new real Files
  // ────────────────────────────────────────────────
  const existingS3Urls: string[] = [];

  formData.attachments.forEach((att) => {
    if (att.file instanceof File) {
      // New file → send as multipart file
      submitFormData.append("files", att.file);
    } else if (typeof att.url === 'string' && att.url.startsWith('https://')) {
      // Existing S3 URL → collect to send as JSON array
      existingS3Urls.push(att.url);
    }
    // Ignore blob: URLs — never send them!
  });

  // Send existing S3 URLs as a JSON string
  if (existingS3Urls.length > 0) {
    submitFormData.append("existingAttachments", JSON.stringify(existingS3Urls));
  }

  const result = await executeRequest(
    () => apiService.post("/accepted-issue", submitFormData),
    {
      errorMessage: t("issues.taskFailed"),
    }
  );
    if (result) {
      onCreateIssue(result);
      onOpenChange(false);

      // Reset form
      setFormData({
        summary: "",
        description: "",
        status: "TO_DO",
        building: selectedBuilding?._id,
        linkedToModel: "",
        linkedTo: "",
        linkedToName: "",
        priority: "Medium",
        category: null,
        isAccepted: null,
        assignedTo: [],
        dueDate: undefined,
        checklist: [],
        attachments: [],
        reporter : initialData?.reporter
      });
    }

   
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          {
            id: Date.now().toString(),
            text: newChecklistItem,
            checked: false,
          },
        ],
      }));
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          url: URL.createObjectURL(file),
          file: file
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
      });
    }
  };

  const removeAttachment = (e, id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== id),
    }));
    e.target.value = ""
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const priorityColors: Record<string, string> = {
    Low: " text-[#379AE6FF]",
    Medium: " text-[#EA916EFF]",
    High: " text-red-600",
    URGENT: " text-purple-600",
  };

  const priorityBg: Record<string, string> = {
    Low: " bg-[#F1F5FDFF]",
    Medium: " bg-[#FDF5F1FF]",
    High: " bg-[#FDF2F2FF]",
    URGENT: " bg-purple-600",
  };

  const getAttachmentIcon = (url: string, fileName?: string) => {
       const extFromName = fileName?.split(".").pop()?.toLowerCase();
      const extFromUrl = url.split("?")[0].split(".").pop()?.toLowerCase();
      const knownExts = ["pdf", "doc", "docx", "xls", "xlsx", "mp4", "jpg", "jpeg", "png", "gif", "webp", "txt"];
      const ext = (extFromName && knownExts.includes(extFromName)) ? extFromName : (extFromUrl && knownExts.includes(extFromUrl)) ? extFromUrl : extFromName || extFromUrl;
      switch (ext) {
        case "pdf":
          return (
            <img src={pdfIcon} className="w-10 h-10 object-contain" alt="PDF" />
          );
        case "doc":
        case "docx":
          return (
            <img src={docxIcon} className="w-8 h-8 object-contain" alt="DOCX" />
          );
        case "xls":
        case "xlsx":
          return (
            <img src={xlsxIcon} className="w-8 h-8 object-contain" alt="Excel" />
          );
        case "mp4":
          return <Video className="w-10 h-10 text-primary" />;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
          return (
            <img src={url} className="object-cover [image-orientation:from-image]" alt="Image" />
          );
        case "txt":
          return <FileText className="w-8 h-8 text-gray-600" />;
        default:
          return <FileText className="w-8 h-8 text-muted-foreground" />;
      }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[94dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl mx-2 sm:mx-auto">
        {/* HEADER */}
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t("issues.createTaskFromIssue")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="text-sm font-medium text-foreground mt-3 capitalize">
            {formatedLocation}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("issues.convertIssueDescription")}
          </p>
        </DialogHeader>

        {/* BODY - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="space-y-6">
            {/* Issue Summary */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("issues.issueSummary")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder={t("issues.issueSummaryPlaceholder")}
                className="min-h-32 resize-none text-sm"
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
              />
            </div>

            {/* Additional Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("issues.additionalDescription")}{" "}
                <span className="text-muted-foreground text-sm">
                  ({t("common.optional")})
                </span>
              </Label>
              <Textarea
                placeholder={t("issues.additionalDescriptionPlaceholder")}
                className="min-h-36 resize-none text-sm"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("issues.status")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger className="h-11 font-semibold bg-blue-50 border-blue-200 text-[#1759E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TO_DO">{t("issues.toDo")}</SelectItem>
                    <SelectItem value="IN_PROGRESS">{t("issues.inProgress")}</SelectItem>
                    <SelectItem value="DONE">{t("issues.done")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("issues.priority")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, priority: v }))
                  }
                >
                  <SelectTrigger
                    className={`h-11 ${
                      priorityColors[formData.priority] || ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {formData.priority === "Low" && (
                        <ChevronsDown className="w-5 h-5" color="#379AE6" />
                      )}
                      {formData.priority === "Medium" && (
                        <svg
                          className="w-5 h-5"
                          fill="#EA916E"
                          viewBox="0 0 24 24"
                        >
                          <rect height={2} width={18} x={3} y={3} />
                          <rect height={2} width={18} x={3} y={11} />
                          <rect height={2} width={18} x={3} y={19} />
                        </svg>
                      )}
                      {formData.priority === "High" && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {formData.priority || "Select priority"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-3">
                        <ChevronsDown className="w-5 h-5" color="#379AE6" />
                        <span>{t("issues.low")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5"
                          fill="#EA916E"
                          viewBox="0 0 24 24"
                        >
                          <rect height={2} width={18} x={3} y={3} />
                          <rect height={2} width={18} x={3} y={11} />
                          <rect height={2} width={18} x={3} y={19} />
                        </svg>
                        <span>{t("issues.medium")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span>{t("issues.high")}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category + Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("issues.category")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("common.optional")})
                  </span>
                </Label>
                {(() => {
                  const buildingCategories = categories.filter((cat) =>
                    cat.buildingIds?.some((b) => b._id === formData.building)
                  );

                  if (buildingCategories.length === 0) {
                    return (
                      <div className="h-11 flex items-center px-3 border rounded-md bg-muted/50">
                        <Tag className="h-4.5 w-4.5 text-muted-foreground mr-3" />
                        <span className="text-sm text-muted-foreground">
                          {t("issues.noCategoriesAvailable")}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Select
                      value={formData.category}
                      onValueChange={(v) =>
                        setFormData((prev) => ({ ...prev, category: v }))
                      }
                    >
                      <SelectTrigger className="h-11">
                        <div className="flex items-center gap-3">
                          <Tag className="h-4.5 w-4.5 text-muted-foreground" />
                          <SelectValue placeholder={t("issues.selectCategory")} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {buildingCategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("issues.assignedTo")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.assignedTo[0] || ""}
                  onValueChange={(v) => {
                    if (v && formData.building) {
                      const selectedUser = users.find((u) => u._id === v);
                      const belongsToBuilding = selectedUser?.affectedTo?.some(
                        (b) => b._id === formData.building
                      );
                      if (!belongsToBuilding) {
                        toast({
                          title: t("issues.userNotAssigned"),
                          description: `${selectedUser?.Name} ${selectedUser?.Last_Name} ${t("issues.userNotBelongsToBuilding").replace("{name}", "")}`,
                          variant: "destructive",
                        });
                        setFormData((prev) => ({
                          ...prev,
                          assignedTo: [],
                        }));
                        return;
                      }
                    }
                    setFormData((prev) => ({
                      ...prev,
                      assignedTo: v ? [v] : [],
                    }));
                  }}
                >
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-3">
                      <User className="h-4.5 w-4.5 text-muted-foreground" />
                      <SelectValue placeholder={t("issues.selectUser")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            {u.profile_picture ? (
                              <AvatarImage src={u.profile_picture} />
                            ) : (
                              <AvatarFallback className="bg-[#0F4C7BFF] text-white uppercase">
                                {u.Name?.[0]?.toUpperCase()}
                                {u.Last_Name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="font-medium">
                                {u.Name} {u.Last_Name}
                              </span>
                            </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <TaskDatePicker
              label={t("issues.dueDate")}
              value={formData.dueDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dueDate: date }))
              }
              placeholder={t("issues.selectDueDate")}
              disablePastDates={true}
            />

            {/* Checklist */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  {t("issues.checklist")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("common.optional")})
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("issues.checklistHint")}
                </p>
              </div>
              <div className="space-y-3">
                {formData.checklist.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedChecklistIndex(index);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedChecklistIndex === null || draggedChecklistIndex === index) {
                        setDraggedChecklistIndex(null);
                        return;
                      }
                      const updatedChecklist = [...formData.checklist];
                      const [draggedItem] = updatedChecklist.splice(draggedChecklistIndex, 1);
                      updatedChecklist.splice(index, 0, draggedItem);
                      setFormData((prev) => ({ ...prev, checklist: updatedChecklist }));
                      setDraggedChecklistIndex(null);
                    }}
                    onDragEnd={() => setDraggedChecklistIndex(null)}
                    className={`flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm hover:shadow transition-shadow ${draggedChecklistIndex === index ? "opacity-50" : ""}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-grab text-muted-foreground/70"
                    >
                      <GripVertical className="h-4.5 w-4.5" />
                    </Button>
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(c) =>
                        setFormData((prev) => ({
                          ...prev,
                          checklist: prev.checklist.map((ci) =>
                            ci.id === item.id ? { ...ci, checked: !!c } : ci
                          ),
                        }))
                      }
                    />
                    <span className="flex-1 text-sm">{item.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChecklistItem(item.id)}
                      className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Input
                    placeholder={t("issues.addChecklistItem")}
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addChecklistItem()}
                    className="h-11"
                  />
                  <Button onClick={addChecklistItem} size="lg" className="px-6">
                    {t("issues.addItem")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  {t("issues.attachments")}{" "}
                  {isFromIssue && (
                    <span className="text-muted-foreground text-sm">
                      ({t("issues.fromIssue")})
                    </span>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("issues.attachmentsHint")}
                </p>
              </div>

              {/* Uploaded Files Grid - Keeps clickable thumbnails and delete */}
              {formData.attachments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {formData.attachments.map((att, i) => (
                    <div
                      key={att.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <button
                        onClick={() => handleImageClick(i)}
                        className="block w-full flex items-center justify-center aspect-square bg-muted/20"
                      >
                        {getAttachmentIcon(att.url, att.name)}
                      </button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering image viewer
                          removeAttachment(e, att.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area - entire area is clickable */}
              <label
                htmlFor="issue-file-upload-input"
                className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <UploadCloud size={54} color="#636AE8FF" />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("issue-file-upload-input")?.click();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                  >
                    {t("issues.browseFiles")}
                  </Button>
                </div>
              </label>
              <input
                id="issue-file-upload-input"
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
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
              {t("issues.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={apiLoading}
              size="lg"
              className="min-w-40 font-medium"
            >
              {apiLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("issues.creating")}
                </>
              ) : (
                t("issues.createTask")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      <ImageViewerModal
        open={isImageViewerOpen}
        onOpenChange={setIsImageViewerOpen}
        images={formData.attachments.map((a) => a.url)}
        initialIndex={selectedImageIndex}
      />
    </Dialog>
  );
}
