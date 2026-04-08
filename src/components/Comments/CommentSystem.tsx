import { useState, useEffect, useRef } from "react";
import UserActivityHoverCard from "@/components/BoardGroup/UserActivityHoverCard";
import { useQueryClient } from "@tanstack/react-query";
import { TASKS_QUERY_KEY } from "@/hooks/queries/useTasksQuery";
import { TASK_DETAIL_QUERY_KEY } from "@/hooks/queries/useTaskDetailQuery";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Smile,
  X,
  Check,
  AtSign,
  Send,
  CornerDownRight,
  Paperclip,
  FileText,
  Download,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { CommentType, CommentReaction } from "@/types";
import { useCurrentUserQuery } from "@/hooks/queries";
import { apiService, endpoints } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageViewerModal } from "@/components/Common/ImageViewerModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";

// Skeleton component for loading comments
const CommentSkeleton = () => (
  <div className="p-4 rounded-lg">
    <div className="flex items-start gap-3">
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  </div>
);

const CommentsLoadingSkeleton = () => (
  <div className="space-y-1">
    <CommentSkeleton />
    <CommentSkeleton />
    <CommentSkeleton />
  </div>
);

interface CommentSystemProps {
  taskId: string;
  buildingId?: string;
  initialComments?: CommentType[];
  onCommentCountChange?: (count: number) => void;
}

// Emoji reactions matching DB schema
const EMOJI_REACTIONS = ["👍", "❤️", "😂", "👀"] as const;
type EmojiReaction = (typeof EMOJI_REACTIONS)[number];

interface BuildingUser {
  _id: string;
  Name: string;
  Last_Name?: string;
  email: string;
  profile_picture?: string;
}

interface FilePreview {
  file: File;
  preview: string;
  type: "image" | "document";
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return (
        <img src={pdfIcon} alt="PDF" className="w-full h-full object-contain" />
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
    default:
      return <FileText className="w-5 h-5 text-muted-foreground" />;
  }
};

