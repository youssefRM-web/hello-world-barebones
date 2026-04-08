import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Check,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "./CreateTaskModal";
import { useToast } from "@/hooks/use-toast";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import {
  useTasksQuery,
  useUpdateTaskMutation,
  useCurrentUserQuery,
  useOrganizationQuery,
} from "@/hooks/queries";
import { useExternalIssuesQuery } from "@/hooks/queries/useExternalIssuesQuery";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TaskItem } from "./TaskItem";
import { TaskDetailModal } from "./TaskDetailModal";
import { statusColumns } from "./boardUtils";
import { SortOption } from "@/hooks/useBoardFilters";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { usePermissions } from "@/contexts/PermissionsContext";
import { AcceptedTasks, Issue } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Link } from "react-router-dom";
import { useAcceptedIssueSocket } from "@/hooks/useAcceptedIssueSocket";

interface BoardProps {
  tasks?: any[];
  selectedBuilding?: any;
}

// Tab type to match backend archived parameter
type TabType =
  | "All Tasks"
  | "My Tasks"
  | "High Prio"
  | "Archived Tasks"
  | "External Tasks";

export const Board = () => {
  const navigate = useNavigate();
  const { taskId: urlTaskId } = useParams<{ taskId?: string }>();

  const [activeTab, setActiveTab] = useState<TabType>("All Tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<string>(null);
  const [sortBy, setSortBy] = useState<SortOption>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [selectedExternalIssue, setSelectedExternalIssue] =
    useState<Issue | null>(null);


  // API pagination - fetch 100 at once
  const [currentPage, setCurrentPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const pageLimit = 100;

  const { toast } = useToast();
  const { selectedBuildingId } = useBuildingSelection();
  const { buildings, categories } = useReferenceData();

  // Real-time accepted issue updates
  useAcceptedIssueSocket();
  const { hasPermission, isAdmin } = usePermissions();
  const { data: currentUser } = useCurrentUserQuery();
  const { organization } = useOrganizationQuery();
  const { t } = useLanguage();

  // Check if public reporting is enabled
  const publicReportingEnabled = organization?.publicReportingEnabled || false;

  // Determine if current tab is archived
  const isArchivedTab = activeTab === "Archived Tasks";
  const isExternalTabActive = activeTab === "External Tasks";

  // Fetch external issues (location-based reports) for external issue detail modal
  const { data: externalIssues = [], isLoading: isLoadingExternalIssues } =
    useExternalIssuesQuery();

  // Fetch tasks with pagination - non-archived tasks - always enabled for real-time counts
  const { data: tasksResponse, isLoading: isLoadingTasks } = useTasksQuery({
    page: currentPage,
    limit: pageLimit,
    archived: false,
    enabled: true,
  });

  // Fetch archived tasks separately - always enabled to get correct count for tabs
  const { data: archivedTasksResponse, isLoading: isLoadingArchived } =
    useTasksQuery({
      page: archivedPage,
      limit: pageLimit,
      archived: true,
      enabled: true,
    });

  // Extract data based on current tab
  const currentResponse = isArchivedTab ? archivedTasksResponse : tasksResponse;
  const allTasks = currentResponse?.data || [];
  const pagination = currentResponse?.pagination;
  const isLoading = isArchivedTab ? isLoadingArchived : isLoadingTasks;

  // Reset page when tab changes
  useEffect(() => {
    if (isArchivedTab) {
      // Use archived page
    } else {
      setCurrentPage(1);
    }
  }, [activeTab]);

  // Check if user can edit/drag a specific task
  const canEditTask = useCallback(
    (task: AcceptedTasks): boolean => {
      // Admin and Manager can edit all tasks
      if (isAdmin) return true;

      // Regular members can only edit tasks assigned to them
      if (!currentUser?._id || !task.Assigned_to) return false;

      return task.Assigned_to.some(
        (assignee) => assignee._id === currentUser._id,
      );
    },
    [isAdmin, currentUser?._id],
  );

  const updateTaskMutation = useUpdateTaskMutation();

  // Filter external tasks from all tasks (these are accepted external reports with Status)
  const externalTasks = useMemo(() => {
    if (isArchivedTab) return [];
    return allTasks.filter(
      (task) => task.isExternalTask === true && !task.archived,
    );
  }, [allTasks, isArchivedTab]);

  const externalTaskCount = externalTasks.length;

  // Get external tasks by status
  const getExternalTasksByStatus = useCallback(
    (status: string) => {
      return externalTasks.filter((task) => task.Status === status);
    },
    [externalTasks],
  );

  // Get categories based on selected building
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!selectedBuildingId || selectedBuildingId === "all") {
      // All buildings: show all categories
      return categories;
    }
    // Filter categories by building - categories have buildingIds array
    return categories.filter((cat: any) =>
      cat.buildingIds?.some(
        (building: any) => building._id === selectedBuildingId,
      ),
    );
  }, [categories, selectedBuildingId]);

  // Filter tasks based on current tab and filters (client-side filtering on paginated data)
  // Helper to extract building ID string from a task
  const getTaskBuildingId = useCallback((task: AcceptedTasks): string | null => {
    const buildingId = task.Building_id as string | { _id: string } | null;
    if (!buildingId) return null;
    if (typeof buildingId === "object" && "_id" in buildingId) return buildingId._id;
    if (typeof buildingId === "string") return buildingId;
    return null;
  }, []);

  // Get building IDs where user has board access permission
  const { getPermittedBuildingIds } = usePermissions();
  const boardPermittedBuildingIds = useMemo(
    () => getPermittedBuildingIds("board"),
    [getPermittedBuildingIds]
  );

  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];

    let filtered = [...allTasks];

    // CRITICAL: Only show tasks from buildings where user has BOARD permission
    if (!isAdmin) {
      if (boardPermittedBuildingIds.length === 0) {
        filtered = [];
      } else {
        filtered = filtered.filter((task) => {
          const taskBuildingId = getTaskBuildingId(task);
          if (!taskBuildingId) return false;
          return boardPermittedBuildingIds.includes(taskBuildingId);
        });
      }
    }

    // Building filter
    if (selectedBuildingId && selectedBuildingId !== "all") {
      filtered = filtered.filter((task) => {
        const taskBuildingId = getTaskBuildingId(task);
        return taskBuildingId === selectedBuildingId;
      });
    }

    // Tab-specific filtering (My Tasks, High Prio)
    if (activeTab === "My Tasks") {
      filtered = filtered.filter((task) =>
        task.Assigned_to?.some((a) => a._id === currentUser._id),
      );
    } else if (activeTab === "High Prio") {
      filtered = filtered.filter((t) => t.priority === "High");
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((task) => {
        const cat = task.category_id;
        if (
          typeof cat === "object" &&
          cat &&
          !Array.isArray(cat) &&
          (cat as { _id: string })._id
        ) {
          return (cat as { _id: string })._id === categoryFilter;
        }
        return false;
      });
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((task) => {
        const title = task.issue_summary?.toLowerCase() || "";
        const description = task.additional_info?.toLowerCase() || "";
        return title.includes(query) || description.includes(query);
      });
    }

    return filtered;
  }, [
    allTasks,
    currentUser,
    selectedBuildingId,
    activeTab,
    categoryFilter,
    priorityFilter,
    searchQuery,
    isAdmin,
    boardPermittedBuildingIds,
  ]);

  // Sort all filtered tasks
  // Default (null): oldest first (new tasks at bottom)
  // Recently: newest first
  const sortedFilteredTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "Recently") {
        // Newest first
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      } else if (sortBy === "Due Date") {
        const dateA = a.Due_date ? new Date(a.Due_date).getTime() : Infinity;
        const dateB = b.Due_date ? new Date(b.Due_date).getTime() : Infinity;
        return dateA - dateB;
      }
      // Default: oldest first (new tasks at bottom)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });
  }, [filteredTasks, sortBy]);

  // Get task count by status
  const getTaskCountByStatus = useCallback(
    (status: string) => {
      return sortedFilteredTasks.filter((task) => task.Status === status).length;
    },
    [sortedFilteredTasks],
  );

  // Get tasks by status for display
  const getTasksByStatus = useCallback(
    (status: string) => {
      return sortedFilteredTasks.filter((task) => task.Status === status);
    },
    [sortedFilteredTasks],
  );
  // Tab counts - compute from building-filtered tasks
  const tabs = useMemo(() => {
    const allTasksData = tasksResponse?.data || [];
    const archivedTasksData = archivedTasksResponse?.data || [];

    // Filter by board permissions (not just building access)
    let buildingFiltered = allTasksData;
    let archivedFiltered = archivedTasksData;

    if (!isAdmin) {
      if (boardPermittedBuildingIds.length === 0) {
        buildingFiltered = [];
        archivedFiltered = [];
      } else {
        buildingFiltered = allTasksData.filter((task) => {
          const taskBuildingId = getTaskBuildingId(task);
          return taskBuildingId ? boardPermittedBuildingIds.includes(taskBuildingId) : false;
        });
        archivedFiltered = archivedTasksData.filter((task) => {
          const taskBuildingId = getTaskBuildingId(task);
          return taskBuildingId ? boardPermittedBuildingIds.includes(taskBuildingId) : false;
        });
      }
    }

    // Then filter by selected building
    if (selectedBuildingId && selectedBuildingId !== "all") {
      buildingFiltered = buildingFiltered.filter((task) => getTaskBuildingId(task) === selectedBuildingId);
      archivedFiltered = archivedFiltered.filter((task) => getTaskBuildingId(task) === selectedBuildingId);
    }

    const nonArchivedTasks = buildingFiltered.filter((t) => !t.archived);
    const archivedTasks = archivedFiltered.filter((t) => t.archived);

    const myTasksCount = nonArchivedTasks.filter((task) =>
      task.Assigned_to?.some((assignee) => assignee._id === currentUser?._id),
    ).length;

    const highPrioCount = nonArchivedTasks.filter(
      (t) => t.priority === "High",
    ).length;

    return [
      { name: "All Tasks" as TabType, count: nonArchivedTasks.length, hasInfo: false },
      { name: "My Tasks" as TabType, count: myTasksCount, hasInfo: true },
      { name: "High Prio" as TabType, count: highPrioCount, hasInfo: true },
      {
        name: "Archived Tasks" as TabType,
        count: archivedTasks.length,
        hasInfo: false,
      },
    ];
  }, [tasksResponse, archivedTasksResponse, currentUser?._id, selectedBuildingId, isAdmin, boardPermittedBuildingIds]);

  // Add External Tasks tab if public reporting is enabled
  // const allTabs = publicReportingEnabled
  //   ? [
  //       ...tabs,
  //       {
  //         name: "External Tasks" as TabType,
  //         count: externalTaskCount,
  //         hasInfo: false,
  //       },
  //     ]
  //   : tabs;
  const allTabs = tabs;

  // Handle task move with React Query optimistic updates
  const handleTaskMove = (
    taskId: string,
    newStatus: string,
    options?: { optimistic?: boolean },
  ) => {
    // Fire and forget - mutation handles optimistic update via onMutate
    updateTaskMutation.mutate({
      taskId,
      data: { Status: newStatus as any },
    });
  };

  // Initialize drag-and-drop handlers
  const dragHandlers = useDragAndDrop(handleTaskMove);

  const handleTaskClick = (task: any) => {
    navigate(`/dashboard/board/${task._id}`);
  };

  const handleCloseTaskModal = () => {
    navigate("/dashboard/board");
  };

  const handleExternalIssueClick = (issue: Issue) => {
    setSelectedExternalIssue(issue);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.hasNext) {
      if (isArchivedTab) {
        setArchivedPage((prev) => prev + 1);
      } else {
        setCurrentPage((prev) => prev + 1);
      }
    }
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrev) {
      if (isArchivedTab) {
        setArchivedPage((prev) => prev - 1);
      } else {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (isArchivedTab) {
      setArchivedPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-background">
        <PageLoadingSkeleton variant="board" />
      </div>
    );
  }

  const CountBadge = ({
    count,
    isActive,
  }: {
    count: number;
    isActive: boolean;
  }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center ${
        isActive
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-muted text-muted-foreground border border-border"
      }`}
    >
      {count}
    </span>
  );

 

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
      {/* Fixed Header */}
      <div className="border-border p-4 lg:p-6 flex-shrink-0">
        <div className="flex  lg:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
            {t("board.title")}
          </h1>
          {hasPermission("board", "createTickets") && !isExternalTabActive && (
            <Button
              size="lg"
              onClick={() => {
                setDefaultStatus(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("board.createButton")}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          {/* Mobile Dropdown */}
          <div className="block sm:hidden">
            <Select
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as TabType)}
            >
              <SelectTrigger className="w-full relative">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{t(`board.${activeTab === "All Tasks" ? "allTasks" : activeTab === "My Tasks" ? "myTasks" : activeTab === "High Prio" ? "highPrio" : activeTab === "Archived Tasks" ? "archivedTasks" : "externalTasks"}`)}</span>
                    {allTabs.find((t) => t.name === activeTab)?.count !==
                      null && (
                      <Badge
                        variant="secondary"
                        className="text-xs flex justify-center items-center rounded-full w-4 h-5  text-[#1759E8FF]"
                      >
                        {allTabs.find((t) => t.name === activeTab)?.count}
                      </Badge>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {allTabs.map((tab) => (
                  <SelectItem key={tab.name} value={tab.name}>
                    <div className="flex items-center gap-2">
                       {tab.name === "External Tasks" && (
                         <MapPin className="w-3.5 h-3.5" />
                       )}
                       <span>{t(`board.${tab.name === "All Tasks" ? "allTasks" : tab.name === "My Tasks" ? "myTasks" : tab.name === "High Prio" ? "highPrio" : tab.name === "Archived Tasks" ? "archivedTasks" : "externalTasks"}`)}</span>
                      {tab.count !== null && (
                        <Badge
                          variant="secondary"
                          className="text-xs rounded-full w-4 h-5 flex items-center justify-center"
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Desktop Tabs */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-6 overflow-x-auto">
            {allTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.name
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {t(`board.${tab.name === "All Tasks" ? "allTasks" : tab.name === "My Tasks" ? "myTasks" : tab.name === "High Prio" ? "highPrio" : tab.name === "Archived Tasks" ? "archivedTasks" : "externalTasks"}`)}
                <CountBadge
                  count={tab.count}
                  isActive={activeTab === tab.name}
                />
              </button>
            ))}

            {/* Show disabled External Tasks tab with message if public reporting is not enabled */}
            {/* {!publicReportingEnabled && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground opacity-60 cursor-not-allowed">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t("board.externalTasks")}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {t("board.disabled")}
                </span>
              </div>
            )} */}
          </div>
        </div>
        {/* Search & Filters */}
        {!isExternalTabActive && (
          <div className="space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("board.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full h-10"
                />
              </div>

              {/* Filters - Stack on mobile, row on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto sm:flex sm:gap-5">
                {/* Category Filter */}
                <Select
                  value={categoryFilter || "all"}
                  onValueChange={(value) =>
                    setCategoryFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                    <SelectValue placeholder={t("board.category")} />
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    <SelectItem value="all">
                      {t("board.allCategories")}
                    </SelectItem>
                    {filteredCategories.map((category: any) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                  value={priorityFilter || "all"}
                  onValueChange={(value) =>
                    setPriorityFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                    <SelectValue placeholder={t("board.priority")} />
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    <SelectItem value="all">
                      {t("board.allPriorities")}
                    </SelectItem>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <span>{t("board.low")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <span>{t("board.medium")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <span>{t("board.high")}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select
                  value={sortBy || "default"}
                  onValueChange={(value) =>
                    setSortBy(
                      value === "default" ? null : (value as SortOption),
                    )
                  }
                >
                  <SelectTrigger className="w-full sm:w-36 h-10 shadow-sm border bg-background hover:bg-accent/50 transition-colors">
                    <SelectValue placeholder={t("board.sortBy")} />
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    <SelectItem value="default">
                      {t("board.default")}
                    </SelectItem>
                    <SelectItem value="Recently">
                      {t("board.recently")}
                    </SelectItem>
                    <SelectItem value="Due Date">
                      {t("board.dueDate")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Board Content - Scrollable */}
      {!isExternalTabActive ? (
        <div className="pr-3 pl-3 pb-3 sm:pr-4 sm:pl-4 sm:pb-4 lg:pr-6 lg:pl-6 lg:pb-6 pt-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6 md:space-y-0 overflow-x-hidden md:items-start">
            {statusColumns.map((column) => (
              <div
                key={column.id}
                className="bg-accent/50 rounded-lg transition-colors flex flex-col max-h-[calc(100vh-280px)]"
              >
                {/* Fixed Column Header */}
                <div className="p-3 sm:p-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between gap-2">
                       <h3 className="font-semibold text-foreground text-sm sm:text-base">
                         {column.id === "TO_DO" ? t("board.toDo") : column.id === "IN_PROGRESS" ? t("board.inProgress") : t("board.done")}
                       </h3>
                      {column.title !== "DONE" && (
                        <Badge
                          variant="secondary"
                          className="inline-flex items-center rounded border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-black text-xs bg-[#DEE1E6FF]"
                        >
                          {getTaskCountByStatus(column.id)}
                        </Badge>
                      )}
                      {column.title == "DONE" && <Check color="#14923EFF" />}
                    </div>
                  </div>
                </div>

                {/* Scrollable Tasks Area */}
                <div
                  onDragOver={dragHandlers.handleDragOver}
                  onDragEnter={(e) =>
                    dragHandlers.handleDragEnter(e, column.id)
                  }
                  onDragLeave={dragHandlers.handleDragLeave}
                  onDrop={(e) => dragHandlers.handleDrop(e, column.id)}
                  className={`px-3 sm:px-4 space-y-3 transition-all duration-200 flex-1 overflow-y-auto ${
                    dragHandlers.dragState.isDraggingOver === column.id
                      ? "border-2 border-dashed border-primary/30 rounded-lg"
                      : ""
                  }`}
                >
                  {getTaskCountByStatus(column.id) === 0 ? (
                    <div className="flex items-center flex-col justify-center gap-3 py-8">
                       <p className="text-sm text-muted-foreground">
                         {t("board.noTasksCreated")}
                       </p>
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.46 4.78L2.53999 4.78L2.53999 9.94L21.46 9.94V4.78Z"
                          stroke="gray"
                          strokeWidth="2.064"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M2.53999 15.07L21.46 15.07"
                          stroke="gray"
                          strokeWidth="2.064"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M2.53999 20.21L21.46 20.21"
                          stroke="gray"
                          strokeWidth="2.064"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                      </svg>
                    </div>
                  ) : (
                    getTasksByStatus(column.id).map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        onTaskSelect={handleTaskClick}
                        dragHandlers={dragHandlers}
                        isDragging={
                          dragHandlers.dragState.draggedTaskId === task._id
                        }
                        canEdit={canEditTask(task)}
                      />
                    ))
                  )}
                </div>

                {/* Fixed Create Button */}
                {hasPermission("board", "createTickets") && (
                  <div className="p-3 sm:p-4 flex-shrink-0">
                    <Button
                      variant="ghost"
                      className="w-full text-[#2E69E8FF] hover:bg-blue-600 hover:text-white bg-primary/10 text-sm h-10"
                      onClick={() => {
                        setDefaultStatus(column.id);
                        setIsCreateModalOpen(true);
                      }}
                    >
                      + {t("board.create")}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* External Tasks Content - Same column layout as regular tasks - Scrollable */
        <div className="pr-3 pl-3 pb-3 sm:pr-4 sm:pl-4 sm:pb-4 lg:pr-6 lg:pl-6 lg:pb-6 pt-0 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Message if public reporting not enabled */}
          {!publicReportingEnabled ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
               <h3 className="text-lg font-semibold mb-2">
                 {t("board.externalTasksDisabled")}
               </h3>
               <p className="text-muted-foreground max-w-md mb-4">
                 {t("board.externalTasksDisabledDesc")}
               </p>
              <Link to="/dashboard/organisation?tab=settings">
                 <Button variant="outline" className="flex items-center gap-2">
                   <Settings className="w-4 h-4" />
                   {t("board.goToSettings")}
                 </Button>
              </Link>
            </div>
          ) : externalTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
               <h3 className="text-lg font-semibold mb-2">{t("board.noExternalTasks")}</h3>
               <p className="text-muted-foreground max-w-md">
                 {t("board.noExternalTasksDesc")}
               </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6 md:space-y-0 overflow-x-hidden md:items-start">
              {statusColumns.map((column) => (
                <div
                  key={column.id}
                  className="bg-accent/50 rounded-lg transition-colors flex flex-col max-h-[calc(100vh-280px)]"
                >
                  {/* Fixed Column Header */}
                  <div className="p-3 sm:p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between gap-2">
                       <h3 className="font-semibold text-foreground text-sm sm:text-base">
                           {column.id === "TO_DO" ? t("board.toDo") : column.id === "IN_PROGRESS" ? t("board.inProgress") : t("board.done")}
                         </h3>
                        {column.title !== "DONE" && (
                          <Badge
                            variant="secondary"
                            className="inline-flex items-center rounded border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-black text-xs bg-[#DEE1E6FF]"
                          >
                            {getExternalTasksByStatus(column.id).length}
                          </Badge>
                        )}
                        {column.title == "DONE" && <Check color="#14923EFF" />}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Tasks Area */}
                  <div
                    onDragOver={dragHandlers.handleDragOver}
                    onDragEnter={(e) =>
                      dragHandlers.handleDragEnter(e, column.id)
                    }
                    onDragLeave={dragHandlers.handleDragLeave}
                    onDrop={(e) => dragHandlers.handleDrop(e, column.id)}
                    className={`px-3 sm:px-4 space-y-3 transition-all duration-200 flex-1 overflow-y-auto ${
                      dragHandlers.dragState.isDraggingOver === column.id
                        ? "border-2 border-dashed border-primary/30 rounded-lg"
                        : ""
                    }`}
                  >
                    {getExternalTasksByStatus(column.id).length === 0 ? (
                      <div className="flex items-center flex-col justify-center gap-3 py-8">
                         <p className="text-sm text-muted-foreground">
                           {t("board.noTasksCreated")}
                         </p>
                        <MapPin className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    ) : (
                      getExternalTasksByStatus(column.id).map((task) => (
                        <TaskItem
                          key={task._id}
                          task={task}
                          onTaskSelect={handleTaskClick}
                          dragHandlers={dragHandlers}
                          isDragging={
                            dragHandlers.dragState.draggedTaskId === task._id
                          }
                          canEdit={canEditTask(task)}
                        />
                      ))
                    )}
                  </div>

                  {/* Spacer at bottom */}
                  <div className="p-3 sm:p-4 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateTask={async (newTask) => {
          // React Query will automatically refetch and update
        }}
        defaultStatus={defaultStatus}
      />

      <TaskDetailModal
        taskId={urlTaskId || null}
        isOpen={!!urlTaskId}
        onClose={handleCloseTaskModal}
      />
    </div>
  );
};

export default Board;
