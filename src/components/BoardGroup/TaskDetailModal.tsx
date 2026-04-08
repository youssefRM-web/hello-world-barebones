import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  Plus,
  Trash2,
  X,
  MoreHorizontal,
  Download,
  Timer,
  Edit,
  Link,
  Flag,
  Wallet,
  Menu,
  InfoIcon,
  ChevronsDown,
  Check,
  AlertCircle,
  Clock,
  ChartGantt,
  Paperclip,
  Activity,
  FileText,
  Type,
  ListChecks,
  CheckCircle2,
  UserPlus,
  MapPin,
  Edit3,
  ExternalLink,
  RotateCcw,
  Play,
  Video,
  RefreshCw,
  Eye,
} from "lucide-react";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import { AcceptedTasks } from "@/types";
import {
  useCurrentUserQuery,
  useTasksQuery,
  useUpdateTaskMutation,
  useLoggedTimeQuery,
  useLoggedMaterialQuery,
  useUploadTaskAttachmentMutation,
  useTaskDetailQuery,
  useArchiveTaskMutation,
} from "@/hooks/queries";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { CommentSystem } from "@/components/Comments/CommentSystem";
import { ImageGallery } from "@/components/Common/ImageGallery";
import { DeleteTaskModal } from "./DeleteTaskModal";
import { LinkTaskModal } from "./LinkTaskModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  formatDateOnly,
  formatDateTime,
  formatTime,
  prettifyValue,
} from "@/utils/dateUtils";
import { DeleteChecklistItemModal } from "./DeleteChecklistItemModal";
import { ConfirmModal } from "@/components/modals/BaseModal";
import { LogTimeModal } from "./Modals/LogTimeModal";
import { LoggedTimeModal } from "./Modals/LoggedTimeModal";
import { LogMaterialModal } from "./Modals/LogMaterialModal";
import { LoggedMaterialsModal } from "./Modals/LoggedMaterialsModal";
import { usePermissions } from "@/contexts/PermissionsContext";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useSearchParams } from "react-router-dom";
import { Map, Marker } from "pigeon-maps";
import { Label } from "../ui/label";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { validateFileSizes } from "@/utils/fileValidation";
import UserActivityHoverCard from "./UserActivityHoverCard";
import { downloadFile } from "@/utils/downloadUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// Fields that can be highlighted when changed
type HighlightableField =
  | "status"
  | "priority"
  | "category"
  | "assignee"
  | "dueDate"
  | "title"
  | "additionalInfo"
  | "checklist"
  | "attachments"
  | "linkedTo";

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: (updatedTask: AcceptedTasks) => void;
  onTaskDeleted?: () => void;
  canEdit?: boolean;
}

