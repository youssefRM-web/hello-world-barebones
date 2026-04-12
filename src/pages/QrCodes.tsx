import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  QrCode,
  Download,
  Trash2,
  MapPin,
  Eye,
  RotateCcw,
  QrCodeIcon,
  Plus,
} from "lucide-react";
import QrGenerateModal from "@/components/QrCodeGroup/QrGenerateModal";
import PrintingInstructionsModal from "@/components/QrCodeGroup/PrintingInstructionsModal";
import DeleteQrCodeModal from "@/components/QrCodeGroup/DeleteQrCodeModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiUrl } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { formatDate } from "@/utils/dateUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface QrCodeData {
  _id: string;
  fileUrl: string;
  spaces: string[];
  assets: string[];
  spaceFormat: string;
  assetFormat: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  buildingId: {
    _id: string;
    label: string;
  };
}

const QrCodes = () => {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPrintingInfoOpen, setIsPrintingInfoOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<QrCodeData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrCodes, setQrCodes] = useState<QrCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [spaceFilter, setSpaceFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const { toast } = useToast();
  const { refreshAssets, refreshSpaces } = useReferenceData();
  const { selectedBuilding } = useBuilding();
  const { t } = useLanguage();

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      const token = JSON.parse(
        localStorage.getItem("userInfo") || "{}",
      )?.accessToken;
      const response = await fetch(`${apiUrl}/qr-codes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch QR codes");
      }

      setQrCodes(data);
    } catch (error: any) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileUrl: string, id: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-codes-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: t("qrCodes.title"),
        description: t("qrCodes.downloadSuccess"),
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error downloading QR codes:", error);
      toast({
        title: t("qrCodes.error"),
        description: t("qrCodes.downloadFailed"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (qrCode: QrCodeData) => {
    setSelectedQrCode(qrCode);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQrCode) return;

    setIsDeleting(true);
    try {
      const token = JSON.parse(
        localStorage.getItem("userInfo") || "{}",
      )?.accessToken;
      const response = await fetch(`${apiUrl}/qr-codes/${selectedQrCode._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete QR code");
      }

      toast({
        title: t("qrCodes.title"),
        description: t("qrCodes.deleteSuccess"),
        variant: "success",
      });

      setQrCodes((prev) => prev.filter((qr) => qr._id !== selectedQrCode._id));
      setIsDeleteModalOpen(false);
      setSelectedQrCode(null);
    } catch (error: any) {
      console.error("Error deleting QR code:", error);
      toast({
        title: t("qrCodes.error"),
        description: error.message || t("qrCodes.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
      await refreshSpaces();
      setIsDeleting(false);
    }
  };

  const handleRestoreQrCode = async (qrCodeId: string) => {
    setRestoringId(qrCodeId);
    try {
      const token = JSON.parse(
        localStorage.getItem("userInfo") || "{}",
      )?.accessToken;
      const response = await fetch(`${apiUrl}/qr-codes/${qrCodeId}/unarchive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to restore QR code");
      }

      toast({
        title: t("qrCodes.title"),
        description: t("qrCodes.restoreSuccess"),
        variant: "success",
      });

      // Update the local state
      setQrCodes((prev) =>
        prev.map((qr) =>
          qr._id === qrCodeId ? { ...qr, archived: false } : qr,
        ),
      );
    } catch (error: any) {
      console.error("Error restoring QR code:", error);
      toast({
        title: t("qrCodes.error"),
        description: error.message || t("qrCodes.restoreFailed"),
        variant: "destructive",
      });
    } finally {
      setRestoringId(null);
    }
  };

  // Filter QR codes by selected building from sidebar first
  const sidebarFilteredQrCodes = selectedBuilding
    ? qrCodes.filter((qr) => qr.buildingId?._id === selectedBuilding._id)
    : qrCodes;

  // Get unique buildings for filter dropdown (from sidebar-filtered codes)
  const uniqueBuildings = Array.from(
    new Set(sidebarFilteredQrCodes.map((qr) => qr.buildingId?.label).filter(Boolean)),
  );

  // Filter QR codes based on search and filters
  const filterQrCodes = (codes: QrCodeData[]) => {
    return codes.filter((qr) => {
      // Search filter - search in building name
      const matchesSearch =
        !searchQuery ||
        qr.buildingId?.label?.toLowerCase().includes(searchQuery.toLowerCase());

      // Building filter (dropdown within the page)
      const matchesBuilding =
        buildingFilter === "all" || qr.buildingId?.label === buildingFilter;

      // Space filter (has spaces or not)
      const matchesSpace =
        spaceFilter === "all" ||
        (spaceFilter === "with-spaces" && qr.spaces?.length > 0) ||
        (spaceFilter === "no-spaces" && (!qr.spaces || qr.spaces.length === 0));

      // Asset filter (has assets or not)
      const matchesAsset =
        assetFilter === "all" ||
        (assetFilter === "with-assets" && qr.assets?.length > 0) ||
        (assetFilter === "no-assets" && (!qr.assets || qr.assets.length === 0));

      return matchesSearch && matchesBuilding && matchesSpace && matchesAsset;
    });
  };

  const activeQrCodes = filterQrCodes(sidebarFilteredQrCodes.filter((qr) => !qr.archived));
  const archivedQrCodes = filterQrCodes(sidebarFilteredQrCodes.filter((qr) => qr.archived));

  const tabs = [
    { name: "active", label: t("qrCodes.activeQrCodes") },
    { name: "archived", label: t("qrCodes.archivedQrCodes") },
  ];

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-8 w-8 mx-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </TableCell>
    </TableRow>
  );

  const renderQrCodesTable = (codes: QrCodeData[], isArchived: boolean) => (
    <div className="border border-border/50 rounded-xl shadow-sm bg-card">
    <div className="overflow-auto max-h-[calc(100vh-320px)]">
    <table className="w-full text-sm">
      <thead className="bg-gradient-to-r from-muted/50 to-muted/20 sticky top-0 z-10 [&_tr]:border-b [&_tr]:border-border/50">
        <TableRow>
          <TableHead className="w-16"></TableHead>
          <TableHead>{t("qrCodes.generatedOn")}</TableHead>
          <TableHead>{t("qrCodes.building")}</TableHead>
          <TableHead>{t("qrCodes.spaces")}</TableHead>
          <TableHead>{t("qrCodes.assets")}</TableHead>
          <TableHead className="w-[150px] text-right">{t("qrCodes.actions")}</TableHead>
        </TableRow>
      </thead>

      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))
        ) : codes.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center py-8 text-muted-foreground"
            >
              <QrCodeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              {isArchived
                ? t("qrCodes.noArchivedQrCodes")
                : t("qrCodes.noQrCodesGenerated")}
            </TableCell>
          </TableRow>
        ) : (
          codes.map((qrCode) => (
            <TableRow
              key={qrCode?._id}
              className={`hover:bg-accent/50 ${isArchived ? "opacity-75" : ""}`}
            >
              <TableCell style={{ paddingLeft: "1.2rem" }}>
                <div className="flex items-center justify-center">
                  <div className="bg-[#F1F5FE] w-10 h-10 rounded-md flex items-center justify-center">
                    <QrCode className="w-6 h-6" color="#4D81ED" />
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm font-medium text-foreground">
                {formatDate(qrCode?.createdAt)}
              </TableCell>

              <TableCell className="text-sm text-foreground first-letter:uppercase">
                {qrCode?.buildingId?.label}
              </TableCell>

              <TableCell className="text-sm text-foreground">
                {qrCode?.spaces?.length}
              </TableCell>

              <TableCell className="text-sm text-foreground">
                {qrCode?.assets?.length}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {isArchived ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRestoreQrCode(qrCode._id)}
                      disabled={restoringId === qrCode._id}
                      className="text-primary hover:text-primary/80"
                    >
                      <RotateCcw
                        className={`w-4 h-4 ${restoringId === qrCode._id ? "animate-spin" : ""}`}
                      />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="text-white"
                        onClick={() =>
                          handleDownload(qrCode.fileUrl, qrCode._id)
                        }
                      >
                        {t("qrCodes.download")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(qrCode)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </table>
    </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 pb-0 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            {t("qrCodes.title")}
          </h1>
        </div>
        <div className="flex flex-row items-stretch xs:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 text-sm"
            onClick={() => setIsPrintingInfoOpen(true)}
          >
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:flex">{t("qrCodes.printingInformations")}</span>
          </Button>
          <Button
            size="lg"
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1"
            data-onboarding-target="generate-qr"
          >
            <Plus className="h-4 w-4" />
            {t("qrCodes.generate")}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="block sm:hidden">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full relative">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>
                  {activeTab === "active"
                    ? t("qrCodes.activeQrCodes")
                    : t("qrCodes.archivedQrCodes")}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.name} value={tab.name}>
                <div className="flex items-center gap-2">
                  <span>{tab.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:flex items-center gap-2 lg:gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.name
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 my-6 mb-0">
          <Input
            placeholder={t("qrCodes.search")}
            className="w-full sm:max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="grid grid-cols-3 sm:flex gap-2 sm:gap-4">
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-full sm:w-32 lg:w-40 relative hover:bg-accent/50">
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("qrCodes.allBuildings")}</SelectItem>
                {uniqueBuildings.map((building) => (
                  <SelectItem key={building} value={building!}>
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={spaceFilter} onValueChange={setSpaceFilter}>
              <SelectTrigger className="w-full sm:w-32 lg:w-40 relative hover:bg-accent/50">
                <SelectValue placeholder="Space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("qrCodes.allSpaces")}</SelectItem>
                <SelectItem value="with-spaces">{t("qrCodes.withSpaces")}</SelectItem>
                <SelectItem value="no-spaces">{t("qrCodes.noSpaces")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="w-full sm:w-32 lg:w-40 relative hover:bg-accent/50">
                <SelectValue placeholder="Asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("qrCodes.allAssets")}</SelectItem>
                <SelectItem value="with-assets">{t("qrCodes.withAssets")}</SelectItem>
                <SelectItem value="no-assets">{t("qrCodes.noAssets")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
        {activeTab === "active" && (
          <div className="rounded-lg">
            {renderQrCodesTable(activeQrCodes, false)}
          </div>
        )}

        {activeTab === "archived" && (
          <div className="rounded-lg">
            {renderQrCodesTable(archivedQrCodes, true)}
          </div>
        )}
      </div>
      <QrGenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false);
          fetchQrCodes();
        }}
      />

      <DeleteQrCodeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedQrCode(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <PrintingInstructionsModal
        isOpen={isPrintingInfoOpen}
        onClose={() => setIsPrintingInfoOpen(false)}
      />
    </div>
  );
};

export default QrCodes;
