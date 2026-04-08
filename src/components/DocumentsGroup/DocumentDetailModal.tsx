import React, { useState } from "react";
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
  Building,
  ChevronUp,
  ChevronDown,
  Info,
  Home,
  DoorClosed,
  Package,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { LinkDocumentModal } from "./LinkDocumentModal";
import type { Document } from "@/types";
import { pdfIcon } from "../ui/toaster";

import pdficon from "./assets/pdfIcon.png";
import docxIcon from "./assets/docxIcon.png";
import xlsxIcon from "./assets/xlsx.png";
import imageIcon from "./assets/imgIcon.png";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useUpdateDocumentMutation } from "@/hooks/mutations/useUpdateDocumentMutation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePermissions } from "@/contexts/PermissionsContext";

// File type icon helpers
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={pdficon} />
        </div>
      );
    case "doc":
    case "docx":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={docxIcon} />
        </div>
      );
    case "xlsx":
    case "xls":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={xlsxIcon} />
        </div>
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return (
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={fileName} />
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

// Check if document is expired
const isExpired = (dateString?: string) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

interface DocumentDetailModalProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentDetailModal({
  documentId,
  open,
  onOpenChange,
}: DocumentDetailModalProps) {
  const { t } = useLanguage();
  const { documents, refreshDocuments, refreshSpaces, refreshAssets } =
    useReferenceData();
  const updateDocumentMutation = useUpdateDocumentMutation();
  const { hasPermission, isAdmin } = usePermissions();

  // Get document from context for real-time updates
  const document = documents.find((d) => d._id === documentId);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(
    new Set(),
  );

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

  const linkedTo = document.linkedTo || [];

  const handleRemoveLink = async (linkId: string) => {
    try {
      const updatedLinks = linkedTo.filter((item) => item._id !== linkId);
      const linkedIds = updatedLinks.map((item) => item._id);

      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { linkedTo: linkedIds },
      });

      await refreshDocuments();
      await refreshSpaces();
      await refreshAssets();
    } catch (error) {
      console.error("Error removing link:", error);
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
    try {
      // Combine existing linked IDs with new ones
      const existingIds = linkedTo.map((item) => item._id);
      const newIds = links.map((link) => link.id);
      const allLinkedIds = [...new Set([...existingIds, ...newIds])];

      await updateDocumentMutation.mutateAsync({
        documentId: document._id,
        data: { linkedTo: allLinkedIds },
      });

      await refreshDocuments();
      await refreshSpaces();
      await refreshAssets();
      setShowLinkModal(false);
    } catch (error) {
      console.error("Error updating links:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-md w-full max-h-[95vh] p-0 gap-0  sm:mx-auto flex flex-col">
        {/* Header */}
        <DialogHeader className="space-y-1.5 text-center sm:text-left flex flex-row items-center justify-between p-5 border-b sticky top-0 bg-accent/50 z-10">
          <DialogTitle>{t("documents.documentDetails")}</DialogTitle>
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {hasPermission("documents", "deleteDocuments") && (
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
              className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
              asChild
            >
              <a
                href={document.fileUrls}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4 text-foreground" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-5 h-max  pb-4 p-6 overflow-y-auto">
          {/* Document Icon and Name */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center relative`}
            >
              <div className="w-10 h-10 sm:w-10 sm:h-10 rounded flex items-center justify-center">
                {getFileIcon(document.fileUrls)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                {document.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t("documents.createdOn")} {formatDate(document.createdAt)}
              </p>
            </div>
          </div>

          {/* Open Button */}
          <Button
            className="w-max bg-[#2E69E8FF] hover:bg-blue-700 text-white "
            size="lg"
            onClick={() => window.open(document.fileUrls, "_blank")}
          >
            {t("documents.open")}
          </Button>

          {/* Dates Section */}
          <div className="space-y-3 sm:space-y-4 border rounded-md ">
            <div className="flex items-center gap-3 text-sm pt-3 px-3">
              <Clock
                className={`w-4 h-4 flex-shrink-0 ${isExpired(document.expirationDate) ? "text-red-500" : "text-gray-400"}`}
              />
              <div className="flex items-center gap-2">
                {isExpired(document.expirationDate) && (
                  <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded">
                    {t("documents.expired")}
                  </span>
                )}
                <span
                  className={`font-medium ${isExpired(document.expirationDate) ? "text-red-600" : "text-foreground"}`}
                >
                  {formatDate(document.expirationDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm px-3">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-foreground flex-1">{t("documents.notificationDate")}</span>
              <span className="text-foreground font-medium">
                {formatDate(document.notificationDate)}
              </span>
            </div>
            <div className="text-xs bg-[#F8F9FA] flex gap-2 text-gray-500 leading-relaxed border p-2">
              <Info className="w-6" />
              {t("documents.notificationDateInfo")}
            </div>
          </div>

          {/* Visibility Section */}
          <div className="flex items-center gap-3 text-sm border rounded-md p-3">
            <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-foreground flex-1">{t("documents.visibility")}</span>
            <span className=" px-2 py-1 flex gap-2 first-letter:uppercase rounded text-sm font-medium">
              <svg
                className="w-4 h-4"
                fill="#686583"
                id="Flat"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
              >
                <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z" />
              </svg>
              {document.visibility}
            </span>
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {t("documents.additionalInformationLabel")}
            </h4>
            <p className="text-sm text-foreground border rounded-md p-3">
              {document.additionalInformation || t("documents.noAdditionalInfo")}
            </p>
          </div>

          {/* Linked to Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">{t("documents.linkedTo")}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 text-xs h-auto p-1"
                onClick={() => setShowLinkModal(true)}
                disabled={!hasPermission("documents", "updateDocuments")}
              >
                {t("documents.addLinking")}
              </Button>
            </div>

            {/* Linked Items Grouped by Building */}
            <div className="space-y-2">
              {linkedTo.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">{t("documents.noLinkedItems")}</p>
              ) : (
                Object.entries(groupByBuilding(linkedTo)).map(
                  ([buildingName, items]) => (
                    <div key={buildingName} className="space-y-2">
                      {/* Building Header */}
                      <button
                        onClick={() => toggleBuilding(buildingName)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-foreground">
                            {buildingName}
                          </span>
                        </div>
                        {expandedBuildings.has(buildingName) ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </button>

                      {/* Building Items */}
                      {expandedBuildings.has(buildingName) && (
                        <div className="space-y-2 pl-2">
                          {items.map((link, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {link.type === "space" ? (
                                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                    <DoorClosed className="w-4 h-4 text-blue-600" />
                                  </div>
                                ) : link.type === "asset" ? (
                                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                    <Package className="w-4 h-4 text-blue-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center">
                                    <Building className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}
                                <span className="text-sm text-foreground font-medium">
                                  {link.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleRemoveLink(link._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

          {/* Footer */}
          <div className="flex justify-end gap-2 sm:gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-sm h-9"
              size="lg"
            >
              {t("documents.cancel")}
            </Button>
            <Button
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 text-sm h-9"
            >
              {t("documents.save")}
            </Button>
          </div>
        </div>
      </DialogContent>

      {showDeleteModal && (
        <DeleteDocumentModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          document={document}
        />
      )}

      <LinkDocumentModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        currentLinkedIds={linkedTo.map((link) => link._id)}
        currentLinkedTypes={linkedTo.map((link) => link.type)}
        showOverviewTab={true}
        onApplyLinks={handleApplyLinks}
      />
    </Dialog>
  );
}
