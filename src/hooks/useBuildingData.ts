import { useMemo } from "react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { usePermissions } from "@/contexts/PermissionsContext";

export const useBuildingData = () => {
  const { selectedBuilding } = useBuilding();
  const { spaces, assets, acceptedTasks, issues } = useReferenceData();
  const { isAdmin, getPermittedBuildingIds } = usePermissions();

  const buildingSpecificData = useMemo(() => {
    if (selectedBuilding) {
      // Specific building selected → filter by that building (existing logic)
      const buildingId = selectedBuilding._id;

      const filteredSpaces = spaces.filter((space) => space.building_id._id === buildingId);
      const filteredAssets = assets.filter((asset) => asset.building_id._id === buildingId);
      const filteredAcceptedTasks = acceptedTasks.filter((task) => task.Building_id === buildingId);
      const filteredIssues = issues.filter((issue) => issue.buildingId?._id === buildingId);

      return { filteredSpaces, filteredAssets, filteredAcceptedTasks, filteredIssues, spaces };
    }

    // "All Buildings" selected
    if (isAdmin) {
      // Admin sees everything
      return {
        filteredSpaces: spaces,
        filteredAssets: assets,
        filteredAcceptedTasks: acceptedTasks,
        filteredIssues: issues,
      };
    }

    // Non-admin "All Buildings": filter each data type by permitted buildings for that section
    const spacesBuildingIds = getPermittedBuildingIds("spaces");
    const assetsBuildingIds = getPermittedBuildingIds("assets");
    const boardBuildingIds = getPermittedBuildingIds("board");
    const issuesBuildingIds = getPermittedBuildingIds("issues");

    const filteredSpaces = spaces.filter((space) => spacesBuildingIds.includes(space.building_id._id));
    const filteredAssets = assets.filter((asset) => assetsBuildingIds.includes(asset.building_id._id));
    const filteredAcceptedTasks = acceptedTasks.filter((task) => {
      const taskBuildingId = typeof task.Building_id === "object" && task.Building_id
        ? (task.Building_id as any)._id
        : task.Building_id;
      return boardBuildingIds.includes(taskBuildingId);
    });
    const filteredIssues = issues.filter((issue) => issuesBuildingIds.includes(issue.buildingId?._id));

    return {
      filteredSpaces,
      filteredAssets,
      filteredAcceptedTasks,
      filteredIssues,
      spaces,
    };
  }, [selectedBuilding, spaces, assets, acceptedTasks, issues, isAdmin, getPermittedBuildingIds]);

  return {
    selectedBuilding,
    ...buildingSpecificData,
  };
};
