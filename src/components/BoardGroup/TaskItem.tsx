import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Calendar,
  MessageSquare,
  Paperclip,
  Check,
  MapPin,
  Video,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AcceptedTasks } from "@/types";
import { getPriorityConfig } from "./boardUtils";
import { Map, Marker } from "pigeon-maps";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { formatDate } from "@/utils/dateUtils";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TaskItemProps {
  task: AcceptedTasks;
  dragHandlers: any;
  isDragging: boolean;
  onTaskSelect: (task: AcceptedTasks) => void;
  canEdit?: boolean; // Whether the current user can edit/drag this task
}

const isUrgentDueDate = (dueDate: string | Date | undefined): boolean => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= 1; // Due today, tomorrow, or overdue
};

export const TaskItem = ({
  task,
  dragHandlers,
  isDragging,
  onTaskSelect,
  canEdit = true,
}: TaskItemProps) => {
  const priorityConfig = getPriorityConfig(task.priority);
  const { language } = useLanguage();
  const isUrgent = useMemo(
    () => isUrgentDueDate(task.Due_date),
    [task.Due_date],
  );

  const displaySummary = useMemo(() => {
    if (task.transatedNotificationMessage) {
      const prefix =
        language === "de"
          ? "Ablaufendes Dokument"
          : "Document Expiration Reminder";
      return `${prefix}: ${task.issue_summary}`;
    }
    return task.issue_summary;
  }, [task.transatedNotificationMessage, task.issue_summary, language]);

  // Handle drag start - only allow if user can edit
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canEdit) {
      e.preventDefault();
      return;
    }
    dragHandlers.handleDragStart(e, task._id, task.Status);
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

  return (
    <div
      draggable={canEdit}
      onDragStart={handleDragStart}
      onDragEnd={dragHandlers.handleDragEnd}
      className={`bg-background border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 ease-out ${
        isDragging
          ? "shadow-lg rotate-1 scale-105 z-50 opacity-50 bg-background"
          : "hover:shadow-md hover:bg-accent/20"
      } ${
        isUrgent && !task.isRecurring
          ? "border-l-4 border-l-[#F098B4FF] animate-pulse-border"
          : ""
      } ${!canEdit ? "cursor-default" : ""}`}
      style={{
        ...(isDragging && {
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--primary))",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        }),
      }}
      onClick={(e) => {
        if (!isDragging) {
          onTaskSelect(task);
        }
      }}
    >
      {/* Location Chain */}
      {task.locationChain && (
        <div className="text-xs text-muted-foreground mb-2 font-medium first-letter:uppercase capitalize">
          {task.locationChain}
        </div>
      )}

      {/* Issue Summary */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-lg font-medium text-foreground mb-3 line-clamp-2 leading-snug first-letter:uppercase break-words ">
              {displaySummary}
            </p>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="max-w-xs text-left mb-4 leading-tight break-words"
          >
            <p className="text-sm">{displaySummary}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Location info with hoverable map */}
      {task.location_coordinates && (
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 mb-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-blue-700 dark:text-blue-300 truncate">
                  {task.location_name ||
                    `${task.location_coordinates.lat.toFixed(
                      4,
                    )}, ${task.location_coordinates.lng.toFixed(4)}`}
                </span>
              </div>
              {/* Mini map preview */}
              <div className="mt-2 h-16 rounded overflow-hidden border border-blue-200 dark:border-blue-800">
                <Map
                  center={[
                    task.location_coordinates.lat,
                    task.location_coordinates.lng,
                  ]}
                  zoom={14}
                  height={64}
                  attribution={false}
                >
                  <Marker
                    width={24}
                    anchor={[
                      task.location_coordinates.lat,
                      task.location_coordinates.lng,
                    ]}
                    color="hsl(var(--primary))"
                  />
                </Map>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-0" side="right" align="start">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Reported Location</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.location_name ||
                  `${task.location_coordinates.lat.toFixed(
                    6,
                  )}, ${task.location_coordinates.lng.toFixed(6)}`}
              </p>
            </div>
            <div className="h-48 p-2">
              <Map
                center={[
                  task.location_coordinates.lat,
                  task.location_coordinates.lng,
                ]}
                zoom={15}
                height={192}
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
          </HoverCardContent>
        </HoverCard>
      )}

      {/* Images/Attachments Preview */}
      {task?.Attachements && task.Attachements.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          {task.Attachements.slice(0, 4).map((attachment, idx) => (
            <div key={idx} className="w-12 h-12  rounded-lg overflow-hidden">
              {typeof attachment === "string" &&
              (attachment.includes(".jpg") ||
                attachment.includes(".png") ||
                attachment.includes(".webp") ||
                attachment.includes(".jpeg")) ? (
                <img
                  src={attachment}
                  alt="Attachment"
                  className="w-full h-full object-cover"
                />
              ) : (
                <a
                  className="w-full h-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                  title={attachment.split("/").pop()}
                >
                  <div className="flex flex-col items-center justify-center p-2">
                    {getAttachmentIcon(attachment)}
                  </div>
                </a>
              )}
            </div>
          ))}
          {task.Attachements.length > 4 && (
            <div className="w-12 h-12 bg-[#0F4C7BFF] rounded-lg flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                +{task.Attachements.length - 4}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Priority and Category Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge
          className={`flex items-center gap-1 text-xs font-medium px-4 py-1 rounded border ${priorityConfig.classes}`}
        >
          {priorityConfig.icon}
          <span>{task.priority}</span>
        </Badge>

        {task.category_id && (
          <Badge className="text-xs font-medium px-4 py-1 rounded bg-[#F1F5FEFF] text-[#1759E8FF] first-letter:uppercase">
            <span className="first-letter:uppercase">
              {typeof task.category_id === "object" &&
              !Array.isArray(task.category_id) &&
              "label" in task.category_id
                ? task.category_id.label
                : Array.isArray(task.category_id)
                  ? task.category_id.join(", ")
                  : task.category_id}
            </span>
          </Badge>
        )}

        {task?.Status == "DONE" && (
          <div className="bg-[#F1F5FE] w-7 h-7 rounded-md flex items-center justify-center">
            <Check className="w-4 h-4" color="#14923EFF" />
          </div>
        )}
        {task?.isRecurring && (
          <div className="bg-[#F1F5FE] w-7 h-7 rounded-md flex items-center justify-center">
            <RefreshCw className="w-4 h-4" color="#4D81ED" />
          </div>
        )}
      </div>

      {/* Bottom Row - Stats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date */}
          {task?.Due_date && (
            <div
              className={`flex items-center gap-1 text-xs font-medium border rounded px-4 py-1 whitespace-nowrap ${
                isUrgent
                  ? "text-red-500 border-red-300 bg-red-50"
                  : "text-[#565E6CFF] border-[#DEE1E6FF]"
              }`}
            >
              <Calendar
                className={`h-4 w-4 flex-shrink-0 ${
                  isUrgent ? "text-red-500" : ""
                }`}
              />
              <span className="truncate">{formatDate(task.Due_date)}</span>
            </div>
          )}

          {/* Comments */}
          <div className="flex items-center gap-1 text-xs font-medium text-[#565E6CFF] border border-[#DEE1E6FF] rounded px-4 py-1 whitespace-nowrap">
            <MessageSquare className="h-3 w-3 flex-shrink-0" />
            <span>{task.comments?.length || 0}</span>
          </div>

          {/* Checklist */}
          <div className="flex items-center gap-1 text-xs font-medium text-[#565E6CFF] border border-[#DEE1E6FF] rounded px-4 py-1 whitespace-nowrap">
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
                fill="currentColor"
                style={{ fillOpacity: 1 }}
              />
              <path
                d="M8.36915 4.22462C8.76192 3.90427 9.34092 3.92686 9.70704 4.29298C10.0732 4.65909 10.0958 5.2381 9.7754 5.63087L9.70704 5.70704L5.70704 9.70704C5.34093 10.0732 4.76192 10.0958 4.36915 9.7754L4.29298 9.70704L2.29298 7.70704L2.22462 7.63087C1.90427 7.2381 1.92686 6.65909 2.29298 6.29298C2.65909 5.92686 3.2381 5.90427 3.63087 6.22462L3.70704 6.29298L5.00001 7.58595L8.29298 4.29298L8.36915 4.22462Z"
                fill="currentColor"
                style={{ fillOpacity: 1 }}
              />
              <path
                d="M21 5C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H13C12.4477 7 12 6.55228 12 6C12 5.44772 12.4477 5 13 5H21Z"
                fill="currentColor"
                style={{ fillOpacity: 1 }}
              />
              <path
                d="M21 11C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13C12.4477 13 12 12.5523 12 12C12 11.4477 12.4477 11 13 11H21Z"
                fill="currentColor"
                style={{ fillOpacity: 1 }}
              />
              <path
                d="M21 17C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H13C12.4477 19 12 18.5523 12 18C12 17.4477 12.4477 17 13 17H21Z"
                fill="currentColor"
                style={{ fillOpacity: 1 }}
              />
            </svg>
            <span>{task.Checklist?.length || 0}</span>
          </div>

          {/* Attachments */}
          <div className="flex items-center gap-1 text-xs font-medium text-[#565E6CFF] border border-[#DEE1E6FF] rounded px-4 py-1 whitespace-nowrap">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            <span>{task.Attachements?.length || 0}</span>
          </div>
        </div>

        {/* Avatar */}
        {task.Assigned_to && task.Assigned_to.length > 0 && (
          <div className="flex items-center gap-1">
            {task.Assigned_to.slice(0, 2).map((assignee, idx) => (
              <Avatar key={idx} className="w-10 h-10">
                <AvatarImage
                  src={assignee.profile_picture}
                  alt={assignee.Name}
                />
                <AvatarFallback className="bg-[#0F4C7BFF] text-white">
                  {assignee.Name?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                  {assignee.Last_Name?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.Assigned_to.length > 2 && (
              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  +{task.Assigned_to.length - 2}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
