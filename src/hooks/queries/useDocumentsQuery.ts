import { useQuery } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import type { Document } from "@/types";

export const useDocumentsQuery = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<Document[]> => {
      const response = await apiService.get<Document[]>(endpoints.documents);
      return response.data || [];
    },
  });
};