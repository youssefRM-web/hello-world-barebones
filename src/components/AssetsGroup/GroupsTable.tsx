import React, { useState, useMemo } from "react";
import AssetGroupDetailsModal from "./AssetGroupDetailsModal";
import { useGroupsQuery } from "@/hooks/queries";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

interface GroupsTableProps {
  searchTerm?: string;
  filters?: {
    category?: string;
    building?: string;
    area?: string;
    space?: string;
    group?: string;
  };
}

const GroupsTable = ({ searchTerm = "", filters = {} }: GroupsTableProps) => {
  const { data: groups, isLoading } = useGroupsQuery();
  const { t } = useLanguage();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter to only show groups with assets and apply filters
  const assetGroups = useMemo(() => {
    let filtered = groups?.filter(
      (group) =>
        group?.assets &&
        group?.assets?.length >= 0 &&
        group?.belongTo === "assets"
    ) || [];

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((group) =>
        group.name?.toLowerCase().includes(query)
      );
    }

    // Apply group filter (show only the selected group)
    if (filters.group && filters.group !== "all") {
      filtered = filtered.filter((group) => group._id === filters.group);
    }

    // Apply building filter - filter groups that have assets in the selected building
    if (filters.building && filters.building !== "all") {
      filtered = filtered.filter((group) => {
        if (!group.assets || group.assets.length === 0) return false;
        return group.assets.some((asset: any) => {
          const assetBuildingId = typeof asset.building_id === "string"
            ? asset.building_id
            : asset.building_id?._id;
          return assetBuildingId === filters.building;
        });
      });
    }

    return filtered;
  }, [groups, searchTerm, filters]);

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg  w-full">
      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>{t("assets.name")}</TableHead>
                <TableHead className="text-center">{t("assets.linkedAssets")}</TableHead>
                <TableHead className="text-center">{t("assets.openTasks")}</TableHead>
                <TableHead className="text-center">{t("assets.tasksInProgress")}</TableHead>
                <TableHead className="text-center">{t("assets.tasksCompleted")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-card divide-y divide-border">
              {assetGroups &&
              assetGroups.find((g) => g.belongTo === "assets") &&
              assetGroups?.length >= 0 ? (
                assetGroups.map((group) => (
                  <TableRow
                    key={group?._id}
                    className="hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleGroupClick(group._id)}
                  >
                    {/* Icon */}
                    <TableCell className="px-3 sm:px-6 py-4 whitespace-nowrap">
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
                    </TableCell>

                    {/* Name */}
                    <TableCell className="px-3 sm:px-6 first-letter:uppercase py-4 whitespace-nowrap font-medium text-foreground">
                      {group?.name}
                    </TableCell>

                      {/* Linked Assets */}
                    <TableCell className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                      {(group?.assets || []).filter((a: any) => !a?.archived).length}
                    </TableCell>

                    {/* Open Tasks */}
                    <TableCell className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                      {group?.taskCounts?.open > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                          {group?.taskCounts?.open}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {group?.taskCounts?.open}
                        </span>
                      )}
                    </TableCell>

                    {/* Tasks in Progress */}
                    <TableCell className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                      {group?.taskCounts?.inProgress}
                    </TableCell>

                    {/* Tasks Completed */}
                    <TableCell className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                      {group?.taskCounts?.completed}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t("assets.noAssetGroupsFound")}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AssetGroupDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        groupId={selectedGroupId}
      />
    </div>
  );
};

export default GroupsTable;