export function CommentSystem({
  taskId,
  buildingId,
  initialComments = [],
  onCommentCountChange,
}: CommentSystemProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [replies, setReplies] = useState<Record<string, CommentType[]>>({});
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  // Track which replies are collapsed (default: all expanded)
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isRepliesLoading, setIsRepliesLoading] = useState<
    Record<string, boolean>
  >({});
  const [commentSortOrder, setCommentSortOrder] = useState<"newest" | "oldest">(
    "newest",
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [hoveredReaction, setHoveredReaction] = useState<{
    itemId: string;
    emoji: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "comment" | "reply";
    parentId?: string;
  } | null>(null);

  // Attachment preview state
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // File upload state
  const [commentFiles, setCommentFiles] = useState<FilePreview[]>([]);
  const [replyFiles, setReplyFiles] = useState<Record<string, FilePreview[]>>(
    {},
  );
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  // Mention functionality
  const [buildingUsers, setBuildingUsers] = useState<BuildingUser[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionTarget, setMentionTarget] = useState<
    "comment" | "reply" | null
  >(null);
  const [mentionReplyId, setMentionReplyId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch building users for mentions
  useEffect(() => {
    const fetchBuildingUsers = async () => {
      if (!buildingId) return;
      try {
        const response = await apiService.get<BuildingUser[]>(
          `${endpoints.buildings}/${buildingId}/users`,
        );
        setBuildingUsers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch building users:", error);
      }
    };
    fetchBuildingUsers();
  }, [buildingId]);

  // File upload handlers
  const handleCommentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FilePreview[] = [];
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : "";
      newFiles.push({ file, preview, type: isImage ? "image" : "document" });
    });
    setCommentFiles((prev) => [...prev, ...newFiles]);
    if (e.target) e.target.value = "";
  };

  const handleReplyFileSelect = (
    commentId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FilePreview[] = [];
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : "";
      newFiles.push({ file, preview, type: isImage ? "image" : "document" });
    });
    setReplyFiles((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), ...newFiles],
    }));
    if (e.target) e.target.value = "";
  };

  const removeCommentFile = (index: number) => {
    setCommentFiles((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const removeReplyFile = (commentId: string, index: number) => {
    setReplyFiles((prev) => {
      const updated = { ...prev };
      if (updated[commentId]?.[index]?.preview)
        URL.revokeObjectURL(updated[commentId][index].preview);
      updated[commentId] = updated[commentId].filter((_, i) => i !== index);
      return updated;
    });
  };

  // Fetch comments with real-time polling
  useEffect(() => {
    let isFirstLoad = true;

    const fetchComments = async () => {
      try {
        if (isFirstLoad) setIsCommentsLoading(true);
        const response = await apiService.get<CommentType[]>(
          `${endpoints.comment}/accepted-issue/${taskId}`,
        );
        const fetchedComments = response.data || [];
        setComments(fetchedComments);

        // Fetch replies for all comments on initial load
        if (isFirstLoad && fetchedComments.length > 0) {
          const repliesPromises = fetchedComments.map(async (comment) => {
            try {
              const repliesRes = await apiService.get<CommentType[]>(
                `${endpoints.comment}/replies/${comment._id}`,
              );
              return { commentId: comment._id, replies: repliesRes.data || [] };
            } catch {
              return { commentId: comment._id, replies: [] };
            }
          });

          const allReplies = await Promise.all(repliesPromises);
          const repliesMap: Record<string, CommentType[]> = {};
          allReplies.forEach(({ commentId, replies: commentReplies }) => {
            if (commentReplies.length > 0) {
              repliesMap[commentId] = commentReplies;
            }
          });
          setReplies(repliesMap);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        if (isFirstLoad) {
          setIsCommentsLoading(false);
          isFirstLoad = false;
        }
      }
    };

    fetchComments();
    const interval = setInterval(fetchComments, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  // Notify parent of comment count changes
  useEffect(() => {
    onCommentCountChange?.(comments.length);
  }, [comments.length, onCommentCountChange]);

  const initials = (user) => {
    return `${user?.Name[0]}${user?.Last_Name[0]}`.toUpperCase();
  };

  const isOwnComment = (comment: CommentType) => {
    return currentUser?._id === comment?.id_user?._id;
  };

  const handleCommentInputChange = (value: string) => {
    setNewComment(value);
    handleMentionDetection(value, "comment");
  };

  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
    handleMentionDetection(value, "reply", commentId);
  };

  const handleMentionDetection = (
    value: string,
    target: "comment" | "reply",
    replyId?: string,
  ) => {
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(" ");
      const isAtStartOrAfterSpace =
        lastAtIndex === 0 || value[lastAtIndex - 1] === " ";

      if (isAtStartOrAfterSpace && !hasSpaceAfterAt) {
        setMentionQuery(textAfterAt.toLowerCase());
        setShowMentions(true);
        setMentionTarget(target);
        setMentionReplyId(replyId || null);
        return;
      }
    }
    setShowMentions(false);
    setMentionTarget(null);
    setMentionReplyId(null);
  };

  const handleMentionSelect = (user: BuildingUser) => {
    const username = `${user.Name}${
      user.Last_Name ? "_" + user.Last_Name : ""
    }`.replace(/\s+/g, "_");

    if (mentionTarget === "comment") {
      const lastAtIndex = newComment.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const newValue = newComment.slice(0, lastAtIndex) + `@${username} `;
        setNewComment(newValue);
      }
    } else if (mentionTarget === "reply" && mentionReplyId) {
      const currentText = replyTexts[mentionReplyId] || "";
      const lastAtIndex = currentText.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const newValue = currentText.slice(0, lastAtIndex) + `@${username} `;
        setReplyTexts((prev) => ({ ...prev, [mentionReplyId]: newValue }));
      }
    }

    setShowMentions(false);
    setMentionQuery("");
    setMentionTarget(null);
    setMentionReplyId(null);
  };

  const filteredUsers = buildingUsers.filter((user) => {
    const fullName = `${user?.Name} ${user?.Last_Name || ""}`.toLowerCase();
    const email = user?.email?.toLowerCase();
    return fullName?.includes(mentionQuery) || email?.includes(mentionQuery);
  });

  // New comment with file support
  const handleSendComment = async () => {
    if ((!newComment.trim() && commentFiles.length === 0) || !currentUser)
      return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", newComment);
      formData.append("accepted_issue", taskId);
      formData.append("id_user", currentUser._id);
      formData.append(
        "authorName",
        `${currentUser.Name} ${currentUser.Last_Name}`,
      );
      commentFiles.forEach((filePreview) => {
        formData.append("files", filePreview.file);
      });

      const response = await apiService.post<CommentType>(
        `${endpoints.comment}`,
        formData,
      );
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
      // Clear files and revoke object URLs
      commentFiles.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setCommentFiles([]);
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
    } catch (error) {
      console.error("Failed to send comment:", error);
      toast({
        title: t("common.error"),
        description: t("comments.failedToSendComment"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reply with file support (one-level only)
  const handleReply = async (commentId: string) => {
    const replyText = replyTexts[commentId];
    const files = replyFiles[commentId] || [];
    if ((!replyText?.trim() && files.length === 0) || !currentUser) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", replyText || "");
      formData.append("id_user", currentUser._id);
      formData.append("accepted_issue", taskId);
      formData.append(
        "authorName",
        `${currentUser.Name} ${currentUser.Last_Name}`,
      );
      files.forEach((filePreview) => {
        formData.append("files", filePreview.file);
      });

      await apiService.post(
        `${endpoints.comment}/reply/${commentId}`,
        formData,
      );

      const repliesResponse = await apiService.get<CommentType[]>(
        `${endpoints.comment}/replies/${commentId}`,
      );

      setReplies((prev) => ({ ...prev, [commentId]: repliesResponse.data }));
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
      // Clear files and revoke object URLs
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setReplyFiles((prev) => ({ ...prev, [commentId]: [] }));
      // Ensure replies are visible (remove from collapsed set)
      setCollapsedReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast({
        title: t("common.error"),
        description: t("comments.failedToSendReply"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;
    setIsLoading(true);
    try {
      await apiService.patch(`${endpoints.comment}/${commentId}`, {
        content: editText,
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editText } : c,
        ),
      );
      setEditingCommentId(null);
      setEditText("");
      toast({
        title: t("common.success"),
        description: t("comments.commentUpdated"),
        variant: "success"
      });
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast({
        title: t("common.error"),
        description: t("comments.failedToUpdateComment"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit reply
  const handleEditReply = async (replyId: string, parentCommentId: string) => {
    if (!editText.trim()) return;
    setIsLoading(true);
    try {
      await apiService.patch(`${endpoints.comment}/${replyId}`, {
        content: editText,
      });
      setReplies((prev) => ({
        ...prev,
        [parentCommentId]: prev[parentCommentId]?.map((r) =>
          r._id === replyId ? { ...r, content: editText } : r,
        ),
      }));
      setEditingReplyId(null);
      setEditText("");
      toast({
        title: t("common.success"),
        description: t("comments.replyUpdated"),
        variant: "success"
      });
    } catch (error) {
      console.error("Failed to edit reply:", error);
      toast({
        title: t("common.error"),
        description: t("comments.failedToUpdateReply"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handlers
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      await apiService.delete(`${endpoints.comment}/${deleteTarget.id}`);
      if (deleteTarget.type === "comment") {
        setComments((prev) => prev.filter((c) => c._id !== deleteTarget.id));
      } else if (deleteTarget.parentId) {
        setReplies((prev) => ({
          ...prev,
          [deleteTarget.parentId!]: prev[deleteTarget.parentId!]?.filter(
            (r) => r._id !== deleteTarget.id,
          ),
        }));
      }
      toast({
        title: t("comments.deleted"),
        description:
          deleteTarget.type === "comment"
            ? t("comments.commentDeleted")
            : t("comments.replyDeleted"),
            variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
      });
    } catch (error) {
      console.error("Failed to delete:", error);
      toast({
        title: t("common.error"),
        description: t("comments.failedToDelete"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  };

  // Handle emoji reaction - works with the new DB schema
  const handleReaction = async (
    itemId: string,
    emoji: EmojiReaction,
    isComment: boolean,
    parentCommentId?: string,
  ) => {
    if (!currentUser) return;

    // Find the item (comment or reply) to update
    const updateReactions = (items: CommentType[]): CommentType[] => {
      return items.map((item) => {
        if (item._id === itemId) {
          const currentReactions = item.reactions || [];
          const reactionIndex = currentReactions.findIndex(
            (r) => r.type === emoji,
          );

          let newReactions: CommentReaction[];

          if (reactionIndex >= 0) {
            // Reaction exists - check if user already reacted
            const reaction = currentReactions[reactionIndex];
            const userIndex = reaction.users.findIndex(
              (u) => u._id === currentUser._id,
            );

            if (userIndex >= 0) {
              // Remove user from this reaction
              const newUsers = reaction.users.filter(
                (u) => u._id !== currentUser._id,
              );
              if (newUsers.length === 0) {
                // Remove entire reaction if no users left
                newReactions = currentReactions.filter(
                  (_, i) => i !== reactionIndex,
                );
              } else {
                newReactions = currentReactions.map((r, i) =>
                  i === reactionIndex ? { ...r, users: newUsers } : r,
                );
              }
            } else {
              // Add user to this reaction
              newReactions = currentReactions.map((r, i) =>
                i === reactionIndex
                  ? {
                      ...r,
                      users: [
                        ...r.users,
                        {
                          _id: currentUser._id,
                          Name: currentUser.Name,
                          Last_Name: currentUser.Last_Name,
                          profile_picture: currentUser.profile_picture,
                        },
                      ],
                    }
                  : r,
              );
            }
          } else {
            // Add new reaction with current user
            newReactions = [
              ...currentReactions,
              {
                type: emoji,
                users: [
                  {
                    _id: currentUser._id,
                    Name: currentUser.Name,
                    Last_Name: currentUser.Last_Name,
                    profile_picture: currentUser.profile_picture,
                  },
                ],
              },
            ];
          }

          return { ...item, reactions: newReactions };
        }
        return item;
      });
    };

    // Optimistic update
    if (isComment) {
      setComments((prev) => updateReactions(prev));
    } else if (parentCommentId) {
      setReplies((prev) => ({
        ...prev,
        [parentCommentId]: updateReactions(prev[parentCommentId] || []),
      }));
    }

    try {
      await apiService.post(`${endpoints.comment}/${itemId}/react`, {
        type: emoji,
      });
    } catch (error) {
      console.error("Failed to save reaction:", error);
      toast({
        title: t("common.error"),
        description: t("comments.failedToAddReaction"),
        variant: "destructive",
      });
      // Revert on error by refetching
      const response = await apiService.get<CommentType[]>(
        `${endpoints.comment}/accepted-issue/${taskId}`,
      );
      setComments(response.data || []);
    }
  };

  const toggleReplies = async (commentId: string) => {
    // Now we toggle collapsed state (default is expanded)
    const isCollapsing = !collapsedReplies.has(commentId);

    setCollapsedReplies((prev) => {
      const newSet = new Set(prev);
      isCollapsing ? newSet.add(commentId) : newSet.delete(commentId);
      return newSet;
    });
  };

  const startEditComment = (comment: CommentType) => {
    setEditingCommentId(comment._id);
    setEditText(comment.content);
  };

  const startEditReply = (reply: CommentType) => {
    setEditingReplyId(reply._id);
    setEditText(reply.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingReplyId(null);
    setEditText("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();

    // Use UTC time difference to avoid local timezone shifts
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("comments.justNow");
    if (diffMins < 60) return `${diffMins}${t("comments.minutesAgo")}`;
    if (diffHours < 24) return `${diffHours}${t("comments.hoursAgo")}`;
    if (diffDays < 7) return `${diffDays}${t("comments.daysAgo")}`;

    // Use UTC date parts for the final formatted date
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
  };

  // Helper to check if current user has reacted with specific emoji
  const hasUserReacted = (
    reactions: CommentReaction[] | undefined,
    emoji: string,
  ): boolean => {
    if (!reactions || !currentUser) return false;
    const reaction = reactions.find((r) => r.type === emoji);
    return reaction
      ? reaction.users.some((u) => u._id === currentUser._id)
      : false;
  };

  // Get total reaction count for an item
  const getTotalReactions = (
    reactions: CommentReaction[] | undefined,
  ): number => {
    if (!reactions) return 0;
    return reactions.reduce((total, r) => total + r.users.length, 0);
  };

  // Render mention text with highlighted mentions
  const CommentContent = ({ content }: { content: string }) => {
    const parts = content.split(/(@\w+)/g);
    return (
      <span>
        {parts.map((part, i) =>
          part.startsWith("@") ? (
            <span
              key={i}
              className="text-primary font-medium cursor-pointer hover:underline capitalize"
            >
              {part.replace("@", "").replace(/_/g, " ")}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </span>
    );
  };

  // Mention dropdown - positioned above the textarea with proper z-index
  const MentionDropdown = ({ targetId }: { targetId?: string }) => {
    if (!showMentions || filteredUsers.length === 0) return null;

    // Only show for correct target
    if (mentionTarget === "comment" && targetId !== "comment") return null;
    if (mentionTarget === "reply" && targetId !== mentionReplyId) return null;

    return (
      <div className="absolute left-0 bottom-full mb-2 w-72 bg-popover border border-border rounded-lg shadow-2xl p-2 max-h-56 overflow-y-auto z-[100]">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2 py-1 flex items-center gap-1.5 border-b border-border pb-2">
          <AtSign className="h-3.5 w-3.5" />
          {t("comments.mentionTeamMember")}
        </div>
        <div className="space-y-0.5">
          {filteredUsers.slice(0, 6).map((user) => (
            <button
              key={user._id}
              onClick={() => handleMentionSelect(user)}
              className="w-full flex items-center gap-3 p-2 text-left hover:bg-accent rounded-md transition-colors"
            >
              <Avatar className="h-7 w-7">
                {user.profile_picture ? (
                  <AvatarImage src={user.profile_picture} alt={user.Name} />
                ) : (
                  <AvatarFallback className="bg-[#0F4C7BFF] rounded-md text-white text-sm">
                    {initials(user)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate capitalize">
                  {user.Name} {user.Last_Name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Reaction button component - uses native HTML dropdown
  const ReactionButton = ({
    itemId,
    reactions,
    isComment,
    parentCommentId,
  }: {
    itemId: string;
    reactions?: CommentReaction[];
    isComment: boolean;
    parentCommentId?: string;
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const totalReactions = getTotalReactions(reactions);
    const activeReactions = reactions?.filter((r) => r.users.length > 0) || [];

    // Close picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          pickerRef.current &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          setShowPicker(false);
        }
      };

      if (showPicker) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showPicker]);

    const onEmojiClick = (emoji: EmojiReaction) => {
      handleReaction(itemId, emoji, isComment, parentCommentId);
      setShowPicker(false);
    };

    return (
      <div className="flex items-center gap-2">
        {/* Add reaction button with native dropdown */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="inline-flex items-center gap-1.5 h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Smile className="h-3.5 w-3.5" />
            <span>{t("comments.react")}</span>
          </button>

          {showPicker && (
            <div
              className="absolute bottom-full left-0 mb-2 p-2 bg-popover border border-border rounded-lg shadow-lg z-[9999] flex gap-1"
              style={{ minWidth: "max-content" }}
            >
              {EMOJI_REACTIONS.map((emoji) => {
                const isActive = hasUserReacted(reactions, emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onEmojiClick(emoji)}
                    className={cn(
                      "h-10 w-10 rounded-full text-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-125 hover:bg-accent",
                      isActive && "bg-primary/20 ring-2 ring-primary",
                    )}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Display reaction summary with hover to show users */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1">
            {activeReactions.map((reaction) => (
              <TooltipProvider key={reaction.type}>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors cursor-pointer",
                        hasUserReacted(reactions, reaction.type)
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                      onClick={() =>
                        handleReaction(
                          itemId,
                          reaction.type as EmojiReaction,
                          isComment,
                          parentCommentId,
                        )
                      }
                    >
                      <span className="text-sm">{reaction.type}</span>
                      <span className="font-medium">
                        {reaction.users.length}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px] p-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-medium text-xs border-b border-border pb-1.5">
                        <span className="text-base">{reaction.type}</span>
                        <span>
                          {reaction.users?.length || 0}{" "}
                          {(reaction.users?.length || 0) === 1
                            ? t("comments.person")
                            : t("comments.people")}
                        </span>
                      </div>
                      {reaction.users && reaction.users.length > 0 && (
                        <div className="space-y-1.5 capitalize">
                          {reaction.users.slice(0, 10).map((user, index) => {
                            // Handle case where user might be just a string ID (after refresh) or full object
                            const userId =
                              typeof user === "string" ? user : user._id;
                            const userName =
                              typeof user === "string" ? "" : user.Name || "";
                            const userLastName =
                              typeof user === "string"
                                ? ""
                                : user.Last_Name || "";
                            const userPicture =
                              typeof user === "string"
                                ? undefined
                                : user.profile_picture;
                            const displayName =
                              userName || userLastName
                                ? `${userName} ${userLastName}`.trim()
                                : "User";

                            return (
                              <div
                                key={userId || `user-${index}`}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="h-5 w-5 flex-shrink-0">
                                  {userPicture ? (
                                    <AvatarImage
                                      src={userPicture}
                                      alt={userName}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-[#0F4C7BFF] rounded-none text-white text-xs uppercase">
                                      {userName?.[0] || ""}
                                      {userLastName?.[0] || "U"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="text-xs truncate rounded-none">
                                  {displayName}
                                </span>
                              </div>
                            );
                          })}
                          {reaction.users.length > 10 && (
                            <div className="text-xs text-muted-foreground pl-7">
                              +{reaction.users.length - 10} {t("comments.more")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper to check if file is an image
  const isImageFile = (url: string): boolean => {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
  };

  // Helper to get filename from URL
  const getFileName = (url: string): string => {
    return url.split("/").pop() || "File";
  };

  // Open preview modal
  const openImagePreview = (images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewInitialIndex(index);
    setIsPreviewOpen(true);
  };

  // Normalize attachments: support both string[] and {type, url}[] formats
  const normalizeAttachments = (attachments: any[] | undefined): string[] => {
    if (!attachments || attachments.length === 0) return [];
    return attachments
      .map((att) => (typeof att === "string" ? att : att?.url || ""))
      .filter(Boolean);
  };

  // Attachment display component
  const AttachmentDisplay = ({
    attachments: rawAttachments,
    compact = false,
  }: {
    attachments?: any[];
    compact?: boolean;
  }) => {
    const attachments = normalizeAttachments(rawAttachments);
    if (attachments.length === 0) return null;

    const imageFiles = attachments.filter(isImageFile);
    const documentFiles = attachments.filter((f) => !isImageFile(f));

    return (
      <div className={cn("mt-2", compact ? "space-y-1.5" : "space-y-2")}>
        {/* Image Grid */}
        {imageFiles.length > 0 && (
          <div
            className={cn(
              "grid gap-2",
              imageFiles.length === 1
                ? "grid-cols-1"
                : imageFiles.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3",
            )}
          >
            {imageFiles.map((url, index) => (
              <div
                key={index}
                className={cn(
                  "relative group/img cursor-pointer rounded-lg overflow-hidden bg-muted border border-border",
                  compact ? "h-16" : "h-24",
                )}
                onClick={() => openImagePreview(imageFiles, index)}
              >
                <img
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document List */}
        {documentFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {documentFiles.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors",
                  compact ? "px-2 py-1.5" : "px-3 py-2",
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0",
                    compact ? "w-5 h-5" : "w-6 h-6",
                  )}
                >
                  {getFileIcon(url)}
                </div>
                <span
                  className={cn(
                    "text-foreground truncate max-w-[120px]",
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  {getFileName(url)}
                </span>
                <Download
                  className={cn(
                    "text-muted-foreground",
                    compact ? "h-3 w-3" : "h-3.5 w-3.5",
                  )}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col max-h-full w-full">
      {/* Image Preview Modal */}
      <ImageViewerModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        images={previewImages}
        initialIndex={previewInitialIndex}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "comment"
                ? t("comments.deleteComment")
                : t("comments.deleteReply")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("comments.deleteConfirm")}{" "}
              {deleteTarget?.type === "comment"
                ? t("comments.comment")
                : t("comments.reply").toLowerCase()}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Loading */}
      {isCommentsLoading && <CommentsLoadingSkeleton />}

      {/* Sort Button */}
      {!isCommentsLoading && comments.length > 1 && (
        <div className="flex justify-end px-2 pb-1">
          <button
            onClick={() =>
              setCommentSortOrder((prev) =>
                prev === "newest" ? "oldest" : "newest",
              )
            }
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border"
          >
            <ArrowUpDown className="h-3 w-3" />
            {commentSortOrder === "newest"
              ? t("comments.newest") || "Newest"
              : t("comments.oldest") || "Oldest"}
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 space-y-1 overflow-y-auto max-h-[550px]">
        {!isCommentsLoading && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <MessageSquare className="h-8 w-8 opacity-60" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("comments.noCommentsYet")}
            </p>
            <p className="text-xs mt-1">{t("comments.beFirstToComment")}</p>
          </div>
        )}

        {[...comments]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return commentSortOrder === "newest"
              ? dateB - dateA
              : dateA - dateB;
          })
          .map((comment) => {
            const commentReplies = replies[comment._id] || [];
            const hasReplies = commentReplies.length > 0;
            const isReplyLoading = isRepliesLoading[comment._id];

            return (
              <div key={comment._id} className="group">
                {/* Comment Card */}
                {/* {console.log(comments)} */}
                <div className="p-4 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      {comment?.id_user?.profile_picture ? (
                        <AvatarImage
                          src={comment.id_user.profile_picture}
                          alt={comment.id_user.Name || "Profile"}
                        />
                      ) : (
                        <AvatarFallback className="bg-[#0F4C7BFF] rounded-md text-white text-sm">
                          {initials(comment?.id_user)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {comment.id_user?.Name ? (
                          <UserActivityHoverCard
                            userId={comment.id_user?._id}
                            firstName={comment.id_user?.Name || ""}
                            lastName={comment.id_user?.Last_Name || ""}
                            email={(comment.id_user as any)?.Email}
                            profilePicture={comment.id_user?.profile_picture}
                            boardTasks={comment.id_user?.assignedIssues}
                            buildings={comment.id_user?.affectedTo}
                          />
                        ) : (
                          <Skeleton className="h-4 w-24" />
                        )}
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                        {isOwnComment(comment) && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {t("comments.you")}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      {editingCommentId === comment._id ? (
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 h-9"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditComment(comment._id)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                            <CommentContent content={comment.content} />
                          </p>
                          {/* Comment Attachments */}
                          <AttachmentDisplay
                            attachments={comment.attachments}
                          />
                        </>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-3">
                        <ReactionButton
                          itemId={comment._id}
                          reactions={comment.reactions}
                          isComment={true}
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment._id ? null : comment._id,
                            )
                          }
                        >
                          <CornerDownRight className="h-3.5 w-3.5" />
                          {t("comments.reply")}
                        </Button>

                        {isOwnComment(comment) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground  transition-opacity"
                              onClick={() => startEditComment(comment)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive  transition-opacity"
                              onClick={() =>
                                setDeleteTarget({
                                  id: comment._id,
                                  type: "comment",
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}

                        {hasReplies && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto"
                            onClick={() => toggleReplies(comment._id)}
                          >
                            {!collapsedReplies.has(comment._id) ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" />
                                {t("comments.hide")} ({commentReplies.length})
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                {commentReplies.length}{" "}
                                {commentReplies.length === 1
                                  ? t("comments.reply").toLowerCase()
                                  : t("comments.reply").toLowerCase()}
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <div className="mt-3 pl-2 border-l-2 border-primary/20">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              {currentUser?.profile_picture ? (
                                <AvatarImage
                                  src={currentUser.profile_picture}
                                />
                              ) : (
                                <AvatarFallback className="bg-[#0F4C7BFF] rounded-md text-white text-xs">
                                  {initials(currentUser)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 relative">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={replyTexts[comment._id] || ""}
                                  onChange={(e) =>
                                    handleReplyInputChange(
                                      comment._id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={t("comments.writeReply")}
                                  className="flex-1 h-8 text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleReply(comment._id);
                                    }
                                  }}
                                />
                                <input
                                  type="file"
                                  ref={(el) => {
                                    replyFileInputRefs.current[comment._id] =
                                      el;
                                  }}
                                  onChange={(e) =>
                                    handleReplyFileSelect(comment._id, e)
                                  }
                                  className="hidden"
                                  multiple
                                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                                />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                          replyFileInputRefs.current[
                                            comment._id
                                          ]?.click()
                                        }
                                      >
                                        <Paperclip className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t("comments.attachFile")}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Button
                                  size="sm"
                                  className="h-8 px-3"
                                  onClick={() => handleReply(comment._id)}
                                  disabled={
                                    (!replyTexts[comment._id]?.trim() &&
                                      !(replyFiles[comment._id]?.length > 0)) ||
                                    isLoading
                                  }
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <MentionDropdown targetId={comment._id} />

                              {/* Reply File Preview */}
                              {replyFiles[comment._id]?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {replyFiles[comment._id].map(
                                    (filePreview, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-muted/70 rounded-lg border border-border"
                                      >
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded">
                                          {filePreview.type === "image" ? (
                                            <img
                                              src={filePreview.preview}
                                              alt=""
                                              className="w-8 h-8 object-cover rounded"
                                            />
                                          ) : (
                                            getFileIcon(filePreview.file.name)
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium truncate max-w-[120px]">
                                            {filePreview.file.name}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground uppercase">
                                            {filePreview.file.name
                                              .split(".")
                                              .pop()}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                                          onClick={() =>
                                            removeReplyFile(comment._id, index)
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies Loading */}
                      {isReplyLoading && !hasReplies && (
                        <div className="mt-3 ml-2 space-y-2 border-l-2 border-muted pl-4">
                          <div className="py-2">
                            <div className="flex items-start gap-2">
                              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-3 w-20" />
                                  <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies List (one-level only) - shown by default */}
                      {hasReplies && !collapsedReplies.has(comment._id) && (
                        <div className="mt-3 ml-2 space-y-2 border-l-2 border-muted pl-4">
                          {commentReplies.map((reply) => (
                            <div key={reply._id} className="group/reply py-2">
                              <div className="flex items-start gap-2">
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                  {reply?.id_user?.profile_picture ? (
                                    <AvatarImage
                                      src={reply.id_user.profile_picture}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-[#0F4C7BFF] rounded-md text-white text-xs">
                                      {initials(reply.id_user)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {reply.id_user?.Name ? (
                                      <UserActivityHoverCard
                                        userId={reply.id_user?._id}
                                        firstName={reply.id_user?.Name || ""}
                                        lastName={
                                          reply.id_user?.Last_Name || ""
                                        }
                                        email={(reply.id_user as any)?.Email}
                                        profilePicture={
                                          reply.id_user?.profile_picture
                                        }
                                        boardTasks={
                                          reply.id_user?.assignedIssues
                                        }
                                        buildings={reply.id_user?.affectedTo}
                                      />
                                    ) : (
                                      <Skeleton className="h-3 w-20" />
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>

                                  {editingReplyId === reply._id ? (
                                    <div className="mt-1 flex items-center gap-2">
                                      <Input
                                        value={editText}
                                        onChange={(e) =>
                                          setEditText(e.target.value)
                                        }
                                        className="flex-1 h-7 text-xs"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                          handleEditReply(
                                            reply._id,
                                            comment._id,
                                          )
                                        }
                                        disabled={isLoading}
                                      >
                                        <Check className="h-3 w-3 text-green-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={cancelEdit}
                                      >
                                        <X className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="mt-0.5 text-xs text-foreground leading-relaxed">
                                        <CommentContent
                                          content={reply.content}
                                        />
                                      </p>
                                      {/* Reply Attachments */}
                                      <AttachmentDisplay
                                        attachments={reply.attachments}
                                        compact
                                      />
                                    </>
                                  )}

                                  <div className="flex items-center gap-1 mt-2">
                                    <ReactionButton
                                      itemId={reply._id}
                                      reactions={reply.reactions}
                                      isComment={false}
                                      parentCommentId={comment._id}
                                    />

                                    {isOwnComment(reply) && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover/reply:opacity-100"
                                          onClick={() => startEditReply(reply)}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover/reply:opacity-100"
                                          onClick={() =>
                                            setDeleteTarget({
                                              id: reply._id,
                                              type: "reply",
                                              parentId: comment._id,
                                            })
                                          }
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* New Comment Input - At Bottom */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            {currentUser?.profile_picture ? (
              <AvatarImage
                src={currentUser.profile_picture}
                alt={currentUser.Name || "Profile"}
              />
            ) : (
              <AvatarFallback className="bg-[#0F4C7BFF] text-white text-sm">
                {initials(currentUser)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 flex flex-col gap-2">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => handleCommentInputChange(e.target.value)}
                placeholder={t("comments.writeComment")}
                className="resize-none min-h-[80px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              <MentionDropdown targetId="comment" />
            </div>
            <div className="flex justify-between">
              {/* Comment File Preview */}
              {commentFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {commentFiles.map((filePreview, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-muted/70 rounded-lg border border-border"
                    >
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded">
                        {filePreview.type === "image" ? (
                          <img
                            src={filePreview.preview}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          getFileIcon(filePreview.file.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {filePreview.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {filePreview.file.name.split(".").pop()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeCommentFile(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                ref={commentFileInputRef}
                onChange={handleCommentFileSelect}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
              />

              <div className="flex flex-1 justify-end  gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => commentFileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("comments.attachFile")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => {
                          const newValue =
                            newComment +
                            (newComment && !newComment.endsWith(" ")
                              ? " @"
                              : "@");
                          setNewComment(newValue);
                          textareaRef.current?.focus();
                        }}
                      >
                        <AtSign className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("comments.mentionSomeone")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  size="sm"
                  className="h-7 px-3 gap-1.5"
                  onClick={handleSendComment}
                  disabled={
                    (!newComment.trim() && commentFiles.length === 0) ||
                    isLoading
                  }
                >
                  <Send className="h-3.5 w-3.5" />
                  {t("comments.send")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
