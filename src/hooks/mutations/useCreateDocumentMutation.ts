import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { toast } from "sonner";
import type { Document } from "@/types";

interface CreateDocumentData {
  name: string;
  linkedTo: string[];
  visibility: string;
  additionalInformation?: string;
  expirationDate?: Date;
  notificationDate?: Date;
  file?: File;
  buildingId?: string;
}

export const useCreateDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: CreateDocumentData): Promise<Document> => {
      const formData = new FormData();

      formData.append("name", documentData.name);
      documentData.linkedTo.forEach((id) => formData.append("linkedTo", id));
      formData.append("visibility", documentData.visibility);

      if (documentData.additionalInformation) {
        formData.append(
          "additionalInformation",
          documentData.additionalInformation,
        );
      }
      if (documentData.expirationDate) {
        const expDate = new Date(documentData.expirationDate);
        expDate.setHours(12, 0, 0, 0);
        formData.append("expirationDate", expDate.toISOString());
      }
      if (documentData.notificationDate) {
        const notifDate = new Date(documentData.notificationDate);
        notifDate.setHours(12, 0, 0, 0);
        formData.append("notificationDate", notifDate.toISOString());
      }
      if (documentData.file) {
        formData.append("file", documentData.file);
      }
      if (documentData.buildingId) {
        formData.append("buildingId", documentData.buildingId);
      }

      const response = await apiService.post<Document>(
        endpoints.documents,
        formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Failed to upload document";
      toast.error("Error", {
        description: errorMsg,
      });
    },
  });
};
