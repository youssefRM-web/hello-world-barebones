import React, { useState } from "react";
import {
  FileText,
  ExternalLink,
  Calendar,
  Users,
  Trash2,
  RotateCcw,
  Play,
  Download,
  Video,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DocumentDetailModalEditable } from "./DocumentDetailModalEditable";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@/types";
import pdfIcon from "./assets/pdfIcon.png";
import docxIcon from "./assets/docxIcon.png";
import xlsxIcon from "./assets/xlsx.png";
import imageIcon from "./assets/imgIcon.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/dateUtils";

interface DocumentsTableProps {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  isArchived?: boolean;
  isExpired?: boolean;
  onRestore?: (documentId: string) => Promise<void>;
  restoringId?: string | null;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  isLoading,
  error,
  isArchived = false,
  isExpired = false,
  onRestore,
  restoringId,
}) => {
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null,
  );
  const [videoToPlay, setVideoToPlay] = useState<string | null>(null);

  const isVideoFile = (fileUrl?: string) => {
    return fileUrl?.toLowerCase().endsWith(".mp4");
  };
  
  const handleDownloadVideo = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatLinkedTo = (linkedTo: Document["linkedTo"]) => {
    if (!linkedTo || linkedTo.length === 0) return t("documents.noLinks");
    return linkedTo
      .map((link, i) =>
        i === linkedTo.length - 1 ? link.name : `${link.name} / `,
      )
      .join("");
  };

  const formatBuilding = (linkedTo: Document["linkedTo"]) => {
    if (!linkedTo || linkedTo.length === 0) return t("documents.noBuildings");

    // Extract buildings from linkedTo - each item has a nested `building` object
    const uniqueBuildings = linkedTo.reduce(
      (acc, link) => {
        const building = link?.building;
        if (building?._id && !acc.find((b) => b._id === building._id)) {
          acc.push({ _id: building._id, name: building.name || "Unknown" });
        }
        return acc;
      },
      [] as Array<{ _id: string; name: string }>,
    );

    if (uniqueBuildings.length === 0) return t("documents.noBuildings");

    return uniqueBuildings
      .map((building, i) =>
        i === uniqueBuildings.length - 1
          ? building.name
          : `${building.name} / `,
      )
      .join("");
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        {t("documents.errorLoading")}: {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 shadow-sm bg-card">
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-muted/50 to-muted/20 sticky top-0 z-10 [&_tr]:border-b [&_tr]:border-border/50">
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>{t("documents.documentNameCol")}</TableHead>
            <TableHead>{t("documents.building")}</TableHead>
            <TableHead>{t("documents.linkedToCol")}</TableHead>
            <TableHead>{t("documents.expirationDate")}</TableHead>
            <TableHead>{t("documents.notificationDate")}</TableHead>
            <TableHead>{t("documents.created")}</TableHead>
            <TableHead className="w-[100px]">{t("documents.actions")}</TableHead>
          </TableRow>
        </thead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground "
              >
                <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                {isArchived
                  ? t("documents.noArchivedDocuments")
                  : isExpired
                    ? t("documents.noExpiredDocuments")
                    : t("documents.noDocumentsFound")}
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow
                key={doc?._id}
                className={`${isArchived ? "opacity-75" : "hover:bg-accent/50 cursor-pointer"} ${isExpired ? "opacity-60" : ""}`}
                onClick={() =>
                  !isArchived && setSelectedDocument(doc)
                }
              >
                <TableCell>
                  {(() => {
                    const ext = doc?.fileUrls?.split(".").pop()?.toLowerCase();
                    switch (ext) {
                      case "pdf":
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            <img src={pdfIcon} className="w-8 h-8" alt="PDF" />
                          </div>
                        );
                      case "doc":
                      case "docx":
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            <img
                              src={docxIcon}
                              className="w-8 h-8"
                              alt="DOCX"
                            />
                          </div>
                        );
                      case "txt":
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center ">
                            <FileText className="w-8 h-8 text-gray-600" />
                          </div>
                        );
                      case "xlsx":
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            <img src={xlsxIcon} className="w-8 h-8" alt="img" />
                          </div>
                        );
                      case "png":
                      case "jpg":
                      case "jpeg":
                      case "webp":
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            <img
                              src={doc?.fileUrls}
                              className="w-8 h-8"
                              alt="img"
                            />
                          </div>
                        );
                      case "mp4":
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            <Video className="w-8 h-8 text-primary" />
                          </div>
                        );
                      default:
                        return (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            <FileText className="w-8 h-8" color="#4D81ED" />
                          </div>
                        );
                    }
                  })()}
                </TableCell>

                <TableCell className="font-medium ">
                  <div className="flex items-center gap-2 ">
                    <span className="first-letter:uppercase"> {doc?.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium first-letter:uppercase">
                  <div className="flex items-center gap-2">
                    {formatBuilding(doc?.linkedTo)}
                  </div>
                </TableCell>
                <TableCell className="first-letter:uppercase">
                  {formatLinkedTo(doc?.linkedTo)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />

                    {doc?.expirationDate
                      ? formatDate(doc?.expirationDate)
                      : "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {doc?.notificationDate
                      ? formatDate(doc?.notificationDate)
                      : "N/A"}
                  </div>
                </TableCell>
                <TableCell>{formatDate(doc.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isArchived && onRestore ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(doc._id);
                        }}
                        disabled={restoringId === doc._id}
                        className="text-primary hover:text-primary/80"
                      >
                        <RotateCcw
                          className={`w-4 h-4 ${restoringId === doc._id ? "animate-spin" : ""}`}
                        />
                      </Button>
                    ) : (
                      <>
                        {isVideoFile(doc.fileUrls) ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoToPlay(doc.fileUrls);
                              }}
                              className="text-primary hover:text-primary/80"
                              title="Play video"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadVideo(
                                  doc.fileUrls,
                                  doc.name + ".mp4",
                                );
                              }}
                              className="text-primary hover:text-primary/80"
                              title="Download video"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={doc.fileUrls}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {hasPermission("documents", "deleteDocuments") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocumentToDelete(doc);
                            }}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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

      {selectedDocument && (
        <DocumentDetailModalEditable
          open={!!selectedDocument}
          onOpenChange={() => setSelectedDocument(null)}
          document={selectedDocument}
          readOnly={isExpired}
        />
      )}

      {documentToDelete && (
        <DeleteDocumentModal
          isOpen={!!documentToDelete}
          onClose={() => setDocumentToDelete(null)}
          document={documentToDelete}
        />
      )}

      {/* Video Player Modal */}
      <Dialog open={!!videoToPlay} onOpenChange={() => setVideoToPlay(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{t("documents.videoPlayer")}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {videoToPlay && (
              <video
                src={videoToPlay}
                controls
                autoPlay
                className="w-full max-h-[70vh] rounded-lg bg-black"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsTable;
