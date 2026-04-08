import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface ImageViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
}

export function ImageViewerModal({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-[#212121]">
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          <img
            src={images[currentIndex]}
            alt={`Attachment ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain [image-orientation:from-image]"
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 rounded-full px-3 py-1">
              <span className="text-white text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
