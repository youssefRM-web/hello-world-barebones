import { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  Lock,
  Send,
  Paperclip,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  ArrowUp,
  Equal,
  ArrowDown,
  X,
  Reply,
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSendMessageMutation } from "@/hooks/queries/useTicketsQuery";
import type { AdminTicket } from "@/pages/AdminTickets";
import { formatDate } from "@/utils/dateUtils";
import { ImageViewerModal } from "@/components/Common/ImageViewerModal";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";

interface TicketDetailProps {
  ticket: AdminTicket;
  onResolve?: (ticketId: string) => void;
  isResolving?: boolean;
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "high":
      return <ArrowUp className="h-4 w-4 text-orange-500" />;
    case "medium":
      return <Equal className="h-4 w-4 text-orange-500" />;
    case "low":
      return <ArrowDown className="h-4 w-4 text-blue-500" />;
    default:
      return <Equal className="h-4 w-4 text-muted-foreground" />;
  }
};

// Helper functions for attachments
const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

const getThumbnail = (url: string, size: "small" | "tiny" = "small") => {
  if (!url) return url;
  const params =
    size === "tiny" ? "w=32&q=10&blur=10&f=webp" : "w=400&q=75&f=webp";

  if (url.includes("res.cloudinary.com")) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      const [base, rest] = parts;
      return `${base}/upload/c_limit,w_${size === "tiny" ? 32 : 400},q_auto,f_webp/${rest}`;
    }
  }
  return `${url}?${params}`;
};

const getAttachmentIcon = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <img src={pdfIcon} className="w-8 h-8 object-contain" alt="PDF" />;
    case "doc":
    case "docx":
      return <img src={docxIcon} className="w-8 h-8 object-contain" alt="DOCX" />;
    case "xls":
    case "xlsx":
      return <img src={xlsxIcon} className="w-8 h-8 object-contain" alt="Excel" />;
    case "mp4":
      return <Video className="w-8 h-8 text-primary" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <img src={imageIcon} className="w-8 h-8 object-contain" alt="Image" />;
    case "txt":
      return <FileText className="w-8 h-8 text-gray-600" />;
    default:
      return <FileText className="w-8 h-8 text-gray-400" />;
  }
};

