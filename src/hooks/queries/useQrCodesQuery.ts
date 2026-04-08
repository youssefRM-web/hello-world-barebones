import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

interface QrCodeImage {
  url: string;
  itemId: string;
  itemName: string;
  itemType: string;
  size: string;
  _id: string;
}

interface QrCodeData {
  _id: string;
  fileUrl: string;
  spaces: string[];
  assets: string[];
  images: QrCodeImage[];
  organizationId: string;
  buildingId: string;
  createdAt: string;
  updatedAt: string;
}

export const useQrCodesQuery = (buildingId?: string | null, fetchAll: boolean = false) => {
  return useQuery({
    queryKey: ["qrCodes", buildingId, fetchAll],
    queryFn: async () => {
      // If fetchAll is true or no buildingId, fetch all QR codes for the organization
      const url = buildingId && !fetchAll ? `/qr-codes?buildingId=${buildingId}` : "/qr-codes";
      const response = await apiService.get<QrCodeData[]>(url);
      return response.data;
    },
    enabled: fetchAll || !!buildingId,
  });
};

export const useQrCodesForItem = (
  itemId: string,
  itemType: "space" | "asset",
  buildingId?: string
) => {
  // Always fetch for the specific building if provided
  const { data: allQrCodes = [], ...rest } = useQrCodesQuery(buildingId, !buildingId);

  // Filter QR codes that contain this item
  const qrCodes = allQrCodes.filter((qr) => {
    if (itemType === "space") {
      return (
        qr.spaces?.includes(itemId) ||
        qr.images?.some(
          (img) => img.itemId === itemId && img.itemType === "space"
        )
      );
    } else {
      return (
        qr.assets?.includes(itemId) ||
        qr.images?.some(
          (img) => img.itemId === itemId && img.itemType === "asset"
        )
      );
    }
  });

  // Count QR codes for this item
  const qrCodeCount = qrCodes.reduce((count, qr) => {
    return count + qr.images.filter((img) => img.itemId === itemId).length;
  }, 0);

  return {
    qrCodes,
    qrCodeCount,
    ...rest,
  };
};