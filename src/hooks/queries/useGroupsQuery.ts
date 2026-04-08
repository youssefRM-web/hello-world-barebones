import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";

export interface Group {
  _id: string;
  name: string;
  description: string;
  assets: any[];
  spaces: any[];
  status: string;
  createdAt: string;
  updatedAt: string;
  belongTo : string;
  taskCounts: {
    open: number;
    inProgress: number;
    completed: number;
  };
}

export const useGroupsQuery = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiService.get<Group[]>(endpoints.groups);
      return response.data;
    },
  });
};

export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      assets?: string[];
      spaces?: string[];
      belongTo?: string;
    }) => {
      const response = await apiService.post(endpoints.groups, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiService.delete(
        `${endpoints.groups}/${groupId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};
