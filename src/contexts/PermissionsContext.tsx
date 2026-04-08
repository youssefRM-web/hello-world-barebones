import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Permissions } from "@/types";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useBuilding } from "@/contexts/BuildingContext";

interface PermissionsContextType {
  permissions: Permissions;
  hasPermission: (section: keyof Permissions, action?: string) => boolean;
  canAccess: (section: keyof Permissions) => boolean;
  isAdmin: boolean;
  isLoading: boolean;
  getPermittedBuildingIds: (section: keyof Permissions) => string[];
}

const defaultPermissions: Permissions = {
  issues: { accessNewIssues: false, acceptDeclineNewIssues: false },
  board: { accessTicketBoard: false, createTickets: false, manageOwnTickets: false, editTimeLog: false, editMaterialLog: false },
  tasks: { accessTasks: false, createTasks: false, updateTasks: false, deleteTasks: false },
  spaces: { accessSpaces: false, createSpaces: false, updateSpaces: false, deleteSpaces: false },
  assets: { accessAssets: false, createAssets: false, updateAssets: false, deleteAssets: false },
  documents: { accessDocuments: false, createDocuments: false, updateDocuments: false, deleteDocuments: false },
  insights: { accessInsights: false },
  qrCodes: { accessQRCodes: false, createQRCodes: false },
  organisation: { accessOrganisation: false, manageSubscription: false, manageBillingPayment: false, manageInvoices: false, manageUsers: false, manageSettings: false },
  buildings: { manageBuildings: false, manageCategories: false, manageReportFlow: false },
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};

const getPrimaryAccessKey = (section: keyof Permissions): string | null => {
  switch (section) {
    case "issues": return "accessNewIssues";
    case "board": return "accessTicketBoard";
    case "tasks": return "accessTasks";
    case "spaces": return "accessSpaces";
    case "assets": return "accessAssets";
    case "documents": return "accessDocuments";
    case "insights": return "accessInsights";
    case "qrCodes": return "accessQRCodes";
    case "organisation": return "accessOrganisation";
    case "buildings": return "manageBuildings";
    default: return null;
  }
};

const mergePermissions = (a: Permissions, b: Permissions): Permissions => {
  const result = { ...defaultPermissions };
  for (const section of Object.keys(result) as (keyof Permissions)[]) {
    const merged: any = { ...(result[section] as any) };
    const aSection = a[section] as any;
    const bSection = b[section] as any;
    for (const key of Object.keys(merged)) {
      merged[key] = !!(aSection?.[key]) || !!(bSection?.[key]);
    }
    (result as any)[section] = merged;
  }
  return result;
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: currentUser } = useCurrentUserQuery();
  const { selectedBuilding } = useBuilding();
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = Array.isArray(currentUser?.Roles) && currentUser.Roles[0]?.toLowerCase() === "manager";

  useEffect(() => {
    setIsLoading(true);

    if (!currentUser) {
      setPermissions(defaultPermissions);
      setIsLoading(false);
      return;
    }

    if (isAdmin) {
      setPermissions(currentUser.permissions);
    } else {
      const buildingPerms = currentUser.buildingPermissions;

      if (buildingPerms && buildingPerms.length > 0) {
        if (selectedBuilding) {
          const selectedBuildingId = typeof selectedBuilding === 'string'
            ? selectedBuilding
            : (selectedBuilding as any)?._id;
          const bp = buildingPerms.find(
            (bp) => (bp.buildingId as any)?._id === selectedBuildingId || bp.buildingId === selectedBuildingId
          );
          setPermissions(bp?.permissions || defaultPermissions);
        } else {
          // "All Buildings" → aggregate with OR across all building permissions
          let aggregated = { ...defaultPermissions };
          for (const bp of buildingPerms) {
            if (bp.permissions) {
              aggregated = mergePermissions(aggregated, bp.permissions);
            }
          }
          setPermissions(aggregated);
        }
      } else if (currentUser.permissions) {
        setPermissions(currentUser.permissions);
      } else {
        setPermissions(defaultPermissions);
      }
    }

    setIsLoading(false);
  }, [currentUser, isAdmin, selectedBuilding]);

  const getPermittedBuildingIds = useCallback((section: keyof Permissions): string[] => {
    if (isAdmin) return []; // empty = all for admin
    const buildingPerms = currentUser?.buildingPermissions;
    if (!buildingPerms || buildingPerms.length === 0) return [];
    const accessKey = getPrimaryAccessKey(section);
    if (!accessKey) return [];

    return buildingPerms
      .filter((bp) => {
        const sectionPerms = bp.permissions?.[section] as any;
        return sectionPerms?.[accessKey] === true;
      })
      .map((bp) => ((bp.buildingId as any)?._id || bp.buildingId) as string);
  }, [currentUser, isAdmin]);

  const hasPermission = (section: keyof Permissions, action?: string): boolean => {
    if (isAdmin) return true;
    const sectionPermissions = permissions[section] as any;
    if (!sectionPermissions) return false;
    if (!action) return Object.values(sectionPermissions).some(Boolean);
    return sectionPermissions[action] === true;
  };

  const canAccess = (section: keyof Permissions): boolean => {
    if (isAdmin) return true;
    const accessKey = getPrimaryAccessKey(section);
    if (!accessKey) return false;
    const sectionPerms = permissions[section] as any;
    return sectionPerms?.[accessKey] === true;
  };

  return (
    <PermissionsContext.Provider
      value={{ permissions, hasPermission, canAccess, isAdmin, isLoading, getPermittedBuildingIds }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};
