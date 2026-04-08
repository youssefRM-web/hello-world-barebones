import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  X,
  Flag,
  Calendar,
  AlertCircle,
  ChevronsDown,
  GripVertical,
  UploadCloud,
  Trash2,
  MapPin,
  User,
  Mail,
} from "lucide-react";
import { useBuilding } from "@/contexts/BuildingContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { apiService } from "@/services/api";
import { useCurrentUserQuery, useCreateTaskMutation } from "@/hooks/queries";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormError } from "@/components/ui/form-error";
import { TaskDatePicker } from "../TasksGroup/TaskDatePicker";
import { Issue } from "@/types";
import { Map, Marker } from "pigeon-maps";
import { ImageViewerModal } from "@/components/Common/ImageViewerModal";

interface CreateExternalTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (taskData: any) => void;
  issue: Issue | null;
}

export function CreateExternalTaskModal({
  open,
  onOpenChange,
  onCreateTask,
  issue,
}: CreateExternalTaskModalProps) {
  const { selectedBuilding } = useBuilding();
  const { selectedBuildingId } = useBuildingSelection();
  const { data: currentUser } = useCurrentUserQuery();
  const createTaskMutation = useCreateTaskMutation();
  const { users, buildings, categories, refreshData } = useReferenceData();

  const [formData, setFormData] = useState({
    issueSummary: "",
    description: "",
    status: "TO_DO",
    building: "",
    priority: "Medium",
    category: null as string | null,
    isAccepted: true,
    assignedTo: "",
    dueDate: undefined as Date | undefined,
    checklist: [] as { id: string; text: string; checked: boolean }[],
    attachments: [] as { id: string; name: string; url: string; file?: File }[],
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState<
    number | null
  >(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { t } = useLanguage();

  const { errors, validateForm, clearError } = useFormValidation({
    issueSummary: { required: true, message: "Issue summary is required" },
    status: { required: true, message: "Status is required" },
    building: { required: true, message: "Building is required" },
    priority: { required: true, message: "Priority is required" },
    assignedTo: { required: true, message: "Assignee is required" },
    dueDate: { required: true, message: "Due date is required" },
  });

  // Pre-populate form when modal opens with issue data
  useEffect(() => {
    if (open && issue) {
      setFormData({
        issueSummary: issue.issue_summary || "",
        description: issue.additional_info || "",
        status: "TO_DO",
        building: "",
        priority: issue.priority || "Medium",
        category: null,
        isAccepted: true,
        assignedTo: "",
        dueDate: undefined,
        checklist: [],
        attachments: (issue.attachements || []).map(
          (url: string, index: number) => ({
            id: `issue-${index}`,
            name: `Attachment ${index + 1}`,
            url: url,
          })
        ),
      });
    } else if (open && !issue) {
      // Reset form
      setFormData({
        issueSummary: "",
        description: "",
        status: "TO_DO",
        building: "",
        priority: "Medium",
        category: null,
        isAccepted: true,
        assignedTo: "",
        dueDate: undefined,
        checklist: [],
        attachments: [],
      });
    }
  }, [open, issue]);

  const handleSubmit = async () => {
    if (!currentUser || isSubmitting || !issue) return;

    // Validate required fields
    if (!validateForm(formData)) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formPayload = new FormData();

    // Basic fields
    formPayload.append("created_by", currentUser._id);
    formPayload.append("issue_summary", formData.issueSummary);
    formPayload.append("organizationId", currentUser?.Organization_id?._id);
    formPayload.append("additional_info", formData.description || "");
    formPayload.append("Building_id", formData.building);
    formPayload.append("priority", formData.priority);
    formPayload.append("Status", formData.status);
    formPayload.append("isAccepted", "true");
    formPayload.append("isExternalTask", "true");

    // Include location data from the original issue
    if (issue.location_coordinates) {
      formPayload.append(
        "location_coordinates[lat]",
        issue.location_coordinates.lat.toString()
      );
      formPayload.append(
        "location_coordinates[lng]",
        issue.location_coordinates.lng.toString()
      );
    }
    if (issue.location_name) {
      formPayload.append("location_name", issue.location_name);
    }

    // Include original issue ID for reference
    formPayload.append("originalIssueId", issue._id);

    if (formData.dueDate) {
      formPayload.append("Due_date", formData.dueDate.toISOString());
    }

    // Only append category_id if it's a valid ObjectId
    if (
      formData.category &&
      formData.category !== "N/A" &&
      formData.category !== "None"
    ) {
      formPayload.append("category_id", formData.category);
    }

    (Array.isArray(formData.assignedTo)
      ? formData.assignedTo
      : [formData.assignedTo]
    ).forEach((userId) => {
      formPayload.append("Assigned_to", userId);
    });

    if (formData.checklist.length > 0) {
      formPayload.append(
        "Checklist",
        JSON.stringify(
          formData.checklist.map((item) => ({
            name: item.text,
            completed: item.checked,
          }))
        )
      );
    }

    // Append files
    formData.attachments.forEach((att: any) => {
      if (att.file) {
        formPayload.append("files", att.file);
      }
    });

    // Append existing attachment URLs from the issue
    const existingUrls = formData.attachments
      .filter((att) => !att.file)
      .map((att) => att.url);
    if (existingUrls.length > 0) {
      formPayload.append("existingAttachments", JSON.stringify(existingUrls));
    }

    try {
      const response = await createTaskMutation.mutateAsync(formPayload);

      // Also update the original issue to mark it as accepted
      await apiService.patch(`/issues/${issue._id}`, {
        isAccepted: true,
        buildingId: formData.building,
      });

      onCreateTask(response);
      refreshData();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
          id: Date.now().toString() + Math.random(),
          name: file.name,
          file,
          url: URL.createObjectURL(file),
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
      });
    }
  };

  const removeAttachment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== id),
    }));
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  // Filter users based on building selection
  const currentUserArray = users.filter((user) => {
    if (!formData.building) return true;
    return user.affectedTo?.some(
      (building) => building._id === formData.building
    );
  });

  // Filter categories by selected building
  const filteredCategories = formData.building
    ? categories.filter((category) =>
        category.buildingIds?.some(
          (building: any) => building._id === formData.building
        )
      )
    : categories;

  const priorityColors: Record<string, string> = {
    Low: " text-[#379AE6FF]",
    Medium: " text-[#EA916EFF]",
    High: " text-red-600",
    Urgent: " text-purple-600",
  };

  if (!issue) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[92dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
          {/* HEADER */}
          <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Create Task from External Report
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
              Convert this location-based report into a task. Required fields
              are marked with an asterisk (*).
            </p>
          </DialogHeader>

          {/* BODY - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="space-y-6">
              {/* Location Map */}
              {issue.location_coordinates && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Reported Location
                  </Label>
                  <div className="rounded-lg overflow-hidden border">
                    <Map
                      center={[
                        issue.location_coordinates.lat,
                        issue.location_coordinates.lng,
                      ]}
                      zoom={15}
                      height={180}
                    >
                      <Marker
                        width={40}
                        anchor={[
                          issue.location_coordinates.lat,
                          issue.location_coordinates.lng,
                        ]}
                        color="hsl(var(--primary))"
                      />
                    </Map>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {issue.location_name ||
                      `${issue.location_coordinates.lat.toFixed(
                        6
                      )}, ${issue.location_coordinates.lng.toFixed(6)}`}
                  </p>
                </div>
              )}

              {/* Reporter Info */}
              {issue.reporter &&
                (issue.reporter.name || issue.reporter.email) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Reporter Information
                    </Label>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      {issue.reporter.name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{issue.reporter.name}</span>
                        </div>
                      )}
                      {issue.reporter.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{issue.reporter.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Issue Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Issue Summary <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="issueSummary"
                  placeholder="e.g. The large printer in the main office is jammed..."
                  className="min-h-32 resize-none text-sm"
                  value={formData.issueSummary}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      issueSummary: e.target.value,
                    }));
                    clearError("issueSummary");
                  }}
                />
                <FormError error={errors.issueSummary} />
              </div>

              {/* Additional Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Additional Description{" "}
                  <span className="text-muted-foreground text-sm">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details..."
                  className="min-h-24 resize-none text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Grid Layout for Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="h-11 w-full font-semibold bg-blue-50 border-blue-200 text-[#1759E8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TO_DO">TO DO</SelectItem>
                      <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                      <SelectItem value="DONE">DONE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Building */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Assign to Building <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.building || ""}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        building: value,
                        assignedTo: "",
                      }));
                      clearError("building");
                    }}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <div className="flex items-center gap-3">
                        <Building className="h-4.5 w-4.5 text-muted-foreground" />
                        <SelectValue placeholder="Select a building" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.filter((building) => !building.archived).map((building) => (
                        <SelectItem key={building._id} value={building._id}>
                          {building.label}
                        </SelectItem>
                      ))}
                      {buildings?.length === 0 && (
                        <SelectItem value="none" disabled>
                          <span className="italic text-muted-foreground">
                            No buildings available
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormError error={errors.building} />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger
                      className={`h-11 w-full ${
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
                          <span>Low</span>
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
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="High">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span>High</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Category{" "}
                    <span className="text-muted-foreground text-sm">
                      (optional)
                    </span>
                  </Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    disabled={!formData.building}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          !formData.building
                            ? "Select building first"
                            : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.label}
                        </SelectItem>
                      ))}
                      {filteredCategories.length === 0 && (
                        <SelectItem value="none" disabled>
                          <span className="italic text-muted-foreground">
                            No categories available
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Assign To <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.assignedTo || ""}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, assignedTo: value }));
                      clearError("assignedTo");
                    }}
                    disabled={!formData.building}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          !formData.building
                            ? "Select building first"
                            : "Select assignee"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserArray.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.profile_picture} />
                              <AvatarFallback className="text-xs">
                                {user.Name?.[0]}
                                {user.Last_Name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {user.Name} {user.Last_Name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {currentUserArray.length === 0 && (
                        <SelectItem value="none" disabled>
                          <span className="italic text-muted-foreground">
                            No users available
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormError error={errors.assignedTo} />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <TaskDatePicker
                    label="Due Date *"
                    value={formData.dueDate}
                    onChange={(date) => {
                      setFormData((prev) => ({ ...prev, dueDate: date }));
                      clearError("dueDate");
                    }}
                    disablePastDates
                  />
                  <FormError error={errors.dueDate} />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Checklist</Label>
                <div className="space-y-2">
                  {formData.checklist.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            checklist: prev.checklist.map((i) =>
                              i.id === item.id
                                ? { ...i, checked: !!checked }
                                : i
                            ),
                          }));
                        }}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.checked
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add checklist item..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addChecklistItem())
                      }
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addChecklistItem}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Attachments{" "}
                    <span className="text-muted-foreground text-sm">
                      (optional)
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload photos, documents, or screenshots to support the task.
                  </p>
                </div>

                {/* Uploaded Files Grid */}
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {formData.attachments.map((attachment, index) => (
                      <div
                        key={attachment.id}
                        className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="aspect-square bg-muted/20">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleImageClick(index)}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white truncate">
                            {attachment.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area with Cloud Icon */}
                <label className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadCloud size={54} color="#636AE8FF" />
                    <div className="relative cursor-pointer">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium px-8 py-3 rounded-lg shadow-md"
                      >
                        {t("support.browseFiles")}
                      </Button>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t bg-background shrink-0">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="min-w-32"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="min-w-40 font-medium"
              >
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageViewerModal
        open={isImageViewerOpen}
        onOpenChange={setIsImageViewerOpen}
        images={formData.attachments.map((att) => att.url)}
        initialIndex={selectedImageIndex}
      />
    </>
  );
}
