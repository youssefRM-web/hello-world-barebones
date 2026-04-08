import React from 'react';
import { cn } from '@/lib/utils';

interface TutorialHighlightProps {
  isHighlighted: boolean;
  children: React.ReactNode;
  className?: string;
}

const TutorialHighlight: React.FC<TutorialHighlightProps> = ({
  isHighlighted,
  children,
  className,
}) => {
  if (!isHighlighted) return <>{children}</>;

  return (
    <div 
      className={cn('relative z-[101]', className)} 
      style={{ pointerEvents: 'auto' }}
      data-tutorial-highlight="true"
    >
      {/* Pulsing ring effect */}
      <div className="absolute -inset-2 rounded-lg animate-pulse bg-primary/30 pointer-events-none" />
      <div className="absolute -inset-1 rounded-lg bg-primary/20 animate-[pulse_1.5s_ease-in-out_infinite] pointer-events-none" />
      
      {/* Content wrapper with elevated z-index - clickable */}
      <div className="relative bg-background rounded-lg shadow-xl ring-2 ring-primary ring-offset-2 ring-offset-background">
        {children}
      </div>
    </div>
  );
};

export default TutorialHighlight;