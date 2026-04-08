import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowLeft,
  Download,
  Eye,
  QrCode,
  FileDown,
  Printer,
  DoorClosed,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadFile } from "@/utils/downloadUtils";

interface QrCodeImage {
  url: string;
  itemId: string;
  itemName: string;
  itemType: string;
  size: string;
  _id: string;
}

interface QrCodeData {
  _id: string;
  fileUrl: string;
  images: QrCodeImage[];
  createdAt: string;
}

interface LinkedQrCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  itemId: string;
  itemName: string;
  itemType: "space" | "asset";
  qrCodes?: QrCodeData[];
}

const LinkedQrCodesModal = ({
  isOpen,
  onClose,
  onBack,
  itemId,
  itemName,
  itemType,
  qrCodes = [],
}: LinkedQrCodesModalProps) => {
  const { t } = useLanguage();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const itemQrImages = qrCodes.flatMap((qr) =>
    qr.images
      .filter((img) => img.itemId === itemId)
      .map((img) => ({
        ...img,
        pdfUrl: qr.fileUrl,
        qrId: qr._id,
        createdAt: qr.createdAt,
      })),
  );

  const handleDownloadFile = async (url: string, filename: string) => {
    await downloadFile(url, filename);
  };

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 first-letter:uppercase">
              <div
                className={`w-8 h-8 rounded flex items-center justify-center ${
                  itemType === "space" ? "bg-customBlue" : "bg-[#F1F5FE]"
                }`}
              >
                {itemType === "space" ? (
                  <DoorClosed className="w-4 h-4 text-blue-600" />
                ) : (
                  <Printer className="w-4 h-4 text-[#4D81ED]" />
                )}
              </div>
              <span>{itemName}</span>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-foreground">{t("qrCodes.qrCodesLabel")}</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {itemQrImages.length}
              </span>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {itemQrImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("qrCodes.noQrCodesLinked").replace("{type}", itemType === "space" ? t("qrCodes.spaces").toLowerCase() : t("qrCodes.assets").toLowerCase())}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("qrCodes.generateHint")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {itemQrImages.map((qrImage, index) => (
                  <div
                    key={qrImage._id || index}
                    className="border rounded-lg p-4 bg-background hover:bg-accent/30 transition-colors"
                  >
                    <div
                      className="aspect-square bg-white rounded-lg border flex items-center justify-center mb-3 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handlePreviewImage(qrImage.url)}
                    >
                      <img
                        src={qrImage.url}
                        alt={`QR Code for ${qrImage.itemName}`}
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium truncate">
                        {qrImage.itemName}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Size: {qrImage.size}</span>
                        <span className="first-letter:uppercase">{qrImage.itemType}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => handlePreviewImage(qrImage.url)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t("qrCodes.preview")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => handleDownloadFile(qrImage.pdfUrl, `qr-code-${qrImage.itemName}.pdf`)}
                        >
                          <FileDown className="w-3 h-3 mr-1" />
                          {t("qrCodes.pdf")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {previewImage && (
        <Dialog
          open={!!previewImage}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="sm:max-w-[500px] p-0">
            <div className="relative">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={previewImage}
                alt="QR Code Preview"
                className="w-full h-auto"
              />

              <div className="p-4 border-t flex justify-center">
                <Button
                  onClick={() => handleDownloadFile(previewImage, "qr-code.png")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("qrCodes.downloadImage")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default LinkedQrCodesModal;
