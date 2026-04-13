import { useState, useEffect, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  User,
  Trash2,
  X,
  Building,
  Tag,
  ChevronsDown,
  AlertCircle,
  GripVertical,
  UploadCloud,
  Link,
  DoorClosed,
  Printer,
  FileText,
  Trash,
} from "lucide-react";
import {
  RecurrenceConfigFrontend,
  RepeatConfiguration,
} from "./RepeatConfiguration";
import { TaskDatePicker } from "./TaskDatePicker";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuildingData } from "@/hooks/useBuildingData";
import { useBuilding } from "@/contexts/BuildingContext";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useCreateRecurringTask } from "@/hooks/mutations";
import { apiService, endpoints } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LinkTaskModal } from "@/components/BoardGroup/LinkTaskModal";
import { useQuery } from "@tanstack/react-query";
import { useFormValidation } from "@/hooks/useFormValidation";
import { toast } from "sonner";
import { FormError } from "../ui/form-error";

interface CreateRecurringTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface FormData {
  name: string;
  building: string;
  asset_id: string;
  space_id: string;
  assignee: string;
  category_id: string;
  priority: "Low" | "Medium" | "High";
  checklist: ChecklistItem[];
  description: string;
  start_date: Date;
  end_date: Date | null;
  recurrence: RecurrenceConfigFrontend;
  attachments: string[];
  linkedType: "Space" | "Asset" | null;
  linkedName: string;
}

