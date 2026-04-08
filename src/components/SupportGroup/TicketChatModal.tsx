import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  Paperclip,
  X,
  Reply,
  FileText,
  Video,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useTicketsQuery,
  useSendMessageMutation,
  useMarkTicketReadMutation,
  Ticket,
  TicketMessage,
} from "@/hooks/queries";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useCurrentUserQuery } from "@/hooks/queries/useCurrentUserQuery";
import { ImageViewerModal } from "@/components/Common/ImageViewerModal";
import { formatDateTime } from "@/utils/dateUtils";
import { getTicketStatusConfig } from "./ticketUtils";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";

interface TicketChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const TicketChatModal = ({ isOpen, onClose, ticket }: TicketChatModalProps) => {
  const { t } = useLanguage();
  const { isAdmin } = usePermissions();
  const { data: currentUser } = useCurrentUserQuery();
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<TicketMessage | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageInitialIndex, setImageInitialIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [], isLoading } = useTicketsQuery();
  const sendMessageMutation = useSendMessageMutation();
  const markTicketReadMutation = useMarkTicketReadMutation();
  // Get the current ticket from the refreshed tickets list (for real-time updates)
  const currentTicket = tickets.find((t) => t._id === ticket?._id) || ticket;
  const currentUserId = currentUser?._id;

  // Get messages from the ticket object
  const allMessages = currentTicket?.messages || [];

  // Check if message is from current user
  const isMyMessage = (message: TicketMessage) => {
    return message.sender?._id === currentUserId;
  };

  // Get sender name
  const getSenderName = (message: TicketMessage) => {
    if (message.sender) {
      return `${message.sender.Name || ""} ${
        message.sender.Last_Name || ""
      }`.trim();
    }
    return message.isStaff ? "Support Team" : "User";
  };

  // Get sender initials
  const getSenderInitials = (message: TicketMessage) => {
    if (message.sender) {
      const first = message.sender.Name?.charAt(0) || "";
      const last = message.sender.Last_Name?.charAt(0) || "";
      return `${first}${last}`.toUpperCase() || "U";
    }
    return message.isStaff ? "ST" : "U";
  };

  const getThumbnail = (url: string, size: "small" | "tiny" = "small") => {
    if (!url) return url;
    const params =
      size === "tiny" ? "w=32&q=10&blur=10&f=webp" : "w=400&q=75&f=webp";

    if (url.includes("res.cloudinary.com")) {
      const transform =
        size === "tiny"
          ? "c_limit,w_32,q_10,blur=10,f_webp"
          : "c_limit,w_400,q_75,f_auto";
      return url.replace("/upload/", `/upload/${transform}/`);
    }

    return `${url}?${params}`;
  };

  const isImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

  useEffect(() => {
    if (isOpen && currentTicket && isAdmin && !currentTicket.read) {
      markTicketReadMutation.mutate(currentTicket._id);
    }
  }, [isOpen, currentTicket?._id, isAdmin, currentTicket?.read]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket || (!newMessage.trim() && attachments.length === 0)) return;

    const formData = new FormData();
    formData.append("ticketId", currentTicket._id);
    formData.append("content", newMessage);
    attachments.forEach((file) => formData.append("attachments", file));
    if (replyingTo) formData.append("replyTo", replyingTo._id);

    await sendMessageMutation.mutateAsync({
      ticketId: currentTicket._id,
      data: formData,
      isStaff: false, // Pass isStaff based on admin status
    });

    setNewMessage("");
    setAttachments([]);
    setReplyingTo(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (!currentTicket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={currentTicket.customer?.profile_picture}
                alt={currentTicket.customer?.Name || "Profile"}
              />
              <AvatarFallback className="bg-[#0F4C7BFF] text-white uppercase">
                {currentTicket.customer?.Name?.charAt(0) || ""}
                {currentTicket.customer?.Last_Name?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate first-letter:uppercase">
                {currentTicket.subject}
              </div>
              <div className="text-sm text-muted-foreground truncate first-letter:uppercase">
                {isAdmin
                  ? `${currentTicket.customer?.Name || ""} ${
                      currentTicket.customer?.Last_Name || ""
                    }`.trim() || "Customer"
                  : t("support.supportTeam")}
              </div>
            </div>
          </div>
          {(() => {
            const config = getTicketStatusConfig(currentTicket.status);
            return (
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${config.classes}`}
              >
                {config.icon}
                {config.label}
              </span>
            );
          })()}
        </div>

        {/* Chat Messages - Conversation Style */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            </div>
          ) : (
            <>
              {allMessages.map((message, index) => {
                const isStaffMessage = message.isStaff;
                // For user view: staff messages on left, user messages on right
                // isAdmin context: if viewing as admin, admin's own messages go right
                const isOwnMessage = isAdmin ? !isStaffMessage : isStaffMessage;

                // replyTo can be an object (populated) or string (ID)
                const repliedMessage = message.replyTo
                  ? typeof message.replyTo === "object"
                    ? message.replyTo
                    : allMessages.find((m) => m._id === message.replyTo)
                  : null;

                // Check if previous message is from same sender type
                const prevMessage = index > 0 ? allMessages[index - 1] : null;
                const showAvatar =
                  !prevMessage || prevMessage.isStaff !== message.isStaff;

                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex gap-3 group",
                      isOwnMessage ? "flex-row-reverse" : ""
                    )}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={message?.sender?.profile_picture}
                          alt={message?.sender?.profile_picture || "Profile"}
                        />
                        <AvatarFallback className="bg-[#0F4C7BFF] text-white uppercase">
                          {getSenderInitials(message)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10" />
                    )}

                    <div
                      className={cn(
                        "flex flex-col max-w-[70%]",
                        isOwnMessage ? "items-end" : "items-start"
                      )}
                    >
                      {/* Sender name and badge */}
                      {showAvatar && (
                        <div
                          className={cn(
                            "flex items-center gap-2 mb-1",
                            isOwnMessage ? "flex-row-reverse" : ""
                          )}
                        >
                          <span className="font-medium text-sm first-letter:uppercase">
                            {getSenderName(message)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(message.createdAt)}
                          </span>
                          {isStaffMessage && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                            >
                              Support
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="relative">
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 shadow-sm",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-background border border-border rounded-bl-md"
                          )}
                        >
                          {/* Replied message preview */}
                          {repliedMessage && (
                            <div
                              className={cn(
                                "mb-2 p-2 rounded text-xs border-l-2",
                                isOwnMessage
                                  ? "bg-primary-foreground/10 border-primary-foreground/30"
                                  : "bg-muted border-muted-foreground/30"
                              )}
                            >
                              <div className="font-semibold mb-1">
                                {repliedMessage.isStaff
                                  ? "Admin"
                                  : getSenderName(repliedMessage)}
                              </div>
                              <div className="opacity-80 truncate">
                                {repliedMessage.content}
                              </div>
                            </div>
                          )}

                          {message.content && (
                            <p className="text-sm whitespace-pre-wrap break-words">
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
                            isOwnMessage ? "-left-10" : "-right-10"
                          )}
                          onClick={() => setReplyingTo(message)}
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {!showAvatar && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(message.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between p-2 bg-blue-50 rounded border-l-2 border-blue-600">
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-600 mb-1">
                  Replying to{" "}
                  {isMyMessage(replyingTo)
                    ? "yourself"
                    : getSenderName(replyingTo)}
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
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate max-w-[120px]">{file.name}</span>
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
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder={t("support.typeMessage")}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                (!newMessage.trim() && attachments.length === 0) ||
                sendMessageMutation.isPending
              }
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Image Viewer Modal */}
        <ImageViewerModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          images={selectedImages}
          initialIndex={imageInitialIndex}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TicketChatModal;
