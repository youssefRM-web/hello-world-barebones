import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  X,
  ArrowLeft,
  Eye,
  Download,
  FileText,
  MessageSquare,
  Calendar,
  Printer,
  QrCode,
  Video,
} from "lucide-react";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPriorityConfig } from "@/components/BoardGroup/boardUtils";
import { formatDate } from "@/utils/dateUtils";
import { Button } from "../ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadFile } from "@/utils/downloadUtils";

interface LinkedAssetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  title: string;
  assetName: string;
  items?: any[];
  asset?: any;
}

const LinkedAssetItemModal = ({
  isOpen,
  onClose,
  onBack,
  title,
  assetName,
  items = [],
  asset,
}: LinkedAssetItemModalProps) => {
  const { t } = useLanguage();

  // Group tasks by status - use linkedTasks from the asset object
  const linkedTasks = asset?.linkedTasks || [];
  const taskData = {
    open: linkedTasks.filter((task: any) => task.Status === "TO_DO"),
    inProgress: linkedTasks.filter(
      (task: any) => task.Status === "IN_PROGRESS",
    ),
    done: linkedTasks.filter((task: any) => task.Status === "DONE"),
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
        return <img src={url} className="w-8 h-8 object-contain" alt="Image" />;
      case "txt":
        return <FileText className="w-8 h-8 text-gray-600" />;
      default:
        return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };

  // Attachments data
  const attachmentsData =
    title.includes("document") &&
    asset?.attachments &&
    asset.attachments.length > 0
      ? asset.attachments.map((attachment: any) => ({
          id: attachment._id,
          name: attachment.name,
          url: attachment.url,
          date: attachment.expirationDate
            ? formatDate(attachment.expirationDate)
            : null,
          icon: FileText,
        }))
      : [];

  // Check if we should show empty state
  const showEmptyState =
    (title === t("assets.linkedDocuments") && attachmentsData.length === 0) ||
    (title === "Linked documents" && attachmentsData.length === 0) ||
    (title === "QR-Codes" && true);

  const getInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderTaskItem = (task: any) => {
    const priorityConfig = getPriorityConfig(task.priority);
    const assignedUser = task.Assigned_to[0];
    const userName = assignedUser?.Name || assignedUser?.email || "";
    const LastName = assignedUser?.Last_Name;
    const userAvatar = assignedUser?.profile_picture;
    return (
      <div
        key={task._id}
        className="p-4 border-l-4 border-red-500 bg-background rounded-r mb-3"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-foreground mb-1 first-letter:uppercase">
              {task?.issue_summary}
            </p>
            <p className="text-sm text-foreground mb-3">
              {task?.additional_info}
            </p>
            <div className="flex gap-4 mb-3">
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs w-max ${priorityConfig.classes}`}
              >
                {priorityConfig.icon}
                {t(`board.${task.priority?.toLowerCase()}`) || task.priority}
              </span>
              <span className="bg-[#F1F8FDFF] px-2 py-1 rounded-md text-xs text-[#2E69E8FF] first-letter:uppercase">
                {task.category_id?.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {task?.Due_date && (
                <div className="flex items-center gap-1 text-xs text-foreground border border-gray-200 rounded px-2 py-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{formatDate(task?.Due_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-foreground border border-gray-200 rounded px-2 py-1 whitespace-nowrap">
                <MessageSquare
                  className="h-3 w-3 flex-shrink-0"
                  color="#565E6CFF"
                />
                <span>{task?.comments?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-foreground border border-gray-200 rounded px-2 py-1 whitespace-nowrap">
                <svg
                  className="w-3 h-3"
                  fill="#686583"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
                <span>{task?.Attachements?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-foreground border border-gray-200 rounded px-2 py-1 whitespace-nowrap">
                <svg
                  className="w-4 h-4"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.36915 14.2246C8.76192 13.9043 9.34092 13.9269 9.70704 14.293C10.0732 14.6591 10.0958 15.2381 9.7754 15.6309L9.70704 15.707L5.70704 19.707C5.34093 20.0732 4.76192 20.0958 4.36915 19.7754L4.29298 19.707L2.29298 17.707L2.22462 17.6309C1.90427 17.2381 1.92686 16.6591 2.29298 16.293C2.65909 15.9269 3.2381 15.9043 3.63087 16.2246L3.70704 16.293L5.00001 17.5859L8.29298 14.293L8.36915 14.2246Z"
                    fill="#686583"
                    style={{ fillOpacity: 1 }}
                  />
                  <path
                    d="M8.36915 4.22462C8.76192 3.90427 9.34092 3.92686 9.70704 4.29298C10.0732 4.65909 10.0958 5.2381 9.7754 5.63087L9.70704 5.70704L5.70704 9.70704C5.34093 10.0732 4.76192 10.0958 4.36915 9.7754L4.29298 9.70704L2.29298 7.70704L2.22462 7.63087C1.90427 7.2381 1.92686 6.65909 2.29298 6.29298C2.65909 5.92686 3.2381 5.90427 3.63087 6.22462L3.70704 6.29298L5.00001 7.58595L8.29298 4.29298L8.36915 4.22462Z"
                    fill="#686583"
                    style={{ fillOpacity: 1 }}
                  />
                  <path
                    d="M21 5C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H13C12.4477 7 12 6.55228 12 6C12 5.44772 12.4477 5 13 5H21Z"
                    fill="#686583"
                    style={{ fillOpacity: 1 }}
                  />
                  <path
                    d="M21 11C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13C12.4477 13 12 12.5523 12 12C12 11.4477 12.4477 11 13 11H21Z"
                    fill="#686583"
                    style={{ fillOpacity: 1 }}
                  />
                  <path
                    d="M21 17C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H13C12.4477 19 12 18.5523 12 18C12 17.4477 12.4477 17 13 17H21Z"
                    fill="#686583"
                    style={{ fillOpacity: 1 }}
                  />
                </svg>
                <span>{task?.Checklist?.length || 0}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center ml-4 self-end">
            <Avatar className="w-8 h-8">
              {userAvatar ? (
                <AvatarImage src={userAvatar} alt={userName} />
              ) : null}
              <AvatarFallback className="bg-[#0F4C7BFF] text-white">
                {userName
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
                {LastName?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    );
  };

  const handleDownload = async (url: string, fileName: string) => {
    await downloadFile(url, fileName);
  };

  const renderDocumentItem = (item: any) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-3 border-l-4 border-orange-400 bg-background rounded-r border"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 flex items-center justify-center">
          {getAttachmentIcon(item.url)}
        </div>
        <div>
          <div className="font-medium text-sm first-letter:uppercase">
            {item.name}
          </div>
          {item.date && (
            <div className="text-xs text-gray-500">
              {t("assets.expiryDate")}: {item.date}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded hover:bg-accent/50 transition-colors"
          onClick={() => window.open(item.url, "_blank")}
          title="Preview"
        >
          <Eye className="w-4 h-4 text-gray-600 hover:text-foreground" />
        </button>
        <button
          className="p-2 rounded hover:bg-accent/50 transition-colors"
          onClick={() => handleDownload(item.url, item.name)}
          title="Download"
        >
          <Download className="w-4 h-4 text-gray-600 hover:text-foreground" />
        </button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[1400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-customBlue rounded flex items-center justify-center">
              <Printer className="w-4 h-4 text-blue-600" />
            </div>
            <span className="first-letter:uppercase">{assetName}</span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
          </DialogTitle>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-forground">{title}</span>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {title === t("assets.tasks") || title === "Tasks" ? (
            <Accordion
              type="multiple"
              defaultValue={["closed"]}
              className="space-y-2"
            >
              <AccordionItem
                value="open"
                className="border rounded-lg hover:bg-accent/50"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2 ">
                    <span className="bg-[#F3F4F6FF] rounded-md text-sm py-1 px-8 text-[#323842FF]">
                      {t("assets.toDo")}
                    </span>
                    <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center text-muted-foreground">
                      {taskData.open.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 overflow-auto max-h-[400px]">
                  {taskData.open.length === 0 ? (
                    <p className="text-sm text-foreground text-center text-muted-foreground italic">
                      {t("assets.noOpenTasks")}
                    </p>
                  ) : (
                    taskData.open.map((task: any) => renderTaskItem(task))
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="in-progress"
                className="border rounded-lg hover:bg-accent/50"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F1F8FDFF] rounded-md text-sm py-1 px-8 text-[#2E69E8FF]">
                      {t("assets.inProgress")}
                    </span>
                    <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center text-muted-foreground">
                      {taskData.inProgress.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 overflow-auto max-h-[400px]">
                  {taskData.inProgress.length === 0 ? (
                    <p className="text-sm  text-center text-muted-foreground italic">
                      {t("assets.noTasksInProgress")}
                    </p>
                  ) : (
                    taskData.inProgress.map((task: any) => renderTaskItem(task))
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="done"
                className="border rounded-lg hover:bg-accent/50"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#EEFDF3FF] rounded-md text-sm py-1 px-8 text-[#117B34FF]">
                      {t("assets.done")}
                    </span>
                    <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center text-muted-foreground">
                      {taskData.done.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 overflow-auto max-h-[400px]">
                  {taskData.done.length === 0 ? (
                    <p className="text-sm text-foreground text-center text-muted-foreground italic">
                      {t("assets.noCompletedTasks")}
                    </p>
                  ) : (
                    taskData.done.map((task: any) => renderTaskItem(task))
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : showEmptyState ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
                {title === "QR-Codes" ? (
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                ) : title.includes("document") || title.includes("Dokument") ? (
                  <FileText className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <FileText className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {title === "QR-Codes"
                  ? t("assets.noQrCodesLinked")
                  : title.includes("document") || title.includes("Dokument")
                    ? t("assets.noDocumentsLinked")
                    : t("assets.noItemsFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachmentsData.map(renderDocumentItem)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedAssetItemModal;
