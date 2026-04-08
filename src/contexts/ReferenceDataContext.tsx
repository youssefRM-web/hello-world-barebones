import React, { createContext, useContext } from "react";
import { useReferenceData as useReferenceDataHook } from "@/hooks/useReferenceData";
import type {
  User,
  Category,
  Building,
  AcceptedTasks,
  Space,
  Organization,
  Asset,
  Issue,
  Document,
} from "@/types";
import { Group } from "@/hooks/queries/useGroupsQuery";

interface ReferenceData {
  users: User[];
  categories: Category[];
  buildings: Building[];
  acceptedTasks: AcceptedTasks[];
  spaces: Space[];
  assets: Asset[];
  issues: Issue[];
  documents: Document[];
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  organizations: Organization[];
  refreshData: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshSpaces: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  checkOrganization: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  refreshBuildings: () => Promise<void>;
  refreshIssues: () => Promise<void>;
  fetchBuildings: () => Promise<void>;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
}

const ReferenceDataContext = createContext<ReferenceData | undefined>(
  undefined
);

export const useReferenceData = () => {
  const context = useContext(ReferenceDataContext);
  if (!context) {
    throw new Error(
      "useReferenceData must be used within a ReferenceDataProvider"
    );
  }
  return context;
};

export const ReferenceDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const referenceData = useReferenceDataHook();

  const value: ReferenceData = {
    ...referenceData,
    fetchBuildings: referenceData?.refreshData,
  };

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
};
