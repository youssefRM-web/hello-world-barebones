import { useMemo, useCallback } from "react";
import { AcceptedTasks } from "@/types";
import { useCurrentUserQuery } from "@/hooks/queries/useCurrentUserQuery";
import { usePermissions } from "@/contexts/PermissionsContext";

export type SortOption = "Recently" | "Due Date" | null;

export const useBoardFilters = (
  allTasks: AcceptedTasks[],
  activeTab: string,
  selectedBuildingId: string,
  buildings: any[],
  sortBy: SortOption = null,
  searchQuery: string = "",
  categoryFilter: string = "",
  priorityFilter: string = "",
) => {
  const { data: currentUser } = useCurrentUserQuery();
  const currentUserId = currentUser?._id;
  const { getPermittedBuildingIds, isAdmin } = usePermissions();

  const getTaskBuildingId = (task: AcceptedTasks): string | null => {
    const buildingId = task.Building_id;
    if (!buildingId) return null;
    if (typeof buildingId === "object" && (buildingId as any)?._id)
      return (buildingId as any)._id;
    if (typeof buildingId === "string") return buildingId;
    return null;
  };

  // Get building IDs where user has board access permission
  const boardPermittedBuildingIds = useMemo(
    () => getPermittedBuildingIds("board"),
    [getPermittedBuildingIds]
  );

  const filteredAcceptedTasks = useMemo(() => {
    if (!currentUser) return [];

    // CRITICAL: Only show tasks from buildings where user has BOARD permission
    let userFiltered = allTasks;
    if (!isAdmin) {
      // For non-admin: if no board permissions at all, show nothing
      if (boardPermittedBuildingIds.length === 0) {
        userFiltered = [];
      } else {
        userFiltered = allTasks.filter((task) => {
          const taskBuildingId = getTaskBuildingId(task);
          return taskBuildingId
            ? boardPermittedBuildingIds.includes(taskBuildingId)
            : false;
        });
      }
    }

    let buildingFiltered: AcceptedTasks[];

    if (selectedBuildingId && selectedBuildingId !== "all") {
      // Specific building selected: show all tasks in that building
      buildingFiltered = userFiltered.filter((task) => {
        return getTaskBuildingId(task) === selectedBuildingId;
      });
    } else {
      // "All buildings" selected: show all tasks across all buildings
      buildingFiltered = userFiltered;
    }

    // Tab filtering (My Tasks, High Prio, etc.)
    let tabFiltered = buildingFiltered;

    if (activeTab === "My Tasks") {
      // My Tasks: only tasks assigned to the current user
      tabFiltered = buildingFiltered.filter((task) =>
        task.Assigned_to?.some((a) => a._id === currentUserId),
      );
    } else if (activeTab === "High Prio") {
      tabFiltered = buildingFiltered.filter((t) => t.priority === "High");
    }

    const archivedFiltered =
      activeTab === "Archived Tasks"
        ? tabFiltered.filter((t) => t.archived)
        : tabFiltered.filter((t) => !t.archived);

    // Apply category filter
    let categoryFiltered = archivedFiltered;
    if (categoryFilter) {
      categoryFiltered = archivedFiltered.filter((task) => {
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

    // Apply priority filter
    let priorityFiltered = categoryFiltered;
    if (priorityFilter) {
      priorityFiltered = categoryFiltered.filter(
        (task) => task.priority === priorityFilter,
      );
    }

    // Apply search filter
    if (!searchQuery.trim()) return priorityFiltered;

    const query = searchQuery.toLowerCase();
    return priorityFiltered.filter((task) => {
      const title = task.issue_summary?.toLowerCase() || "";
      const description = task.additional_info?.toLowerCase() || "";
      return title.includes(query) || description.includes(query);
    });
  }, [
    allTasks,
    selectedBuildingId,
    currentUser,
    activeTab,
    currentUserId,
    searchQuery,
    categoryFilter,
    priorityFilter,
    boardPermittedBuildingIds,
    isAdmin,
  ]);

  const getTasksByStatus = useCallback(
    (status: string) => {
      const filtered = filteredAcceptedTasks.filter(
        (task) => task.Status === status,
      );

      if (!sortBy) return filtered;

      return [...filtered].sort((a, b) => {
        if (sortBy === "Recently") {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // Most recent first
        } else if (sortBy === "Due Date") {
          const dateA = a.Due_date ? new Date(a.Due_date).getTime() : Infinity;
          const dateB = b.Due_date ? new Date(b.Due_date).getTime() : Infinity;
          return dateA - dateB; // Earliest due date first
        }
        return 0;
      });
    },
    [filteredAcceptedTasks, sortBy],
  );

  // Counts for tabs - compute from building-filtered tasks (before tab filtering)
  const buildingFilteredTasks = useMemo(() => {
    if (!currentUser) return [];

    // CRITICAL: Only show tasks from buildings where user has BOARD permission
    let userFiltered = allTasks;
    if (!isAdmin && boardPermittedBuildingIds.length > 0) {
      userFiltered = allTasks.filter((task) => {
        const taskBuildingId = getTaskBuildingId(task);
        return taskBuildingId
          ? boardPermittedBuildingIds.includes(taskBuildingId)
          : false;
      });
    }
    if (selectedBuildingId && selectedBuildingId !== "all") {
      return userFiltered.filter(
        (task) => getTaskBuildingId(task) === selectedBuildingId,
      );
    }
    return userFiltered;
  }, [allTasks, selectedBuildingId, currentUser, isAdmin, boardPermittedBuildingIds]);

  const nonArchivedTasks = buildingFilteredTasks.filter(
    (task) => !task.archived,
  );
  const archivedTasks = buildingFilteredTasks.filter((task) => task.archived);

  const tabs = [
    { name: "All Tasks", count: nonArchivedTasks.length, hasInfo: false },
    {
      name: "My Tasks",
      count: nonArchivedTasks.filter((task) =>
        task.Assigned_to?.some((assignee) => assignee._id === currentUserId),
      ).length,
      hasInfo: true,
    },
    {
      name: "High Prio",
      count: nonArchivedTasks.filter((t) => t.priority === "High").length,
      hasInfo: true,
    },
    { name: "Archived Tasks", count: archivedTasks.length, hasInfo: false },
  ];

  return { filteredAcceptedTasks, getTasksByStatus, tabs };
};
