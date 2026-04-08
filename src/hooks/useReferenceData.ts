import { useState, useEffect } from "react";
import { apiService, endpoints } from "@/services/api";
import type {
  User,
  Building,
  Space,
  Organization,
  AcceptedTasks,
  Category,
  Asset,
  Issue,
  Document,
} from "@/types";
import { useCurrentUserQuery } from "./queries/useCurrentUserQuery";
import { Group } from "./queries/useGroupsQuery";

interface ReferenceDataState {
  users: User[];
  categories: Category[];
  buildings: Building[];
  acceptedTasks: AcceptedTasks[];
  spaces: Space[];
  assets: Asset[];
  issues: Issue[];
  groups: Group[];
  documents: Document[];
  organizations: Organization[];
  hasOrganization: boolean | null;
  isLoading: boolean;
  error: string | null;
}

export const useReferenceData = () => {
  const [state, setState] = useState<ReferenceDataState>({
    users: [],
    categories: [],
    buildings: [],
    acceptedTasks: [],
    spaces: [],
    assets: [],
    issues: [],
    documents: [],
    organizations: [],
    groups: [],
    hasOrganization: null,
    isLoading: true,
    error: null,
  });

  const { data: currentUser } = useCurrentUserQuery();

  /**
   * Generic loader to reduce boilerplate
   */
  const fetchData = async <T>(
    url: string,
    key: keyof ReferenceDataState
  ): Promise<T[]> => {
    const response = await apiService.get<T[]>(url);
    setState((prev) => ({ ...prev, [key]: response.data }));
    return response.data;
  };

  /**
   * Check if user has an organization
   */
  const checkOrganization = async () => {
    if (!currentUser?.Organization_id?._id) {
      setState((prev) => ({ ...prev, hasOrganization: false }));
      return;
    }

    try {
      const response = await apiService.get<Organization>(
        `${endpoints.organizations}/${currentUser.Organization_id._id}`
      );

      setState((prev) => ({
        ...prev,
        hasOrganization: !!response.data,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, hasOrganization: false }));
    }
  };

  /**
   * Update a single asset in state without refetching all data
   */
  const updateAsset = (assetId: string, updates: Partial<Asset>) => {
    setState((prev) => ({
      ...prev,
      assets: prev.assets.map((asset) =>
        asset._id === assetId ? { ...asset, ...updates } : asset
      ),
    }));
  };

  /**
   * Update a single category in state without refetching all data
   */
  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category._id === categoryId ? { ...category, ...updates } : category
      ),
    }));
  };

  /**
   * Refresh only categories without triggering global loading state
   */
  const refreshCategories = async () => {
    try {
      const response = await apiService.get<Category[]>(endpoints.categories);
      setState((prev) => ({ ...prev, categories: response.data }));
    } catch (err) {
      console.error("Error refreshing categories:", err);
    }
  };
  const refreshAssets = async () => {
    try {
      const response = await apiService.get<Asset[]>(endpoints.assets);
      setState((prev) => ({ ...prev, assets: response.data }));
    } catch (err) {
      console.error("Error refreshing assets:", err);
    }
  };

  const refreshSpaces = async () => {
    try {
      const response = await apiService.get<Space[]>(endpoints.spaces);
      setState((prev) => ({ ...prev, spaces: response.data }));
    } catch (err) {
      console.error("Error refreshing spaces:", err);
    }
  };

  const refreshDocuments = async () => {
    try {
      const response = await apiService.get<Document[]>(endpoints.documents);
      setState((prev) => ({ ...prev, documents: response.data }));
    } catch (err) {
      console.error("Error refreshing documents:", err);
    }
  };

  const refreshIssues = async () => {
    if (!currentUser?.Organization_id?._id) return;
    try {
      const response = await apiService.get<any>(
        `/issue/organization/${currentUser.Organization_id._id}?limit=1000`
      );
      // Handle both paginated { data: [] } and plain array responses
      const issues = response.data?.data || response.data || [];
      setState((prev) => ({ ...prev, issues }));
    } catch (err) {
      console.error("Error refreshing issues:", err);
    }
  };

  const refreshBuildings = async () => {
    if (!currentUser?.Organization_id?._id) return;
    try {
      const response = await apiService.get<any>(
        `/building/by-user/${currentUser._id}`
      );
      // Handle both paginated { data: [] } and plain array responses
      const buildings = response.data?.data || response.data || [];
      setState((prev) => ({ ...prev, buildings }));
    } catch (err) {
      console.error("Error refreshing buildings:", err);
    }
  };

  /**
   * Refresh all data in parallel
   */
  const refreshData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const promises: Promise<any>[] = [
        fetchData<User>(
          currentUser?.Organization_id?._id
            ? `/user/organization/${currentUser.Organization_id._id}`
            : endpoints.users,
          "users"
        ),
        fetchData<Category>(endpoints.categories, "categories"),
        // fetchData<Organization>(endpoints.organizations, "organizations"),
        fetchData<Space>(endpoints.spaces, "spaces"),
        fetchData<Asset>(endpoints.assets, "assets"),
        // fetchData<Document>(endpoints.documents, "documents"),
        // fetchData<AcceptedTasks>(endpoints.acceptedTasks, "acceptedTasks"),
        fetchData<Group>(endpoints.groups, "groups"),
      ];

      if (currentUser?._id) {
        // Handle paginated response for buildings
        promises.push(
          (async () => {
            const response = await apiService.get<any>(
              `${endpoints.buildings}/by-user/${currentUser._id}?limit=100&archived=false`
            );
            // Handle both paginated { data: [] } and plain array responses
            const buildings = response.data?.data || response.data || [];
            setState((prev) => ({ ...prev, buildings }));
            return buildings;
          })()
        );
      }

      // Fetch issues by organization - handle paginated response
      if (currentUser?.Organization_id?._id) {
        promises.push(
          (async () => {
            const response = await apiService.get<any>(
              `/issue/organization/${currentUser.Organization_id._id}?limit=1000`
            );
            // Handle both paginated { data: [] } and plain array responses
            const issues = response.data?.data || response.data || [];
            setState((prev) => ({ ...prev, issues }));
            return issues;
          })()
        );
      }

      await Promise.all(promises);

      // after fetching, check organization status
      await checkOrganization();
    } catch (err: any) {
      console.error("Error loading reference data:", err);
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : "Failed to load reference data",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      refreshData();
    }
  }, [currentUser?._id]);

  return {
    ...state,
    refreshData,
    refreshCategories,
    checkOrganization,
    updateAsset,
    updateCategory,
    refreshAssets,
    refreshSpaces,
    refreshDocuments,
    refreshBuildings,
    refreshIssues,
  };
};
