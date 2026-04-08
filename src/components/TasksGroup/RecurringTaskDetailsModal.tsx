import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  X,
  Building,
  User,
  Calendar,
  Edit,
  RefreshCw,
  Tag,
  Repeat,
  Check,
  InfoIcon,
  ChevronsDown,
  Upload,
  Link2,
  FileText,
  Image as ImageIcon,
  File,
  Plus,
  GripVertical,
  MoreHorizontal,
  Play,
  Video,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { apiService, endpoints } from "@/services/api";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { LinkTaskModal } from "../BoardGroup/LinkTaskModal";
import { useUpdateRecurringTask } from "@/hooks/mutations";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DeleteRecurringTaskModal } from "@/components/TasksGroup/DeleteRecurringTaskModal";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/contexts/PermissionsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { format, startOfDay } from "date-fns";
import { useDocumentsQuery } from "@/hooks/queries/useDocumentsQuery";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RecurrenceConfigFrontend,
  RepeatConfiguration,
} from "./RepeatConfiguration";
import { formatDate } from "@/utils/dateUtils";
import { ImageGallery } from "@/components/Common/ImageGallery";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";

// Floating Edit Modal Component - Defined outside to prevent recreation on every render
const FloatingEditModal = ({
  isOpen,
  onClose,
  title,
  onSave,
  children,
  cancelLabel,
  saveLabel,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSave: () => void;
  children: React.ReactNode;
  cancelLabel?: string;
  saveLabel?: string;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;
  const { t } = useLanguage();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ marginTop: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/20"
        onClick={!isLoading ? onClose : undefined}
      />
      <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95">
        <label className="text-sm font-medium">{title}</label>
        <div className="mt-3">{children}</div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button size="sm" onClick={onSave} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
            ) : null}
            {t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface RecurringTaskDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
}

