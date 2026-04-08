import React from 'react';
import { useTutorial } from '@/contexts/TutorialContext';

interface TutorialOverlayProps {
  children?: React.ReactNode;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ children }) => {
  const { isActive } = useTutorial();

  if (!isActive) return <>{children}</>;

  return (
    <>
      {/* Overlay - pointer-events-none so highlighted elements can be clicked */}
      <div 
        className="fixed inset-0 z-[100]" 
        style={{ pointerEvents: 'none' }}
      />
      {children}
    </>
  );
};

export default TutorialOverlay;