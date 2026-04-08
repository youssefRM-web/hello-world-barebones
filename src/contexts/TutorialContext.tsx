import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type TutorialStep = 
  | 'all-buildings'
  | 'manage-buildings'
  | 'overview-tab'
  | 'archived-tab'
  | 'categories-tab'
  | 'add-building'
  | 'completed';

interface TutorialContextType {
  isActive: boolean;
  currentStep: TutorialStep | null;
  startTutorial: () => void;
  nextStep: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_STORAGE_KEY = 'mendigo_tutorial_completed';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const stepOrder: TutorialStep[] = [
    'all-buildings',
    'manage-buildings',
    'overview-tab',
    'archived-tab',
    'categories-tab',
    'add-building',
    'completed'
  ];

  // Check if tutorial was already completed
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (completed === 'true') {
      setIsActive(false);
      setCurrentStep(null);
    }
  }, []);

  // Auto-start tutorial if flag is set (after org creation + reload)
  useEffect(() => {
    const pendingTutorial = localStorage.getItem('mendigo_start_tutorial');
    if (pendingTutorial === 'true') {
      const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (completed !== 'true') {
        // Small delay to ensure the UI is fully rendered
        const timer = setTimeout(() => {
          localStorage.removeItem('mendigo_start_tutorial');
          setIsActive(true);
          setCurrentStep('all-buildings');
        }, 500);
        return () => clearTimeout(timer);
      } else {
        localStorage.removeItem('mendigo_start_tutorial');
      }
    }
  }, []);

  const startTutorial = useCallback(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (completed === 'true') return;
    
    setIsActive(true);
    setCurrentStep('all-buildings');
  }, []);

  const nextStep = useCallback(() => {
    if (!currentStep) return;
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
      completeTutorial();
      return;
    }

    const nextStepValue = stepOrder[currentIndex + 1];
    setCurrentStep(nextStepValue);

    // Navigate to building page when moving to overview-tab
    if (nextStepValue === 'overview-tab' && location.pathname !== '/dashboard/building') {
      navigate('/dashboard/building');
    }
  }, [currentStep, location.pathname, navigate]);

  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(null);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  }, []);

  const skipTutorial = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        startTutorial,
        nextStep,
        completeTutorial,
        skipTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
