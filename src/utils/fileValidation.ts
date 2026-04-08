import { toast } from "sonner";

// Constants (no translation needed)
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const validateFileSize = (
  file: File,
  t?: (key: string, params?: any) => string,
): boolean => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const title = t ? t("fileUpload.fileTooLarge") : "File too large";
    const desc = t
      ? t("fileUpload.singleFileExceeds", {
          fileName: file.name,
          maxSize: MAX_FILE_SIZE_MB,
        })
      : `"${file.name}" exceeds the maximum file size of 10 MB.`;
    toast.error(title, { description: desc });
    return false;
  }
  return true;
};

export const validateFileSizes = (
  files: File[],
  t?: (key: string, params?: any) => string,
): File[] => {
  const validFiles: File[] = [];
  const invalidFiles: string[] = [];

  files.forEach((file) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      invalidFiles.push(`"${file.name}"`);
    } else {
      validFiles.push(file);
    }
  });

  if (invalidFiles.length > 0) {
    const title = t
      ? t("fileUpload.someFilesTooLarge")
      : "Some files are too large";
    const desc = t
      ? t("fileUpload.filesExceedLimit", { maxSize: "10 MB" })
      : invalidFiles.join(", ") + ` exceed the maximum file size of 10 MB.`;
    toast.error(title, { description: desc });
  }

  return validFiles;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
