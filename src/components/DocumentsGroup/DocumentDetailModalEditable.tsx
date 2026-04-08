import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  Trash2,
  Download,
  Calendar,
  Eye,
  ChevronUp,
  ChevronDown,
  Info,
  Home,
  DoorClosed,
  Package,
  Clock,
  FileText,
  Edit,
  Printer,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { LinkDocumentModal } from "./LinkDocumentModal";
import { TaskDatePicker } from "@/components/TasksGroup/TaskDatePicker";
import type { Document } from "@/types";
import { useUpdateDocumentMutation } from "@/hooks/mutations";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

import pdficon from "./assets/pdfIcon.png";
import docxIcon from "./assets/docxIcon.png";
import xlsxIcon from "./assets/xlsx.png";
import imageIcon from "./assets/imgIcon.png";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { usePermissions } from "@/contexts/PermissionsContext";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={pdficon} alt="PDF" />
        </div>
      );
    case "doc":
    case "docx":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={docxIcon} alt="DOCX" />
        </div>
      );
    case "xlsx":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={xlsxIcon} alt="XLSX" />
        </div>
      );
    case "jpeg":
    case "png":
    case "webp":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={fileName} alt="Image" />
        </div>
      );
    case "txt":
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <FileText className="w-5 h-5 text-gray-600" />
        </div>
      );
    default:
      return <FileText className="w-5 h-5 text-gray-600" />;
  }
};

interface DocumentDetailModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

