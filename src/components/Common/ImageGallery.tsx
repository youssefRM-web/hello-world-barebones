import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Video,
  FileText,
} from "lucide-react";
import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";

interface ImageGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const isVideoFile = (url: string) => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
  return videoExtensions.some((ext) => url?.toLowerCase().includes(ext));
};

const isImageFile = (url: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  return imageExtensions.some((ext) => url?.toLowerCase().includes(ext));
};

const isDisplayableMedia = (url: string) => {
  return isImageFile(url) || isVideoFile(url);
};

const getAttachmentIcon = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <img src={pdfIcon} className="w-8 h-8 object-contain" alt="PDF" />;
    case "doc":
    case "docx":
      return (
        <img src={docxIcon} className="w-8 h-8 object-contain" alt="DOCX" />
      );
    case "xls":
    case "xlsx":
      return (
        <img src={xlsxIcon} className="w-8 h-8 object-contain" alt="Excel" />
      );
    case "mp4":
      return <Video className="w-8 h-8 text-primary" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return (
        <img src={url} className="w-8 h-8 object-cover" alt="Image" />
      );
    case "txt":
      return <FileText className="w-8 h-8 text-gray-600" />;
    default:
      return <FileText className="w-8 h-8 text-muted-foreground" />;
  }
};

export function ImageGallery({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Filter to only displayable media (images and videos)
  const displayableImages = images.filter(isDisplayableMedia);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : displayableImages.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < displayableImages.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") onClose();
  };

  if (!displayableImages || displayableImages.length === 0) return null;

  const safeIndex = currentIndex >= displayableImages.length ? 0 : currentIndex;
  const currentMedia = displayableImages[safeIndex];
  const isCurrentVideo = isVideoFile(currentMedia);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl h-[90vh] p-0 bg-[#212121] border-0"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation buttons */}
          {displayableImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Main content - Image or Video */}
          <div className="w-full h-full flex items-center justify-center p-8 overflow-hidden">
            {isCurrentVideo ? (
              <video
                key={currentMedia}
                src={currentMedia}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={currentMedia}
                alt={`Image ${safeIndex + 1} of ${displayableImages.length}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
          </div>

          {/* Media counter */}
          {displayableImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {safeIndex + 1} / {displayableImages.length}
            </div>
          )}

          {/* Thumbnail strip */}
          {displayableImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-xs overflow-x-auto">
              {displayableImages.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all relative ${
                    index === safeIndex
                      ? "border-primary scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                >
                  {isVideoFile(media) ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <img
                      src={media}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
