import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-full max-w-full h-full max-h-full rounded-none' : 'max-w-6xl w-[98vw] h-[90vh] max-h-[850px]'} p-0 overflow-hidden`}>
        <VisuallyHidden>
          <DialogTitle>Demo buchen</DialogTitle>
          <DialogDescription>Buche eine Demo mit dem Mendigo Team</DialogDescription>
        </VisuallyHidden>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 backdrop-blur-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {open && (
          <iframe
            src="https://zeeg.me/mendigo/demo?embed_type=Inline"
            className="w-full h-full border-none md:min-w-[900px]"
            title="Demo buchen"
            allow="payment"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