export function DocumentDetailModalEditable({
  document,
  open,
  onOpenChange,
  readOnly = false,
}: DocumentDetailModalProps) {
  const { t } = useLanguage();
  const { hasPermission, isAdmin } = usePermissions();
  const updateDocumentMutation = useUpdateDocumentMutation();
  const { refreshSpaces, refreshAssets, refreshDocuments } = useReferenceData();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState(
    document?.fileUrls || "",
  );
  const canEdit = !readOnly && hasPermission("documents", "updateDocuments");
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(
    new Set(),
  );

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingExpiration, setIsEditingExpiration] = useState(false);
  const [isEditingNotification, setIsEditingNotification] = useState(false);
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);

  // Edited values
  const [editedName, setEditedName] = useState(document?.name || "");
  const [editedInfo, setEditedInfo] = useState(
    document?.additionalInformation || "",
  );
  const [editedExpiration, setEditedExpiration] = useState<Date | undefined>(
    document?.expirationDate ? new Date(document.expirationDate) : undefined,
  );
  const [editedNotification, setEditedNotification] = useState<
    Date | undefined
  >(
    document?.notificationDate
      ? new Date(document.notificationDate)
      : undefined,
  );
  const [editedVisibility, setEditedVisibility] = useState(
    document?.visibility || "private",
  );
  const [linkedItems, setLinkedItems] = useState(document?.linkedTo || []);

  useEffect(() => {
    if (document) {
      setEditedName(document.name || "");
      setEditedInfo(document.additionalInformation || "");
      setEditedExpiration(
        document.expirationDate ? new Date(document.expirationDate) : undefined,
      );
      setEditedNotification(
        document.notificationDate
          ? new Date(document.notificationDate)
          : undefined,
      );
      setEditedVisibility(document.visibility || "private");
      setLinkedItems(document.linkedTo || []);
      setCurrentFileUrl(document.fileUrls || "");
    }
  }, [document]);

  const toggleBuilding = (buildingName: string) => {
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(buildingName)) {
      newExpanded.delete(buildingName);
    } else {
      newExpanded.add(buildingName);
    }
    setExpandedBuildings(newExpanded);
  };

  if (!document) return null;

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const groupByBuilding = (linkedTo: Document["linkedTo"]) => {
    if (!linkedTo || linkedTo.length === 0) return {};
    const grouped: Record<string, typeof linkedTo> = {};
    linkedTo.forEach((link) => {
      const buildingName = link.building.name;
      if (!grouped[buildingName]) {
        grouped[buildingName] = [];
      }
      grouped[buildingName].push(link);
    });
    return grouped;
  };

  const handleSaveName = async () => {
    setIsUpdating(true);
    try {
      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { name: editedName },
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      await refreshDocuments();
      setIsUpdating(false);
    }
  };

  const handleSaveInfo = async () => {
    setIsUpdating(true);
    try {
      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { additionalInformation: editedInfo },
      });
      setIsEditingInfo(false);
    } catch (error) {
      console.error("Error updating info:", error);
    } finally {
      await refreshDocuments();
      setIsUpdating(false);
    }
  };

  const handleSaveExpiration = async () => {
    setIsUpdating(true);
    try {
      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { expirationDate: editedExpiration || null },
      });
      setIsEditingExpiration(false);
    } catch (error) {
      console.error("Error updating expiration:", error);
    } finally {
      await refreshDocuments();
      setIsUpdating(false);
    }
  };

  const handleSaveNotification = async () => {
    setIsUpdating(true);
    try {
      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { notificationDate: editedNotification || null },
      });
      setIsEditingNotification(false);
    } catch (error) {
      console.error("Error updating notification:", error);
    } finally {
      await refreshDocuments();
      setIsUpdating(false);
    }
  };

  const handleSaveVisibility = async () => {
    setIsUpdating(true);
    try {
      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { visibility: editedVisibility },
      });
      setIsEditingVisibility(false);
    } catch (error) {
      console.error("Error updating visibility:", error);
    } finally {
      await refreshDocuments();
      setIsUpdating(false);
    }
  };

  const handleApplyLinks = async (
    links: {
      id: string;
      name: string;
      type: string;
      buildingId?: string;
      buildingName?: string;
    }[],
  ) => {
    const newLinkObjects: Document["linkedTo"] = links
      .filter((l) => !linkedItems.some((existing) => existing._id === l.id))
      .map((l) => ({
        _id: l.id,
        name: l.name,
        type: l.type === "office" ? "space" : l.type,
        building: {
          _id: l.buildingId || "",
          name: l.buildingName || "Unknown Building",
        },
      }));

    setLinkedItems((prev) => [...prev, ...newLinkObjects]);

    try {
      const existingIds = linkedItems.map((item) => item._id);
      const newIds = links.map((link) => link.id);
      const allLinkedIds = [...new Set([...existingIds, ...newIds])];

      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { linkedTo: allLinkedIds },
      });

      setShowLinkModal(false);
    } catch (error) {
      console.error("Error updating links:", error);
    } finally {
      await refreshDocuments();
      await refreshSpaces();
      await refreshAssets();
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    try {
      const updatedLinks = linkedItems.filter((item) => item._id !== linkId);
      const linkedIds = updatedLinks.map((item) => item._id);

      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { linkedTo: linkedIds },
      });

      setLinkedItems(updatedLinks);
    } catch (error) {
      console.error("Error removing link:", error);
    } finally {
      await refreshDocuments();
      await refreshSpaces();
      await refreshAssets();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-md w-full max-h-[95vh] p-0 gap-0 sm:mx-auto flex flex-col">
        {/* Header */}
        <DialogHeader className="space-y-1.5 text-center sm:text-left flex flex-row items-center justify-between p-5 border-b sticky top-0 bg-accent/50 z-10">
          <DialogTitle>{t("documents.documentDetails")}</DialogTitle>
          <div className="flex items-center gap-1" style={{ margin: 0 }}>
            {!readOnly && hasPermission("documents", "deleteDocuments") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
              asChild
            >
              <a
                href={currentFileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4 text-foreground" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 text-foreground" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-5 h-max pb-4 p-6 overflow-y-auto">
          {/* Document Icon and Name */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center relative">
              <div className="w-10 h-10 sm:w-10 sm:h-10 rounded flex items-center justify-center">
                {getFileIcon(currentFileUrl)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-foreground text-sm sm:text-base truncate first-letter:uppercase">
                  {editedName}
                </h3>
                {canEdit && (
                  <button onClick={() => setIsEditingName(true)}>
                    <Edit className="w-4 h-4 cursor-pointer" />
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 first-letter:uppercase">
                {t("documents.createdOn")} {formatDate(document.createdAt)}
              </p>
            </div>

            {/* Floating Edit: Name */}
            {isEditingName && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/20"
                  onClick={() => !isUpdating && setIsEditingName(false)}
                />
                <div className="relative bg-white rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                  <Label className="text-sm font-medium">
                    {t("documents.editDocumentName")}
                  </Label>
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    autoFocus
                    className="mt-3 h-12 font-medium"
                    placeholder={t("documents.enterDocumentName")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditedName(document.name);
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <div className="flex justify-end gap-3 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => {
                        setEditedName(document.name);
                        setIsEditingName(false);
                      }}
                    >
                      {t("documents.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={isUpdating}
                    >
                      {isUpdating && (
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      {t("documents.save")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Open & Replace Buttons */}
          <div className="flex items-center gap-2">
            <Button
              className="w-max bg-[#2E69E8FF] hover:bg-blue-700 text-white"
              size="lg"
              onClick={() => window.open(currentFileUrl, "_blank")}
            >
              {t("documents.open")}
            </Button>
             {canEdit && (
              <>
                <input
                  type="file"
                  id="replace-file-input"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsReplacingFile(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await apiService.patch(
                        `${endpoints.documents}/${document._id}/replace-file`,
                        formData,
                      );
                      // Update the local file URL to reflect the new file immediately
                      const newUrl = (res.data as any)?.fileUrls || (res.data as any)?.document?.fileUrls;
                      if (newUrl) {
                        setCurrentFileUrl(newUrl);
                      }
                      await refreshDocuments();
                      toast.success(t("documents.title"), {
                        description:
                          t("documents.replaceFileSucc") ||
                          "File replaced successfully",
                      });
                    } catch (error) {
                      console.error("Error replacing file:", error);
                      toast.error("Error", {
                        description:
                          t("documents.replaceFileFailed") ||
                          "Failed to replace file",
                      });
                    } finally {
                      setIsReplacingFile(false);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="lg"
                  disabled={isReplacingFile}
                  onClick={() =>
                    window.document
                      .getElementById("replace-file-input")
                      ?.click()
                  }
                >
                  {isReplacingFile ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isReplacingFile
                    ? t("documents.uploading") || "Uploading..."
                    : t("documents.replaceFile") || "Replace File"}
                </Button>
              </>
            )}
          </div>

          {/* Dates Section */}
          <div className="space-y-3 sm:space-y-4 border rounded-md">
            {/* Expiration Date */}
            <div className="flex items-center gap-3 text-sm pt-3 px-3 group">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-foreground flex-1">
                {t("documents.expirationDate")}
              </span>
              <span className="text-foreground font-medium">
                {formatDate(editedExpiration?.toISOString())}
              </span>

              {canEdit && (
                <button onClick={() => setIsEditingExpiration(true)}>
                  <Edit className="w-4 h-4 cursor-pointer" />
                </button>
              )}
            </div>

            {/* Notification Date */}
            <div className="flex items-center gap-3 text-sm px-3 group">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-foreground flex-1">
                {t("documents.notificationDate")}
              </span>
              <span className="text-foreground font-medium">
                {formatDate(editedNotification?.toISOString())}
              </span>

              {canEdit && (
                <button onClick={() => setIsEditingNotification(true)}>
                  <Edit className="w-4 h-4 cursor-pointer" />
                </button>
              )}
            </div>

            {/* Floating Edit: Expiration Date */}
            {isEditingExpiration && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ margin: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/20"
                  onClick={() => !isUpdating && setIsEditingExpiration(false)}
                />
                <div className="relative bg-white rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                  <TaskDatePicker
                    label={t("documents.editExpirationDate")}
                    value={editedExpiration}
                    onChange={setEditedExpiration}
                    placeholder={t("documents.pickExpirationDate")}
                    disablePastDates={true}
                  />
                  <div className="flex justify-end gap-3 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => {
                        setEditedExpiration(
                          document.expirationDate
                            ? new Date(document.expirationDate)
                            : undefined,
                        );
                        setIsEditingExpiration(false);
                      }}
                    >
                      {t("documents.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveExpiration}
                      disabled={isUpdating}
                    >
                      {isUpdating && (
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      {t("documents.save")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Edit: Notification Date */}
            {isEditingNotification && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ margin: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/20"
                  onClick={() => !isUpdating && setIsEditingNotification(false)}
                />
                <div className="relative bg-white rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                  <TaskDatePicker
                    label={t("documents.editNotificationDate")}
                    value={editedNotification}
                    onChange={setEditedNotification}
                    placeholder={
                      editedExpiration
                        ? t("documents.pickNotificationDate")
                        : t("documents.setExpirationFirst")
                    }
                    disabled={!editedExpiration}
                    disablePastDates={true}
                    minDate={
                      document.createdAt
                        ? new Date(document.createdAt)
                        : new Date()
                    }
                    maxDate={
                      editedExpiration
                        ? new Date(editedExpiration.getTime() - 86400000)
                        : undefined
                    }
                  />
                  <div className="flex justify-end gap-3 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => {
                        setEditedNotification(
                          document.notificationDate
                            ? new Date(document.notificationDate)
                            : undefined,
                        );
                        setIsEditingNotification(false);
                      }}
                    >
                      {t("documents.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotification}
                      disabled={isUpdating}
                    >
                      {isUpdating && (
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      {t("documents.save")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs bg-[#F8F9FA] flex gap-2 text-gray-500 leading-relaxed border p-2">
              <Info className="w-6" />
              {t("documents.notificationDateInfo")}
            </div>
          </div>

          {/* Visibility Section */}
          <div className="flex items-center gap-3 text-sm border rounded-md p-3 group">
            <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-foreground flex-1">
              {t("documents.visibility")}
            </span>
            <span className="px-2 py-1 flex gap-2 first-letter:uppercase rounded text-sm font-medium">
              <svg
                className="w-4 h-4"
                fill="#686583"
                id="Flat"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
              >
                <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z" />
              </svg>
              {editedVisibility}
            </span>

            {canEdit && (
              <button onClick={() => setIsEditingVisibility(true)}>
                <Edit className="w-4 h-4 cursor-pointer" />
              </button>
            )}
          </div>

          {/* Floating Edit: Visibility */}
          {isEditingVisibility && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ margin: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/20"
                onClick={() => setIsEditingVisibility(false)}
              />
              <div className="relative bg-white rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <Label className="text-sm font-medium">
                  {t("documents.editVisibility")}
                </Label>
                <div className="mt-3 space-y-2">
                  <button
                    className={`w-full p-3 text-left border rounded-md transition-colors ${
                      editedVisibility === "private"
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setEditedVisibility("private")}
                  >
                    <div className="font-medium">
                      {t("documents.visibilityPrivate")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("documents.privateDesc")}
                    </div>
                  </button>
                  <button
                    className={`w-full p-3 text-left border rounded-md transition-colors ${
                      editedVisibility === "public"
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setEditedVisibility("public")}
                  >
                    <div className="font-medium">
                      {t("documents.visibilityPublic")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("documents.publicDesc")}
                    </div>
                  </button>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => {
                      setEditedVisibility(document.visibility);
                      setIsEditingVisibility(false);
                    }}
                  >
                    {t("documents.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveVisibility}
                    disabled={isUpdating}
                  >
                    {isUpdating && (
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    {t("documents.save")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="group">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">
                {t("documents.additionalInformationLabel")}
              </h4>

              {canEdit && (
                <button onClick={() => setIsEditingInfo(true)}>
                  <Edit className="w-4 h-4 cursor-pointer" />
                </button>
              )}
            </div>
            <p className="text-sm text-foreground border rounded-md p-3">
              {editedInfo || t("documents.noAdditionalInfo")}
            </p>

            {/* Floating Edit: Additional Info */}
            {isEditingInfo && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ margin: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/20"
                  onClick={() => setIsEditingInfo(false)}
                />
                <div className="relative bg-white rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                  <Label className="text-sm font-medium">
                    {t("documents.editAdditionalInfo")}
                  </Label>
                  <Textarea
                    value={editedInfo}
                    onChange={(e) => setEditedInfo(e.target.value)}
                    autoFocus
                    className="mt-3 min-h-[120px]"
                    placeholder={t("documents.enterAdditionalInfo")}
                  />
                  <div className="flex justify-end gap-3 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => {
                        setEditedInfo(document.additionalInformation || "");
                        setIsEditingInfo(false);
                      }}
                    >
                      {t("documents.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveInfo}
                      disabled={isUpdating}
                    >
                      {isUpdating && (
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      {t("documents.save")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Linked to Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                {t("documents.linkedTo")}
              </h4>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 text-xs h-auto p-1"
                  onClick={() => setShowLinkModal(true)}
                >
                  {t("documents.addLinking")}
                </Button>
              )}
            </div>

            {/* Linked Items Grouped by Building */}
            <div className="space-y-2">
              {linkedItems.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">
                  {t("documents.noLinkedItems")}
                </p>
              ) : (
                Object.entries(groupByBuilding(linkedItems)).map(
                  ([buildingName, items]) => (
                    <div key={buildingName} className="space-y-2">
                      <button
                        onClick={() => toggleBuilding(buildingName)}
                        className="w-full first-letter:uppercase flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-600" />
                          <span className="text-sm first-letter:uppercase font-medium text-foreground">
                            {buildingName}
                          </span>
                        </div>
                        {expandedBuildings.has(buildingName) ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </button>

                      {expandedBuildings.has(buildingName) && (
                        <div className="space-y-2 pl-2">
                          {items.map((link, index) => (
                            <div
                              key={index}
                              className="flex items-center first-letter:uppercase justify-between p-2 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {link.type === "space" ? (
                                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                    <DoorClosed className="w-4 h-4 text-blue-600" />
                                  </div>
                                ) : link.type === "asset" ? (
                                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                    <Printer className="w-4 h-4 text-blue-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center">
                                    <Printer className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}
                                <span className="text-sm text-foreground font-medium">
                                  {link.name}
                                </span>
                              </div>
                              {hasPermission(
                                "documents",
                                "updateDocuments",
                              ) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleRemoveLink(link._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {showDeleteModal && (
        <DeleteDocumentModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            onOpenChange(false);
          }}
          document={document}
        />
      )}

      <LinkDocumentModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        onApplyLinks={handleApplyLinks}
        currentLinkedIds={linkedItems.map((item) => item._id)}
      />
    </Dialog>
  );
}
