import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Cloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { uploadMenuImages } from "@/lib/api";
import { toast } from "sonner";

interface UploadFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: "pending" | "uploading" | "uploaded" | "error";
}

interface MenuUploadViewProps {
  onGoBack: () => void;
}

export const MenuUploadView = ({ onGoBack }: MenuUploadViewProps) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, []);

  const handleBrowseClick = () => fileInputRef.current?.click();
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };
  const handleRemoveFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending" || f.status === "error");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setFiles((prev) => prev.map((f) => pendingFiles.find((p) => p.id === f.id) ? { ...f, status: "uploading" as const, progress: 30 } : f));

    try {
      const realFiles = pendingFiles.map((f) => f.file);
      const result = await uploadMenuImages(realFiles);
      setFiles((prev) => prev.map((f) =>
        pendingFiles.find((p) => p.id === f.id) ? { ...f, status: "uploaded" as const, progress: 100 } : f
      ));
      toast.success(t("uploadSuccess"));
      console.log("Upload result:", result);
    } catch (err) {
      setFiles((prev) => prev.map((f) =>
        pendingFiles.find((p) => p.id === f.id) ? { ...f, status: "error" as const, progress: 0 } : f
      ));
      toast.error((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const pendingFiles = files.filter((f) => f.status === "pending" || f.status === "error");
  const uploadingFiles = files.filter((f) => f.status === "uploading");
  const uploadedFiles = files.filter((f) => f.status === "uploaded");

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" className="mb-2 sm:mb-4 text-[#0A2472] hover:text-[#0A2472]/80 p-0 h-auto text-sm" onClick={onGoBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />{t("goBack")}
        </Button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">{t("createYourMenu")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("menuCreationAiUpload")}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-foreground text-center mb-6">{t("upload")}</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            isDragging ? "border-[#0A2472] bg-[#0A2472]/5" : "border-border hover:border-[#0A2472]/50"
          }`}
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#0A2472] flex items-center justify-center mb-4">
            <Cloud className="w-6 h-6 text-[#0A2472]" />
          </div>
          <p className="text-sm text-foreground mb-1">
            {t("dragAndDropFiles")}{" "}
            <button type="button" className="text-[#0A2472] font-medium hover:underline" onClick={handleBrowseClick}>{t("browse")}</button>
          </p>
          <p className="text-xs text-muted-foreground">{t("supportedFormats")}</p>
          <input ref={fileInputRef} type="file" multiple accept=".jpeg,.jpg,.png,.gif,.pdf" className="hidden" onChange={handleFileInputChange} />
        </div>

        {uploadingFiles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-foreground mb-3">{t("uploading")}...</p>
            <div className="space-y-3">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-sm text-foreground truncate block max-w-[200px]">{file.name}</span>
                    <Progress value={file.progress} className="h-1.5 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-foreground mb-3">{t("readyToUpload")}</p>
            <div className="space-y-3">
              {pendingFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                  <span className="text-sm text-foreground truncate max-w-[250px]">{file.name}</span>
                  <button type="button" onClick={() => handleRemoveFile(file.id)} className="text-destructive hover:text-destructive/80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-foreground mb-3">{t("uploaded")}</p>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                  <span className="text-sm text-foreground truncate max-w-[250px]">{file.name}</span>
                  <span className="text-xs text-green-600 font-medium">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full mt-6 bg-[#0A2472] hover:bg-[#0A2472]/90 text-white rounded-lg"
          disabled={pendingFiles.length === 0 || isUploading}
          onClick={handleUpload}
        >
          {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t("uploadFiles")}
        </Button>
      </div>
    </div>
  );
};
