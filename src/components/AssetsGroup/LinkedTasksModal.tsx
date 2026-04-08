import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  ChevronsDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AcceptedTasks } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDate } from "@/utils/dateUtils";
import { getPriorityConfig } from "../BoardGroup/boardUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupIcon: string;
  tasks: AcceptedTasks[];
}

const LinkedTasksModal = ({
  isOpen,
  onClose,
  groupName,
  groupIcon,
  tasks,
}: LinkedTasksModalProps) => {
  const { t } = useLanguage();
  const openTasks = tasks.filter((task) => task.Status === "TO_DO");
  const inProgressTasks = tasks.filter((task) => task.Status === "IN_PROGRESS");
  const doneTasks = tasks.filter((task) => task.Status === "DONE");

   const isOverdue = (task: any) => {
    if (!task?.Due_date) return false;
    return new Date(task.Due_date) < new Date();
  };
  const CountBadge = ({ count }: { count: number }) => (
    <span className="ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border">
      {count}
    </span>
  );

  const renderTaskItem = (task: any) => {
    const priorityConfig = getPriorityConfig(task.priority);
    const assignedUser = task.Assigned_to[0];
    const userName = assignedUser?.Name || assignedUser?.email || "";
    const LastName = assignedUser?.Last_Name;
    const userAvatar = assignedUser?.profile_picture;
    const overdue = isOverdue(task);
    return (
      <div
        key={task._id}
        className={`p-4 border-l-4 ${overdue ? 'border-red-500' : 'border-transparent'} bg-background rounded-r mb-3`}
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
                {task.priority}
              </span>
              {task.category_id?.label && (
                <span className="bg-[#F1F8FDFF] px-2 py-1 rounded-md text-xs text-[#2E69E8FF]">
                  {task.category_id?.label}
                </span>
              )}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="relative border-b pb-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="#4D81ED"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path d="M10 3H4C3.447 3 3 3.447 3 4v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C11 3.447 10.553 3 10 3zM9 9H5V5h4V9zM20 3h-6c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C21 3.447 20.553 3 20 3zM19 9h-4V5h4V9zM10 13H4c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1v-6C11 13.447 10.553 13 10 13zM9 19H5v-4h4V19zM17 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4S19.206 13 17 13zM17 19c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2S18.103 19 17 19z" />
              </svg>
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {groupName}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 italic text-muted-foreground text-sm">
              {t("assets.noTasksForGroup")}
            </div>
          ) : (
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
                     <CountBadge count={openTasks.length} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 overflow-auto max-h-[400px]">
                  {openTasks.length === 0 ? (
                    <p className="text-sm text-foreground text-center text-muted-foreground italic">
                      {t("assets.noOpenTasks")}
                    </p>
                  ) : (
                    openTasks.map((task) => renderTaskItem(task))
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
                    <CountBadge count={inProgressTasks.length} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 overflow-auto max-h-[400px]">
                  {inProgressTasks.length === 0 ? (
                    <p className="text-sm text-foreground text-center text-muted-foreground italic">
                      {t("assets.noTasksInProgress")}
                    </p>
                  ) : (
                    inProgressTasks.map((task) => renderTaskItem(task))
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
                    <CountBadge count={doneTasks.length} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 overflow-auto max-h-[400px]">
                  {doneTasks.length === 0 ? (
                    <p className="text-sm text-foreground text-center text-muted-foreground italic">
                      {t("assets.noCompletedTasks")}
                    </p>
                  ) : (
                    doneTasks.map((task) => renderTaskItem(task))
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedTasksModal;
