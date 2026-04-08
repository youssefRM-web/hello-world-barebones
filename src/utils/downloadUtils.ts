/**
 * Map common MIME types to file extensions.
 */
const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
  "video/mp4": "mp4",
};

/**
 * Extract extension from a URL path (ignoring query params).
 */
const getExtFromUrl = (url: string): string | null => {
  const path = url.split("?")[0];
  const lastSegment = path.split("/").pop() || "";
  const dotIndex = lastSegment.lastIndexOf(".");
  if (dotIndex > 0) return lastSegment.substring(dotIndex + 1).toLowerCase();
  return null;
};

/**
 * Ensure the filename has an extension, using URL or Content-Type as source of truth.
 * Falls back to .png only as a last resort for images.
 */
const ensureExtension = (name: string, url: string, contentType?: string | null): string => {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex > 0 && dotIndex < name.length - 1) return name; // already has extension

  // Try URL extension first (preserves original format)
  const urlExt = getExtFromUrl(url);
  if (urlExt) return `${name}.${urlExt}`;

  // Try Content-Type header
  if (contentType) {
    const mime = contentType.split(";")[0].trim().toLowerCase();
    const ext = mimeToExt[mime];
    if (ext) return `${name}.${ext}`;
  }

  // Last resort
  return `${name}.png`;
};

/**
 * Cross-browser file download utility.
 * Fetches the file as a blob and triggers a download via an anchor element.
 * Preserves the original file format; falls back to .png only if undetectable.
 */
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  const baseName = filename || url.split("/").pop()?.split("?")[0] || "download";

  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get("content-type");
    const derivedName = ensureExtension(baseName, url, contentType);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = derivedName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Delay cleanup for Safari compatibility
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 150);
  } catch (error) {
    console.warn("Blob download failed, trying fallback:", error);

    const derivedName = ensureExtension(baseName, url);

    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = derivedName;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 150);
    } catch {
      window.open(url, "_blank");
    }
  }
};