export function TicketDetail({
  ticket,
  onResolve,
  isResolving,
}: TicketDetailProps) {
  const [replyMode, setReplyMode] = useState<"public" | "internal">("public");
  const [replyText, setReplyText] = useState("");
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<typeof ticket.messages[0] | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageInitialIndex, setImageInitialIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessageMutation = useSendMessageMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append("ticketId", ticket.id);
    formData.append("content", replyText);
    attachments.forEach((file) => formData.append("attachments", file));
    if (replyingTo) formData.append("replyTo", replyingTo.id);

    try {
      await sendMessageMutation.mutateAsync({
        ticketId: ticket.id,
        data: formData,
        isStaff: true,
      });
      setReplyText("");
      setAttachments([]);
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-1 h-full">
      {/* Main Content - Conversation View */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                ticket.status === "open"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : ticket.status === "resolved"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-700 border-gray-200",
              )}
            >
              {ticket.status.toUpperCase()}
            </Badge>
            <h1 className="text-lg font-semibold first-letter:uppercase">
              {ticket.subject}
            </h1>
            <span className="text-sm text-muted-foreground">
              #{ticket.ticketNumber}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onResolve?.(ticket.id)}
            disabled={isResolving || ticket.status === "resolved"}
          >
            {isResolving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {ticket.status === "resolved" ? "Resolved" : "Resolve Ticket"}
          </Button>
        </div>

        {/* Messages - Conversation Style */}
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-muted/20">
          {ticket.messages.map((message, index) => {
            const isAdmin = !message.isStaff; // Admin/support messages
            const isUser = message.isStaff; // User messages
            const prevMessage = ticket.messages[index - 1];
            const showAvatar =
              index === 0 || prevMessage?.isStaff !== message.isStaff;
            
            // Find replied message if exists
            const repliedMessage = message.replyTo
              ? typeof message.replyTo === "object"
                ? message.replyTo
                : ticket.messages.find((m) => m.id === message.replyTo)
              : null;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 group",
                  isUser ? "flex-row-reverse" : "", // User messages on right, admin on left
                )}
              >
                {showAvatar && (
                  <Avatar className="h-10 w-10">
                    {ticket.customer.avatar ? (
                      <AvatarImage src={ticket.customer.avatar} />
                    ) : (
                      <AvatarFallback className="bg-[#0F4C7BFF] text-white uppercase">
                        {message.senderName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}

                {!showAvatar && <div className="w-8" />}

                <div
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    isUser ? "items-end" : "items-start",
                  )}
                >
                  {showAvatar && (
                    <div
                      className={cn(
                        "flex items-center gap-2 mb-1",
                        isUser ? "flex-row-reverse" : "",
                      )}
                    >
                      <span className="font-medium text-sm first-letter:uppercase">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(message.timestamp)}
                      </span>
                      {isAdmin && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-background border border-border rounded-bl-md",
                      )}
                    >
                      {/* Replied message preview */}
                      {repliedMessage && (
                        <div
                          className={cn(
                            "mb-2 p-2 rounded text-xs border-l-2",
                            isUser
                              ? "bg-primary-foreground/10 border-primary-foreground/30"
                              : "bg-muted border-muted-foreground/30"
                          )}
                        >
                          <div className="font-semibold mb-1">
                            {repliedMessage.senderName}
                          </div>
                          <div className="opacity-80 truncate">
                            {repliedMessage.content}
                          </div>
                        </div>
                      )}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div
                          className={cn(
                            "grid gap-2 mt-2",
                            message.attachments.length === 1 && "grid-cols-1 max-w-[280px]",
                            message.attachments.length === 2 && "grid-cols-2 max-w-[320px]",
                            message.attachments.length === 3 && "grid-cols-3 max-w-[400px]",
                            message.attachments.length >= 4 && "grid-cols-2 max-w-[320px]"
                          )}
                        >
                          {message.attachments.map((att, idx) => {
                            const isImage = isImageUrl(att);
                            const imageCount = message.attachments?.filter(isImageUrl).length || 0;

                            if (!isImage) {
                              return (
                                <a
                                  key={idx}
                                  href={att}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center bg-muted rounded-lg p-3 text-xs hover:bg-muted/80 transition-colors"
                                >
                                  {getAttachmentIcon(att)}
                                </a>
                              );
                            }

                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "relative rounded-lg overflow-hidden cursor-pointer group/img bg-muted",
                                  imageCount === 1 && "aspect-[4/3] max-h-[200px]",
                                  imageCount === 2 && "aspect-square",
                                  imageCount === 3 && "aspect-square",
                                  imageCount >= 4 && "aspect-square"
                                )}
                                onClick={() => {
                                  const images = message.attachments?.filter(isImageUrl) || [];
                                  setSelectedImages(images);
                                  setImageInitialIndex(images.indexOf(att));
                                  setImageModalOpen(true);
                                }}
                              >
                                <img
                                  src={getThumbnail(att, "small")}
                                  alt={`Attachment ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                  <span className="text-white opacity-0 group-hover/img:opacity-100 text-xs font-medium">View</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* Reply button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "absolute top-1 opacity-0 group-hover:opacity-100 h-7 px-2 transition-opacity",
                        isUser ? "-left-10" : "-right-10"
                      )}
                      onClick={() => setReplyingTo(message)}
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {!showAvatar && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(message.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        <div className="p-4 border-t border-border bg-background">
          {/* Replying to preview */}
          {replyingTo && (
            <div className="mb-3 flex items-center justify-between p-2 bg-blue-50 rounded border-l-2 border-blue-600">
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-600 mb-1">
                  Replying to {replyingTo.senderName}
                </div>
                <div className="text-sm text-gray-700 truncate">
                  {replyingTo.content}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <Button
              variant={replyMode === "public" ? "default" : "outline"}
              size="sm"
              onClick={() => setReplyMode("public")}
            >
              Public Reply
            </Button>
            <Button
              variant={replyMode === "internal" ? "default" : "outline"}
              size="sm"
              onClick={() => setReplyMode("internal")}
              className="gap-1"
            >
              <Lock className="h-3 w-3" />
              Internal Note
            </Button>
          </div>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] pr-24 resize-none bg-muted/30"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={handleSendMessage}
                disabled={(!replyText.trim() && attachments.length === 0) || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    Send
                    <Send className="h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Collapsible */}
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            "border-l border-border bg-background transition-all duration-300 flex flex-col",
            isDetailsCollapsed ? "w-14" : "w-[300px]",
          )}
        >
          {/* Collapse Toggle Button */}
          <div className="p-2 border-b border-border flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
              className="h-8 w-8"
            >
              {isDetailsCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isDetailsCollapsed ? (
            /* Collapsed View - Icons Only */
            <div className="flex flex-col items-center gap-4 p-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{ticket.customer.name}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <PriorityIcon priority={ticket.priority} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Priority: {ticket.priority}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        ticket.status === "open"
                          ? "bg-green-500"
                          : "bg-blue-500",
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Status: {ticket.status}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Joined: {formatDate(ticket?.customer?.joined)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* Expanded View - Full Details */
            <div className="p-4 space-y-6 overflow-auto flex-1">
              {/* Ticket Details */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Ticket Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Assignee
                    </label>
                    <Select defaultValue="sarah">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                SJ
                              </AvatarFallback>
                            </Avatar>
                            Sarah Jenkins
                          </div>
                        </SelectItem>
                        <SelectItem value="bob">Bob Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Priority
                      </label>
                      <Select defaultValue={ticket.priority}>
                        <SelectTrigger className="mt-1">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <PriorityIcon priority={ticket.priority} />
                              <span className="first-letter:uppercase">
                                {ticket.priority}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <ArrowUp className="h-4 w-4 text-orange-500" />
                              <span>High</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <Equal className="h-4 w-4 text-orange-500" />
                              <span>Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <ArrowDown className="h-4 w-4 text-blue-500" />
                              <span>Low</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Status
                      </label>
                      <Select defaultValue={ticket.status}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Open
                            </div>
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  User Profile
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    {ticket.customer.avatar ? (
                      <AvatarImage src={ticket.customer.avatar} />
                    ) : (
                      <AvatarFallback className="bg-pink-100 text-pink-700 uppercase">
                        {ticket.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium first-letter:uppercase">
                      {ticket.customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.customer.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs">🏢</span>
                    </div>
                    <div>
                      <p className="font-medium">{ticket.customer.company}</p>
                      <p className="text-xs text-muted-foreground">
                        Plan:{" "}
                        {ticket?.customer?.plan?.name
                          ? ticket?.customer?.plan?.name
                          : "No Plan"}
                      </p>
                    </div>
                    {ticket?.customer?.plan?.isActive ? (
                      <Badge className="ml-auto bg-green-100 text-green-700 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="ml-auto bg-red-100 text-red-700 hover:bg-red-100">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Total Tickets</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">
                      Customer Since
                    </span>
                    <span className="font-medium">
                      {formatDate(ticket?.customer?.joined)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        images={selectedImages}
        initialIndex={imageInitialIndex}
        open={imageModalOpen}
        onOpenChange={() => setImageModalOpen(false)}
      />
    </div>
  );
}