export function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  onTaskUpdate,
  onTaskDeleted,
  canEdit = true,
}: TaskDetailModalProps) {
  const {
    data: task,
    isLoading: isLoadingTask,
    refetch: refetchTaskDetail,
  } = useTaskDetailQuery(taskId || undefined);
  const uploadTaskAttachmentMutation = useUploadTaskAttachmentMutation();
  const { data: currentUser } = useCurrentUserQuery();
  const updateTaskMutation = useUpdateTaskMutation();
  const archiveTaskMutation = useArchiveTaskMutation();
  const { data: loggedTimes = [] } = useLoggedTimeQuery(task?._id || "");
  const { data: loggedMaterials = [] } = useLoggedMaterialQuery(
    task?._id || "",
  );
  const { hasPermission } = usePermissions();
  const [searchParams] = useSearchParams();
  const {
    categories,
    users,
    buildings,
    refreshAssets,
    refreshSpaces,
    refreshCategories,
  } = useReferenceData();
  const { t, language } = useLanguage();

  const displaySummary = useMemo(() => {
    if (task?.transatedNotificationMessage) {
      const prefix =
        language === "de"
          ? "Ablaufendes Dokument"
          : "Document Expiration Reminder";
      return `${prefix}: ${task.issue_summary}`;
    }
    return task?.issue_summary || "";
  }, [task?.transatedNotificationMessage, task?.issue_summary, language]);

  const displayAdditionalInfo = useMemo(() => {
    if (task?.additional_info_key && task?.Due_date) {
      const docName = task.issue_summary || "";
      const dateStr = formatDateOnly(task.Due_date);
      if (language === "de") {
        return `Das Dokument "${docName}" läuft am ${dateStr} ab.`;
      }
      return `This document "${docName}" will expire on ${dateStr}.`;
    }
    return task?.additional_info || "";
  }, [
    task?.additional_info_key,
    task?.issue_summary,
    task?.Due_date,
    task?.additional_info,
    language,
  ]);

  const { selectedBuildingId } = useBuildingSelection();

  const editSelectedBuildingId =
    typeof task?.Linked_To?.building_id === "string"
      ? task.Linked_To.building_id
      : task?.Linked_To?.building_id?._id;

  const [activeTab, setActiveTab] = useState("comments");
  const [commentCount, setCommentCount] = useState(0);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentFilter, setAttachmentFilter] = useState("all");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [videoToPlay, setVideoToPlay] = useState<string | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(
    null,
  );
  const [showAllAttachments, setShowAllAttachments] = useState(false);

  const isVideoFile = (url: string) => url?.toLowerCase().endsWith(".mp4");
  const isImageFileAttachment = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(url?.toLowerCase() || "");

  // Map raw status keys to translated professional labels
  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return "N/A";
    const statusMap: Record<string, { en: string; de: string }> = {
      TO_DO: { en: "To Do", de: "Zu erledigen" },
      IN_PROGRESS: { en: "In Progress", de: "In Bearbeitung" },
      DONE: { en: "Done", de: "Erledigt" },
      REVIEW: { en: "Review", de: "Überprüfung" },
      CANCELLED: { en: "Cancelled", de: "Abgebrochen" },
      ON_HOLD: { en: "On Hold", de: "Pausiert" },
      BLOCKED: { en: "Blocked", de: "Blockiert" },
      OPEN: { en: "Open", de: "Offen" },
      CLOSED: { en: "Closed", de: "Geschlossen" },
    };
    const currentLang = t("common.add") === "Hinzufügen" ? "de" : "en";
    return statusMap[status]?.[currentLang] || status;
  };

  // Map raw priority keys to translated labels
  const getPriorityLabel = (priority: string | undefined): string => {
    if (!priority) return "N/A";
    const priorityMap: Record<string, { en: string; de: string }> = {
      High: { en: "High", de: "Hoch" },
      Medium: { en: "Medium", de: "Mittel" },
      Low: { en: "Low", de: "Niedrig" },
    };
    const currentLang = t("common.add") === "Hinzufügen" ? "de" : "en";
    return priorityMap[priority]?.[currentLang] || priority;
  };

  // Render activity message with colored priority labels
  const renderWithColoredPriorities = (msg: string): React.ReactNode => {
    const priorityStyles: Record<string, string> = {
      High: "text-[#DE3B40] font-semibold",
      Medium: "text-[#EA916E] font-semibold",
      Low: "text-[#379AE6] font-semibold",
      Hoch: "text-[#DE3B40] font-semibold",
      Mittel: "text-[#EA916E] font-semibold",
      Niedrig: "text-[#379AE6] font-semibold",
    };
    const priorityLabels = Object.keys(priorityStyles);
    // Build regex matching any priority label as whole word
    const regex = new RegExp(`(${priorityLabels.join("|")})`, "g");
    const parts = msg.split(regex);
    if (parts.length === 1) return msg;
    return parts.map((part, idx) =>
      priorityStyles[part] ? (
        <span key={idx} className={priorityStyles[part]}>
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      ),
    );
  };

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

  // Handle restore task
  const handleRestoreTask = async () => {
    if (!task?._id) return;

    // Check if associated building is archived
    const linkedTo = task.Linked_To;
    let buildingId = task.Building_id;

    if (linkedTo) {
      if (
        typeof linkedTo.building_id === "object" &&
        linkedTo.building_id?._id
      ) {
        buildingId = linkedTo.building_id._id;
      } else if (typeof linkedTo.building_id === "string") {
        buildingId = linkedTo.building_id;
      }
    }

    // Check if building is archived
    const building = buildings.find((b: any) => b._id === buildingId);
    if (building?.archived) {
      toast({
        title: t("taskDetail.cannotRestoreTask"),
        description: `${t("taskDetail.taskBelongsToArchivedBuilding")} "${
          building.label
        }". ${t("taskDetail.pleaseRestoreBuildingFirst")}`,
        variant: "destructive",
      });
      return;
    }

    // Check if linked space is archived
    if (task.Linked_To_Model === "Space" && (linkedTo as any)?.archived) {
      toast({
        title: t("taskDetail.cannotRestoreTask"),
        description: `${t("taskDetail.taskLinkedToArchivedSpace")} "${
          linkedTo?.name
        }". ${t("taskDetail.pleaseRestoreSpaceFirst")}`,
        variant: "destructive",
      });
      return;
    }

    // Check if linked asset is archived
    if (task.Linked_To_Model === "Asset" && (linkedTo as any)?.archived) {
      toast({
        title: t("taskDetail.cannotRestoreTask"),
        description: `${t("taskDetail.taskLinkedToArchivedAsset")} "${
          linkedTo?.name
        }". ${t("taskDetail.pleaseRestoreAssetFirst")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await archiveTaskMutation.mutateAsync({
        taskId: task._id,
        archived: false,
      });
      await refetchTaskDetail();
    } catch (error) {
      // Error is handled in the mutation
    }
  };
  const [isLinking, setIsLinking] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [logTimeModalOpen, setLogTimeModalOpen] = useState(false);
  const [loggedTimeModalOpen, setLoggedTimeModalOpen] = useState(false);
  const [logMaterialModalOpen, setLogMaterialModalOpen] = useState(false);
  const [loggedMaterialsModalOpen, setLoggedMaterialsModalOpen] =
    useState(false);

  // Mobile drawer states
  const isMobile = useIsMobile();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDrawerContent, setMobileDrawerContent] = useState<
    "comments" | "attachments" | "activity"
  >("comments");

  // Individual edit states for each field
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAdditionalInfo, setEditingAdditionalInfo] = useState(false);

  // Temporary values for editing
  const [tempPriority, setTempPriority] = useState<string>("Medium");
  const [tempCategory, setTempCategory] = useState("");
  const [tempAssignee, setTempAssignee] = useState<any>(undefined);
  const [tempDueDate, setTempDueDate] = useState<any>(undefined);
  const [tempTitle, setTempTitle] = useState("");
  const [tempAdditionalInfo, setTempAdditionalInfo] = useState("");

  // Checklist editing and drag-drop states
  const [editingChecklistIndex, setEditingChecklistIndex] = useState<
    number | null
  >(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");
  const [deleteChecklistIndex, setDeleteChecklistIndex] = useState<
    number | null
  >(null);
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState<
    number | null
  >(null);

  // Highlight states for real-time updates
  const [highlightedFields, setHighlightedFields] = useState<
    Set<HighlightableField>
  >(new Set());
  const previousTaskRef = useRef<AcceptedTasks | null>(null);
  const isFromNotification = useRef(false);

  // Check if opened from notification on mount
  useEffect(() => {
    const fromNotif = searchParams.get("fromNotification");
    if (fromNotif === "true" && taskId) {
      isFromNotification.current = true;
    }
  }, [taskId, searchParams]);

  // Detect changes and highlight fields
  const detectAndHighlightChanges = useCallback(
    (prevTask: AcceptedTasks, newTask: AcceptedTasks) => {
      const changedFields = new Set<HighlightableField>();

      if (prevTask.Status !== newTask.Status) changedFields.add("status");
      if (prevTask.priority !== newTask.priority) changedFields.add("priority");
      if (prevTask.issue_summary !== newTask.issue_summary)
        changedFields.add("title");
      if (prevTask.additional_info !== newTask.additional_info)
        changedFields.add("additionalInfo");
      if (prevTask.Due_date !== newTask.Due_date) changedFields.add("dueDate");

      // Category comparison
      const prevCat =
        typeof prevTask.category_id === "object" &&
        prevTask.category_id &&
        !Array.isArray(prevTask.category_id)
          ? (prevTask.category_id as { _id: string })._id
          : prevTask.category_id;
      const newCat =
        typeof newTask.category_id === "object" &&
        newTask.category_id &&
        !Array.isArray(newTask.category_id)
          ? (newTask.category_id as { _id: string })._id
          : newTask.category_id;
      if (prevCat !== newCat) changedFields.add("category");

      // Assignee comparison
      const prevAssignee =
        prevTask.Assigned_to?.[0]?._id || prevTask.Assigned_to?.[0];
      const newAssignee =
        newTask.Assigned_to?.[0]?._id || newTask.Assigned_to?.[0];
      if (prevAssignee !== newAssignee) changedFields.add("assignee");

      // Checklist comparison
      if (
        JSON.stringify(prevTask.Checklist) !== JSON.stringify(newTask.Checklist)
      ) {
        changedFields.add("checklist");
      }

      // Attachments comparison
      if (
        JSON.stringify(prevTask.Attachements) !==
        JSON.stringify(newTask.Attachements)
      ) {
        changedFields.add("attachments");
      }

      // Linked item comparison
      const prevLinked =
        typeof prevTask.Linked_To === "object"
          ? prevTask.Linked_To?._id
          : prevTask.Linked_To;
      const newLinked =
        typeof newTask.Linked_To === "object"
          ? newTask.Linked_To?._id
          : newTask.Linked_To;
      if (prevLinked !== newLinked) changedFields.add("linkedTo");

      return changedFields;
    },
    [],
  );

  // Track task changes and apply highlights
  useEffect(() => {
    if (!task) return;

    // If this is the first load from a notification, highlight all fields briefly
    if (isFromNotification.current && !previousTaskRef.current) {
      isFromNotification.current = false;
      // Highlight key fields when opening from notification
      setHighlightedFields(
        new Set(["status", "priority", "title", "assignee", "dueDate"]),
      );

      // Clear highlights after 5 seconds
      const timer = setTimeout(() => {
        setHighlightedFields(new Set());
      }, 5000);

      previousTaskRef.current = task;
      return () => clearTimeout(timer);
    }

    // Detect real-time changes
    if (previousTaskRef.current && previousTaskRef.current._id === task._id) {
      const changedFields = detectAndHighlightChanges(
        previousTaskRef.current,
        task,
      );

      if (changedFields.size > 0) {
        setHighlightedFields(changedFields);

        // Clear highlights after 5 seconds
        const timer = setTimeout(() => {
          setHighlightedFields(new Set());
        }, 5000);

        return () => clearTimeout(timer);
      }
    }

    previousTaskRef.current = task;
  }, [task, detectAndHighlightChanges]);

  // Reset highlight state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedFields(new Set());
      previousTaskRef.current = null;
      isFromNotification.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTempPriority(task.priority || "Medium");
      setTempCategory(
        task.category_id &&
          typeof task.category_id === "object" &&
          !Array.isArray(task.category_id)
          ? task.category_id._id
          : "",
      );
      setTempAssignee(task.Assigned_to?.[0]);
      setTempDueDate(task.Due_date);
      setTempTitle(task.issue_summary || "");
      setTempAdditionalInfo(task.additional_info || "");
    }
  }, [task]);

  // Show loading skeleton when fetching task
  if (isLoadingTask) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
          <PageLoadingSkeleton variant="modal" />
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  const handleStatusChange = async (newStatus: AcceptedTasks["Status"]) => {
    if (!task) return;

    await updateTaskMutation.mutateAsync({
      taskId: task._id,
      data: { Status: newStatus },
    });
    await refetchTaskDetail();
    await refreshAssets();
    await refreshSpaces();
  };

  const openImageGallery = (index: number) => {
    setSelectedImageIndex(index);
    setImageGalleryOpen(true);
  };

  const handleChecklistToggle = async (checklistIndex: number) => {
    if (!task) return;

    const updatedChecklist = task.Checklist.map((item, index) =>
      index === checklistIndex ? { ...item, completed: !item.completed } : item,
    );

    await updateTaskMutation.mutateAsync({
      taskId: task._id,
      data: { Checklist: updatedChecklist },
    });
    await refetchTaskDetail();
  };

  const handleAddChecklistItem = async () => {
    if (!task || !newTaskText.trim()) return;

    const newItem = {
      text: newTaskText.trim(),
      completed: false,
    };

    const updatedChecklist = [...(task.Checklist || []), newItem];

    // Clear input and close modal
    setNewTaskText("");
    setAddTaskModalOpen(false);

    await updateTaskMutation.mutateAsync({
      taskId: task._id,
      data: { Checklist: updatedChecklist },
    });
    await refetchTaskDetail();
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || !task) return;

    const validFiles = validateFileSizes(Array.from(files), t);
    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadPreview(URL.createObjectURL(validFiles[0]));

    try {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append("file", file));

      await uploadTaskAttachmentMutation.mutateAsync({
        taskId: task._id,
        formData,
      });

      await refetchTaskDetail();
      await refreshAssets();
      await refreshSpaces();

      toast({
        title: t("board.title2"),
        description: t("board.uploadAttt"),
        variant: "success",
      });
    } catch (error) {
      console.error("❌ Error uploading image:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const isImageFile = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  const getFilteredAttachments = () => {
    if (!task?.Attachements) return [];

    switch (attachmentFilter) {
      case "images":
        return task.Attachements.filter((att) => isImageFile(att));
      case "files":
        return task.Attachements.filter((att) => !isImageFile(att));
      default:
        return task.Attachements;
    }
  };

  // Extract comment attachments (from comments + replies)
  const getCommentAttachments = () => {
    const attachments: { url: string; type: string; createdAt?: string }[] = [];
    if (!task?.comments) return attachments;
    for (const comment of task.comments) {
      if (comment.attachments?.length) {
        for (const att of comment.attachments) {
          const url = typeof att === "string" ? att : att?.url;
          if (url)
            attachments.push({
              url,
              type: "comment",
              createdAt: (comment as any).createdAt,
            });
        }
      }
      if (comment.replies?.length) {
        for (const reply of comment.replies) {
          if (reply.attachments?.length) {
            for (const att of reply.attachments) {
              const url = typeof att === "string" ? att : att?.url;
              if (url)
                attachments.push({
                  url,
                  type: "comment",
                  createdAt: (reply as any).createdAt,
                });
            }
          }
        }
      }
    }
    return attachments;
  };

  // Extract material log attachments
  const getMaterialLogAttachments = () => {
    const attachments: { url: string; type: string; createdAt?: string }[] = [];
    if (!task?.material_logs) return attachments;
    for (const log of task.material_logs) {
      if (log.attachements?.length) {
        for (const att of log.attachements) {
          const url = typeof att === "string" ? att : att?.url;
          if (url)
            attachments.push({
              url,
              type: "loggedMaterial",
              createdAt: log.createdAt,
            });
        }
      }
    }
    return attachments;
  };

  // Filter grouped attachments by type
  const filterAttachmentUrl = (url: string) => {
    if (attachmentFilter === "images") return isImageFile(url);
    if (attachmentFilter === "files") return !isImageFile(url);
    return true;
  };

  // Get total attachment count across all groups
  const getTotalAttachmentCount = () => {
    return (
      (task?.Attachements?.length || 0) +
      getCommentAttachments().length +
      getMaterialLogAttachments().length
    );
  };

  // Get image attachments for gallery
  const getImageAttachments = () => {
    return (task?.Attachements || []).filter((att: string) =>
      isImageFileAttachment(att),
    );
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentUrl: string) => {
    if (!task) return;

    try {
      const updatedAttachments = (task.Attachements || []).filter(
        (att: string) => att !== attachmentUrl,
      );

      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { Attachements: updatedAttachments },
      });

      toast({
        title: t("board.title2"),
        description: t("taskDetail.attachmentRemoved"),
        variant: "success",
      });
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast({
        title: t("common.error"),
        description: t("taskDetail.failedToRemoveAttachment"),
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (url: string) => {
    const filename = url.split("/").pop()?.split("?")[0] || "attachment";
    await downloadFile(url, filename);
  };

  type PriorityConfig = {
    classes: string;
    icon: JSX.Element;
  };

  const getPriorityConfig = (priority: string): PriorityConfig => {
    switch (priority) {
      case "High":
        return {
          classes: "text-[#DE3B40FF] bg-[#FDF2F2FF] capitalize",
          icon: <InfoIcon className="w-3 h-3 text-[#DE3B40FF]" />,
        };
      case "Medium":
        return {
          classes: "text-[#EA916EFF] bg-[#FDF5F1FF] capitalize",
          icon: (
            <svg
              className="w-3 h-3"
              fill="#EA916EFF"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              {" "}
              <g>
                <rect fill="none" height="20" width="20" />
              </g>
              <g>
                <g>
                  <rect height="2" width="18" x="3" y="3" />
                  <rect height="2" width="18" x="3" y="19" />
                  <rect height="2" width="18" x="3" y="11" />
                </g>
              </g>{" "}
            </svg>
          ),
        };
      case "Low":
        return {
          classes: "text-[#379AE6FF] bg-[#F1F8FDFF] capitalize ",
          icon: <ChevronsDown className="w-3 h-3 text-[#379AE6FF]" />,
        };
      default:
        return {
          classes: "text-gray-600 bg-gray-50 border-gray-200 capitalize",
          icon: <ChevronsDown className="w-3 h-3 text-blue-600" />,
        };
    }
  };

  const handleApplyLinks = async (links: any[]) => {
    if (!task || links.length === 0) return;

    // Get the first selected link (we link only one target per issue)
    const selectedLink = links[0];

    // Determine model type for backend (matches @Prop({ enum: ['Asset', 'Space'] }))
    const linkModel = selectedLink?.type === "office" ? "Space" : "Asset";

    try {
      // Show loading while updating
      setIsLinking(true);

      // Prepare update data, include Building_id if provided
      const updateData: any = {
        Linked_To: selectedLink?.id, // the ObjectId of the space/asset
        Linked_To_Model: linkModel, // "Space" or "Asset"
        LinkName: selectedLink?.name,
      };

      // Update building ID if a new one is provided (when selecting from different building)
      if (selectedLink.buildingId) {
        updateData.Building_id = selectedLink.buildingId;
      }

      // 🔹 Call the real backend endpoint
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: updateData,
      });

      // Optionally update UI (no need to reload)
      onTaskUpdate?.({
        ...task,
        Linked_To: selectedLink.id,
        Linked_To_Model: linkModel,
        ...(selectedLink.buildingId && {
          Building_id: selectedLink.buildingId,
        }),
      });

      // Close modal after success
      setIsLinkModalOpen(false);

      // Refetch task details
      await refetchTaskDetail();
      await refreshAssets();
      await refreshSpaces();
      toast({
        title: t("board.title2"),
        description: t("taskDetail.linkedSuccessfully"),
        variant: "success",
      });
    } catch (error) {
      console.error("❌ Error applying links:", error);
      toast({
        title: t("common.error"),
        description: t("taskDetail.failedToApplyLink"),
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkSelect = () => {
    // Empty function - actual selection happens on Apply button
  };

  // Individual field save handlers using React Query
  const handleSavePriority = async () => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { priority: tempPriority as any },
      });
      setEditingPriority(false);
      await refetchTaskDetail();
    } catch (error) {}
  };

  const handleSaveCategory = async () => {
    try {
      const categoryValue =
        tempCategory === "N/A" || tempCategory === "None" || !tempCategory
          ? null
          : tempCategory;
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { category_id: categoryValue as any },
      });
      setEditingCategory(false);
      await refetchTaskDetail();
      await refreshCategories();
    } catch (error) {}
  };

  const handleSaveAssignee = async () => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { Assigned_to: [tempAssignee] },
      });
      setEditingAssignee(false);
      await refetchTaskDetail();
    } catch (error) {}
  };

  const handleSaveDueDate = async () => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { Due_date: tempDueDate || null },
      });
      setEditingDueDate(false);
      await refetchTaskDetail();
    } catch (error) {}
  };

  const handleSaveTitle = async () => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { issue_summary: tempTitle },
      });
      setEditingTitle(false);
      await refetchTaskDetail();
    } catch (error) {}
  };

  const handleSaveAdditionalInfo = async () => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        data: { additional_info: tempAdditionalInfo },
      });
      setEditingAdditionalInfo(false);
      await refetchTaskDetail();
    } catch (error) {}
  };

  const formatTotalTime = () => {
    const totalMinutes = loggedTimes.reduce(
      (sum, log) => sum + log.duration,
      0,
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 || minutes > 0 ? `${hours}h ${minutes}m` : "0h 0m";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    );
    return utcDate.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTotalMaterial = () => {
    const total = loggedMaterials.reduce((sum, log) => sum + log.amount, 0);
    return total > 0 ? `€ ${total?.toFixed(2)}` : "€ 0.00";
  };

  // Checklist handlers
  const handleEditChecklistItem = (index: number) => {
    setEditingChecklistIndex(index);
    setEditingChecklistText(task?.Checklist[index].text || "");
  };

  const handleSaveChecklistEdit = async () => {
    if (!task || editingChecklistIndex === null || !editingChecklistText.trim())
      return;

    const updatedChecklist = task.Checklist.map((item, index) =>
      index === editingChecklistIndex
        ? { ...item, text: editingChecklistText.trim() }
        : item,
    );

    await updateTaskMutation.mutateAsync({
      taskId: task._id,
      data: { Checklist: updatedChecklist },
    });

    setEditingChecklistIndex(null);
    setEditingChecklistText("");
    await refetchTaskDetail();
  };

  const handleCancelChecklistEdit = () => {
    setEditingChecklistIndex(null);
    setEditingChecklistText("");
  };

  const handleDeleteChecklistItem = async () => {
    if (!task || deleteChecklistIndex === null) return;

    const updatedChecklist = task.Checklist.filter(
      (_, index) => index !== deleteChecklistIndex,
    );

    await updateTaskMutation.mutateAsync({
      taskId: task._id,
      data: { Checklist: updatedChecklist },
    });

    setDeleteChecklistIndex(null);
    await refetchTaskDetail();
  };

  const handleChecklistDragStart = (e: React.DragEvent, index: number) => {
    setDraggedChecklistIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleChecklistDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleChecklistDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (
      !task ||
      draggedChecklistIndex === null ||
      draggedChecklistIndex === dropIndex
    ) {
      setDraggedChecklistIndex(null);
      return;
    }

    const updatedChecklist = [...task.Checklist];
    const [draggedItem] = updatedChecklist.splice(draggedChecklistIndex, 1);
    updatedChecklist.splice(dropIndex, 0, draggedItem);

    await updateTaskMutation.mutateAsync({
      taskId: task._id,
      data: { Checklist: updatedChecklist },
    });

    setDraggedChecklistIndex(null);
    await refetchTaskDetail();
  };

  const handleCopyLink = async () => {
    const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;

    await navigator.clipboard.writeText(fullUrl);

    toast({
      title: t("board.title2"),
      description: t("taskDetail.copyLink"),
      variant: "success",
    });
  };

  const priorityConfig = getPriorityConfig(task.priority);

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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full sm:max-w-6xl w-full max-h-[95vh] p-0 gap-0 sm:mx-auto flex flex-col overflow-hidden">
          {/* Header */}
          <DialogHeader className="shrink-0 border-b bg-gradient-to-b from-accent/70 via-accent/40 to-transparent backdrop-blur-sm">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              {/* Flex container with space-between + gap control */}
              <div className="flex items-start justify-between gap-6">
                {/* Left: Meta Info (takes available space) */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-1.5 gap-x-3 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-start">
                        {t("board.reportedOn")}{" "}
                        <span className="font-medium text-foreground">
                          {formatDate(task?.createdAt)}
                        </span>
                        {task?.reporter?.name && (
                          <>
                            {" "}
                            {t("taskDetail.by") || "by"}{" "}
                            <span className="font-medium text-foreground">
                              {task.reporter.name}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    {task?.reporter?.email && (
                      <div className="flex items-center gap-1.5 pl-5 sm:pl-0">
                        <span className="hidden sm:inline text-muted-foreground/40">
                          •
                        </span>
                        <span className="text-muted-foreground break-all">
                          {task.reporter.email}
                        </span>
                      </div>
                    )}
                    {task?.reporter?.phone && (
                      <div className="flex items-center gap-1.5 pl-5 sm:pl-0">
                        <span className="hidden sm:inline text-muted-foreground/40">
                          •
                        </span>
                        <span className="text-muted-foreground">
                          {task.reporter.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 pl-5 sm:pl-0">
                      <span className="hidden sm:inline text-muted-foreground/40">
                        •
                      </span>
                      <User className="h-3.5 w-3.5 text-muted-foreground/70 flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {`${task?.Assigned_to?.[0]?.Name || ""} ${task?.Assigned_to?.[0]?.Last_Name || ""}`.trim() ||
                          `${task?.created_by?.Name || ""} ${task?.created_by?.Last_Name || ""}`.trim()}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      {t("taskDetail.updated")}{" "}
                      {formatDateOnly(task?.updatedAt)} {t("taskDetail.at")}{" "}
                      {formatTime(task?.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Action Buttons — ALWAYS aligned to the right */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  {canEdit &&
                    (task?.archived ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-green-100 hover:text-green-600 transition-all"
                        onClick={handleRestoreTask}
                        disabled={archiveTaskMutation.isPending}
                      >
                        <RotateCcw
                          className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${
                            archiveTaskMutation.isPending ? "animate-spin" : ""
                          }`}
                        />
                        <span className="sr-only">
                          {t("taskDetail.restoreTask")}
                        </span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        <Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        <span className="sr-only">
                          {t("taskDetail.deleteTask")}
                        </span>
                      </Button>
                    ))}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
                    onClick={handleCopyLink}
                  >
                    <Link className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    <span className="sr-only">{t("taskDetail.copyLink")}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="sr-only">{t("common.close")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pb-4 p-3 sm:p-6 overflow-hidden flex-1 min-h-0">
            {/* Left Half */}
            <div className="space-y-4 mb-5 pt-1 pr-0 lg:pr-4 lg:border-r overflow-y-auto lg:overflow-y-auto scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent">
              {/* Mini Map */}
              {task.location_coordinates && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t("taskDetail.reportedLocation")}
                  </Label>
                  <div className="rounded-lg overflow-hidden border">
                    <Map
                      center={[
                        task.location_coordinates.lat,
                        task.location_coordinates.lng,
                      ]}
                      zoom={15}
                      height={200}
                    >
                      <Marker
                        width={40}
                        anchor={[
                          task.location_coordinates.lat,
                          task.location_coordinates.lng,
                        ]}
                        color="hsl(var(--primary))"
                      />
                    </Map>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {task.location_name ||
                        `${task.location_coordinates.lat.toFixed(
                          6,
                        )}, ${task.location_coordinates.lng.toFixed(6)}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps?q=${
                            task.location_coordinates!.lat
                          },${task.location_coordinates!.lng}`,
                          "_blank",
                        );
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {t("taskDetail.openInMaps")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className={`p-1 -m-1`}>
                <Select
                  defaultValue={task?.Status || "TO_DO"}
                  onValueChange={handleStatusChange}
                  disabled={!canEdit}
                >
                  <SelectTrigger
                    className={`w-auto min-w-[180px]  px-4 bg-[#F1F5FEFF] justify-center font-bold text-[#1759E8FF] text-sm relative ${
                      !canEdit ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TO_DO">{t("board.toDo")}</SelectItem>
                    <SelectItem value="IN_PROGRESS">
                      {t("board.inProgress")}
                    </SelectItem>
                    <SelectItem value="DONE">{t("board.done")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Main Issue Text */}
              <div className={`flex items-center gap-3 group p-1 -m-1 `}>
                <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-base sm:text-xl capitalize font-normal text-foreground mb-3 line-clamp-2 leading-snug first-letter:uppercase break-words ">
              {displaySummary}
            </p>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-xs text-left mb-4 leading-tight break-words"
          >
            <p className="text-sm">{displaySummary}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
                {canEdit && hasPermission("board", "createTickets") && (
                  <button
                    onClick={() => setEditingTitle(true)}
                    className=" transition-opacity"
                  >
                    <Edit className="h-4 w-4" color="#565E6CFF" />
                  </button>
                )}
              </div>

              {/* Floating Title Edit */}
              {editingTitle && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center px-4"
                  style={{ margin: 0 }}
                >
                  <div
                    className="absolute inset-0 bg-black/20"
                    onClick={() =>
                      !updateTaskMutation.isPending && setEditingTitle(false)
                    }
                  />
                  <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-2xl animate-in fade-in zoom-in-95">
                    <label className="text-sm font-medium">
                      {t("taskDetail.editTitle")}
                    </label>
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      autoFocus
                      className="mt-3 text-xl font-medium h-12"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveTitle();
                        }
                        if (e.key === "Escape") {
                          setTempTitle(task.issue_summary || "");
                          setEditingTitle(false);
                        }
                      }}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updateTaskMutation.isPending}
                        onClick={() => {
                          setTempTitle(task.issue_summary || "");
                          setEditingTitle(false);
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveTitle}
                        disabled={updateTaskMutation.isPending}
                      >
                        {updateTaskMutation.isPending && (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        )}
                        {t("common.save")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image/Video/Document Attachments */}
              <div className="flex gap-2 pb-2 p-1 -m-1">
                {/* Fixed add button - always first */}
                {canEdit && (
                  <label
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors flex-shrink-0 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*, .pdf, .mp4"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                      disabled={isUploading}
                    />
                  </label>
                )}

                {/* Attachments grid with smooth expand animation */}
                <div
                  className={`flex gap-2 ${showAllAttachments ? "flex-wrap" : "overflow-x-auto"} transition-all duration-300 ease-in-out min-w-0 flex-1`}
                >
                  {task?.Attachements &&
                    task.Attachements.length > 0 &&
                    (showAllAttachments
                      ? task.Attachements
                      : task.Attachements.slice(0, 4)
                    ).map((attachment, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden flex-shrink-0 border group animate-scale-in"
                        style={{
                          animationDelay:
                            showAllAttachments && i >= 4
                              ? `${(i - 4) * 50}ms`
                              : "0ms",
                          animationFillMode: "both",
                        }}
                      >
                        {isVideoFile(attachment) ? (
                          <div
                            className="w-full h-full bg-muted flex items-center justify-center cursor-pointer relative"
                            onClick={() => openImageGallery(i)}
                          >
                            <Video className="h-6 w-6 text-primary" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ) : isImageFileAttachment(attachment) ? (
                          <img
                            src={attachment}
                            alt={`Attachment ${i + 1}`}
                            className="w-full h-full object-cover rounded-md cursor-pointer"
                            onClick={() => openImageGallery(i)}
                          />
                        ) : (
                          <a
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                            title={attachment.split("/").pop()}
                          >
                            <div className="flex flex-col items-center justify-center p-2">
                              {getAttachmentIcon(attachment)}
                              <span className="text-[10px] text-muted-foreground mt-1 text-center truncate w-full">
                                {attachment.split("/").pop()?.slice(0, 10)}...
                              </span>
                            </div>
                          </a>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => setAttachmentToDelete(attachment)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  {task.Attachements.length > 4 && (
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                      onClick={() => setShowAllAttachments(!showAllAttachments)}
                    >
                      <span className="text-lg text-primary-foreground font-medium">
                        {showAllAttachments
                          ? "−"
                          : `+${task.Attachements.length - 4}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div
                className={`flex items-center justify-between py-3 rounded-md p gap-2 `}
              >
                <div className="flex items-center gap-2 border flex-1 rounded-md p-2 ">
                  <div className="bg-[#0F4C7BFF] w-12 h-10 flex items-center justify-center rounded-md">
                    <svg
                      className="w-6 h-6"
                      fill="#FFFFFF"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M21 20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.314a1 1 0 0 1 .38-.785l8-6.311a1 1 0 0 1 1.24 0l8 6.31a1 1 0 0 1 .38.786V20zM7 12a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z" />
                      </g>
                    </svg>
                  </div>
                  <span className="font-medium w-full flex capitalize items-center justify-between text-sm">
                    {task?.locationChain || task?.location_name}{" "}
                  </span>
                </div>
                {canEdit && (
                  <Edit
                    className="h-4 w-4 cursor-pointer"
                    color="#565E6CFF"
                    onClick={() => setIsLinkModalOpen(true)}
                  />
                )}
              </div>

              {/* Additional Description – floating edit */}
              <div className={`group p-1 -m-1`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">
                    {t("board.additionalDescription")}
                  </h3>
                  {canEdit && (
                    <button
                      onClick={() => setEditingAdditionalInfo(true)}
                      className="transition-opacity"
                    >
                      <Edit className="h-4 w-4" color="#565E6CFF" />
                    </button>
                  )}
                </div>

                {/* Make sure the FLEX PARENT allows children to shrink (min-w-0 on wrapper) */}
                <div className="min-w-0">
                  <p
                    className="
        text-sm text-foreground leading-relaxed border rounded-md p-3
        w-full min-w-0
        whitespace-pre-line break-words
      "
                    // If you prefer inline style:
                    // style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                  >
                    {displayAdditionalInfo ||
                      t("board.noAdditionalDescription")}
                  </p>
                </div>
              </div>

              {/* Floating Additional Info Edit */}
              {editingAdditionalInfo && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center px-4"
                  style={{ margin: 0 }}
                >
                  <div
                    className="absolute inset-0 bg-black/20"
                    onClick={() =>
                      !updateTaskMutation.isPending &&
                      setEditingAdditionalInfo(false)
                    }
                  />
                  <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-2xl animate-in fade-in zoom-in-95">
                    <label className="text-sm font-medium">
                      {t("board.additionalDescription")}
                    </label>
                    <Textarea
                      value={tempAdditionalInfo}
                      onChange={(e) => setTempAdditionalInfo(e.target.value)}
                      autoFocus
                      className="mt-3 min-h-[200px] resize-none"
                      onKeyDown={(e) =>
                        e.key === "Escape" &&
                        (setTempAdditionalInfo(task.additional_info || ""),
                        setEditingAdditionalInfo(false))
                      }
                    />
                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updateTaskMutation.isPending}
                        onClick={() => {
                          setTempAdditionalInfo(task.additional_info || "");
                          setEditingAdditionalInfo(false);
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAdditionalInfo}
                        disabled={updateTaskMutation.isPending}
                      >
                        {updateTaskMutation.isPending && (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        )}
                        {t("common.save")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Section */}
              <div className="space-y-3 border rounded-md p-3">
                {/* Priority */}
                <div
                  className={`flex items-center justify-between group p-1 -m-1 `}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4"
                      fill="#565E6CFF"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 6l2.29 2.29l-4.88 4.88l-4-4L2 16.59L3.41 18l6-6l4 4l6.3-6.29L22 12V6h-6z" />
                    </svg>
                    <span className="text-sm">{t("board.priority")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`flex items-center gap-1 text-xs font-medium px-4 py-1 rounded ${
                        priorityBg[task.priority]
                      } ${priorityColors[task.priority]}`}
                    >
                      {priorityConfig.icon}
                      <span>
                        {t(`board.${task.priority?.toLowerCase()}`) ||
                          task.priority}
                      </span>
                    </Badge>
                    {canEdit && (
                      <button
                        onClick={() => setEditingPriority(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4" color="#565E6CFF" />
                      </button>
                    )}
                  </div>
                </div>
                {editingPriority && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() =>
                        !updateTaskMutation.isPending &&
                        setEditingPriority(false)
                      }
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md">
                      <label className="text-sm font-medium">
                        {t("board.priority")}
                      </label>
                      <Select
                        value={tempPriority}
                        onValueChange={setTempPriority}
                      >
                        <SelectTrigger className="mt-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">
                            <div className="flex items-center gap-2">
                              <ChevronsDown className="w-4 h-4 text-[#379AE6FF]" />
                              {t("board.low")}
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
                              {t("board.medium")}
                            </div>
                          </SelectItem>
                          <SelectItem value="High">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              {t("board.high")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateTaskMutation.isPending}
                          onClick={() => {
                            setTempPriority(task.priority);
                            setEditingPriority(false);
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSavePriority}
                          disabled={updateTaskMutation.isPending}
                        >
                          {updateTaskMutation.isPending && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category – floating */}
                <div
                  className={`flex items-center justify-between group p-1 -m-1 `}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4"
                      fill="#565E6CFF"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z" />
                    </svg>
                    <span className="text-sm">{t("board.category")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                      {task?.category_id &&
                      typeof task.category_id === "object" &&
                      !Array.isArray(task.category_id)
                        ? task.category_id.label
                        : "N/A"}
                    </span>
                    {canEdit &&
                      task?.category_id &&
                      typeof task.category_id === "object" &&
                      !Array.isArray(task.category_id) && (
                        <button
                          onClick={async () => {
                            try {
                              await updateTaskMutation.mutateAsync({
                                taskId: task._id,
                                data: { category_id: null },
                              });
                              await refreshCategories();
                              toast({
                                title: t("board.title2"),
                                description: t(
                                  "taskDetail.categoryRemovedSuccessfully",
                                ),
                                variant: "success",
                              });
                            } catch (error) {
                              toast({
                                title: t("common.error"),
                                description: t(
                                  "taskDetail.failedToRemoveCategory",
                                ),
                                variant: "destructive",
                              });
                            }
                          }}
                          className="transition-opacity hover:opacity-70"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      )}
                    {canEdit && (
                      <button
                        onClick={() => setEditingCategory(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4" color="#565E6CFF" />
                      </button>
                    )}
                  </div>
                </div>
                {editingCategory && (
                  /* floating card – same pattern as above */ <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() =>
                        !updateTaskMutation.isPending &&
                        setEditingCategory(false)
                      }
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md">
                      <label className="text-sm font-medium">
                        {t("board.category")}
                      </label>
                      <Select
                        value={tempCategory || ""}
                        onValueChange={setTempCategory}
                      >
                        <SelectTrigger className="mt-3">
                          <SelectValue
                            placeholder={t("taskDetail.selectCategory")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((category: any) => {
                              const buildingId = task?.Building_id;
                              const taskBuildingId =
                                buildingId && typeof buildingId === "object"
                                  ? (buildingId as any)._id
                                  : buildingId;
                              return category.buildingIds?.some(
                                (building: any) =>
                                  building._id === editSelectedBuildingId ||
                                  building._id === taskBuildingId,
                              );
                            })
                            .map((category: any) => (
                              <SelectItem
                                key={category._id}
                                value={category._id}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateTaskMutation.isPending}
                          onClick={() => {
                            setTempCategory(
                              task?.category_id &&
                                typeof task.category_id === "object" &&
                                !Array.isArray(task.category_id)
                                ? task.category_id._id
                                : "",
                            );
                            setEditingCategory(false);
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveCategory}
                          disabled={updateTaskMutation.isPending}
                        >
                          {updateTaskMutation.isPending && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignee – floating */}
                <div
                  className={`flex items-center justify-between group p-1 -m-1 `}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[#565E6CFF]" />
                    <span className="text-sm">{t("board.assignee")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {task?.Assigned_to.length > 0 ? (
                        <>
                          <Avatar className="h-6 w-6">
                            {task?.Assigned_to?.[0]?.profile_picture ? (
                              <AvatarImage
                                src={task.Assigned_to[0].profile_picture}
                              />
                            ) : (
                              <AvatarFallback className="bg-[#0F4C7BFF] text-white text-xs rounded-md">
                                {task?.Assigned_to?.[0]?.Name?.[0]?.toUpperCase()}
                                {task?.Assigned_to?.[0]?.Last_Name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm capitalize">
                            {task?.Assigned_to?.[0]?.Name}{" "}
                            {task?.Assigned_to?.[0]?.Last_Name}
                          </span>
                        </>
                      ) : (
                        <span className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded first-letter:uppercase">
                          N/A
                        </span>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setEditingAssignee(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4" color="#565E6CFF" />
                      </button>
                    )}
                  </div>
                </div>
                {editingAssignee && (
                  /* floating card with user select */ <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() =>
                        !updateTaskMutation.isPending &&
                        setEditingAssignee(false)
                      }
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md">
                      <label className="text-sm font-medium">
                        {t("board.assignee")}
                      </label>
                      <Select
                        value={tempAssignee?._id}
                        onValueChange={(v) =>
                          setTempAssignee(users?.find((u: any) => u._id === v))
                        }
                      >
                        <SelectTrigger className="mt-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user._id} value={user?._id}>
                              {user?.Name} {user?.Last_Name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateTaskMutation.isPending}
                          onClick={() => {
                            setTempAssignee(task.Assigned_to?.[0]);
                            setEditingAssignee(false);
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveAssignee}
                          disabled={updateTaskMutation.isPending}
                        >
                          {updateTaskMutation.isPending && (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Due Date – floating calendar */}
                <div
                  className={`flex items-center justify-between group p-1 -m-1 `}
                >
                  <div className="flex items-center gap-3">
                    <Flag className="h-4 w-4 text-[#565E6CFF]" />
                    <span className="text-sm">{t("board.dueDate")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {task.Due_date
                        ? formatDate(task.Due_date)
                        : t("board.noDueDate")}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => setEditingDueDate(true)}
                        className=" transition-opacity"
                      >
                        <Edit className="h-4 w-4" color="#565E6CFF" />
                      </button>
                    )}
                  </div>
                </div>
                {editingDueDate && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ margin: 0 }}
                  >
                    <div
                      className="absolute inset-0 bg-black/20"
                      onClick={() =>
                        !updateTaskMutation.isPending &&
                        setEditingDueDate(false)
                      }
                    />
                    <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-auto">
                      <label className="text-sm font-medium block mb-3">
                        {t("board.dueDate")}
                      </label>
                      <CustomCalendar
                        selected={
                          tempDueDate ? new Date(tempDueDate) : undefined
                        }
                        onSelect={(d) => setTempDueDate(d?.toISOString() || "")}
                        disablePastDates={true}
                      />
                      <div className="flex justify-between gap-3 mt-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={
                            updateTaskMutation.isPending || !tempDueDate
                          }
                          onClick={() => {
                            setTempDueDate(null);
                          }}
                        >
                          {t("common.clear")}
                        </Button>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updateTaskMutation.isPending}
                            onClick={() => {
                              setTempDueDate(task.Due_date);
                              setEditingDueDate(false);
                            }}
                          >
                            {t("common.cancel")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveDueDate}
                            disabled={updateTaskMutation.isPending}
                          >
                            {updateTaskMutation.isPending && (
                              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            {t("common.save")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra fields - always visible */}
                <div className="space-y-3">
                  {/* Logged time */}
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <Timer
                        className="h-4 w-4 text-[#565E6CFF]"
                        color="#565E6CFF"
                      />
                      <span className="text-sm text-foreground">
                        {t("board.loggedTimeTitle")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#F1F5FEFF] text-[#1759E8FF] flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                        {formatTotalTime()}
                      </span>
                      {hasPermission("board", "editTimeLog") && (
                        <button
                          onClick={() => setLogTimeModalOpen(true)}
                          className="w-6 h-6 border border-dashed border-gray-300 flex-shrink-0 flex items-center justify-center text-foreground hover:text-gray-600 cursor-pointer rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      onClick={() => setLoggedTimeModalOpen(true)}
                      className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded cursor-pointer hover:bg-[#E5EDFEFF]"
                    >
                      {loggedTimes.length === 0
                        ? t("board.noActivitiesYet")
                        : `${loggedTimes.length} ${
                            loggedTimes.length === 1
                              ? t("taskDetail.activity")
                              : t("taskDetail.activities")
                          }`}
                    </span>
                  </div>

                  {/* Logged material */}
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet
                        className="h-4 w-4 text-[#565E6CFF]"
                        color="#565E6CFF"
                      />
                      <span className="text-sm text-foreground">
                        {t("board.loggedMaterialsTitle")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#F1F5FEFF] text-[#1759E8FF] flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                        {formatTotalMaterial()}
                      </span>
                      {hasPermission("board", "editMaterialLog") && (
                        <button
                          onClick={() => setLogMaterialModalOpen(true)}
                          className="w-6 h-6 border border-dashed border-gray-300 flex-shrink-0 flex items-center justify-center text-foreground hover:text-gray-600 cursor-pointer rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      onClick={() => setLoggedMaterialsModalOpen(true)}
                      className="bg-[#F1F5FEFF] text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded cursor-pointer hover:bg-[#E5EDFEFF]"
                    >
                      {loggedMaterials.length === 0
                        ? t("board.noActivitiesYet")
                        : `${loggedMaterials.length} ${
                            loggedMaterials.length === 1
                              ? t("taskDetail.activity")
                              : t("taskDetail.activities")
                          }`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className={`p-1 -m-1 `}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">
                      {t("board.checklist")}
                    </h3>
                    <span className="text-xs text-foreground border rounded-md p-1">
                      {task?.Checklist
                        ? `${
                            task.Checklist.filter((item) => item.completed)
                              .length
                          }/${task.Checklist.length}`
                        : "0/0"}
                    </span>
                  </div>
                  {canEdit && (
                    <span
                      className="text-[#2E69E8FF] text-sm flex items-center gap-2 cursor-pointer"
                      onClick={() => setAddTaskModalOpen(true)}
                    >
                      {/* <Plus className="h-3 w-3 mr-1" /> */}
                      {t("board.addItem")}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {task?.Checklist && task.Checklist.length > 0 ? (
                    task.Checklist.map((item, index) => (
                      <div
                        key={index}
                        draggable={canEdit}
                        onDragStart={(e) =>
                          canEdit && handleChecklistDragStart(e, index)
                        }
                        onDragOver={
                          canEdit ? handleChecklistDragOver : undefined
                        }
                        onDrop={(e) => canEdit && handleChecklistDrop(e, index)}
                        className={`flex items-center gap-3 border rounded-lg p-3 bg-background shadow-sm hover:shadow transition-shadow ${
                          draggedChecklistIndex === index ? "opacity-50" : ""
                        } ${!canEdit ? "cursor-default" : ""}`}
                      >
                        {canEdit && (
                          <button
                            type="button"
                            className="h-8 w-8 cursor-grab text-muted-foreground/70 flex items-center justify-center"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        )}
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() =>
                              canEdit && handleChecklistToggle(index)
                            }
                            disabled={!canEdit}
                            className="sr-only peer"
                          />
                          <div
                            className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                              item.completed
                                ? "bg-primary border-primary"
                                : "border-gray-300 bg-background"
                            } ${canEdit ? "cursor-pointer" : ""}`}
                          >
                            {item.completed && (
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
                                if (e.key === "Enter")
                                  handleSaveChecklistEdit();
                                if (e.key === "Escape")
                                  handleCancelChecklistEdit();
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
                                item.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.text}
                            </span>
                            {canEdit && (
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
                                    onClick={() =>
                                      handleEditChecklistItem(index)
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setDeleteChecklistIndex(index)
                                    }
                                    className="cursor-pointer text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    {t("common.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      {t("board.noChecklistItems")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Half - Tabs Section */}
            <div className="flex flex-col min-h-0 overflow-hidden pt-1">
              {!isMobile ? (
                /* Desktop/Tablet View - Normal Tabs */
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  <TabsList className="grid w-full grid-cols-3 text-center h-8 sm:h-9 mb-4 sticky top-0 z-10 bg-background">
                    <TabsTrigger
                      value="comments"
                      className="text-xs sm:text-sm justify-center relative px-2"
                    >
                      <span className="hidden sm:inline">
                        {t("board.comments")}
                      </span>
                      <span className="sm:hidden">💬</span>

                      <Badge
                        variant="secondary"
                        className={` ${
                          activeTab === "comments"
                            ? "text-xs rounded-full w-4 h-5 flex items-center justify-center bg-[#F1F5FDFF] text-[#1759E8FF] border-[#1759E8FF] "
                            : " text-xs rounded-full w-4 h-5 flex items-center justify-center"
                        }`}
                      >
                        {commentCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="attachments"
                      className="text-xs sm:text-sm bg-background justify-center relative px-2"
                    >
                      <span className="hidden sm:inline">
                        {t("board.attachments")}
                      </span>
                      <span className="sm:hidden">📎</span>

                      <Badge
                        variant="secondary"
                        className={` ${
                          activeTab === "attachments"
                            ? "text-xs rounded-full w-4 h-5 flex items-center justify-center bg-[#F1F5FDFF] text-[#1759E8FF] border-[#1759E8FF] "
                            : " text-xs rounded-full w-4 h-5 flex items-center justify-center"
                        }`}
                      >
                        {getTotalAttachmentCount()}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className="text-xs sm:text-sm justify-center bg-background px-2"
                    >
                      <span className="hidden sm:inline">
                        {t("board.activity")}
                      </span>
                      <span className="sm:hidden">📊</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="comments"
                    className="flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=inactive]:hidden scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent"
                  >
                    <CommentSystem
                      taskId={task._id}
                      buildingId={editSelectedBuildingId}
                      onCommentCountChange={setCommentCount}
                    />
                  </TabsContent>

                  <TabsContent
                    value="attachments"
                    className="flex-1 min-h-0 overflow-y-auto data-[state=active]:block data-[state=inactive]:hidden scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent"
                  >
                    {/* Header with filter and add button */}
                    <div className="flex items-center justify-between mb-4 mt-3">
                      <Select
                        value={attachmentFilter}
                        onValueChange={setAttachmentFilter}
                      >
                        <SelectTrigger className="w-auto h-8 text-sm pr-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("taskDetail.commonFilter")}
                          </SelectItem>
                          <SelectItem value="images">
                            {t("taskDetail.imagesFilter")}
                          </SelectItem>
                          <SelectItem value="files">
                            {t("taskDetail.filesFilter")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*, .pdf, .mp4"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <span className="text-[#1759E8FF] text-sm font-medium flex items-center gap-1 cursor-pointer hover:underline">
                          <Plus className="h-4 w-4" />
                          {isUploading
                            ? t("taskDetail.uploading")
                            : t("common.add")}
                        </span>
                      </label>
                    </div>

                    {/* Grouped Attachments List */}
                    <div className="space-y-6">
                      {/* With Task */}
                      {(() => {
                        const taskAttachments = getFilteredAttachments();
                        if (taskAttachments.length === 0) return null;
                        return (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              {t("taskDetail.withTask")}
                            </h4>
                            <div className="space-y-2">
                              {taskAttachments.map((attachment, index) => {
                                const isImage =
                                  isImageFileAttachment(attachment);
                                const isVideo = isVideoFile(attachment);
                                const fileName =
                                  attachment.split("/").pop() || "Unknown file";
                                const createdDate = task?.createdAt
                                  ? format(
                                      new Date(task?.createdAt),
                                      "dd.MM.yy",
                                    )
                                  : "";
                                /*  const creatorName = typeof task?.created_by === "object" && task?.created_by
                                  ? `${task?.created_by?.Name || ""} ${task?.created_by?.Last_Name || ""}`.trim()
                                  : "Unknown"; */
                                return (
                                  <div
                                    key={`task-${index}`}
                                    className="flex items-center gap-3 group"
                                  >
                                    <div
                                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 flex items-center justify-center cursor-pointer border"
                                      onClick={() => {
                                        if (isImage) {
                                          const allImages =
                                            getFilteredAttachments().filter(
                                              (a) => isImageFileAttachment(a),
                                            );
                                          const idx =
                                            allImages.indexOf(attachment);
                                          setGalleryImages(allImages);
                                          setSelectedImageIndex(
                                            idx >= 0 ? idx : 0,
                                          );
                                          setImageGalleryOpen(true);
                                        } else if (isVideo) {
                                          setVideoToPlay(attachment);
                                        }
                                      }}
                                    >
                                      {isImage ? (
                                        <img
                                          src={attachment}
                                          alt="attachment"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : isVideo ? (
                                        <div className="relative w-full h-full">
                                          <video
                                            src={attachment}
                                            className="w-full h-full object-cover"
                                            muted
                                            preload="metadata"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play className="h-4 w-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        getAttachmentIcon(attachment)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {fileName.length > 30
                                          ? `${fileName.slice(0, 27)}...`
                                          : fileName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {createdDate}
                                        {/* &nbsp;•&nbsp; {creatorName} */}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        className="p-2 hover:bg-muted rounded-md transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(attachment);
                                        }}
                                        title={t("common.download")}
                                      >
                                        <Download className="h-4 w-4 text-destructive" />
                                      </button>
                                      {canEdit && (
                                        <button
                                          className="p-2 hover:bg-muted rounded-md transition-colors opacity-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setAttachmentToDelete(attachment);
                                          }}
                                          title={t("common.delete")}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* With Comments */}
                      {(() => {
                        const commentAtts = getCommentAttachments().filter(
                          (a) => filterAttachmentUrl(a.url),
                        );
                        if (commentAtts.length === 0) return null;
                        return (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              {t("taskDetail.withComments")}
                            </h4>
                            <div className="space-y-2">
                              {commentAtts.map((att, index) => {
                                const isImage = isImageFileAttachment(att.url);
                                const isVideo = isVideoFile(att.url);
                                const createdDate = att?.createdAt
                                  ? format(new Date(att.createdAt), "dd.MM.yy")
                                  : "";
                                const fileName =
                                  att.url.split("/").pop() || "Unknown file";
                                return (
                                  <div
                                    key={`comment-att-${index}`}
                                    className="flex items-center gap-3 group"
                                  >
                                    <div
                                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 flex items-center justify-center cursor-pointer border"
                                      onClick={() => {
                                        if (isImage) {
                                          const allImages = commentAtts
                                            .filter((a) =>
                                              isImageFileAttachment(a.url),
                                            )
                                            .map((a) => a.url);
                                          const idx = allImages.indexOf(
                                            att.url,
                                          );
                                          setGalleryImages(allImages);
                                          setSelectedImageIndex(
                                            idx >= 0 ? idx : 0,
                                          );
                                          setImageGalleryOpen(true);
                                        } else if (isVideo) {
                                          setVideoToPlay(att.url);
                                        }
                                      }}
                                    >
                                      {isImage ? (
                                        <img
                                          src={att.url}
                                          alt="attachment"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : isVideo ? (
                                        <div className="relative w-full h-full">
                                          <video
                                            src={att.url}
                                            className="w-full h-full object-cover"
                                            muted
                                            preload="metadata"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play className="h-4 w-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        getAttachmentIcon(att.url)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {fileName.length > 30
                                          ? `${fileName.slice(0, 27)}...`
                                          : fileName}
                                      </p>
                                      {createdDate && (
                                        <p className="text-xs text-muted-foreground">
                                          {createdDate}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        className="p-2 hover:bg-muted rounded-md transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(att.url);
                                        }}
                                        title={t("common.download")}
                                      >
                                        <Download className="h-4 w-4 text-destructive" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* With Material Log */}
                      {(() => {
                        const materialAtts = getMaterialLogAttachments().filter(
                          (a) => filterAttachmentUrl(a.url),
                        );

                        if (materialAtts.length === 0) return null;
                        return (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              {t("taskDetail.withMaterialLog")}
                            </h4>
                            <div className="space-y-2">
                              {materialAtts.map((att, index) => {
                                const isImage = isImageFileAttachment(att.url);
                                const isVideo = isVideoFile(att.url);

                                const createdDate = att?.createdAt
                                  ? format(new Date(att.createdAt), "dd.MM.yy")
                                  : "";
                                const fileName =
                                  att.url.split("/").pop() || "Unknown file";
                                return (
                                  <div
                                    key={`material-att-${index}`}
                                    className="flex items-center gap-3 group"
                                  >
                                    <div
                                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 flex items-center justify-center cursor-pointer border"
                                      onClick={() => {
                                        if (isImage) {
                                          const allImages = materialAtts
                                            .filter((a) =>
                                              isImageFileAttachment(a.url),
                                            )
                                            .map((a) => a.url);
                                          const idx = allImages.indexOf(
                                            att.url,
                                          );
                                          setGalleryImages(allImages);
                                          setSelectedImageIndex(
                                            idx >= 0 ? idx : 0,
                                          );
                                          setImageGalleryOpen(true);
                                        } else if (isVideo) {
                                          setVideoToPlay(att.url);
                                        }
                                      }}
                                    >
                                      {isImage ? (
                                        <img
                                          src={att.url}
                                          alt="attachment"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : isVideo ? (
                                        <div className="relative w-full h-full">
                                          <video
                                            src={att.url}
                                            className="w-full h-full object-cover"
                                            muted
                                            preload="metadata"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play className="h-4 w-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        getAttachmentIcon(att.url)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {fileName.length > 30
                                          ? `${fileName.slice(0, 27)}...`
                                          : fileName}
                                      </p>
                                      {createdDate && (
                                        <p className="text-xs text-muted-foreground">
                                          {createdDate}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        className="p-2 hover:bg-muted rounded-md transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(att.url);
                                        }}
                                        title={t("common.download")}
                                      >
                                        <Download className="h-4 w-4 text-destructive" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Empty state */}
                      {getTotalAttachmentCount() === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Paperclip className="h-8 w-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t("taskDetail.noAttachments")}
                          </p>
                          <label className="mt-3 cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*, .pdf, .mp4"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            <span className="text-primary text-sm font-medium flex items-center gap-1 cursor-pointer hover:underline">
                              <Plus className="h-4 w-4" />
                              {t("common.add")}{" "}
                              {t("board.attachments").toLowerCase()}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="activity"
                    className="mt-6 -mx-1 px-1 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent"
                  >
                    {task?.activity_log?.filter(
                      (log) => log?.action !== "created",
                    )?.length > 0 ? (
                      <div className="flex flex-col">
                        {/* Activity List */}
                        <div className="pr-2">
                          <div className="space-y-5 py-2">
                            {task.activity_log
                              .filter((log) => log?.action !== "created")
                              .map((log) => {
                                const firstName = log?.user_id?.Name || "";
                                const lastName = log?.user_id?.Last_Name || "";

                                const userName =
                                  firstName || lastName
                                    ? `${firstName} ${lastName}`.trim()
                                    : "Unknown User";
                                const timestamp = new Date(log.timestamp);

                                // Determine icon and color based on message content or action
                                const messageKeys = Array.isArray(log.message)
                                  ? log.message
                                  : [log.message];
                                const primaryKey = messageKeys[0] || "";
                                let icon: React.ReactNode;
                                let iconColor = "text-blue-600 bg-blue-100";

                                if (primaryKey.includes("LOCATION")) {
                                  icon = <MapPin className="h-4 w-4" />;
                                  iconColor = "text-emerald-600 bg-emerald-100";
                                } else if (
                                  primaryKey.includes("ASSIGNED") ||
                                  log.message?.includes("users")
                                ) {
                                  icon = <UserPlus className="h-4 w-4" />;
                                  iconColor = "text-purple-600 bg-purple-100";
                                } else if (primaryKey.includes("STATUS")) {
                                  icon = <CheckCircle2 className="h-4 w-4" />;
                                  iconColor = "text-amber-600 bg-amber-100";
                                } else if (primaryKey.includes("PRIORITY")) {
                                  icon = <AlertCircle className="h-4 w-4" />;
                                  iconColor = "text-red-600 bg-red-100";
                                } else if (primaryKey.includes("DUE_DATE")) {
                                  icon = <Calendar className="h-4 w-4" />;
                                  iconColor = "text-indigo-600 bg-indigo-100";
                                } else if (primaryKey.includes("CHECKLIST")) {
                                  icon = <ListChecks className="h-4 w-4" />;
                                  iconColor = "text-teal-600 bg-teal-100";
                                } else if (primaryKey.includes("ATTACHMENT")) {
                                  icon = <Paperclip className="h-4 w-4" />;
                                  iconColor = "text-gray-600 bg-gray-100";
                                } else if (primaryKey.includes("TITLE")) {
                                  icon = <Type className="h-4 w-4" />;
                                  iconColor = "text-pink-600 bg-pink-100";
                                } else if (
                                  primaryKey.includes("DESCRIPTION") ||
                                  primaryKey.includes("ADDITIONAL_INFO")
                                ) {
                                  icon = <FileText className="h-4 w-4" />;
                                  iconColor = "text-cyan-600 bg-cyan-100";
                                } else {
                                  icon = <Edit3 className="h-4 w-4" />;
                                  iconColor = "text-muted-foreground bg-muted";
                                }

                                const replaceAll = (text: string) => {
                                  const d = log.details || {};
                                  return text
                                    .replace(
                                      "{oldLocation}",
                                      d.oldLocation || "N/A",
                                    )
                                    .replace(
                                      "{newLocation}",
                                      d.newLocation || "N/A",
                                    )
                                    .replace(
                                      "{oldStatus}",
                                      getStatusLabel(d.oldStatus) || "N/A",
                                    )
                                    .replace(
                                      "{newStatus}",
                                      getStatusLabel(d.newStatus) || "N/A",
                                    )
                                    .replace(
                                      "{oldPriority}",
                                      getPriorityLabel(d.oldPriority) || "N/A",
                                    )
                                    .replace(
                                      "{newPriority}",
                                      getPriorityLabel(d.newPriority) || "N/A",
                                    )
                                    .replace(
                                      "{oldDueDate}",
                                      d.oldDueDate || "N/A",
                                    )
                                    .replace(
                                      "{newDueDate}",
                                      d.newDueDate || "N/A",
                                    )
                                    .replace(
                                      "{oldSummary}",
                                      d.oldSummary || "N/A",
                                    )
                                    .replace(
                                      "{newSummary}",
                                      d.newSummary || "N/A",
                                    )
                                    .replace(
                                      "{oldCategory}",
                                      d.oldCategory || "N/A",
                                    )
                                    .replace(
                                      "{newCategory}",
                                      d.newCategory || "N/A",
                                    )
                                    .replace(
                                      "{oldAssignees}",
                                      d.oldAssignees || "N/A",
                                    )
                                    .replace(
                                      "{newAssignees}",
                                      d.newAssignees || "N/A",
                                    )
                                    .replace(
                                      "{comment_preview}",
                                      d.comment_preview || "",
                                    )
                                    .replace(
                                      "{durationHours}",
                                      d.duration_hours || "",
                                    )
                                    .replace(
                                      "{description}",
                                      d.description || "",
                                    )
                                    .replace("{amount}", d.amount || "");
                                };

                                const translatedMessages = messageKeys.map(
                                  (key) => {
                                    const translated = t(`activity.${key}`);
                                    return replaceAll(
                                      translated !== `activity.${key}`
                                        ? translated
                                        : key,
                                    );
                                  },
                                );

                                const attachmentUrl =
                                  log.action === "attachment_added" &&
                                  log.details?.attachment_url
                                    ? log.details.attachment_url
                                    : log.details?.changes?.[0]?.new &&
                                        log.action === "attachment_added"
                                      ? log.details.changes[0].new
                                      : null;
                                const logUser = log?.user_id as any;
                                // Render message with userName as a hover card
                                const renderMessageWithUserCard = (
                                  msg: string,
                                ) => {
                                  const userPlaceholder = "{userName}";
                                  if (!msg.includes(userPlaceholder)) {
                                    return renderWithColoredPriorities(msg);
                                  }
                                  const parts = msg.split(userPlaceholder);
                                  return (
                                    <>
                                      {renderWithColoredPriorities(parts[0])}
                                      <UserActivityHoverCard
                                        userId={logUser?._id}
                                        firstName={firstName}
                                        lastName={lastName}
                                        email={logUser?.Email}
                                        profilePicture={
                                          logUser?.profile_picture
                                        }
                                        boardTasks={logUser?.assignedIssues}
                                        buildings={logUser?.affectedTo}
                                        inviteId={logUser?.inviteId}
                                      />
                                      {parts[1] &&
                                        renderWithColoredPriorities(parts[1])}
                                    </>
                                  );
                                };
                                return (
                                  <div
                                    key={log._id}
                                    className="flex gap-4 group"
                                  >
                                    {/* Icon */}
                                    <div className="shrink-0 mt-0.5">
                                      <div
                                        className={`rounded-full p-2 ${iconColor}`}
                                      >
                                        {icon}
                                      </div>
                                    </div>

                                    {/* Avatar + Content */}
                                    <div className="flex gap-3 flex-1 min-w-0">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm leading-relaxed flex justify-between text-foreground first-letter:uppercase">
                                          {translatedMessages.map((msg, i) => (
                                            <span key={i}>
                                              {i > 0 && <br />}
                                              {renderMessageWithUserCard(msg)}
                                            </span>
                                          ))}
                                          {/* Attachment preview button */}
                                          {attachmentUrl && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className=" h-7 text-xs gap-1.5"
                                              onClick={() => {
                                                setGalleryImages([
                                                  attachmentUrl,
                                                ]);
                                                setSelectedImageIndex(0);
                                                setImageGalleryOpen(true);
                                              }}
                                            >
                                              <Eye className="h-3 w-3" />
                                              {/* {t("taskDetail.viewAttachment")} */}
                                            </Button>
                                          )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          {formatDateOnly(
                                            new Date(log.timestamp),
                                          )}{" "}
                                          {t("taskDetail.at")}{" "}
                                          {timestamp.toLocaleTimeString(
                                            "en-US",
                                            {
                                              hour: "numeric",
                                              minute: "2-digit",
                                              hour12: false
                                            },
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Show All Button */}
                        {/* {task.activity_log.filter(
                          (log) => log?.action !== "created"
                        ).length > 8 &&
                          !showAllActivity && (
                            <div className="mt-4 pt-4 border-t border-border/60">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllActivity(true)}
                                className="w-full text-sm font-medium text-primary hover:bg-accent/60 rounded-lg transition-colors"
                              >
                                Show all activity (
                                {task.activity_log.filter(
                                  (log) => log?.action !== "created"
                                ).length - 8}{" "}
                                more)
                              </Button>
                            </div>
                          )} */}
                      </div>
                    ) : (
                      /* Premium Empty State */
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 blur-3xl rounded-full w-40 h-40 -z-10" />
                          <div className="rounded-full bg-muted/50 p-4 ">
                            <Activity className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        </div>

                        <h3 className="text-sm font-medium text-foreground">
                          {t("taskDetail.noActivityYet")}
                        </h3>
                        {/* <p className="text-xs mt-1 text-muted-foreground">
                          {t("taskDetail.noActivityDescription")}
                        </p> */}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                /* Mobile View - Empty content area with message */
                <div className="flex flex-1 items-center justify-center text-foreground/60 pb-20">
                  <p className="text-sm">{t("taskDetail.selectTabBelow")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Fixed Bottom Tabs */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 grid grid-cols-3">
              <button
                onClick={() => {
                  setMobileDrawerContent("comments");
                  setMobileDrawerOpen(true);
                }}
                className="flex flex-col items-center justify-center py-3 px-2 hover:bg-accent transition-colors"
              >
                <span className=" mb-1">
                  <ChartGantt size={20} />{" "}
                </span>
                <span className="text-xs text-foreground flex gap-1 items-center">
                  {t("board.comments")}
                  {task?.comments?.length > 0 && (
                    <span className="text-[10px] bg-[#F1F5FDFF] text-[#1759E8FF] border border-[#1759E8FF] rounded-full w-4 h-4 flex items-center justify-center">
                      {task?.comments?.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerContent("attachments");
                  setMobileDrawerOpen(true);
                }}
                className="flex flex-col items-center justify-center py-3 px-2 hover:bg-accent transition-colors border-x"
              >
                <span className="mb-1">
                  <Paperclip size={20} />{" "}
                </span>
                <span className="text-xs text-foreground">
                  {t("board.attachments")}
                </span>
                <span className="text-xs text-foreground flex gap-1 items-center">
                  {task?.Attachements?.length > 0 && (
                    <span className="text-[10px] bg-[#F1F5FDFF] text-[#1759E8FF] border border-[#1759E8FF] rounded-full w-4 h-4 flex items-center justify-center">
                      {task?.Attachements?.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerContent("activity");
                  setMobileDrawerOpen(true);
                }}
                className="flex flex-col items-center justify-center py-3 px-2 hover:bg-accent transition-colors"
              >
                <span className="mb-1">
                  <Activity size={20} />{" "}
                </span>
                <span className="text-xs text-foreground">
                  {t("board.activity")}
                </span>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Drawer for Tab Content */}
      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="capitalize">
                {mobileDrawerContent === "comments"
                  ? t("board.comments")
                  : mobileDrawerContent === "attachments"
                    ? t("board.attachments")
                    : t("board.activity")}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto p-4">
            {mobileDrawerContent === "comments" && (
              <CommentSystem
                taskId={task._id}
                buildingId={editSelectedBuildingId}
              />
            )}
            {mobileDrawerContent === "attachments" && (
              <div className="space-y-4">
                {/* Header with filter and add button */}
                <div className="flex items-center justify-between">
                  <Select
                    value={attachmentFilter}
                    onValueChange={setAttachmentFilter}
                  >
                    <SelectTrigger className="w-20 h-8 text-sm relative">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("taskDetail.commonFilter")}
                      </SelectItem>
                      <SelectItem value="images">
                        {t("taskDetail.imagesFilter")}
                      </SelectItem>
                      <SelectItem value="files">
                        {t("taskDetail.filesFilter")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <label
                    className={`${
                      isUploading ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#2E69E8FF] border-none h-8"
                      asChild
                      disabled={isUploading}
                    >
                      <span>
                        {isUploading ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#2E69E8FF] border-t-transparent" />
                            {t("taskDetail.uploading")}
                          </span>
                        ) : (
                          `+ ${t("common.add")}`
                        )}
                      </span>
                    </Button>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {/* Attachments List */}
                <div className="space-y-4">
                  {getFilteredAttachments().length > 0 ? (
                    <>
                      <div className="text-sm font-medium text-gray-700">
                        {t("taskDetail.attachments")} (
                        {getFilteredAttachments().length})
                      </div>
                      {getFilteredAttachments().map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 border rounded-md"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className=" text-white text-xs">
                              {isImageFile(attachment) ? (
                                <img
                                  src={attachment}
                                  alt="img"
                                  className="cover h-10 w-10 rounded-md"
                                />
                              ) : (
                                "📄"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {attachment.split("/").pop() ||
                                `Attachment ${index + 1}`}
                            </div>
                            <div className="text-xs text-foreground">
                              {(() => {
                                const now = new Date();

                                // Use UTC getters to keep the real current date (no local offset shift)
                                const day = now
                                  .getUTCDate()
                                  .toString()
                                  .padStart(2, "0");
                                const month = (now.getUTCMonth() + 1)
                                  .toString()
                                  .padStart(2, "0");
                                const year = now.getUTCFullYear();

                                return `${day}.${month}.${year}`;
                              })()}{" "}
                              - {currentUser?.Name || "User"}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDownload(attachment)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-foreground">
                      {t("taskDetail.noAttachmentsFound")}
                    </div>
                  )}
                </div>
              </div>
            )}
            {mobileDrawerContent === "activity" && (
              <div>
                {task?.activity_log?.length > 0 ? (
                  <>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {task?.activity_log
                        .filter((log) => log?.action !== "created")
                        .slice(0, showAllActivity ? undefined : 5)
                        .map((log) => {
                          const userName =
                            log?.details?.userName || "Unknown User";
                          const messageKeys = Array.isArray(log.message)
                            ? log.message
                            : [log.message];
                          const primaryKey = messageKeys[0] || "";

                          let icon: React.ReactNode;
                          let iconColor = "text-blue-600 bg-blue-100";

                          if (primaryKey.includes("LOCATION")) {
                            icon = <MapPin className="h-4 w-4" />;
                            iconColor = "text-emerald-600 bg-emerald-100";
                          } else if (primaryKey.includes("ASSIGNED")) {
                            icon = <UserPlus className="h-4 w-4" />;
                            iconColor = "text-purple-600 bg-purple-100";
                          } else if (primaryKey.includes("STATUS")) {
                            icon = <CheckCircle2 className="h-4 w-4" />;
                            iconColor = "text-amber-600 bg-amber-100";
                          } else if (primaryKey.includes("PRIORITY")) {
                            icon = <AlertCircle className="h-4 w-4" />;
                            iconColor = "text-red-600 bg-red-100";
                          } else if (primaryKey.includes("ATTACHMENT")) {
                            icon = <Paperclip className="h-4 w-4" />;
                            iconColor = "text-gray-600 bg-gray-100";
                          } else {
                            icon = <Edit3 className="h-4 w-4" />;
                            iconColor = "text-muted-foreground bg-muted";
                          }

                          const replaceAll = (text: string) => {
                            const d = log.details || {};
                            return text
                              .replace("{userName}", userName)
                              .replace("{oldLocation}", d.oldLocation || "N/A")
                              .replace("{newLocation}", d.newLocation || "N/A")
                              .replace(
                                "{oldStatus}",
                                getStatusLabel(d.oldStatus) || "N/A",
                              )
                              .replace(
                                "{newStatus}",
                                getStatusLabel(d.newStatus) || "N/A",
                              )
                              .replace(
                                "{oldPriority}",
                                getPriorityLabel(d.oldPriority) || "N/A",
                              )
                              .replace(
                                "{newPriority}",
                                getPriorityLabel(d.newPriority) || "N/A",
                              )
                              .replace("{oldDueDate}", d.oldDueDate || "N/A")
                              .replace("{newDueDate}", d.newDueDate || "N/A")
                              .replace("{oldSummary}", d.oldSummary || "N/A")
                              .replace("{newSummary}", d.newSummary || "N/A")
                              .replace("{oldCategory}", d.oldCategory || "N/A")
                              .replace("{newCategory}", d.newCategory || "N/A")
                              .replace(
                                "{oldAssignees}",
                                d.oldAssignees || "N/A",
                              )
                              .replace(
                                "{newAssignees}",
                                d.newAssignees || "N/A",
                              )
                              .replace(
                                "{comment_preview}",
                                d.comment_preview || "",
                              )
                              .replace(
                                "{durationHours}",
                                d.duration_hours || "",
                              )
                              .replace("{description}", d.description || "")
                              .replace("{amount}", d.amount || "");
                          };

                          const translatedMessages = messageKeys.map((key) => {
                            const translated = t(`activity.${key}`);
                            return replaceAll(
                              translated !== `activity.${key}`
                                ? translated
                                : key,
                            );
                          });

                          const attachmentUrl =
                            log.action === "attachment_added" &&
                            log.details?.attachment_url
                              ? log.details.attachment_url
                              : log.details?.changes?.[0]?.new &&
                                  log.action === "attachment_added"
                                ? log.details.changes[0].new
                                : null;

                          return (
                            <div
                              key={log._id}
                              className="flex items-start gap-3"
                            >
                              <div className="shrink-0 mt-0.5">
                                <div
                                  className={`rounded-full p-2 ${iconColor}`}
                                >
                                  {icon}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm first-letter:uppercase">
                                  {translatedMessages.map((msg, i) => (
                                    <span key={i}>
                                      {i > 0 && <br />}
                                      {renderWithColoredPriorities(msg)}
                                    </span>
                                  ))}
                                </div>

                                {/* Attachment preview button */}
                                {attachmentUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 h-7 text-xs gap-1.5"
                                    onClick={() => {
                                      setGalleryImages([attachmentUrl]);
                                      setSelectedImageIndex(0);
                                      setImageGalleryOpen(true);
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                    {t("taskDetail.viewAttachment")}
                                  </Button>
                                )}

                                <div className="text-xs text-foreground mt-1">
                                  {new Date(log.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* View More Button */}
                    {task?.activity_log.filter(
                      (log) => log?.action !== "created",
                    ).length > 5 &&
                      !showAllActivity && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllActivity(true)}
                          className="w-full mt-4 text-[#2E69E8FF] border-[#2E69E8FF] hover:bg-[#F1F5FDFF]"
                        >
                          {t("taskDetail.viewMore")} (
                          {task?.activity_log.filter(
                            (log) => log?.action !== "created",
                          ).length - 5}{" "}
                          {t("taskDetail.more")})
                        </Button>
                      )}
                  </>
                ) : (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    {t("taskDetail.noActivityYet")}
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Link Task Modal */}
      <LinkTaskModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        onSelectLink={handleLinkSelect}
        onApplyLinks={handleApplyLinks}
        selectedBuildingId={task?.Building_id}
        editSelectedBuildingId={editSelectedBuildingId}
        showAllBuildings={!selectedBuildingId}
        alreadyLinkedItems={
          task?.Linked_To?._id
            ? [
                {
                  id: task.Linked_To._id,
                  type: task.Linked_To_Model === "Asset" ? "Asset" : "Space",
                },
              ]
            : []
        }
      />

      {/* Image Gallery Modal */}
      <ImageGallery
        images={
          galleryImages.length > 0 ? galleryImages : task?.Attachements || []
        }
        isOpen={imageGalleryOpen}
        onClose={() => {
          setImageGalleryOpen(false);
          setGalleryImages([]);
        }}
        initialIndex={selectedImageIndex}
      />

      {/* Delete Task Modal */}
      {task && (
        <DeleteTaskModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          task={task}
          onTaskDeleted={() => {
            onTaskDeleted?.();
            onClose();
          }}
        />
      )}

      {/* Add Task Modal */}
      <Dialog open={addTaskModalOpen} onOpenChange={setAddTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("taskDetail.addChecklistItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t("taskDetail.enterTaskDescription")}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddChecklistItem()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddTaskModalOpen(false);
                  setNewTaskText("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleAddChecklistItem}
                disabled={!newTaskText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Checklist Item Modal */}
      <DeleteChecklistItemModal
        isOpen={deleteChecklistIndex !== null}
        onClose={() => setDeleteChecklistIndex(null)}
        onConfirm={handleDeleteChecklistItem}
        itemName={
          deleteChecklistIndex !== null && task?.Checklist[deleteChecklistIndex]
            ? task.Checklist[deleteChecklistIndex].name
            : ""
        }
      />

      {/* Log Time Modal */}
      {task && (
        <LogTimeModal
          isOpen={logTimeModalOpen}
          onClose={() => setLogTimeModalOpen(false)}
          taskId={task._id}
        />
      )}

      {/* Logged Time Modal */}
      {task && (
        <LoggedTimeModal
          isOpen={loggedTimeModalOpen}
          onClose={() => setLoggedTimeModalOpen(false)}
          taskId={task._id}
        />
      )}

      {/* Log Material Modal */}
      {task && (
        <LogMaterialModal
          isOpen={logMaterialModalOpen}
          onClose={() => setLogMaterialModalOpen(false)}
          taskId={task._id}
        />
      )}

      {/* Logged Materials Modal */}
      {task && (
        <LoggedMaterialsModal
          isOpen={loggedMaterialsModalOpen}
          onClose={() => setLoggedMaterialsModalOpen(false)}
          taskId={task._id}
        />
      )}

      {/* Delete Attachment Confirmation Modal */}
      <ConfirmModal
        isOpen={!!attachmentToDelete}
        onClose={() => setAttachmentToDelete(null)}
        onConfirm={async () => {
          if (attachmentToDelete) {
            await handleDeleteAttachment(attachmentToDelete);
            setAttachmentToDelete(null);
          }
        }}
        title={t("taskDetail.deleteAttachment")}
        description={t("taskDetail.deleteAttachmentConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isDestructive
      />

      {/* Video Player Modal */}
      <Dialog open={!!videoToPlay} onOpenChange={() => setVideoToPlay(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{t("taskDetail.videoPlayer")}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {videoToPlay && (
              <video
                src={videoToPlay}
                controls
                autoPlay
                className="w-full max-h-[70vh] rounded-lg bg-black"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
