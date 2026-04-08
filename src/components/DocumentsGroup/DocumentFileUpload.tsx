import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  X,
  UploadCloud,
  Play,
  Download,
  Video,
} from "lucide-react";
import { FormError } from "../ui/form-error";
import pdfIcon from "./assets/pdfIcon.png";
import docxIcon from "./assets/docxIcon.png";
import xlsxIcon from "./assets/xlsx.png";
import imageIcon from "./assets/imgIcon.png";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const MAX_VIDEO_SIZE_MB = 10;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// File type icon helpers
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={pdfIcon}
            alt="PDF"
            className="w-full h-full object-contain"
          />
        </div>
      );
    case "doc":
    case "docx":
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={docxIcon}
            alt="DOCX"
            className="w-full h-full object-contain"
          />
        </div>
      );
    case "xls":
    case "xlsx":
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={xlsxIcon}
            alt="XLSX"
            className="w-full h-full object-contain"
          />
        </div>
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={imageIcon}
            alt="Image"
            className="w-full h-full object-contain"
          />
        </div>
      );
    case "mp4":
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <Video className="w-6 h-6 text-primary" />
        </div>
      );
    case "txt":
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      );
  }
};

interface DocumentFileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFiles?: string[];
  selectedFileNames?: string[];
  onRemoveFile?: (index: number) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export function DocumentFileUpload({
  onFileUpload,
  selectedFiles = [],
  selectedFileNames = [],
  onRemoveFile,
  errors = {},
  clearError,
}: DocumentFileUploadProps) {
  const { t } = useLanguage();
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const isVideoFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".mp4");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setVideoError(null);

    if (file) {
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        setVideoError(
          `"${file.name}" exceeds the maximum file size of ${MAX_VIDEO_SIZE_MB}MB.`,
        );
        event.target.value = "";
        return;
      }
    }

    if (clearError) {
      clearError("fileUrls");
    }
    onFileUpload(event);
  };

  const handleDownloadVideo = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">
        {t("documents.fileUpload")} <span className="text-destructive">*</span>
      </Label>

      {/* Uploaded Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          {selectedFiles.map((file, index) => {
            const fileName =
              selectedFileNames[index] ||
              file.split("/").pop() ||
              `Document ${index + 1}`;
            const isVideo = isVideoFile(fileName);

            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {fileName.split(".").pop()?.toUpperCase() || "FILE"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isVideo && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setVideoPreview(file)}
                          className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                          title="Play video"
                        >
                          <Play className="w-4.5 h-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadVideo(file, fileName)}
                          className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                          title="Download video"
                        >
                          <Download className="w-4.5 h-4.5" />
                        </Button>
                      </>
                    )}
                    {onRemoveFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFile(index)}
                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4.5 h-4.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Video Preview Thumbnail */}
                {isVideo && (
                  <div className="rounded-lg overflow-hidden border bg-muted">
                    <video
                      src={file}
                      className="w-full max-h-48 object-contain bg-black"
                      muted
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Area */}
      <label className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors">
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud size={54} color="#636AE8FF" />

          <div className="relative">
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
            >
              {t("documents.browseFiles")}
            </Button>
            <input
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*, video/*, .pdf"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t("documents.supportsFiles")}
          </p>
        </div>
      </label>

      {videoError && <FormError error={videoError} />}
      <FormError error={errors.fileUrls} />

      {/* Video Player Modal */}
      <Dialog open={!!videoPreview} onOpenChange={() => setVideoPreview(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{t("documents.videoPreview")}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {videoPreview && (
              <video
                src={videoPreview}
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
}
