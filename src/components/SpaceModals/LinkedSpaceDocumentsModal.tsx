import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  ArrowLeft,
  Eye,
  Download,
  FileText,
  DoorClosed,
  Video,
} from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import { Button } from "../ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadFile } from "@/utils/downloadUtils";

interface Attachment {
  _id: string;
  name: string;
  url: string;
  createdAt?: string;
  expirationDate?: string;
}

interface LinkedSpaceDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  spaceName: string;
  attachments: Attachment[];
}

const LinkedSpaceDocumentsModal = ({
  isOpen,
  onClose,
  onBack,
  spaceName,
  attachments = [],
}: LinkedSpaceDocumentsModalProps) => {
  const { t } = useLanguage();

  const handlePreview = (url: string) => { window.open(url, "_blank"); };
  const getFileExtension = (url: string) => url.split("?")[0].split(".").pop() || "";

  const handleDownload = async (url: string, fileName: string) => {
    const extension = getFileExtension(url);
    const finalName = extension ? `${fileName}.${extension}` : fileName;
    await downloadFile(url, finalName);
  };

  const getAttachmentIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf": return <img src={pdfIcon} className="w-8 h-8 object-contain" alt="PDF" />;
      case "doc": case "docx": return <img src={docxIcon} className="w-8 h-8 object-contain" alt="DOCX" />;
      case "xls": case "xlsx": return <img src={xlsxIcon} className="w-8 h-8 object-contain" alt="Excel" />;
      case "mp4": return <Video className="w-8 h-8 text-primary" />;
      case "jpg": case "jpeg": case "png": case "gif": case "webp": return <img src={url} className="w-8 h-8 object-contain" alt="Image" />;
      case "txt": return <FileText className="w-8 h-8 text-gray-600" />;
      default: return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-customBlue rounded flex items-center justify-center">
              <DoorClosed className="w-4 h-4 text-blue-600" />
            </div>
            <span className="first-letter:uppercase">{spaceName}</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-foreground">{t("spaces.linkedDocuments")}</span>
          </div>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto flex-1">
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground italic">{t("spaces.noAttachments")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div key={attachment._id} className="flex items-center justify-between p-3 border-l-4 border-orange-400 bg-background rounded-r border">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center">{getAttachmentIcon(attachment?.url)}</div>
                    <div>
                      <div className="font-medium text-sm first-letter:uppercase">{attachment.name}</div>
                      {attachment.expirationDate && (
                        <div className="text-xs text-gray-500 first-letter:uppercase">
                          {t("spaces.expiryDate")}: {formatDate(attachment.expirationDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded hover:bg-accent/50 transition-colors" onClick={() => handlePreview(attachment.url)} title="Preview">
                      <Eye className="w-4 h-4 text-gray-600 hover:text-foreground" />
                    </button>
                    <button className="p-2 rounded hover:bg-accent/50 transition-colors" onClick={() => handleDownload(attachment.url, attachment.name)} title="Download">
                      <Download className="w-4 h-4 text-gray-600 hover:text-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedSpaceDocumentsModal;
