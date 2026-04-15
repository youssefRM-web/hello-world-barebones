import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Cloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

interface UploadFile {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "uploaded" | "error";
}

interface MenuUploadViewProps {
  onGoBack: () => void;
}

export const MenuUploadView = ({ onGoBack }: MenuUploadViewProps) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (file: File) => {
    const newFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      progress: 0,
      status: "uploading",
    };

    setFiles((prev) => [...prev, newFile]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === newFile.id && f.status === "uploading") {
            const newProgress = Math.min(f.progress + Math.random() * 30, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: "uploaded" };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        })
      );
    }, 500);
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      simulateUpload(file);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadingFiles = files.filter((f) => f.status === "uploading");
  const uploadedFiles = files.filter((f) => f.status === "uploaded");

  return (
    <div className="w-full">
      {/* Header with Go Back */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          className="mb-2 sm:mb-4 text-[#0A2472] hover:text-[#0A2472]/80 p-0 h-auto text-sm"
          onClick={onGoBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("goBack")}
        </Button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            {t("createYourMenu")}
          </h1>
          <p className="text-xs sm:text-sm text-[#181522] mt-1">
            {t("menuCreationAiUpload")}
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-foreground text-center mb-6">
          {t("upload")}
        </h2>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            isDragging
              ? "border-[#0A2472] bg-[#0A2472]/5"
              : "border-border hover:border-[#0A2472]/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#0A2472] flex items-center justify-center mb-4">
            <Cloud className="w-6 h-6 text-[#0A2472]" />
          </div>
          <p className="text-sm text-foreground mb-1">
            {t("dragAndDropFiles")}{" "}
            <button
              type="button"
              className="text-[#0A2472] font-medium hover:underline"
              onClick={handleBrowseClick}
            >
              {t("browse")}
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            {t("supportedFormats")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpeg,.jpg,.png,.gif,.mp4,.pdf,.psd,.ai,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        {/* Uploading Section */}
        {uploadingFiles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-foreground mb-3">
              {t("uploading")} - {uploadingFiles.length}/{files.length} {t("files")}
            </p>
            <div className="space-y-3">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Progress value={file.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Section */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-foreground mb-3">{t("uploaded")}</p>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border border-border rounded-lg px-4 py-3"
                >
                  <span className="text-sm text-foreground truncate max-w-[250px]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          className="w-full mt-6 bg-[#0A2472] hover:bg-[#0A2472]/90 text-white rounded-lg"
          disabled={files.length === 0}
        >
          {t("uploadFiles")}
        </Button>
      </div>
    </div>
  );
};
