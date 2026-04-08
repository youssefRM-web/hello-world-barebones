import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IssueCard } from "./IssueGroup/IssueCard";
import { CreateIssueModal } from "./IssueGroup/CreateIssueModal";
import { CreateExternalTaskModal } from "./BoardGroup/CreateExternalTaskModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { Issue } from "@/types";
import { useBuilding } from "@/contexts/BuildingContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useNotificationBadges } from "@/contexts/NotificationBadgesContext";
import { useIssuesQuery, useIssuesCountByStatusQuery } from "@/hooks/queries/useIssuesQuery";
import { useCurrentUserQuery } from "@/hooks/queries";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export function Dashboard() {
  type TabName = "pending" | "accepted" | "declined";

  const { refreshData } = useReferenceData();
  const { t } = useLanguage();
  const { selectedBuilding } = useBuilding();
  const { data: currentUser } = useCurrentUserQuery();
  const { executeRequest } = useApi();
  const { canAccess, isAdmin, getPermittedBuildingIds } = usePermissions();
  const { markIssuesAsViewed, incrementNewIssues } = useNotificationBadges();
  
  const [activeTab, setActiveTab] = useState<TabName>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExternalTaskModalOpen, setIsExternalTaskModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const organizationId = currentUser?.Organization_id?._id;
  const rawBuildingId = selectedBuilding?._id || null;

  // For non-admin: only show issues from permitted buildings
  const permittedBuildingIds = getPermittedBuildingIds("issues");
  
  // If a specific building is selected but user lacks permission, block it
  const buildingId = (!isAdmin && rawBuildingId && !permittedBuildingIds.includes(rawBuildingId))
    ? "none" // Force no results for unpermitted building
    : rawBuildingId;
    
  // For non-admin "All Buildings": use permitted building IDs, or dummy to return no results
  const effectiveBuildingIds = (!buildingId && !isAdmin) 
    ? (permittedBuildingIds.length > 0 ? permittedBuildingIds : ["none"]) 
    : undefined;


  // Mark issues as viewed when Dashboard mounts, and mark as left when unmounting
  useEffect(() => {
    markIssuesAsViewed();
    return () => {
      incrementNewIssues(); // Mark as left dashboard
    };
  }, [markIssuesAsViewed, incrementNewIssues]);

  // Use paginated issues query with status filter and proper pagination
  const { data: issuesData, isLoading, refetch: refetchIssues } = useIssuesQuery({
    organizationId,
    buildingId,
    buildingIds: effectiveBuildingIds,
    page: currentPage,
    limit: pageSize,
    status: activeTab,
  });

  // Fetch counts for all statuses (just page 1 with limit 1 to get total count)
  const { data: pendingCountData } = useIssuesCountByStatusQuery({
    organizationId,
    buildingId,
    buildingIds: effectiveBuildingIds,
    status: "pending",
  });
  const { data: acceptedCountData } = useIssuesCountByStatusQuery({
    organizationId,
    buildingId,
    buildingIds: effectiveBuildingIds,
    status: "accepted",
  });
  const { data: declinedCountData } = useIssuesCountByStatusQuery({
    organizationId,
    buildingId,
    buildingIds: effectiveBuildingIds,
    status: "declined",
  });

  // Get issues from server response (already filtered by building on API)
  const issues = issuesData?.data || [];
  const serverPagination = issuesData?.pagination;
  
  // Use counts from the count queries
  const pendingCount = pendingCountData ?? 0;
  const acceptedCount = acceptedCountData ?? 0;
  const declinedCount = declinedCountData ?? 0;

  // Mark issues as viewed when component mounts
  useEffect(() => {
    markIssuesAsViewed();
  }, []);

  const handleAccept = async (issue: Issue) => {
    setSelectedIssue(issue);
    // Check if this is a location-based issue (external report)
    if (issue.location_coordinates && !issue.buildingId) {
      setIsExternalTaskModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleDecline = async (issueId: string) => {
    await executeRequest(
      () =>
        apiService.patch(`${endpoints.issues}/${issueId}`, {
          isAccepted: false,
          status : "declined"
        }),
      {
        successMessage: t("issues.issueDeclined"),
        onSuccess: () => {
          refetchIssues();
          refreshData();
        },
      }
    );
  };

  const handleReAccept = async (issue: Issue) => {
    await handleAccept(issue);
  };

  const handleCreateIssue = async (issueData: any) => {
    if (selectedIssue) {
      // Update existing issue
      const { _id, ...updatableData } = issueData;

      await executeRequest(
        () =>
          apiService.patch(`${endpoints.issues}/${selectedIssue._id}`, {
            ...updatableData,
            isAccepted: true,
          }),
        {
          successMessage: t("issues.issueAccepted"),
          onSuccess: () => {
            refetchIssues();
            refreshData();
            setSelectedIssue(null);
            setIsCreateModalOpen(false);
          },
        }
      );
    }
  };

  // Filter issues by search query and sort
  const filteredIssues = useMemo(() => {
    let filtered = issues.filter((issue) => {
      const matchesSearch =
        issue.additional_info
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        issue.issue_summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort client-side
    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  }, [issues, searchQuery, sortBy]);

  // Use server-side pagination
  const pagination = useMemo(() => {
    if (serverPagination) {
      return {
        page: serverPagination.page,
        totalPages: serverPagination.totalPages,
        total: serverPagination.total,
        hasNext: serverPagination.hasNext,
        hasPrev: serverPagination.hasPrev,
      };
    }
    return {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNext: false,
      hasPrev: false,
    };
  }, [serverPagination]);

  // Reset to page 1 when building or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [buildingId, activeTab, searchQuery]);

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <PageLoadingSkeleton variant="default" />
      </div>
    );
  }

  // Check if user has access to issues
  if (!canAccess("issues") && !isAdmin) {
    return (
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">
            {t("issues.welcomeTitle")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("issues.noAccessMessage")}
          </p>
          <div className="text-sm text-gray-500">
            {t("issues.sidebarHint")}
          </div>
        </div>
      </div>
    );
  }

  const tabLabels: Record<TabName, string> = {
    pending: t("issues.pendingIssues"),
    accepted: t("issues.acceptedIssues"),
    declined: t("issues.declinedIssues"),
  };

  const tabs: { name: TabName; count: number; hasInfo: boolean }[] = [
    { name: "pending", count: pendingCount, hasInfo: false },
    { name: "accepted", count: acceptedCount, hasInfo: false },
    { name: "declined", count: declinedCount, hasInfo: false },
  ];

  const CountBadge = ({ count, isActive }: { count: number; isActive: boolean }) => (
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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-5 lg:pt-7 pb-0 bg-background">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
           <h1 className="text-xl lg:text-2xl font-semibold text-foreground flex items-center gap-2">
            <span>{t("issues.title")}</span>
          </h1>
        </div>

        {/* Header with Create Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Mobile Dropdown */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as TabName)}>
              <SelectTrigger className="w-full relative">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{tabLabels[activeTab]}</span>
                    <CountBadge count={tabs.find((t) => t.name === activeTab)?.count || 0} isActive={true} />
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.name} value={tab.name}>
                    <div className="flex items-center gap-2">
                      <span>{tabLabels[tab.name]}</span>
                      <CountBadge count={tab.count} isActive={tab.name === activeTab} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.name
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {tabLabels[tab.name]}
                <CountBadge count={tab.count} isActive={activeTab === tab.name} />
              </button>
            ))}
          </div>

        {/*  <Button
          onClick={() => {
            setSelectedIssue(null);
            setIsCreateModalOpen(true);
          }}
          className="text-sm"
        >
          + Create New Issue
        </Button> */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative md:hidden">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("issues.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("issues.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48 lg:w-64"
            />
          </div>

          <div className="flex gap-3">
            {/* <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white flex-1 sm:flex-none"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="priority">Sort by: Priority</option>
          </select> */}

            {/* <Select>
              <SelectTrigger className="w-32 sm:w-40 bg-background relative">
                <SelectValue placeholder="newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">newest</SelectItem>
                <SelectItem value="oldest">oldest</SelectItem>
                <SelectItem value="priority">priority</SelectItem>
              </SelectContent>
            </Select> */}

            <Button
              variant="outline"
              className="flex items-center gap-2 px-3"
              onClick={() => setSortBy(prev => prev === "newest" ? "oldest" : "newest")}
              title={sortBy === "newest" ? t("issues.sortNewest") : t("issues.sortOldest")}
            >
              <svg
                className={`w-6 h-6 transition-transform ${sortBy === "oldest" ? "rotate-180" : ""}`}
                fill="#565E6CFF"
                id="Flat"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
              >
                <path d="M119.39,172.94a8,8,0,0,1-1.73,8.72l-32,32a8,8,0,0,1-11.32,0l-32-32A8,8,0,0,1,48,168H72V48a8,8,0,0,1,16,0V168h24A8,8,0,0,1,119.39,172.94Zm94.27-98.6-32-32a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,144,88h24V208a8,8,0,0,0,16,0V88h24a8,8,0,0,0,5.66-13.66Z" />
              </svg>
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-auto px-5 pb-5">
        {/* Issues List */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 overflow-x-hidden">
          {filteredIssues.length === 0 ? (
            <div className="col-span-full flex-col gap-2 text-center items-center flex justify-center h-[50vh] pb-12 pt-6 text-muted-foreground text-sm">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 5.5C20 5.23478 19.8946 4.98051 19.707 4.79297C19.5195 4.60543 19.2652 4.5 19 4.5L5 4.5C4.73478 4.5 4.48051 4.60543 4.29297 4.79297C4.10543 4.98051 4 5.23478 4 5.5L4 19.0859L6.29297 16.793L6.36621 16.7266C6.54417 16.5807 6.76791 16.5 7 16.5L19 16.5C19.2652 16.5 19.5195 16.3946 19.707 16.207C19.8946 16.0195 20 15.7652 20 15.5L20 5.5ZM22 15.5C22 16.2957 21.6837 17.0585 21.1211 17.6211C20.5585 18.1837 19.7957 18.5 19 18.5L7.41406 18.5L3.70703 22.207C3.42103 22.493 2.99086 22.5786 2.61719 22.4238C2.24359 22.269 2 21.9044 2 21.5L2 5.5C2 4.70435 2.3163 3.94152 2.87891 3.37891C3.44152 2.8163 4.20435 2.5 5 2.5L19 2.5C19.7956 2.5 20.5585 2.8163 21.1211 3.37891C21.6837 3.94152 22 4.70435 22 5.5L22 15.5Z"
                  fill="gray"
                />
                <path
                  d="M11 9.5V7.5C11 6.94772 11.4477 6.5 12 6.5C12.5523 6.5 13 6.94772 13 7.5V9.5C13 10.0523 12.5523 10.5 12 10.5C11.4477 10.5 11 10.0523 11 9.5Z"
                  fill="gray"
                />
                <path
                  d="M12.0098 12.5L12.1123 12.5049C12.6165 12.5561 13.0098 12.9822 13.0098 13.5C13.0098 14.0178 12.6165 14.4439 12.1123 14.4951L12.0098 14.5H12C11.4477 14.5 11 14.0523 11 13.5C11 12.9477 11.4477 12.5 12 12.5H12.0098Z"
                  fill="gray"
                />
              </svg>
              <p>{t(`issues.no${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Issues`)}</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                title={issue.issue_summary}
                additional_info={issue.additional_info}
                locationChain={issue.locationChain}
                timestamp={new Date(issue.createdAt).toLocaleString()}
                images={issue.attachements || []}
                activeTab={activeTab}
                onAccept={() => handleAccept(issue)}
                onDecline={() => handleDecline(issue._id)}
                onReAccept={() => handleReAccept(issue)}
                buildingId={issue?.buildingId?.label}
                Linked_To={issue?.Linked_To?.name}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("issues.previous")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("issues.page")} {pagination.page} {t("issues.of")} {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
            >
              {t("issues.next")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Regular issue modal */}
      <CreateIssueModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setSelectedIssue(null);
        }}
        onCreateIssue={handleCreateIssue}
        initialData={selectedIssue}
      />

      {/* External task modal for location-based reports */}
      <CreateExternalTaskModal
        open={isExternalTaskModalOpen}
        onOpenChange={(open) => {
          setIsExternalTaskModalOpen(open);
          if (!open) setSelectedIssue(null);
        }}
        onCreateTask={(taskData) => {
          refreshData();
          setIsExternalTaskModalOpen(false);
          setSelectedIssue(null);
        }}
        issue={selectedIssue}
      />
    </div>
  );
}