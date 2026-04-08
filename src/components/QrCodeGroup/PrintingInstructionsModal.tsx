import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Printer, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useTranslation } from "@/lib/translations";

interface PrintingInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintingInstructionsModal: React.FC<PrintingInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const pi = t.printingInstructions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary" />
              {pi.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription>{pi.subtitle}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[65vh]">
          <div className="space-y-6 pr-4">
            {/* Intro */}
            <p className="text-sm text-muted-foreground">{pi.intro}</p>
            <p className="text-sm text-muted-foreground">{pi.disclaimer}</p>

            {/* A4 Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                {pi.a4.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {pi.a4.description}
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {pi.a4.oneMotif.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pi.a4.oneMotif.instruction}
                  </p>
                  <p className="text-xs italic text-muted-foreground mt-1">
                    „{pi.a4.oneMotif.option}"
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {pi.a4.multiMotif.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pi.a4.multiMotif.instruction}
                  </p>
                  <p className="text-xs italic text-muted-foreground mt-1">
                    „{pi.a4.multiMotif.option}"
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{pi.a4.orderInfo}</p>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  window.open(
                    "https://www.wir-machen-druck.de/hartschaumplatte-din-a4-hoch-210-x-297cm-40farbig-bedruckt.html#content-view",
                    "_blank",
                  )
                }
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {pi.toPrint}
              </Button>
            </div>

            {/* A5 Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                {pi.a5.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {pi.a5.description}
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {pi.a5.typeInstruction}
                </p>
                <p className="text-xs italic text-muted-foreground">
                  „{pi.a5.typeOption}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {pi.a5.dimensionsLabel}
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>{pi.a5.width}</li>
                  <li>{pi.a5.height}</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">{pi.a5.orderInfo}</p>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  window.open(
                    "https://www.wir-machen-druck.de/hartschaumplatte-mit-freier-groesse-rechteckig-einseitig-40farbig-bedruckt.html#content-view",
                    "_blank",
                  )
                }
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {pi.toPrint}
              </Button>
            </div>

            {/* Stickers Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                {pi.stickers.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {pi.stickers.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {pi.stickers.sizes}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  window.open(
                    "https://www.avery-zweckform.com/etiketten/quadratische-etiketten",
                    "_blank",
                  )
                }
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {pi.toPrint}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrintingInstructionsModal;