export function RecurringTaskDetailsModal({
  open,
  onOpenChange,
  task,
}: RecurringTaskDetailsModalProps) {
  const { t } = useLanguage();
  const updateTask = useUpdateRecurringTask();
  const queryClient = useQueryClient();
  const { categories, users } = useReferenceData();
  const { hasPermission } = usePermissions();
  const { selectedBuildingId } = useBuildingSelection();

  // Floating edit states
  const [editingName, setEditingName] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState(false);
  const [editingStartDate, setEditingStartDate] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  // Temp values for editing
  const [tempName, setTempName] = useState("");
  const [tempPriority, setTempPriority] = useState("Medium");
  const [tempCategory, setTempCategory] = useState("");
  const [tempAssignee, setTempAssignee] = useState("");
  const [tempRecurrence, setTempRecurrence] =
    useState<RecurrenceConfigFrontend>({ type: "daily", interval: 1 });
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>();
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>();
  const [tempStatus, setTempStatus] = useState("true");
  const [tempDescription, setTempDescription] = useState("");

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [checklist, setChecklist] = useState(task?.checklist || []);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState<
    number | null
  >(null);
  const [editingChecklistIndex, setEditingChecklistIndex] = useState<
    number | null
  >(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<"upload" | "link">(
    "upload",
  );
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [linkedDocuments, setLinkedDocuments] = useState<any[]>(
    task?.linked_documents || [],
  );

  // Image gallery and video states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [videoToPlay, setVideoToPlay] = useState<string | null>(null);

  const { data: documents = [] } = useDocumentsQuery();

  // File type helpers
  const isVideoFile = (url: string) => url?.toLowerCase().endsWith(".mp4");
  const isImageFileAttachment = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(url?.toLowerCase() || "");

  const getAttachmentIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return (
          <img src={pdfIcon} className="w-8 h-8 object-contain" alt="PDF" />
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
        return <Video className="w-8 h-8 text-primary" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return (
          <img src={imageIcon} className="w-8 h-8 object-contain" alt="Image" />
        );
      case "txt":
        return <FileText className="w-8 h-8 text-gray-600" />;
      default:
        return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };

  // Get image attachments for gallery
  const getImageAttachments = () => {
    return (task?.attachments || []).filter((att: string) =>
      isImageFileAttachment(att),
    );
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initialize temp values when task changes
  useEffect(() => {
    if (task) {
      setTempName(task.name || "");
      setTempPriority(task.priority || "Medium");
      setTempCategory(
        task.category_id && typeof task.category_id === "object"
          ? task.category_id._id
          : task.category_id || "",
      );
      setTempAssignee(task.assignee?._id || "");
      setTempRecurrence(task.recurrence || { type: "daily", interval: 1 });
      setTempStartDate(task.start_date ? new Date(task.start_date) : undefined);
      setTempEndDate(task.end_date ? new Date(task.end_date) : undefined);
      setTempStatus(task.is_active ? "true" : "false");
      setTempDescription(task.description || "");
      setChecklist(task.checklist || []);
      setLinkedDocuments(task.linked_documents || []);
    }
  }, [task]);

  const handleSaveName = async () => {
    try {
      await updateTask.mutateAsync({ id: task._id, data: { name: tempName } });
      setEditingName(false);
    } catch (error) {
      // error handled by mutation's onError
    }
  };

  const handleSavePriority = async () => {
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { priority: tempPriority },
      });
      setEditingPriority(false);
    } catch (error) {}
  };

  const handleSaveCategory = async () => {
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { category_id: tempCategory },
      });
      setEditingCategory(false);
    } catch (error) {}
  };

  const handleSaveAssignee = async () => {
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { assignee: tempAssignee },
      });
      setEditingAssignee(false);
    } catch (error) {}
  };

  const handleSaveRecurrence = async () => {
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { recurrence: tempRecurrence },
      });
      setEditingRecurrence(false);
    } catch (error) {}
  };

  const handleSaveStartDate = async () => {
    try {
      const dateStr = tempStartDate ? format(tempStartDate, "yyyy-MM-dd") : undefined;
      await updateTask.mutateAsync({
        id: task._id,
        data: { start_date: dateStr },
      });
      setEditingStartDate(false);
    } catch (error) {}
  };

  const handleSaveEndDate = async () => {
    try {
       const dateStr = tempEndDate ? format(tempEndDate, "yyyy-MM-dd") : undefined;
      await updateTask.mutateAsync({
        id: task._id,
        data: { end_date: dateStr },
      });
      setEditingEndDate(false);
    } catch (error) {}
  };

  const handleSaveStatus = async () => {
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { is_active: tempStatus === "true" },
      });
      setEditingStatus(false);
    } catch (error) {}
  };

  const handleSaveDescription = async () => {
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { description: tempDescription },
      });
      setEditingDescription(false);
    } catch (error) {}
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const updatedChecklist = [
        ...checklist,
        { id: Date.now().toString(), text: newChecklistItem, checked: false },
      ];
      setChecklist(updatedChecklist);
      updateTask.mutate({
        id: task._id,
        data: { checklist: updatedChecklist },
      });
      setNewChecklistItem("");
    }
  };

  const handleDeleteClick = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleTaskDeleted = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
    onOpenChange(false);
  };

  const removeChecklistItem = (index: number) => {
    const updatedChecklist = checklist.filter(
      (_: any, i: number) => i !== index,
    );
    setChecklist(updatedChecklist);
    updateTask.mutate({ id: task._id, data: { checklist: updatedChecklist } });
  };

  const toggleChecklistItem = (index: number) => {
    const updatedChecklist = checklist.map((item: any, i: number) =>
      i === index ? { ...item, checked: !item.checked } : item,
    );
    setChecklist(updatedChecklist);
    updateTask.mutate({ id: task._id, data: { checklist: updatedChecklist } });
  };

  const handleEditChecklistItem = (index: number) => {
    setEditingChecklistIndex(index);
    setEditingChecklistText(checklist[index]?.text || "");
  };

  const handleSaveChecklistEdit = async () => {
    if (editingChecklistIndex === null || !editingChecklistText.trim()) return;

    const updatedChecklist = checklist.map((item: any, index: number) =>
      index === editingChecklistIndex
        ? { ...item, text: editingChecklistText.trim() }
        : item,
    );

    setChecklist(updatedChecklist);
    await updateTask.mutateAsync({
      id: task._id,
      data: { checklist: updatedChecklist },
    });
    setEditingChecklistIndex(null);
    setEditingChecklistText("");
  };

  const handleCancelChecklistEdit = () => {
    setEditingChecklistIndex(null);
    setEditingChecklistText("");
  };

  if (!task) return null;

  // Helper function to format rhythm for display
  const formatRhythm = (recurrence: any) => {
    if (!recurrence) return "-";

    const {
      type,
      interval,
      weekDays,
      monthDay,
      monthPosition,
      monthWeekDay,
      yearMonth,
      yearDay,
      yearPosition,
      yearWeekDay,
      yearMonthName,
    } = recurrence;

    if (type === "daily") {
      return interval === 1 ? "Every day" : `Every ${interval} days`;
    }

    if (type === "mofr") {
      return "Every week Mo - Fr";
    }

    if (type === "weekly") {
      const dayLabel = weekDays?.[0]
        ? weekDays[0].charAt(0).toUpperCase() + weekDays[0].slice(1)
        : "Monday";
      return interval === 1
        ? `Every week on ${dayLabel}`
        : `Every ${interval} weeks on ${dayLabel}`;
    }

    if (type === "monthly") {
      if (monthPosition && monthWeekDay) {
        const dayLabel =
          monthWeekDay.charAt(0).toUpperCase() + monthWeekDay.slice(1);
        return interval === 1
          ? `Every month on the ${monthPosition} ${dayLabel}`
          : `Every ${interval} months on the ${monthPosition} ${dayLabel}`;
      }
      return interval === 1
        ? `Every month on day ${monthDay || 1}`
        : `Every ${interval} months on day ${monthDay || 1}`;
    }

    if (type === "yearly") {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      if (yearPosition && yearWeekDay) {
        const dayLabel =
          yearWeekDay.charAt(0).toUpperCase() + yearWeekDay.slice(1);
        const monthLabel = months[(yearMonthName || 1) - 1];
        return `Every ${
          interval === 1 ? "year" : `${interval} years`
        } on the ${yearPosition} ${dayLabel} of ${monthLabel}`;
      }
      const monthLabel = months[(yearMonth || 1) - 1];
      return `Every ${
        interval === 1 ? "year" : `${interval} years`
      } on ${monthLabel} ${yearDay || 1}`;
    }

    return type || "-";
  };

  // Get building ID from the linked space or asset (similar to TaskDetailModal)
  const editSelectedBuildingId = (() => {
    // Check if building_id exists directly on the task
    if (task?.building_id) {
      return typeof task.building_id === "string"
        ? task.building_id
        : task.building_id?._id;
    }
    // Check if space_id has building info
    if (task?.space_id?.building_id) {
      return typeof task.space_id.building_id === "string"
        ? task.space_id.building_id
        : task.space_id.building_id?._id;
    }
    // Check if asset_id has building info
    if (task?.asset_id?.building_id) {
      return typeof task.asset_id.building_id === "string"
        ? task.asset_id.building_id
        : task.asset_id.building_id?._id;
    }
    return undefined;
  })();

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "High":
        return {
          classes:
            "text-[#DE3B40FF] bg-[#FDF2F2FF] font-medium first-letter:uppercase",
          icon: <InfoIcon className="w-3 h-3 text-[#DE3B40FF]" />,
        };
      case "Medium":
        return {
          classes:
            "text-[#EA916EFF] bg-[#FDF5F1FF] font-medium first-letter:uppercase",
          icon: (
            <svg
              className="w-3 h-3"
              fill="#EA916EFF"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <g>
                <rect fill="none" height="20" width="20" />
              </g>
              <g>
                <g>
                  <rect height="2" width="18" x="3" y="3" />
                  <rect height="2" width="18" x="3" y="19" />
                  <rect height="2" width="18" x="3" y="11" />
                </g>
              </g>
            </svg>
          ),
        };
      case "Low":
        return {
          classes:
            "text-[#379AE6FF] bg-[#F1F8FDFF] font-medium first-letter:uppercase",
          icon: <ChevronsDown className="w-3 h-3 text-[#379AE6FF]" />,
        };
      default:
        return {
          classes:
            "text-gray-600 bg-gray-50 border-gray-200 font-medium first-letter:uppercase",
          icon: <ChevronsDown className="w-3 h-3 text-blue-600" />,
        };
    }
  };

  const handleApplyLinks = async (links: any[]) => {
    if (!task || links.length === 0) return;
    const selectedLink = links[0];
    const linkModel = selectedLink.type === "office" ? "space_id" : "asset_id";

    // Prepare update data, include building if provided
    // For recurring tasks, the building field is "building" not "building_id"
    const updateData: any = { [linkModel]: selectedLink.id };

    // Update building if a new one is provided (when selecting from different building)
    if (selectedLink.buildingId) {
      updateData.building = selectedLink.buildingId;
    }

    await updateTask.mutateAsync({
      id: task._id,
      data: updateData,
    });
    setIsLinkModalOpen(false);
  };

  const handleLinkSelect = () => {};

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || !task) return;

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > MAX_FILE_SIZE,
    );
    if (oversizedFiles.length > 0) {
      toast.error(t("tasks.fileTooLarge"), {
        description: t("tasks.maxFileSize"),
      });
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const uploadResponse = await apiService.post<{ urls: string[] }>(
        `${endpoints.reccuringTasks}/${task._id}/attachments`,
        formData,
      );

      const uploadedUrls = uploadResponse.data.urls || [];
      const currentAttachments = task.attachments || [];
      const newAttachments = [...currentAttachments, ...uploadedUrls];

      // Invalidate to refresh task data with new attachments
      await queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });

      toast.success(t("tasks.title"), {
        description: t("tasks.filesUploaded").replace(
          "{count}",
          String(files.length),
        ),
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(t("tasks.error"), {
        description: t("tasks.failedUpload"),
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentUrl: string) => {
    if (!task) return;
    try {
      const updatedAttachments = (task.attachments || []).filter(
        (att: string) => att !== attachmentUrl,
      );

      await apiService.delete<{ urls: string[] }>(
        `${endpoints.reccuringTasks}/${task._id}/attachments`,
        { data: { attachmentUrl } },
      );

      // Invalidate to refresh task data after deletion
      await queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });

      toast.success(t("tasks.removed"), {
        description: t("tasks.attachmentDeleted"),
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error(t("tasks.error"), {
        description: t("tasks.failedDeleteAttachment"),
      });
    }
  };

  const handleLinkDocuments = async () => {
    if (selectedDocuments.length === 0) return;

    try {
      const docsToLink = documents.filter((doc: any) =>
        selectedDocuments.includes(doc._id),
      );
      const newLinkedDocs = [...linkedDocuments, ...docsToLink];

      await updateTask.mutateAsync({
        id: task._id,
        data: { linked_documents: newLinkedDocs.map((d) => d._id) },
      });

      setLinkedDocuments(newLinkedDocs);
      setSelectedDocuments([]);
      setIsAttachmentModalOpen(false);

      toast.success(t("tasks.title"), {
        description: t("tasks.documentsLinked").replace(
          "{count}",
          String(selectedDocuments.length),
        ),
      });
    } catch (error) {
      console.error("Error linking documents:", error);
      toast.error(t("tasks.error"), {
        description: t("tasks.failedLinkDocuments"),
      });
    }
  };

  const handleRemoveLinkedDocument = async (docId: string) => {
    try {
      const updatedDocs = linkedDocuments.filter((d: any) => d._id !== docId);

      await updateTask.mutateAsync({
        id: task._id,
        data: { linked_documents: updatedDocs.map((d: any) => d._id) },
      });

      setLinkedDocuments(updatedDocs);

      toast.success(t("tasks.removed"), {
        description: t("tasks.documentUnlinked"),
      });
    } catch (error) {
      console.error("Error removing document:", error);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="w-4 h-4 text-green-600" />;
    }
    if (ext === "pdf") {
      return <FileText className="w-4 h-4 text-red-600" />;
    }
    return <File className="w-4 h-4 text-blue-600" />;
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-[#D3F9E0] text-[#5EAE79] rounded-md px-4 py-1">
        {t("tasks.active")}
      </Badge>
    ) : (
      <Badge className="bg-[#FDF2F2] text-[#E45F63] px-4 py-1 rounded-md">
        {t("tasks.inactive")}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-xl sm:max-w-sm md:max-w-sm w-full max-h-[95vh] p-0 gap-0 sm:mx-auto flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-5 border-b sticky top-0 bg-accent/50 z-10">
          <DialogTitle>
            <div className="flex items-center gap-2">
              {t("tasks.recurringTaskDetails")}
            </div>
          </DialogTitle>
          <div className="flex items-center gap-3">
            {hasPermission("tasks", "deleteTasks") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                onClick={(e) => handleDeleteClick(task, e)}
              >
                <Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Task Name Section */}
          <div className="space-y-1 flex items-center gap-3">
            <div className="bg-[#F1F5FE] w-10 h-10 rounded-md flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground first-letter:uppercase">
                  {task.name}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="transition-opacity"
                >
                  <Edit className="h-4 w-4" color="#565E6CFF" />
                </button>
              </div>
              <p className=" first-letter:uppercase text-xs text-gray-500">
                {t("tasks.created")}{" "}
                {task.createdAt ? formatDate(task.createdAt) : "-"}
              </p>
            </div>
          </div>

          {/* Attachments Section - Card Grid Style */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {/* <Label className="text-sm font-medium text-foreground">
                Attachments ({task.attachments?.length || 0})
              </Label> */}
              {/* <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={isUploading}
                  asChild
                >
                  <span>
                    <Plus className="h-3.5 w-3.5" />
                    {isUploading ? "Uploading..." : "Add"}
                  </span>
                </Button>
              </label> */}
            </div>

            {task.attachments && task.attachments.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {task.attachments.map((attachment: string, index: number) => {
                  const isImage = isImageFileAttachment(attachment);
                  const isVideo = isVideoFile(attachment);

                  return (
                    <div
                      key={index}
                      className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        if (isImage) {
                          const imageIndex =
                            getImageAttachments().indexOf(attachment);
                          setSelectedImageIndex(
                            imageIndex >= 0 ? imageIndex : 0,
                          );
                          setImageGalleryOpen(true);
                        } else if (isVideo) {
                          setVideoToPlay(attachment);
                        } else {
                          handleDownload(attachment);
                        }
                      }}
                    >
                      {/* Content */}
                      {isVideo ? (
                        <div className="relative w-full h-full">
                          <video
                            src={attachment}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : isImage ? (
                        <img
                          src={attachment}
                          alt="attachment"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          {getAttachmentIcon(attachment)}
                          <span className="text-[10px] text-muted-foreground mt-1 text-center truncate w-full">
                            {attachment.split("/").pop()?.slice(0, 10)}...
                          </span>
                        </div>
                      )}

                      {/* Delete button overlay */}
                      <button
                        className="absolute top-1 right-1 h-5 w-5 bg-destructive text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAttachment(attachment);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      {/* Download button overlay for non-image files */}
                      {/* {!isImage && !isVideo && (
                        <button
                          className="absolute bottom-1 right-1 h-5 w-5 bg-primary text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(attachment);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      )} */}
                    </div>
                  );
                })}

                {/* Add button as a card */}
                <label
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*, .pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </label>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {/* Add button as a card when no attachments */}
                <label
                  className={`w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*, .pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </label>
              </div>
            )}
          </div>

          {/* Image Gallery Modal */}
          <ImageGallery
            images={getImageAttachments()}
            isOpen={imageGalleryOpen}
            onClose={() => setImageGalleryOpen(false)}
            initialIndex={selectedImageIndex}
          />

          {/* Video Player Modal */}
          {videoToPlay && (
            <Dialog
              open={!!videoToPlay}
              onOpenChange={() => setVideoToPlay(null)}
            >
              <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle>{t("tasks.videoPlayer")}</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <video
                    src={videoToPlay}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh] rounded-md"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Floating Name Edit */}
          <FloatingEditModal
            isOpen={editingName}
            onClose={() => {
              setTempName(task.name || "");
              setEditingName(false);
            }}
            title={t("tasks.editName")}
            onSave={handleSaveName}
            isLoading={updateTask.isPending}
          >
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
              className="text-lg font-medium"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setTempName(task.name || "");
                  setEditingName(false);
                }
              }}
            />
          </FloatingEditModal>

          {/* Details Grid */}
          <div className="space-y-4 border rounded-md p-4">
            {/* Linked to */}
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 mt-0.5" />
              <div className="flex-1 flex justify-between min-w-0">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.linkedTo")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-foreground capitalize">
                    {task.locationChain}
                  </div>
                  <button
                    onClick={() => setIsLinkModalOpen(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Assigned to */}
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 mt-0.5" />
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.assignedToColumn")}
                </div>
                <div className="flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <Avatar className="h-7 w-7 rounded-lg">
                        <AvatarImage
                          src={task.assignee?.profile_picture}
                          alt="Profile"
                          className="rounded-lg"
                        />
                        <AvatarFallback className="bg-[#0F4C7BFF] text-white text-xs">
                          {task.assignee?.Name?.[0]?.toUpperCase()}
                          {task.assignee?.Name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground first-letter:uppercase">
                        {task.assignee.Name} {task.assignee.Last_Name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {t("tasks.unassigned")}
                    </span>
                  )}
                  <button onClick={() => setEditingAssignee(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 mt-0.5" />
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.category")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                    {task?.category_id &&
                    typeof task.category_id === "object" &&
                    !Array.isArray(task.category_id)
                      ? task.category_id.label
                      : "N/A"}
                  </span>
                  <button onClick={() => setEditingCategory(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 mt-0.5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path d="M16 6l2.29 2.29l-4.88 4.88l-4-4L2 16.59L3.41 18l6-6l4 4l6.3-6.29L22 12V6h-6z" />
              </svg>
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.priority")}
                </div>
                <div className="flex items-center gap-2 capitalize">
                  <Badge
                    className={`px-3 py-1 border-none flex items-center gap-1  ${
                      getPriorityConfig(task.priority).classes
                    }`}
                  >
                    {getPriorityConfig(task.priority).icon}
                    {t(`tasks.${task.priority?.toLowerCase()}`) || task.priority?.toLowerCase()}
                  </Badge>
                  <button onClick={() => setEditingPriority(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Repeated */}
            <div className="flex items-start gap-3">
              <Repeat className="w-4 h-4 mt-0.5" />
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.repeated")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-foreground">
                    {formatRhythm(task.recurrence)}
                  </div>
                  <button onClick={() => setEditingRecurrence(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Start date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5" />
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.startDate")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-foreground">
                    {task.start_date ? formatDate(task.start_date) : "-"}
                  </div>
                  <button onClick={() => setEditingStartDate(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* End date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5" />
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.endDateOptional")
                    .replace(" (optional)", "")
                    .replace(" (optional)", "")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-foreground">
                    {task.end_date ? formatDate(task.end_date) : "-"}
                  </div>
                  <button onClick={() => setEditingEndDate(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path d="M2 11H7V13H2zM17 11H22V13H17zM11 17H13V22H11zM11 2H13V7H11z" />
                <path
                  transform="rotate(-45.001 6.697 6.697)"
                  d="M5.697 4.197H7.697V9.197H5.697z"
                />
                <path
                  transform="rotate(134.999 17.303 17.303)"
                  d="M16.303 14.803H18.303V19.803H16.303z"
                />
                <path
                  transform="rotate(45.001 6.697 17.303)"
                  d="M5.697 14.803H7.697V19.803H5.697z"
                />
                <path
                  transform="rotate(-44.992 17.303 6.697)"
                  d="M14.803 5.697H19.803V7.697H14.803z"
                />
              </svg>
              <div className="flex-1 flex justify-between">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t("tasks.status")}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(
                    task.is_active === true || task.is_active === "true"
                      ? "Active"
                      : "Inactive",
                  )}
                  <button onClick={() => setEditingStatus(true)}>
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#565E6CFF"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Edit Modals */}
          <FloatingEditModal
            isOpen={editingAssignee}
            onClose={() => {
              setTempAssignee(task.assignee?._id || "");
              setEditingAssignee(false);
            }}
            title={t("tasks.editAssignee")}
            onSave={handleSaveAssignee}
            isLoading={updateTask.isPending}
          >
            <Select value={tempAssignee} onValueChange={setTempAssignee}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("tasks.selectAssignee")} />
              </SelectTrigger>
              <SelectContent>
                {users
                  ?.filter((u: any) => u.role?.name !== "Manager")
                  .map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.Name} {user.Last_Name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FloatingEditModal>

          <FloatingEditModal
            isOpen={editingCategory}
            onClose={() => {
              setTempCategory(task.category_id?._id || "");
              setEditingCategory(false);
            }}
            title={t("tasks.editCategory")}
            onSave={handleSaveCategory}
            isLoading={updateTask.isPending}
          >
            <Select value={tempCategory} onValueChange={setTempCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("tasks.category")} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FloatingEditModal>

          <FloatingEditModal
            isOpen={editingPriority}
            onClose={() => {
              setTempPriority(task.priority || "Medium");
              setEditingPriority(false);
            }}
            title={t("tasks.editPriority")}
            onSave={handleSavePriority}
            isLoading={updateTask.isPending}
          >
            <Select value={tempPriority} onValueChange={setTempPriority}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">
                  <div className="flex items-center gap-2">
                    <ChevronsDown className="w-4 h-4 text-[#379AE6FF]" />
                    {t("tasks.low")}
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="#EA916EFF"
                      viewBox="0 0 24 24"
                    >
                      <rect height="2" width="18" x="3" y="3" />
                      <rect height="2" width="18" x="3" y="19" />
                      <rect height="2" width="18" x="3" y="11" />
                    </svg>
                    {t("tasks.medium")}
                  </div>
                </SelectItem>
                <SelectItem value="High">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    {t("tasks.high")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FloatingEditModal>

          <FloatingEditModal
            isOpen={editingRecurrence}
            onClose={() => {
              setTempRecurrence(
                task.recurrence || { type: "daily", interval: 1 },
              );
              setEditingRecurrence(false);
            }}
            title={t("tasks.editRhythm")}
            onSave={handleSaveRecurrence}
            isLoading={updateTask.isPending}
          >
            <RepeatConfiguration
              value={tempRecurrence}
              onChange={setTempRecurrence}
            />
          </FloatingEditModal>

          <FloatingEditModal
            isOpen={editingStartDate}
            onClose={() => {
              setTempStartDate(
                task.start_date ? new Date(task.start_date) : undefined,
              );
              setEditingStartDate(false);
            }}
            title={t("tasks.editStartDate")}
            onSave={handleSaveStartDate}
            isLoading={updateTask.isPending}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {tempStartDate
                    ? format(tempStartDate, "PPP")
                    : t("tasks.pickADate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CustomCalendar
                  selected={tempStartDate}
                  onSelect={setTempStartDate}
                  minDate={startOfDay(new Date())}
                />
              </PopoverContent>
            </Popover>
          </FloatingEditModal>

          <FloatingEditModal
            isOpen={editingEndDate}
            onClose={() => {
              setTempEndDate(
                task.end_date ? new Date(task.end_date) : undefined,
              );
              setEditingEndDate(false);
            }}
            title={t("tasks.editEndDate")}
            onSave={handleSaveEndDate}
            isLoading={updateTask.isPending}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {tempEndDate
                    ? format(tempEndDate, "PPP")
                    : t("tasks.pickADate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CustomCalendar
                  selected={tempEndDate}
                  onSelect={setTempEndDate}
                  minDate={
                    tempStartDate
                      ? startOfDay(new Date(tempStartDate.getTime() + 86400000))
                      : startOfDay(new Date())
                  }
                />
              </PopoverContent>
            </Popover>
          </FloatingEditModal>

          <FloatingEditModal
            isOpen={editingStatus}
            onClose={() => {
              setTempStatus(task.is_active ? "true" : "false");
              setEditingStatus(false);
            }}
            title={t("tasks.editStatus")}
            onSave={handleSaveStatus}
            isLoading={updateTask.isPending}
          >
            <Select value={tempStatus} onValueChange={setTempStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("tasks.active")}</SelectItem>
                <SelectItem value="false">{t("tasks.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </FloatingEditModal>

          {/* Additional information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                {t("tasks.additionalInfo")}
              </div>
              <button onClick={() => setEditingDescription(true)}>
                <Edit className="h-4 w-4 cursor-pointer" color="#565E6CFF" />
              </button>
            </div>
            <Textarea
              value={task.description || ""}
              className="min-h-[60px] text-sm text-gray-600 p-4"
              readOnly
            />
          </div>

          <FloatingEditModal
            isOpen={editingDescription}
            onClose={() => {
              setTempDescription(task.description || "");
              setEditingDescription(false);
            }}
            title={t("tasks.editAdditionalInfo")}
            onSave={handleSaveDescription}
            isLoading={updateTask.isPending}
          >
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              autoFocus
              className="min-h-[120px]"
            />
          </FloatingEditModal>

          {/* Checklist */}
          <div>
            <Label className="text-sm text-foreground">
              {t("tasks.checklist")}
            </Label>
            <p className="text-xs mt-1 text-gray-500">
              {t("tasks.manageChecklistItems")}
            </p>
            <div className="mt-2 space-y-2">
              {checklist.length > 0 ? (
                checklist.map((item: any, index: number) => (
                  <div
                    key={item._id || item.id || index}
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
                      const updatedChecklist = [...checklist];
                      const [draggedItem] = updatedChecklist.splice(
                        draggedChecklistIndex,
                        1,
                      );
                      updatedChecklist.splice(index, 0, draggedItem);
                      setChecklist(updatedChecklist);
                      updateTask.mutate({
                        id: task._id,
                        data: { checklist: updatedChecklist },
                      });
                      setDraggedChecklistIndex(null);
                    }}
                    onDragEnd={() => setDraggedChecklistIndex(null)}
                    className={`flex items-center gap-3 border rounded-lg p-3 bg-background shadow-sm hover:shadow transition-shadow ${
                      draggedChecklistIndex === index ? "opacity-50" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="h-8 w-8 cursor-grab text-muted-foreground/70 flex items-center justify-center"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(index)}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                          item.checked
                            ? "bg-primary border-primary"
                            : "border-gray-300 bg-background"
                        } cursor-pointer`}
                      >
                        {item.checked && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </label>
                    {editingChecklistIndex === index ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingChecklistText}
                          onChange={(e) =>
                            setEditingChecklistText(e.target.value)
                          }
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveChecklistEdit();
                            if (e.key === "Escape") handleCancelChecklistEdit();
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveChecklistEdit}
                          className="h-7 w-7 p-0"
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelChecklistEdit}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-sm text-foreground flex-1 ${
                            item.checked
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {item.text}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-background"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditChecklistItem(index)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => removeChecklistItem(index)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  {t("tasks.noChecklistItems")}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder={t("tasks.addChecklistTask")}
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addChecklistItem()}
                  className="flex-1"
                />
                <Button
                  onClick={addChecklistItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  {t("tasks.add")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <LinkTaskModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        onSelectLink={handleLinkSelect}
        onApplyLinks={handleApplyLinks}
        selectedBuildingId={editSelectedBuildingId || undefined}
        editSelectedBuildingId={editSelectedBuildingId}
        showAllBuildings={!selectedBuildingId}
      />

      {taskToDelete && (
        <DeleteRecurringTaskModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          task={taskToDelete}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </Dialog>
  );
}
