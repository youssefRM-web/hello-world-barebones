import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';

interface TutorialPopupProps {
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showSkip?: boolean;
  buttonText?: string;
  onAction?: () => void;
  targetRef?: React.RefObject<HTMLElement>;
}

const TutorialPopup: React.FC<TutorialPopupProps> = ({
  title,
  description,
  position = 'bottom',
  showSkip = true,
  buttonText = 'OK',
  onAction,
}) => {
  const { nextStep, skipTutorial } = useTutorial();
  const { t } = useLanguage();
  const popupRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    // Find the highlighted element (parent with the highlight class)
    const highlightedElement = document.querySelector('[data-tutorial-highlight="true"]');
    
    if (highlightedElement && popupRef.current) {
      const rect = highlightedElement.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - popupRect.height - 12;
          left = rect.left + rect.width / 2 - popupRect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2 - popupRect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - popupRect.height / 2;
          left = rect.left - popupRect.width - 12;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - popupRect.height / 2;
          left = rect.right + 12;
          break;
      }
      
      // Keep popup within viewport
      const padding = 16;
      if (left < padding) left = padding;
      if (left + popupRect.width > window.innerWidth - padding) {
        left = window.innerWidth - popupRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + popupRect.height > window.innerHeight - padding) {
        top = window.innerHeight - popupRect.height - padding;
      }
      
      setCoords({ top, left });
    }
  }, [position]);

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      nextStep();
    }
  };

  const popupContent = (
    <div
      ref={popupRef}
      className="fixed z-[9999] w-72"
      style={coords ? { top: coords.top, left: coords.left } : { visibility: 'hidden', top: 0, left: 0 }}
    >
      {/* Content */}
      <div className="bg-background rounded-lg shadow-2xl border border-border p-4 animate-in fade-in-0 zoom-in-95">
        {showSkip && (
          <button
            onClick={skipTutorial}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <h3 className="font-semibold text-foreground mb-2 pr-6">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleAction} size="sm" className="flex-1">
            {buttonText}
          </Button>
          {showSkip && (
            <Button
              onClick={skipTutorial}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              {t("tutorial.skip")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
};

export default TutorialPopup;