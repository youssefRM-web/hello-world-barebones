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
  ChevronDown,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedAssetsTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: number;
    name: string;
    icon: string;
    open_tasks: number;
    tasks_in_progress: number;
    tasks_completed: number;
  };
}

// Mock data for linked assets and tasks
const linkedAssets = [
  { id: 1, name: "Asset 01", supplierName: "Supplier name" },
];

const mockTasks = [
  {
    id: 1,
    title: "The little floor on the second ground is totally wet.",
    priority: "high",
    status: "open",
    assignee: "👤",
    comments: 4,
    date: "12 Feb 2024",
  },
];

const LinkedAssetsTasksModal = ({
  isOpen,
  onClose,
  group,
}: LinkedAssetsTasksModalProps) => {
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState({
    open: true,
    inProgress: false,
    done: false,
  });
  
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden">
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
            <div className="w-6 h-6 bg-customBlue rounded flex items-center justify-center">
              <span className="text-blue-600 text-sm">{group.icon}</span>
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {group.name}
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

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Linked Assets */}
          <div className="w-80 border-r pr-4 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-4">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-foreground">
                {t("assets.linkedAssets")}
              </h3>
              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">ⓘ</span>
              </div>
            </div>

            <div className="space-y-3">
              {linkedAssets.map((asset) => (
                <div key={asset.id} className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-customBlue rounded flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📦</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {asset.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {asset.supplierName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Linked Tasks */}
          <div className="flex-1 pl-4 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-4">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-foreground">
                {t("assets.linkedTasks")}
              </h3>
              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">ⓘ</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Open Tasks */}
              <Collapsible
                open={openSections.open}
                onOpenChange={() => toggleSection("open")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {t("spaces.open")}
                    </span>
                    <div className="w-4 h-4 bg-accent/50 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">ⓘ</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openSections.open ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  {mockTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg bg-accent/50"
                    >
                      <div className="space-y-3">
                        <p className="text-sm text-foreground">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-red-100 text-[#DE3B40FF] rounded">
                            Low
                          </span>
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            Electric
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            E1
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            DE
                          </span>
                          <span className="text-xs px-2 py-1 bg-red-100 text-[#DE3B40FF] rounded">
                            FR KBS WE101
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-foreground">
                                {task.assignee}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-foreground">
                                {task.comments}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-foreground">
                              {task.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* In Progress Tasks */}
              <Collapsible
                open={openSections.inProgress}
                onOpenChange={() => toggleSection("inProgress")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {t("assets.inProgress")}
                    </span>
                    <div className="w-4 h-4  rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">ⓘ</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openSections.inProgress ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="text-sm text-muted-foreground text-center italic py-4">
                    {t("assets.noTasksInProgress")}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Done Tasks */}
              <Collapsible
                open={openSections.done}
                onOpenChange={() => toggleSection("done")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {t("assets.done")}
                    </span>
                    <div className="w-4 h-4  rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">ⓘ</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openSections.done ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="text-sm text-gray-500 text-center py-4">
                    {t("assets.noCompletedTasks")}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedAssetsTasksModal;
