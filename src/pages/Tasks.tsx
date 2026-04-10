import OnboardingGuideBanner from "@/components/Onboarding/OnboardingGuideBanner";
import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateRecurringTaskModal } from "@/components/TasksGroup/CreateRecurringTaskModal";
import { RecurringTaskDetailsModal } from "@/components/TasksGroup/RecurringTaskDetailsModal";
import { RecurringTaskHelpModal } from "@/components/TasksGroup/RecurringTaskHelpModal";

import { useRecurringTasksQuery } from "@/hooks/queries";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { formatDate } from "@/utils/dateUtils";
import { getPriorityConfig } from "@/components/BoardGroup/boardUtils";

const Tasks = () => {
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();
  const { selectedBuildingId } = useBuildingSelection();
  const { categories, spaces, assets } = useReferenceData();
  const [activeTab, setActiveTab] = useState("allTasks");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedLinkedTo, setSelectedLinkedTo] = useState("all");

  const { data: recurringTasks = [], isLoading } = useRecurringTasksQuery() as {
    data: any[];
    isLoading: boolean;
  };

  // Filter tasks by selected building (null = all buildings)
  const buildingFilteredTasks = useMemo(() => {
    if (!selectedBuildingId) return recurringTasks;
    return recurringTasks.filter((task: any) => {
      const taskBuildingId =
        typeof task.building_id === "object"
          ? task.building_id?._id
          : task.building_id;
      const taskBuildingFromBuilding =
        typeof task.building === "object" ? task.building?._id : task.building;
      return (
        taskBuildingId === selectedBuildingId ||
        taskBuildingFromBuilding === selectedBuildingId
      );
    });
  }, [recurringTasks, selectedBuildingId]);

  // Get the selected task from the fresh query data
  const selectedTask = selectedTaskId
    ? recurringTasks.find((task: any) => task._id === selectedTaskId)
    : null;

  // Filter categories based on selected building
  const filteredCategories = useMemo(() => {
    if (!selectedBuildingId) return categories;
    return categories.filter((category) =>
      category.buildingIds?.some(
        (building) => building._id === selectedBuildingId,
      ),
    );
  }, [categories, selectedBuildingId]);

  // Filter spaces and assets based on selected building
  const filteredSpacesAndAssets = useMemo(() => {
    const items: { id: string; name: string; type: "Space" | "Asset" }[] = [];

    const filteredSpacesList = selectedBuildingId
      ? spaces.filter((space) => {
          const spaceBuildingId =
            typeof space.building_id === "object"
              ? (space.building_id as any)?._id
              : space.building_id;
          return spaceBuildingId === selectedBuildingId && !space.archived;
        })
      : spaces.filter((space) => !space.archived);

    const filteredAssetsList = selectedBuildingId
      ? assets.filter((asset) => {
          const assetBuildingId =
            typeof asset.building_id === "object"
              ? (asset.building_id as any)?._id
              : asset.building_id;
          return assetBuildingId === selectedBuildingId && !asset.archived;
        })
      : assets.filter((asset) => !asset.archived);

    filteredSpacesList.forEach((space) => {
      items.push({ id: space._id, name: space.name, type: "Space" });
    });

    filteredAssetsList.forEach((asset) => {
      items.push({ id: asset._id, name: asset.name, type: "Asset" });
    });

    return items;
  }, [spaces, assets, selectedBuildingId]);

  const uniqueAssignees = Array.from(
    new Map(
      buildingFilteredTasks
        .filter((task: any) => task.assignee)
        .map((task: any) => [task.assignee._id, task.assignee]),
    ).values(),
  ) as any[];

  const getStatusBadge = (status: string) => {
    const isActive = status === "Active";
    return isActive ? (
      <Badge className="bg-[#D3F9E0] text-[#5EAE79] rounded-md px-4 py-1">
        {t("tasks.active")}
      </Badge>
    ) : (
      <Badge className="bg-[#FDF2F2] text-[#E45F63] px-4 py-1 rounded-md">
        {t("tasks.inactive")}
      </Badge>
    );
  };

  const tabs = [
    { key: "allTasks", label: t("tasks.allTasks") },
    { key: "active", label: t("tasks.active") },
    { key: "inactive", label: t("tasks.inactive") },
  ];

  const getPriorityBadge = (priority: string) => {
    const { classes, icon } = getPriorityConfig(priority);
    const priorityLabel = priority === "Low" ? t("tasks.low") : priority === "Medium" ? t("tasks.medium") : priority === "High" ? t("tasks.high") : priority;
    return (
      <Badge
        className={`flex items-center gap-1 w-max text-xs font-medium px-4 py-1 ${classes}`}
        style={{ borderRadius: 6 }}
      >
        {icon}
        {priorityLabel}
      </Badge>
    );
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task._id);
    setIsDetailsModalOpen(true);
  };

  // Helper: translate day name
  const translateDay = (day: string) => {
    const dayMap: Record<string, string> = {
      monday: t("tasks.monday"), tuesday: t("tasks.tuesday"), wednesday: t("tasks.wednesday"),
      thursday: t("tasks.thursday"), friday: t("tasks.friday"), saturday: t("tasks.saturday"), sunday: t("tasks.sunday"),
    };
    return dayMap[day?.toLowerCase()] || day?.charAt(0).toUpperCase() + day?.slice(1);
  };

  // Helper: translate month name
  const translateMonth = (monthIndex: number) => {
    const monthKeys = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const key = monthKeys[monthIndex - 1];
    return key ? t(`tasks.${key}`) : String(monthIndex);
  };

  // Helper: translate position
  const translatePosition = (pos: string) => {
    const posMap: Record<string, string> = {
      first: t("tasks.first"), second: t("tasks.second"), third: t("tasks.third"),
      fourth: t("tasks.fourth"), last: t("tasks.last"),
    };
    return posMap[pos] || pos;
  };

  // Helper function to format rhythm for display
  const formatRhythm = (recurrence: any) => {
    if (!recurrence) return "-";
    const { type, interval, weekDays, monthDay, monthPosition, monthWeekDay, yearMonth, yearDay, yearPosition, yearWeekDay, yearMonthName } = recurrence;

    if (type === "daily") {
      return interval === 1 ? t("tasks.everyDay") : t("tasks.everyXDays").replace("{interval}", String(interval));
    }
    if (type === "mofr") return t("tasks.everyWeekMoFr");
    if (type === "weekly") {
      const dayLabel = translateDay(weekDays?.[0] || "monday");
      return interval === 1
        ? t("tasks.everyWeekOn").replace("{day}", dayLabel)
        : t("tasks.everyXWeeksOn").replace("{interval}", String(interval)).replace("{day}", dayLabel);
    }
    if (type === "monthly") {
      if (monthPosition && monthWeekDay) {
        return interval === 1
          ? t("tasks.everyMonthOnThe").replace("{position}", translatePosition(monthPosition)).replace("{day}", translateDay(monthWeekDay))
          : t("tasks.everyXMonthsOnThe").replace("{interval}", String(interval)).replace("{position}", translatePosition(monthPosition)).replace("{day}", translateDay(monthWeekDay));
      }
      return interval === 1
        ? t("tasks.everyMonthOnDay").replace("{day}", String(monthDay || 1))
        : t("tasks.everyXMonthsOnDay").replace("{interval}", String(interval)).replace("{day}", String(monthDay || 1));
    }
    if (type === "yearly") {
      if (yearPosition && yearWeekDay) {
        const dayLabel = translateDay(yearWeekDay);
        const monthLabel = translateMonth(yearMonthName || 1);
        return interval === 1
          ? t("tasks.everyYearOnThe").replace("{position}", translatePosition(yearPosition)).replace("{day}", dayLabel).replace("{month}", monthLabel)
          : t("tasks.everyXYearsOnThe").replace("{interval}", String(interval)).replace("{position}", translatePosition(yearPosition)).replace("{day}", dayLabel).replace("{month}", monthLabel);
      }
      const monthLabel = translateMonth(yearMonth || 1);
      return interval === 1
        ? t("tasks.everyYearOn").replace("{month}", monthLabel).replace("{day}", String(yearDay || 1))
        : t("tasks.everyXYearsOn").replace("{interval}", String(interval)).replace("{month}", monthLabel).replace("{day}", String(yearDay || 1));
    }
    return type || "-";
  };

  const filteredTasks = buildingFilteredTasks.filter((task: any) => {
    const isActive = task.is_active === true || task.is_active === "true";
    const isInactive = task.is_active === false || task.is_active === "false" || task.is_active === undefined || task.is_active === null;

    if (activeTab === "active" && !isActive) return false;
    if (activeTab === "inactive" && !isInactive) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = task.name?.toLowerCase().includes(query);
      const buildingMatch = task.building?.label?.toLowerCase().includes(query);
      const assetMatch = task.asset_id?.name?.toLowerCase().includes(query);
      const spaceMatch = task.space_id?.name?.toLowerCase().includes(query);
      if (!nameMatch && !buildingMatch && !assetMatch && !spaceMatch) return false;
    }

    if (selectedCategory !== "all") {
      const categoryId = typeof task.category_id === "object" ? task.category_id?._id : task.category_id;
      if (categoryId !== selectedCategory) return false;
    }
    if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
    if (selectedAssignee !== "all" && task.assignee?._id !== selectedAssignee) return false;
    if (selectedLinkedTo !== "all") {
      const spaceId = typeof task.space_id === "object" ? task.space_id?._id : task.space_id;
      const assetId = typeof task.asset_id === "object" ? task.asset_id?._id : task.asset_id;
      if (spaceId !== selectedLinkedTo && assetId !== selectedLinkedTo) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-background">
        <PageLoadingSkeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 pb-0">
        {/* Header */}
        <div className="flex flex-wrap lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
            {t("tasks.recurring")} {t("tasks.title")}
          </h1>
        </div>
        <div className="flex  xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 text-sm"
            onClick={() => setIsHelpModalOpen(true)}
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span className=" hidden sm:flex">{t("tasks.help")}</span>
          </Button>
          {hasPermission("tasks", "createTasks") && (
            <Button
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("tasks.newTask")}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col space-y-7 ">
        {/* Mobile Dropdown */}
        <div className="block sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full relative">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{tabs.find(t => t.key === activeTab)?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab.key} value={tab.key}>
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Tabs */}
        <div
          className="flex hidden  sm:flex items-center gap-2 lg:gap-6 overflow-x-auto"
          style={{ margin: 0 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary/10 text-[#2E69E8FF] font-medium"
                  : "text-gray-600 font-medium hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("tasks.searchTasks")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger className="w-full sm:w-40 relative hover:bg-accent/50">
              <SelectValue placeholder={t("tasks.assignee")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.allAssignees")}</SelectItem>
              {uniqueAssignees.map((assignee: any) => (
                <SelectItem key={assignee._id} value={assignee._id}>
                  {assignee.Name} {assignee.Last_Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40 relative hover:bg-accent/50">
              <SelectValue placeholder={t("tasks.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.allCategories")}</SelectItem>
              {filteredCategories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full sm:w-40 relative hover:bg-accent/50">
              <SelectValue placeholder={t("tasks.priority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.allPriorities")}</SelectItem>
              <SelectItem value="Low">{t("tasks.low")}</SelectItem>
              <SelectItem value="Medium">{t("tasks.medium")}</SelectItem>
              <SelectItem value="High">{t("tasks.high")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLinkedTo} onValueChange={setSelectedLinkedTo}>
            <SelectTrigger className="w-full sm:w-48 relative hover:bg-accent/50">
              <SelectValue placeholder={t("tasks.linkedTo")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.linkedTo")}</SelectItem>
              {filteredSpacesAndAssets.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      [{item.type}]
                    </span>
                    {item.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
        <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t("tasks.status")}</TableHead>
                <TableHead>{t("tasks.taskTitle")}</TableHead>
                <TableHead>{t("tasks.linkedTo")}</TableHead>
                <TableHead>{t("tasks.category")}</TableHead>
                <TableHead>{t("tasks.priority")}</TableHead>
                <TableHead>{t("tasks.startDate")}</TableHead>
                <TableHead>{t("tasks.rhythm")}</TableHead>
                <TableHead>{t("tasks.assignedToColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-20" /></div></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-9 w-9 rounded-lg" /><Skeleton className="h-4 w-24" /></div></TableCell>
                  </TableRow>
                ))
              ) : filteredTasks && filteredTasks.length > 0 ? (
                filteredTasks.map((task: any) => (
                  <TableRow
                    key={task._id}
                    className=" cursor-pointer hover:bg-accent/50"
                    onClick={() => handleTaskClick(task)}
                  >
                    <TableCell>
                      <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
                        <RefreshCw className="w-5 h-5" color="#4D81ED" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        task.is_active === true || task.is_active === "true"
                          ? "Active"
                          : "Inactive",
                      )}
                    </TableCell>
                    <TableCell className="font-medium first-letter:uppercase">
                      {task.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium first-letter:uppercase">
                          {task.asset_id?.name || task.space_id?.name || "-"}
                        </div>
                        <div className="text-sm text-gray-500 first-letter:uppercase">
                          {task.building?.label || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="first-letter:uppercase">
                      <span className="bg-[#F1F5FEFF] first-letter:uppercase text-[#1759E8FF] text-xs font-medium px-4 py-1 rounded ">
                        {task?.category_id &&
                        typeof task.category_id === "object" &&
                        !Array.isArray(task.category_id)
                          ? task.category_id.label
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      {task.start_date ? formatDate(task.start_date) : "-"}
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={formatRhythm(task.recurrence)}
                    >
                      {formatRhythm(task.recurrence)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9 rounded-lg ">
                          <AvatarImage
                            src={task.assignee?.profile_picture}
                            alt="Profile"
                            className="rounded-lg"
                          />
                          <AvatarFallback className=" bg-[#0F4C7BFF] text-white text-lg rounded-md uppercase">
                            {task.assignee?.Name?.[0]}{task.assignee?.Last_Name?.[0]} 
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm first-letter:uppercase">
                          {task.assignee
                            ? `${task.assignee.Name} ${task.assignee.Last_Name}`
                            : t("tasks.unassigned")}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableCell
                  colSpan={12}
                  className="text-center py-12 text-muted-foreground"
                >
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t("tasks.noRecurringTasksFound")}</p>
                </TableCell>
              )}
            </TableBody>
          </Table>
        </div>
        </div>
      </div>

      {/* Modals */}
      <CreateRecurringTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {selectedTask && (
        <RecurringTaskDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={(open) => {
            setIsDetailsModalOpen(open);
            if (!open) setSelectedTaskId(null);
          }}
          task={selectedTask}
        />
      )}

      <RecurringTaskHelpModal
        open={isHelpModalOpen}
        onOpenChange={setIsHelpModalOpen}
      />
    </div>
  );
};

export default Tasks;
