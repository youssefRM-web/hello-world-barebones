import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity,
  Search,
  Download,
  Package,
  Tag,
  UserX,
  Printer,
} from "lucide-react";
import { apiService, endpoints } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Pie,
  Tooltip,
} from "recharts";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { useCurrentUserQuery } from "@/hooks/queries/useCurrentUserQuery";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useLanguage } from "@/components/language-provider";
import { useTranslation } from "@/lib/translations";

const Insights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("overall");
  const { toast } = useToast();
  const { selectedBuilding, setSelectedBuilding } = useBuilding();
  const { setSelectedBuildingId } = useBuildingSelection();
  const {
    spaces,
    assets,
    users,
    groups,
    buildings,
    isLoading: referenceLoading,
  } = useReferenceData();

  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const ins = t.dashboard.content.insights;
  const tabs = t.dashboard.content.tabs;
  const stats_t = t.dashboard.content.stats;
  const charts_t = t.dashboard.content.charts;

  const { data: currentUser } = useCurrentUserQuery();
  const organizationId = currentUser?.Organization_id?._id;

  // Sync building filter with sidebar selection
  const buildingFilter = selectedBuilding?._id || "all";

  // Calculate date range based on time filter
  const dateRange = useMemo(() => {
    if (timeFilter === "overall") return undefined;
    
    const now = new Date();
    const start = new Date();
    
    if (timeFilter === "week") {
      start.setDate(now.getDate() - 7);
    } else if (timeFilter === "month") {
      start.setMonth(now.getMonth() - 1);
    }
    
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString()
    };
  }, [timeFilter]);

  // Fetch comprehensive insights data
  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ["insights-comprehensive", organizationId, buildingFilter === "all" ? null : buildingFilter, dateRange],
    queryFn: async () => {
      if (!organizationId) {
        return null;
      }
      try {
        const params: any = {
          organizationId,
        };
        
        if (buildingFilter !== "all") {
          params.buildingId = buildingFilter;
        }
        
        if (dateRange) {
          params.startDate = dateRange.startDate;
          params.endDate = dateRange.endDate;
        }
        
        const response = await apiService.get<any>(endpoints.insightsComprehensive, { params });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch comprehensive insights:", error);
        return null;
      }
    },
    enabled: !!organizationId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  // Refetch data when component mounts
  React.useEffect(() => {
    refetchInsights();
  }, [refetchInsights]);

  // Calculate statistics from comprehensive API data
  const calculateStats = () => {
    if (!insightsData) {
      return [
        { title: stats_t.toDo, value: "0", change: "", trend: "neutral", icon: Activity, color: "blue" },
        { title: stats_t.inProgress, value: "0", change: "", trend: "neutral", icon: TrendingUp, color: "orange" },
        { title: stats_t.completed, value: "0", change: "", trend: "up", icon: BarChart3, color: "green" },
        { title: stats_t.dueToday, value: "0", change: "", trend: "neutral", icon: PieChart, color: "yellow" },
        { title: stats_t.overdue, value: "0", change: "", trend: "neutral", icon: Activity, color: "red" },
      ];
    }

    const taskStatus = insightsData.taskStatus || [];
    const todoCount = taskStatus.find((s: any) => s.status === "TO_DO")?.count || 0;
    const inProgressCount = taskStatus.find((s: any) => s.status === "IN_PROGRESS")?.count || 0;
    const doneCount = taskStatus.find((s: any) => s.status === "DONE")?.count || 0;
    const dueTodayCount = insightsData.dueToday || 0;
    const overdueCount = insightsData.overdue || 0;

    return [
      { title: stats_t.toDo, value: todoCount.toString(), change: "", trend: "neutral", icon: Activity, color: "blue" },
      { title: stats_t.inProgress, value: inProgressCount.toString(), change: "", trend: "neutral", icon: TrendingUp, color: "orange" },
      { title: stats_t.completed, value: doneCount.toString(), change: "", trend: "up", icon: BarChart3, color: "green" },
      { title: stats_t.dueToday, value: dueTodayCount.toString(), change: "", trend: "neutral", icon: PieChart, color: "yellow" },
      { title: stats_t.overdue, value: overdueCount.toString(), change: "", trend: "neutral", icon: Activity, color: "red" },
    ];
  };

  const statsData = calculateStats();

  // Calculate priority chart data from comprehensive API data
  const calculatePriorityData = () => {
    if (!insightsData) {
      return [
        { name: ins.high, value: 0, color: "#ef4444" },
        { name: ins.medium, value: 0, color: "#f59e0b" },
        { name: ins.low, value: 0, color: "#3b82f6" },
        { name: ins.noPriority, value: 0, color: "#9ca3af" },
      ];
    }

    const taskPriority = insightsData.taskPriority || [];
    const highCount = taskPriority.find((p: any) => p.priority === "High")?.count || 0;
    const mediumCount = taskPriority.find((p: any) => p.priority === "Medium")?.count || 0;
    const lowCount = taskPriority.find((p: any) => p.priority === "Low")?.count || 0;
    const noPriorityCount = taskPriority.find((p: any) => !p.priority || p.priority === "None")?.count || 0;

    return [
      { name: ins.high, value: highCount, color: "#ef4444" },
      { name: ins.medium, value: mediumCount, color: "#f59e0b" },
      { name: ins.low, value: lowCount, color: "#3b82f6" },
      { name: ins.noPriority, value: noPriorityCount, color: "#9ca3af" },
    ];
  };

  const priorityChartData = calculatePriorityData();
  const totalOpenTasks = priorityChartData.reduce((acc, item) => acc + item.value, 0);

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="text-sm font-medium">{data.name}: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate high priority tickets by member from users data
  const calculateHighPriorityTickets = () => {
    if (!insightsData?.users || !Array.isArray(insightsData.users)) return [];

    return insightsData.users
      .filter((user: any) => user.highPriority > 0)
      .map((user: any) => ({
        name: user.name || "Unknown User",
        value: user.highPriority || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  };

  const highPriorityTickets = calculateHighPriorityTickets();

  // Calculate user activity data from comprehensive API data
  const calculateUserData = () => {
    if (!insightsData?.users || !Array.isArray(insightsData.users)) return [];

    return insightsData.users
      .map((user: any) => ({
        name: user.name || "Unknown User",
        tasks: user.totalTickets || 0,
        assigned: user.currentlyAssigned || 0
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 6);
  };

  const userData = calculateUserData();

  // Calculate category data from comprehensive API data
  const calculateCategoryData = () => {
    if (!insightsData?.categories || !Array.isArray(insightsData.categories)) return [];

    return insightsData.categories
      .map((cat: any) => ({
        category: cat.category || cat.name || "Uncategorized",
        count: cat.totalTickets || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const categoryData = calculateCategoryData();

  // Calculate maximum values for dynamic bar widths
  const maxUserTasks = Math.max(...(userData.length > 0 ? userData.map((user) => user.tasks) : [1]));
  const maxUserAssigned = Math.max(...(userData.length > 0 ? userData.map((user) => user.assigned) : [1]));
  const maxCategoryCount = Math.max(...(categoryData.length > 0 ? categoryData.map((cat) => cat.count) : [1]));

  // Helper function to format logged time (hours to h min format)
  const formatLoggedTime = (hours: number) => {
    const h = Math.floor(hours);
    const minutes = Math.floor((hours - h) * 60);
    return `${h} h ${minutes} min`;
  };

  // Helper function to format logged cost
  const formatLoggedCost = (cost: number) => {
    return `${cost.toFixed(2).replace('.', ',')} €`;
  };

  // Calculate spaces data from comprehensive API response
  const calculateSpacesData = useMemo(() => {
    if (!insightsData?.spaces || !Array.isArray(insightsData.spaces)) return [];
    return insightsData.spaces.map((space: any) => ({
      _id: space._id,
      name: space.name || "Unnamed Space",
      building: space.buildingName || "Unknown Building",
      totalTickets: space.totalTickets || 0,
      lowPriority: space.lowPriority || 0,
      mediumPriority: space.mediumPriority || 0,
      highPriority: space.highPriority || 0,
      loggedCost: formatLoggedCost(space.loggedCost || 0),
      loggedTime: formatLoggedTime(space.loggedTime || 0),
    }));
  }, [insightsData]);

  // Calculate assets data from comprehensive API response
  const calculateAssetsData = useMemo(() => {
    if (!insightsData?.assets || !Array.isArray(insightsData.assets)) return [];

    return insightsData.assets.map((asset: any) => ({
      _id: asset._id,
      name: asset.name || "Unnamed Asset",
      building: asset.buildingName || "Unknown Building",
      totalTickets: asset.totalTickets || 0,
      lowPriority: asset.lowPriority || 0,
      mediumPriority: asset.mediumPriority || 0,
      highPriority: asset.highPriority || 0,
      loggedCost: formatLoggedCost(asset.loggedCost || 0),
      loggedTime: formatLoggedTime(asset.loggedTime || 0),
    }));
  }, [insightsData]);

  // Calculate users data from comprehensive API response
  const calculateUsersData = useMemo(() => {
    if (!insightsData?.users || !Array.isArray(insightsData.users)) return [];

    return insightsData.users.map((user: any) => ({
      _id: user._id,
      member: user.name || "Unknown User",
      totalTickets: user.totalTickets || 0,
      currentlyAssigned: user.currentlyAssigned || 0,
      lowPriority: user.lowPriority || 0,
      mediumPriority: user.mediumPriority || 0,
      highPriority: user.highPriority || 0,
      loggedCosts: formatLoggedCost(user.loggedCost || 0),
      loggedTime: formatLoggedTime(user.loggedTime || 0),
    }));
  }, [insightsData]);

  // Calculate categories data from comprehensive API response
  const calculateCategoriesData = useMemo(() => {
    if (!insightsData?.categories || !Array.isArray(insightsData.categories)) return [];

    return insightsData.categories.map((category: any) => {
      const buildingLabels = category.buildingIds
        ?.map((b: any) => (typeof b === 'object' ? b.label : b))
        .filter(Boolean)
        .join(", ") || "No Building";

      return {
        _id: category._id,
        category: category.category || "Unnamed Category",
        building: buildingLabels,
        buildingIds: category.buildingIds || [],
        totalTickets: category.totalTickets || 0,
        lowPriority: category.lowPriority || 0,
        mediumPriority: category.mediumPriority || 0,
        highPriority: category.highPriority || 0,
        loggedCosts: formatLoggedCost(category.loggedCost || 0),
        loggedTime: formatLoggedTime(category.loggedTime || 0),
      };
    });
  }, [insightsData]);

  // Calculate groups data from comprehensive API response
  const calculateGroupsData = useMemo(() => {
    if (!insightsData?.groups || !Array.isArray(insightsData.groups)) return [];

    return insightsData.groups.map((group: any) => ({
      _id: group._id,
      group: group.group || group.name || "Unnamed Group",
      totalTickets: group.totalTickets || 0,
      lowPriority: group.lowPriority || 0,
      mediumPriority: group.mediumPriority || 0,
      highPriority: group.highPriority || 0,
      loggedCosts: formatLoggedCost(group.loggedCost || 0),
      loggedTime: formatLoggedTime(group.loggedTime || 0),
    }));
  }, [insightsData]);

  // Filter data based on search term
  const filteredSpacesData = calculateSpacesData.filter(
    (s: any) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssetsData = calculateAssetsData.filter(
    (a: any) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsersData = calculateUsersData.filter((u: any) =>
    u.member.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategoriesData = calculateCategoriesData.filter((c: any) =>
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroupsData = calculateGroupsData.filter((g: any) =>
    g.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export functionality
  const handleExport = () => {
    try {
      const exportData = {
        stats: statsData.map(s => ({ title: s.title, value: s.value })),
        priorities: priorityChartData.map(p => ({ priority: p.name, count: p.value })),
        spaces: calculateSpacesData,
        assets: calculateAssetsData,
        users: calculateUsersData,
        categories: calculateCategoriesData,
        groups: calculateGroupsData,
      };

      let csvContent = "Insights Export\n\n";
      
      csvContent += "Statistics\n";
      csvContent += "Metric,Value\n";
      exportData.stats.forEach(s => {
        csvContent += `${s.title},${s.value}\n`;
      });
      
      csvContent += "\nOpen Tasks by Priority\n";
      csvContent += "Priority,Count\n";
      exportData.priorities.forEach(p => {
        csvContent += `${p.priority},${p.count}\n`;
      });

      csvContent += "\nSpaces\n";
      csvContent += `${ins.name},${ins.building},${ins.totalTickets},${ins.lowPriority},${ins.mediumPriority},${ins.highPriority},${ins.loggedCost},${ins.loggedTime}\n`;
      exportData.spaces.forEach((s: any) => {
        csvContent += `${s.name},${s.building},${s.totalTickets},${s.lowPriority},${s.mediumPriority},${s.highPriority},${s.loggedCost},${s.loggedTime}\n`;
      });

      csvContent += "\nAssets\n";
      csvContent += `${ins.name},${ins.building},${ins.totalTickets},${ins.lowPriority},${ins.mediumPriority},${ins.highPriority},${ins.loggedCost},${ins.loggedTime}\n`;
      exportData.assets.forEach((a: any) => {
        csvContent += `${a.name},${a.building},${a.totalTickets},${a.lowPriority},${a.mediumPriority},${a.highPriority},${a.loggedCost},${a.loggedTime}\n`;
      });

      csvContent += "\nUsers\n";
      csvContent += `${ins.member},${ins.totalTickets},${ins.currentlyAssignedTo},${ins.lowPriority},${ins.mediumPriority},${ins.highPriority},${ins.loggedCosts},${ins.loggedTime}\n`;
      exportData.users.forEach((u: any) => {
        csvContent += `${u.member},${u.totalTickets},${u.currentlyAssigned},${u.lowPriority},${u.mediumPriority},${u.highPriority},${u.loggedCosts},${u.loggedTime}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `insights_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: t.dashboard.content.insightsTitle,
        description: ins.exportSuccess,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: ins.exportError,
        variant: "destructive",
      });
    }
  };

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );

  // Table headers reused across tabs
  const commonHeaders = (
    <>
      <TableHead className="text-center">{ins.totalTickets}</TableHead>
      <TableHead className="text-center">{ins.lowPriority}</TableHead>
      <TableHead className="text-center">{ins.mediumPriority}</TableHead>
      <TableHead className="text-center">{ins.highPriority}</TableHead>
      <TableHead className="text-right">{ins.loggedCost}</TableHead>
      <TableHead className="text-right">{ins.loggedTime}</TableHead>
    </>
  );

  // Show loading skeleton while data is being fetched
  if (referenceLoading || insightsLoading) {
    return (
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <PageLoadingSkeleton variant="default" />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-4 lg:p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {t.dashboard.content.insightsTitle}
            </h1>

            <Button className="text-white" size="lg" onClick={handleExport}>
              <Download className="w-4 h-4" />
              {ins.export}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <TabsList className="w-fit gap-2 lg:gap-6">
              <TabsTrigger value="overview">{tabs.overview}</TabsTrigger>
              <TabsTrigger value="spaces">{tabs.spaces}</TabsTrigger>
              <TabsTrigger value="assets">{tabs.assets}</TabsTrigger>
              <TabsTrigger value="users">{tabs.users}</TabsTrigger>
              <TabsTrigger value="category">{tabs.category}</TabsTrigger>
              <TabsTrigger value="groups">{tabs.groups}</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <Select 
                value={buildingFilter} 
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedBuilding(null);
                    setSelectedBuildingId(null);
                  } else {
                    const building = buildings?.find((b: any) => b._id === value);
                    if (building) {
                      setSelectedBuilding(building);
                      setSelectedBuildingId(building._id);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-32 sm:w-40 bg-background relative">
                  <SelectValue placeholder={ins.allBuildings} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ins.allBuildings}</SelectItem>
                  {buildings?.map((building: any) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32 sm:w-40 bg-background relative">
                  <SelectValue placeholder={ins.overall} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">{ins.overall}</SelectItem>
                  <SelectItem value="month">{ins.lastMonth}</SelectItem>
                  <SelectItem value="week">{ins.lastWeek}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {statsData.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{stat.title}</span>
                    <stat.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <p className="text-xs text-foreground">{stat.change}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{charts_t.openTasksByPriority}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div style={{ height: "14rem", width: "14rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={priorityChartData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={0}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {priorityChartData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {priorityChartData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-foreground">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{charts_t.highPriorityTicketsByMember}</CardTitle>
              </CardHeader>
              <CardContent>
                {highPriorityTickets.length === 0 ? (
                  <EmptyState message={ins.noHighPriorityTickets} />
                ) : (
                  <div className="space-y-4">
                    {highPriorityTickets.map((user, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground font-medium">
                            {user.name}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full h-8 bg-gray-100">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${(user.value / Math.max(...highPriorityTickets.map((u) => u.value))) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-6 text-xs text-foreground">
                  <span>0</span>
                  <span>{Math.ceil(Math.max(...highPriorityTickets.map((u) => u.value), 1) / 3)}</span>
                  <span>{Math.ceil((Math.max(...highPriorityTickets.map((u) => u.value), 1) * 2) / 3)}</span>
                  <span>{Math.max(...highPriorityTickets.map((u) => u.value), 1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{charts_t.activityByUser}</CardTitle>
              </CardHeader>
              <CardContent>
                {userData.length === 0 ? (
                  <EmptyState message={ins.noUserActivity} />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-8 text-sm font-medium text-foreground pb-2 border-b">
                      <div className="flex items-center justify-between">
                        <span>{ins.user}</span>
                        <span>{ins.tasksTotal}</span>
                      </div>
                      <div>{ins.currentlyAssignedTo}</div>
                    </div>

                    {userData.map((user, index) => (
                      <div key={index} className="grid grid-cols-2 gap-8">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{user.name}</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-8 bg-blue-600 transition-all duration-300"
                              style={{ width: `${Math.max((user.tasks / maxUserTasks) * 80, 8)}px` }}
                            ></div>
                            <span className="text-sm font-medium">{user.tasks}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 bg-teal-400 transition-all duration-300"
                            style={{ width: `${Math.max((user.assigned / maxUserAssigned) * 80, 8)}px` }}
                          ></div>
                          <span className="text-sm font-medium">{user.assigned}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{charts_t.tasksByCategory}</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <EmptyState message={ins.noCategoryData} />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground pb-2 border-b">
                      <span>{ins.category}</span>
                      <span>{ins.taskCountTotal}</span>
                    </div>

                    {categoryData.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 bg-blue-600 transition-all duration-300"
                            style={{ width: `${Math.max((cat.count / maxCategoryCount) * 80, 8)}px` }}
                          ></div>
                          <span className="text-sm font-medium">{cat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spaces Tab */}
        <TabsContent value="spaces">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
              <Input
                placeholder={ins.search}
                className="pl-9 w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredSpacesData.length === 0 ? (
            <div className="bg-background rounded-lg border-none">
              <Table className="border-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.name}</TableHead>
                    <TableHead>{ins.building}</TableHead>
                    {commonHeaders}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{ins.noSpacesFound}</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-background rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.name}</TableHead>
                    <TableHead>{ins.building}</TableHead>
                    {commonHeaders}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpacesData.map((space: any, index: number) => (
                    <TableRow key={space._id || index}>
                      <TableCell className="font-medium">{space.name}</TableCell>
                      <TableCell>{space.building}</TableCell>
                      <TableCell className="text-center">{space.totalTickets}</TableCell>
                      <TableCell className="text-center">{space.lowPriority}</TableCell>
                      <TableCell className="text-center">{space.mediumPriority}</TableCell>
                      <TableCell className="text-center">{space.highPriority}</TableCell>
                      <TableCell className="text-right">{space.loggedCost}</TableCell>
                      <TableCell className="text-right">{space.loggedTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
              <Input
                placeholder={ins.search}
                className="pl-9 w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredAssetsData.length === 0 ? (
            <div className="bg-background rounded-lg border-none">
              <Table className="border-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.name}</TableHead>
                    <TableHead>{ins.building}</TableHead>
                    {commonHeaders}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Printer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{ins.noAssetsFound}</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-background rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.name}</TableHead>
                    <TableHead>{ins.building}</TableHead>
                    {commonHeaders}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssetsData.map((asset: any, index: number) => (
                    <TableRow key={asset._id || index}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.building}</TableCell>
                      <TableCell className="text-center">{asset.totalTickets}</TableCell>
                      <TableCell className="text-center">{asset.lowPriority}</TableCell>
                      <TableCell className="text-center">{asset.mediumPriority}</TableCell>
                      <TableCell className="text-center">{asset.highPriority}</TableCell>
                      <TableCell className="text-right">{asset.loggedCost}</TableCell>
                      <TableCell className="text-right">{asset.loggedTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
              <Input
                placeholder={ins.search}
                className="pl-9 w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredUsersData.length === 0 ? (
            <div className="bg-background rounded-lg border-none">
              <Table className="border-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.member}</TableHead>
                    <TableHead className="text-center">{ins.totalTickets}</TableHead>
                    <TableHead className="text-center">{ins.currentlyAssignedTo}</TableHead>
                    <TableHead className="text-center">{ins.lowPriority}</TableHead>
                    <TableHead className="text-center">{ins.mediumPriority}</TableHead>
                    <TableHead className="text-center">{ins.highPriority}</TableHead>
                    <TableHead className="text-right">{ins.loggedCosts}</TableHead>
                    <TableHead className="text-right">{ins.loggedTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{ins.noUsersFound}</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-background rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.member}</TableHead>
                    <TableHead className="text-center">{ins.totalTickets}</TableHead>
                    <TableHead className="text-center">{ins.currentlyAssignedTo}</TableHead>
                    <TableHead className="text-center">{ins.lowPriority}</TableHead>
                    <TableHead className="text-center">{ins.mediumPriority}</TableHead>
                    <TableHead className="text-center">{ins.highPriority}</TableHead>
                    <TableHead className="text-right">{ins.loggedCosts}</TableHead>
                    <TableHead className="text-right">{ins.loggedTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsersData.map((user: any, index: number) => (
                    <TableRow key={user._id || index}>
                      <TableCell className="font-medium">{user.member}</TableCell>
                      <TableCell className="text-center">{user.totalTickets}</TableCell>
                      <TableCell className="text-center">{user.currentlyAssigned}</TableCell>
                      <TableCell className="text-center">{user.lowPriority}</TableCell>
                      <TableCell className="text-center">{user.mediumPriority}</TableCell>
                      <TableCell className="text-center">{user.highPriority}</TableCell>
                      <TableCell className="text-right">{user.loggedCosts}</TableCell>
                      <TableCell className="text-right">{user.loggedTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Category Tab */}
        <TabsContent value="category">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
              <Input
                placeholder={ins.search}
                className="pl-9 w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredCategoriesData.length === 0 ? (
            <div className="bg-background rounded-lg border-none">
              <Table className="border-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.category}</TableHead>
                    <TableHead className="text-center">{ins.totalTickets}</TableHead>
                    <TableHead className="text-center">{ins.lowPriority}</TableHead>
                    <TableHead className="text-center">{ins.mediumPriority}</TableHead>
                    <TableHead className="text-center">{ins.highPriority}</TableHead>
                    <TableHead className="text-right">{ins.loggedCosts}</TableHead>
                    <TableHead className="text-right">{ins.loggedTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{ins.noCategoriesFound}</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-background rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.category}</TableHead>
                    <TableHead className="text-center">{ins.totalTickets}</TableHead>
                    <TableHead className="text-center">{ins.lowPriority}</TableHead>
                    <TableHead className="text-center">{ins.mediumPriority}</TableHead>
                    <TableHead className="text-center">{ins.highPriority}</TableHead>
                    <TableHead className="text-right">{ins.loggedCosts}</TableHead>
                    <TableHead className="text-right">{ins.loggedTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategoriesData.map((category: any, index: number) => (
                    <TableRow key={category._id || index}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell className="text-center">{category.totalTickets}</TableCell>
                      <TableCell className="text-center">{category.lowPriority}</TableCell>
                      <TableCell className="text-center">{category.mediumPriority}</TableCell>
                      <TableCell className="text-center">{category.highPriority}</TableCell>
                      <TableCell className="text-right">{category.loggedCosts}</TableCell>
                      <TableCell className="text-right">{category.loggedTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
              <Input
                placeholder={ins.search}
                className="pl-9 w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredGroupsData.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState message={ins.noGroupsFound} />
              </CardContent>
            </Card>
          ) : (
            <div className="bg-background rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ins.group}</TableHead>
                    <TableHead className="text-center">{ins.totalTickets}</TableHead>
                    <TableHead className="text-center">{ins.lowPriority}</TableHead>
                    <TableHead className="text-center">{ins.mediumPriority}</TableHead>
                    <TableHead className="text-center">{ins.highPriority}</TableHead>
                    <TableHead className="text-right">{ins.loggedCosts}</TableHead>
                    <TableHead className="text-right">{ins.loggedTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroupsData.map((group: any, index: number) => (
                    <TableRow key={group._id || index}>
                      <TableCell className="font-medium">{group.group}</TableCell>
                      <TableCell className="text-center">{group.totalTickets}</TableCell>
                      <TableCell className="text-center">{group.lowPriority}</TableCell>
                      <TableCell className="text-center">{group.mediumPriority}</TableCell>
                      <TableCell className="text-center">{group.highPriority}</TableCell>
                      <TableCell className="text-right">{group.loggedCosts}</TableCell>
                      <TableCell className="text-right">{group.loggedTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Insights;
