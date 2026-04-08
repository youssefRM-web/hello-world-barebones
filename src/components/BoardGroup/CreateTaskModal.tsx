import { useEffect, useState } from "react";
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
  Link,
  Flag,
  Calendar,
  Tag,
  AlertTriangle,
  AlertCircle,
  ArrowDown,
  ChevronsDown,
  GripVertical,
  UploadCloud,
} from "lucide-react";
import { LinkTaskModal } from "./LinkTaskModal";
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
import { useQueryClient } from "@tanstack/react-query";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (taskData: any) => void;
  defaultStatus: string;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onCreateTask,
  defaultStatus,
}: CreateTaskModalProps) {
  const { selectedBuilding } = useBuilding();
  const queryClient = useQueryClient();
  const { selectedBuildingId } = useBuildingSelection();
  const { data: currentUser } = useCurrentUserQuery();
  const createTaskMutation = useCreateTaskMutation();
  const { users, buildings, categories, refreshData } = useReferenceData();

  const [formData, setFormData] = useState({
    issueSummary: "",
    description: "",
    status: "TO_DO",
    building: selectedBuilding?._id,
    linkedToModel: "",
    linkedTo: "",
    priority: "Medium",
    category: null,
    isAccepted: true,
    assignedTo: "",
    dueDate: undefined as Date | undefined,
    checklist: [] as { id: string; text: string; checked: boolean }[],
    attachments: [] as { id: string; name: string; url: string }[],
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState<
    number | null
  >(null);

  const { t } = useLanguage();

  const { errors, validateForm, clearError } = useFormValidation({
    issueSummary: { required: true, message: "Issue summary is required" },
    description: { required: false, message: "" },
    status: { required: true, message: "Status is required" },
    building: { required: true, message: "Building is required" },
    linkedTo: { required: true, message: "Linked to is required" },
    priority: { required: true, message: "Priority is required" },
    assignedTo: { required: true, message: "Assignee is required" },
    // dueDate: { required: true, message: "Due date is required" },
  });

  // Determine if a specific building is selected in sidebar
  const isBuildingLockedFromSidebar =
    selectedBuildingId && selectedBuildingId !== "all";

  // Whenever modal opens, reset form and set the correct status
  useEffect(() => {
    if (open) {
      // If a specific building is selected in sidebar, use that; otherwise use selectedBuilding from context
      const preSelectedBuildingId = isBuildingLockedFromSidebar
        ? selectedBuildingId
        : selectedBuilding?._id;

      setFormData((prev) => ({
        ...prev,
        status: defaultStatus || "TO_DO",
        issueSummary: "",
        description: "",
        building: preSelectedBuildingId,
        linkedToModel: "",
        linkedTo: "",
        priority: "Medium",
        category: null,
        isAccepted: true,
        assignedTo: "",
        dueDate: undefined,
        checklist: [],
        attachments: [],
      }));
      setLinkedItemName("");
    }
  }, [
    open,
    defaultStatus,
    selectedBuilding,
    selectedBuildingId,
    isBuildingLockedFromSidebar,
  ]);

  const handleSubmit = async () => {
    if (!currentUser || isSubmitting) return;

    const lng = localStorage.getItem("language");
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

    formPayload.append("Linked_To_Model", formData.linkedToModel);
    if (formData.linkedTo) {
      formPayload.append("Linked_To", formData.linkedTo);
    }
    formPayload.append("priority", formData.priority);
    formPayload.append("language", lng);
    formPayload.append("Status", formData.status);
    formPayload.append("isAccepted", "true");
    formPayload.append("firstName", currentUser.Name);
    formPayload.append("lastName", currentUser.Last_Name);

    if (formData.dueDate) {
      const localDate = formData.dueDate;
      const utcMidnight = new Date(
        Date.UTC(
          localDate.getFullYear(),
          localDate.getMonth(),
          localDate.getDate()
        )
      );

      formPayload.append("Due_date", utcMidnight.toISOString());
    }

    // ✅ Only append category_id if it's a valid ObjectId (not null, "None", or "N/A")
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
            text: item.text,
            completed: item.checked,
          }))
        )
      );
    }

    // ✅ Append files
    formData.attachments.forEach((att: any) => {
      formPayload.append("files", att.file);
    });

    try {
      const response = await createTaskMutation.mutateAsync(formPayload);
      onCreateTask(response);
      refreshData();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
    }
  };

  const [linkedItemName, setLinkedItemName] = useState("");

  const handleLinkSelect = (
    type: "Space" | "Asset",
    id: string,
    name: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      linkedToModel: type,
      linkedTo: id,
    }));
    setLinkedItemName(name);
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
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (files) {
      Array.from(files).forEach((file) => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: t("fileUpload.fileTooLarge"),
            description: `"${file.name}" exceeds the maximum file size of ${MAX_FILE_SIZE_MB}MB.`,
            variant: "destructive",
          });
          return;
        }

        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          date: (() => {
            const now = new Date();

            // Use UTC getters to keep the original server-like date/time
            const day = now.getUTCDate().toString().padStart(2, "0");
            const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
            const year = now.getUTCFullYear();

            const hours = now.getUTCHours().toString().padStart(2, "0");
            const minutes = now.getUTCMinutes().toString().padStart(2, "0");

            return `${day}.${month}.${year} - ${hours}:${minutes}`;
          })(),
          file,
          url: URL.createObjectURL(file),
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
      });
    }
    // Reset input to allow re-uploading same file
    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== id),
    }));
  };

  // Filter users based on sidebar building selection
  // If "All buildings" is selected, show all users including managers
  // If a specific building is selected, show users affected to that building including managers
  const currentUserArray = users.filter((user) => {
    // Include current user as well (can assign to themselves)

    // If "All buildings" selected (null or "all"), show all users
    if (!selectedBuildingId || selectedBuildingId === "all") {
      return true;
    }

    // If a specific building is selected, show users affected to that building
    return user.affectedTo?.some(
      (building) => building._id === selectedBuildingId
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

  const priorityBg: Record<string, string> = {
    Low: " bg-[#F1F5FDFF]",
    Medium: " bg-[#FDF5F1FF]",
    High: " bg-[#FDF2F2FF]",
    Urgent: " bg-purple-600",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[92dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
          {/* HEADER */}
          <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {t("board.createTask")}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">{t("common.close")}</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("board.createTaskDescription")}
            </p>
          </DialogHeader>

          {/* BODY - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="space-y-6">
              {/* Issue Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("board.issueSummary")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="issueSummary"
                  placeholder={t("board.issueSummaryPlaceholder")}
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
                  {t("board.additionalDescription")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("common.optional")})
                  </span>
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("board.additionalDescriptionPlaceholder")}
                  className="min-h-36 resize-none text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <FormError error={errors.description} />
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("board.status")}{" "}
                    <span className="text-destructive">*</span>
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
                      <SelectItem value="TO_DO">{t("board.toDo")}</SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        {t("board.inProgress")}
                      </SelectItem>
                      <SelectItem value="DONE">{t("board.done")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormError error={errors.status} />
                </div>

                {/* Building */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("board.building")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.building || ""}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, building: value }));
                      clearError("building");
                    }}
                    disabled={!!isBuildingLockedFromSidebar}
                  >
                    <SelectTrigger
                      className={`h-11 w-full ${isBuildingLockedFromSidebar
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                        }`}
                    >
                      <div className="flex items-center gap-2 capitalize">
                        <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                        <SelectValue placeholder={t("board.selectBuilding")} className="capitalize"/>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {buildings
                        .filter((building) => !building.archived)
                        .map((building) => (
                          <SelectItem key={building._id} value={building._id} className="capitalize">
                            {building.label}
                          </SelectItem>
                        ))}
                      {buildings?.length === 0 && (
                        <SelectItem value="none" disabled>
                          <span className="italic text-muted-foreground">
                            {t("board.noBuildingsAvailable")}
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormError error={errors.building} />
                </div>

                {/* Linked to */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("board.linkedTo")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    variant="outline"
                    onClick={() => setIsLinkModalOpen(true)}
                    className="w-full justify-start text-left font-normal h-11"
                    disabled={!formData.building}
                  >
                    <div className="flex items-center gap-2 overflow-hidden capitalize">
                      <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span
                        className={`truncate ${!formData.building
                            ? "text-muted-foreground"
                            : "text-foreground"
                          }`}
                      >
                        {!formData.building
                          ? t("board.selectBuildingFirst")
                          : linkedItemName || t("board.chooseSpaceAsset")}
                      </span>
                    </div>
                  </Button>
                  <FormError error={errors.linkedTo} />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("board.priority")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger
                      className={`h-11 w-full ${priorityColors[formData.priority] || ""
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.priority === "Low" && (
                          <ChevronsDown className="w-4 h-4" color="#379AE6" />
                        )}
                        {formData.priority === "Medium" && (
                          <svg
                            className="w-4 h-4"
                            fill="#EA916E"
                            viewBox="0 0 24 24"
                          >
                            <rect height={2} width={18} x={3} y={3} />
                            <rect height={2} width={18} x={3} y={11} />
                            <rect height={2} width={18} x={3} y={19} />
                          </svg>
                        )}
                        {formData.priority === "High" && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {formData.priority === "Low"
                            ? t("board.low")
                            : formData.priority === "Medium"
                              ? t("board.medium")
                              : formData.priority === "High"
                                ? t("board.high")
                                : t("board.selectPriority")}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">
                        <div className="flex items-center gap-2">
                          <ChevronsDown className="w-4 h-4" color="#379AE6" />
                          <span>{t("board.low")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="#EA916E"
                            viewBox="0 0 24 24"
                          >
                            <rect height={2} width={18} x={3} y={3} />
                            <rect height={2} width={18} x={3} y={11} />
                            <rect height={2} width={18} x={3} y={19} />
                          </svg>
                          <span>{t("board.medium")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="High">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>{t("board.high")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormError error={errors.priority} />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("board.categoryOptional")}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({t("common.optional")})
                    </span>
                  </Label>
                  <Select
                    value={
                      formData.category === null ? "None" : formData.category
                    }
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: value === "None" ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-11 w-full">
                      <div className="flex items-center gap-2 capitalize">
                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <SelectValue placeholder={t("board.category")} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">{t("board.none")}</SelectItem>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id} className="capitalize">
                          {category.label}
                        </SelectItem>
                      ))}
                      {filteredCategories.length === 0 && (
                        <SelectItem value="none" disabled>
                          <span className="italic text-muted-foreground">
                            {t("board.noCategoriesForBuilding")}
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormError error={errors.category} />
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("board.assignee")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.assignedTo || ""}
                    onValueChange={(value) => {
                      // Check if user belongs to the selected building
                      if (formData.building) {
                        const selectedUser = users.find((u) => u._id === value);
                        const belongsToBuilding = selectedUser?.affectedTo?.some(
                          (b) => b._id === formData.building
                        );
                        if (!belongsToBuilding) {
                          toast({
                            title: "User not assigned to this building",
                            description: `${selectedUser?.Name} ${selectedUser?.Last_Name} does not belong to the selected building. Please choose another user.`,
                            variant: "destructive",
                          });
                          setFormData((prev) => ({ ...prev, assignedTo: "" }));
                          return;
                        }
                      }
                      setFormData((prev) => ({ ...prev, assignedTo: value }));
                    }}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        {formData.assignedTo ? (
                          (() => {
                            const selectedUser = currentUserArray.find(
                              (u) => u._id === formData.assignedTo
                            );
                            return selectedUser ? (
                              <>
                                <span className="font-medium truncate first-letter:uppercase">
                                  {selectedUser.Name} {selectedUser.Last_Name}
                                </span>
                              </>
                            ) : null;
                          })()
                        ) : (
                          <span className="text-muted-foreground">
                            {t("board.selectAssignee")}
                          </span>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserArray.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-3 py-1">
                            <Avatar className="h-8 w-8">
                              {user?.profile_picture ? (
                                <AvatarImage
                                  src={user.profile_picture}
                                  alt={user.Name}
                                />
                              ) : (
                                <AvatarFallback className="bg-[#0F4C7BFF] text-white text-xs">
                                  {user.Name?.[0]?.toUpperCase()}
                                  {user.Last_Name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium first-letter:uppercase">
                                {user.Name} {user.Last_Name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      {currentUserArray?.length === 0 && (
                        <SelectItem value="none" disabled>
                          <span className="italic text-muted-foreground">
                            {t("board.noUsersAvailable")}
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormError error={errors.assignedTo} />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <TaskDatePicker
                  label={t("board.dueDate")}
                  value={formData.dueDate}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, dueDate: date }));
                    clearError("dueDate");
                  }}
                  placeholder={t("board.pickADate")}
                  disablePastDates={true}
                />
              </div>
              {/* Checklist */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    {t("board.checklist")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("common.optional")})
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("board.addActionableSteps")}
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
                        if (
                          draggedChecklistIndex === null ||
                          draggedChecklistIndex === index
                        ) {
                          setDraggedChecklistIndex(null);
                          return;
                        }
                        const updatedChecklist = [...formData.checklist];
                        const [draggedItem] = updatedChecklist.splice(
                          draggedChecklistIndex,
                          1
                        );
                        updatedChecklist.splice(index, 0, draggedItem);
                        setFormData((prev) => ({
                          ...prev,
                          checklist: updatedChecklist,
                        }));
                        setDraggedChecklistIndex(null);
                      }}
                      onDragEnd={() => setDraggedChecklistIndex(null)}
                      className={`flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm hover:shadow transition-shadow ${draggedChecklistIndex === index ? "opacity-50" : ""
                        }`}
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
                        onCheckedChange={(c) => {
                          setFormData((prev) => ({
                            ...prev,
                            checklist: prev.checklist.map((ci) =>
                              ci.id === item.id ? { ...ci, checked: !!c } : ci
                            ),
                          }));
                        }}
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
                      placeholder={t("board.addChecklistItem")}
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addChecklistItem()
                      }
                      className="h-11"
                    />
                    <Button
                      onClick={addChecklistItem}
                      size="lg"
                      className="px-6"
                    >
                      {t("board.addItem")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Attachments - PROFESSIONAL UPGRADE */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    {t("board.attachments")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("common.optional")})
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("board.uploadPhotos")}
                  </p>
                </div>

                {/* Uploaded Files Grid - Unchanged */}
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {formData.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="aspect-square bg-muted/20">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
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

                {/* Compact Upload Area - Reduced height */}
                {/* The entire clickable upload zone */}
                <label
                  htmlFor="file-upload-input"
                  className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Upload Icon */}
                    <UploadCloud size={54} color="#636AE8FF" />

                    {/* Browse Files Button - just visual, no input overlay needed */}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); // Important: prevent label from triggering twice
                        document.getElementById("file-upload-input")?.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                    >
                      {t("support.browseFiles")}
                    </Button>
                  </div>
                </label>

                {/* Hidden actual file input */}
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="*/*"
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
                {t("board.cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="min-w-40 font-medium"
              >
                {isSubmitting ? t("board.creating") : t("board.createTask")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Task Modal */}
      <LinkTaskModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        onSelectLink={handleLinkSelect}
        selectedBuildingId={formData.building}
      />
    </>
  );
}