export function CreateRecurringTaskModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateRecurringTaskModalProps) {
  const { t } = useLanguage();
  const { selectedBuilding } = useBuilding();
  const { filteredSpaces, filteredAssets } = useBuildingData();
  const { data: currentUser } = useCurrentUserQuery();
  const { users, buildings, refreshData } = useReferenceData();
  const createRecurringTask = useCreateRecurringTask();
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiService.get(endpoints.categories);
      return response.data;
    },
  });
  const [linkedToError, setLinkedToError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    building: selectedBuilding?._id || "",
    asset_id: "",
    space_id: "",
    assignee: "",
    category_id: "",
    priority: "Medium",
    checklist: [] as { id: string; text: string; checked: boolean }[],
    description: "",
    start_date: new Date(),
    end_date: null,
    recurrence: { type: "daily" as const, interval: 1 },
    attachments: [],
    linkedType: null,
    linkedName: "",
  });

  // Filter categories based on selected building
  const filteredCategories = useMemo(() => {
    if (!categoriesData || !formData.building) return [];
    return (categoriesData as any[]).filter((category: any) =>
      category.buildingIds?.some((b: any) => b._id === formData.building)
    );
  }, [categoriesData, formData.building]);

  // Reset category when building changes
  useEffect(() => {
    if (formData.building) {
      setFormData((prev) => ({
        ...prev,
        category_id: "",
        asset_id: "",
        space_id: "",
        linkedType: null,
        linkedName: "",
      }));
    }
  }, [formData.building]);

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState<
    number | null
  >(null);

  const { errors, validateForm, clearError } = useFormValidation({
    name: { required: true, message: t("tasks.taskNameRequired") },
    building: { required: true, message: t("tasks.buildingRequired") },
    assignee: { required: true, message: t("tasks.assigneeRequired") },
    start_date: { required: true, message: t("tasks.startDateRequiredMsg") },
  });

  const handleSubmit = async () => {
    setIsLoading(true);

    // Validate linked to field
    /* const hasLinkedTo = formData.asset_id || formData.space_id;
    if (!hasLinkedTo) {
      setLinkedToError("Linked to is required");
    } else {
      setLinkedToError(null);
    } */

    try {
       if (!validateForm(formData)) {
      toast.error(t("tasks.missingRequiredFields"), {
          description: t("tasks.fillRequiredFields"),
        });
        setIsLoading(false);
        return;
      }

      // Build FormData to send files along with task data
      const formPayload = new FormData();

      formPayload.append("created_by", currentUser?._id || "");
      formPayload.append(
        "organizationId",
        currentUser?.Organization_id?._id || ""
      );
      formPayload.append("name", formData.name);
      if (formData.description) {
        formPayload.append("description", formData.description);
      }
      formPayload.append(
        "building",
        formData.building || selectedBuilding?._id || ""
      );
      if (formData.asset_id) {
        formPayload.append("asset_id", formData.asset_id);
      }
      if (formData.space_id) {
        formPayload.append("space_id", formData.space_id);
      }
      if (formData.assignee) {
        formPayload.append("assignee", formData.assignee);
      }
      if (formData.category_id) {
        formPayload.append("category_id", formData.category_id);
      }
      formPayload.append("priority", formData.priority);

      if (formData.checklist.length > 0) {
        formPayload.append(
          "checklist",
          JSON.stringify(
            formData.checklist.map((item) => ({
              text: item.text,
              checked: item.checked,
            }))
          )
        );
      }


      if (formData.start_date) {
        const localDate = formData.start_date;
        const utcMidnight = new Date(
          Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate()
          )
        );

        formPayload.append("start_date", utcMidnight.toISOString());
      }
      if (formData.end_date) {
        const localDate = formData.end_date;
        const utcMidnight = new Date(
          Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate()
          )
        );

        formPayload.append("end_date", utcMidnight.toISOString());
      }
     
      formPayload.append("recurrence", JSON.stringify(formData.recurrence));
      formPayload.append("is_active", "true");

      // Append files
      files.forEach((file) => {
        formPayload.append("files", file);
      });

      await createRecurringTask.mutateAsync(formPayload);

      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        building: selectedBuilding?._id || "",
        asset_id: "",
        space_id: "",
        assignee: "",
        category_id: "",
        priority: "Medium",
        checklist: [] as { id: string; text: string; checked: boolean }[],
        description: "",
        start_date: new Date(),
        end_date: null,
        recurrence: { type: "daily" as const, interval: 1 },
        attachments: [],
        linkedType: null,
        linkedName: "",
      });
      setFiles([]);
    } catch (error: any) {
      console.error("Error creating recurring task:", error);
      toast.error(t("tasks.error"), {
        description: t("tasks.serverError"),
      });
    } finally {
      setIsLoading(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    // Validate file size
    const oversizedFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(t("tasks.fileTooLarge"), {
        description: t("tasks.maxFileSize"),
      });
      e.target.value = "";
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);

    // Optional: clear input for next selection
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
          {/* HEADER */}
          <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {t("tasks.createRecurringTask")}
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
            <p className="text-sm text-muted-foreground mt-2">
              {t("tasks.createRecurringTaskDesc")}
            </p>
          </DialogHeader>

          {/* BODY - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("tasks.taskName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("tasks.taskNamePlaceholder")}
                  className="h-11 text-sm"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                  }}
                />
                <FormError error={errors.name} />
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("tasks.additionalInfo")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("tasks.optional")})
                  </span>
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("tasks.additionalInfoPlaceholder")}
                  className="min-h-36 resize-none text-sm"
                  value={formData?.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Building */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("tasks.building")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.building || ""}
                  onValueChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, building: value }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-3 capitalize">
                      <Building className="h-4.5 w-4.5 text-muted-foreground" />
                      <SelectValue placeholder={t("tasks.selectBuilding")} className="capitalize"/>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBuilding && (
                      <SelectItem value={selectedBuilding._id}>
                        <span className="font-medium capitalize">
                          {selectedBuilding.label}
                        </span>
                      </SelectItem>
                    )}
                    {!selectedBuilding &&
                      buildings
                        .filter((building) => !building.archived)
                        .map((building) => (
                          <SelectItem key={building._id} value={building._id} className="capitalize">
                            {building.label}
                          </SelectItem>
                        ))}
                    {buildings?.length === 0 && (
                      <SelectItem value="none" disabled>
                        <span className="italic text-muted-foreground">
                          {t("tasks.noBuildingsAvailable")}
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormError error={errors.building} />
              </div>

              {/* Link to Space or Asset */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("tasks.linkedTo")}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 justify-start"
                    onClick={() => setLinkModalOpen(true)}
                    disabled={!formData.building}
                  >
                    <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formData.linkedName ? (
                      <div className="flex items-center gap-2">
                        {/* {formData.linkedType === "Space" ? (
                          <DoorClosed className="h-4 w-4 text-primary" />
                        ) : (
                          <Printer className="h-4 w-4 text-primary" />
                        )} */}
                        <span className="font-medium capitalize">
                          {formData.linkedName}
                        </span>
                        {/* <span className="text-xs text-muted-foreground">
                          ({formData.linkedType})
                        </span> */}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {t("tasks.chooseSpaceAsset")}
                      </span>
                    )}
                  </Button>
                  {formData.linkedName && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          asset_id: "",
                          space_id: "",
                          linkedType: null,
                          linkedName: "",
                        }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {linkedToError && !formData.asset_id && !formData.space_id && (
                  <FormError error={linkedToError} />
                )}
                {!formData.space_id && formData.asset_id && (
                  <FormError error={errors.space_id} />
                )}
                {formData.space_id && !formData.asset_id && (
                  <FormError error={errors.asset_id} />
                )}
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("tasks.assignee")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.assignee || ""}
                  onValueChange={(value) => {
                    // Check if user belongs to the selected building
                    if (formData.building) {
                      const selectedUser = users.find((u) => u._id === value);
                      const belongsToBuilding = selectedUser?.affectedTo?.some(
                        (b) => b._id === formData.building
                      );
                      if (!belongsToBuilding) {
                        toast.error(t("tasks.userNotAssignedToBuilding"), {
                         description: t("tasks.userNotBelongDesc").replace("{name}", `${selectedUser?.Name} ${selectedUser?.Last_Name}`),
                        });
                        setFormData((prev) => ({ ...prev, assignee: "" }));
                        return;
                      }
                    }
                    setFormData((prev) => ({ ...prev, assignee: value }));
                  }}
                >
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-3">
                      <User className="h-4.5 w-4.5 text-muted-foreground" />
                      {formData.assignee ? (
                        (() => {
                          const selectedUser = users.find(
                            (u) => u._id === formData.assignee
                          );
                          return selectedUser ? (
                            <>
                             
                              <span className="font-medium">
                                {selectedUser.Name} {selectedUser.Last_Name}
                              </span>
                            </>
                          ) : null;
                        })()
                      ) : (
                        <span className="text-muted-foreground">
                          {t("tasks.selectAssignee")}
                        </span>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
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
                            <span className="font-medium">
                              {user.Name} {user.Last_Name}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    {users?.length === 0 && (
                      <SelectItem value="none" disabled>
                        <span className="italic text-muted-foreground">
                          {t("tasks.noUsersAvailable")}
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormError error={errors.assignee} />
              </div>

              {/* Category & Priority - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("tasks.category")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("tasks.optional")})
                    </span>
                  </Label>
                  <Select
                    value={formData.category_id || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category_id: value }))
                    }
                    disabled={!formData.building}
                  >
                    <SelectTrigger className="h-11">
                      <div className="flex items-center gap-3">
                        <Tag className="h-4.5 w-4.5 text-muted-foreground" />
                        <SelectValue placeholder="None" className="capitalize"/>{" "}
                        {/* This shows "None" when no selection */}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category: any) => (
                        <SelectItem key={category._id} value={category._id} className="capitalize">
                          {category.label}
                        </SelectItem>
                      ))}
                      {filteredCategories.length === 0 && formData.building && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                          {t("tasks.noCategoriesAvailable")}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("tasks.priority")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.priority || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: value as "Low" | "Medium" | "High",
                      }))
                    }
                  >
                    <SelectTrigger
                      className={`h-11 ${
                        priorityColors[formData.priority] || ""
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.priority === "Low" && (
                          <ChevronsDown className="w-5 h-5" color="#379AE6" />
                        )}
                        {formData.priority === "Medium" && (
                          <svg
                            className="w-5 h-5"
                            fill="#EA916EFF"
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
                          {formData.priority === "Low" ? t("tasks.low") : formData.priority === "Medium" ? t("tasks.medium") : formData.priority === "High" ? t("tasks.high") : t("tasks.selectPriority")}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">
                        <div className="flex items-center gap-3">
                          <ChevronsDown className="w-5 h-5" color="#379AE6" />
                          <span>{t("tasks.low")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="#EA916EFF"
                            viewBox="0 0 24 24"
                          >
                            <rect height={2} width={18} x={3} y={3} />
                            <rect height={2} width={18} x={3} y={11} />
                            <rect height={2} width={18} x={3} y={19} />
                          </svg>
                          <span>{t("tasks.medium")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="High">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span>{t("tasks.high")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Date */}
              <TaskDatePicker
                label={`${t("tasks.startDateRequired")}*`}
                value={formData?.start_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, start_date: date }))
                }
                placeholder={t("tasks.selectStartDate")}
                disablePastDates={true}
              />

              {/* Repeat Configuration */}
              <RepeatConfiguration
                value={formData?.recurrence}
                onChange={(config) =>
                  setFormData({ ...formData, recurrence: config })
                }
              />

              {/* End Date */}
              <TaskDatePicker
                label={t("tasks.endDateOptional")}
                value={formData?.end_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, end_date: date }))
                }
                placeholder={t("tasks.selectEndDate")}
                disablePastDates={true}
                minDate={formData.start_date}
              />

              {/* Checklist */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    {t("tasks.checklist")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("tasks.optional")})
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("tasks.checklistDesc")}
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
                      className={`flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm hover:shadow transition-shadow ${
                        draggedChecklistIndex === index ? "opacity-50" : ""
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
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            checklist: prev.checklist.map((ci) =>
                              ci.id === item.id
                                ? { ...ci, checked: !!checked }
                                : ci
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
                      placeholder={t("tasks.addNewChecklistItem")}
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
                      {t("tasks.addItem")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    {t("tasks.attachments")}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t("tasks.optional")})
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("tasks.attachmentsDesc")}
                  </p>
                </div>

                {/* Upload Area + Preview */}
                <div className="space-y-6">
                  {/* Preview of uploaded files (appears after selection) */}
                  {files.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                              <div className="text-center">
                                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-1 text-xs text-muted-foreground truncate max-w-[120px]">
                                  {file.name}
                                </p>
                              </div>
                            </div>
                          )}
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
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
                        onClick={(e) => {
                          e.stopPropagation(); // ← Prevents double open when clicking button
                          fileInputRef.current?.click();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                      >
                        {t("tasks.browseFiles")}
                      </Button>
                    </div>
                  </div>

                  {/* Hidden real file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*, .pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="min-w-32"
              >
                {t("tasks.cancel")}
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                onClick={handleSubmit}
                className="min-w-40 font-medium"
              >
                {isLoading ? t("tasks.creating") : t("common.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Task Modal */}
      <LinkTaskModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        selectedBuildingId={formData.building}
        onSelectLink={(type, id, name) => {
          setFormData((prev) => ({
            ...prev,
            linkedType: type,
            linkedName: name,
            asset_id: type === "Asset" ? id : "",
            space_id: type === "Space" ? id : "",
          }));
        }}
        onApplyLinks={() => {
          setLinkModalOpen(false);
        }}
      />
    </>
  );
}
