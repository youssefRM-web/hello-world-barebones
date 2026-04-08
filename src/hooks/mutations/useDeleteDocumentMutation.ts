import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { toast } from "sonner";

interface DeleteDocumentParams {
  documentId: string;
  linkedToId?: string;
  linkedToType?: string;
}

export const useDeleteDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, linkedToId, linkedToType }: DeleteDocumentParams): Promise<void> => {
      await apiService.delete(`${endpoints.documents}/${documentId}`, {
        data: { linkedToId, linkedToType },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
      
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to delete document";
      toast.error("Error", {
        description: errorMsg,
      });
    },
  });
};
