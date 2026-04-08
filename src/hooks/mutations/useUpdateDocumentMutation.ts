import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, endpoints } from "@/services/api";
import { toast } from "sonner";
import type { Document } from "@/types";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpdateDocumentData {
  name?: string;
  linkedTo?: string[];
  visibility?: string;
  additionalInformation?: string;
  expirationDate?: Date | null;
  notificationDate?: Date | null;
}

export const useUpdateDocumentMutation = () => {
  const queryClient = useQueryClient();
  const {refreshData} = useReferenceData()
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async ({
      documentId,
      data,
    }: {
      documentId: string;
      data: UpdateDocumentData;
    }): Promise<Document> => {
      const formData: any = {};

      if (data.name !== undefined) formData.name = data.name;
      if (data.linkedTo !== undefined) formData.linkedTo = data.linkedTo;
      if (data.visibility !== undefined) formData.visibility = data.visibility;
      if (data.additionalInformation !== undefined)
        formData.additionalInformation = data.additionalInformation;
      if (data.expirationDate !== undefined)
        formData.expirationDate = data.expirationDate
          ? data.expirationDate.toISOString()
          : null;
      if (data.notificationDate !== undefined)
        formData.notificationDate = data.notificationDate
          ? data.notificationDate.toISOString()
          : null;

      const response = await apiService.patch<Document>(
        `${endpoints.documents}/${documentId}`,
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["referenceData"] });
      refreshData()
      toast.success(t("documents.title"), {
        description: t("documents.succ"),
      });
    },
    onError: (error: any) => {
      const errorMsg =
        t("documents.fail");
      toast.error("Error", {
        description: errorMsg,
      });
    },
  });
};
