import React, { createContext, useContext, useState, useCallback } from 'react';

export type OnboardingStep =
  | 'create-building'
  | 'create-room'
  | 'create-asset'
  | 'generate-qr'
  | 'create-report'
  | 'upload-document'
  | 'create-recurring-task';

export interface OnboardingStepConfig {
  id: OnboardingStep;
  index: number;
  completed: boolean;
}

interface OnboardingContextType {
  isOnboardingVisible: boolean;
  steps: OnboardingStepConfig[];
  completedCount: number;
  totalSteps: number;
  activeGuide: OnboardingStep | null;
  guideSubStep: number;
  startGuide: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep) => void;
  stopGuide: () => void;
  skipAllSteps: () => void;
  dismissOnboarding: () => void;
  setGuideSubStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'mendigo_onboarding_steps';
const ONBOARDING_DISMISSED_KEY = 'mendigo_onboarding_dismissed';

const ALL_STEPS: OnboardingStep[] = [
  'create-building',
  'create-room',
  'create-asset',
  'generate-qr',
  'create-report',
  'upload-document',
  'create-recurring-task',
];

function loadCompleted(): Set<OnboardingStep> {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveCompleted(set: Set<OnboardingStep>) {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify([...set]));
}

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(loadCompleted);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true');
  const [activeGuide, setActiveGuide] = useState<OnboardingStep | null>(null);
  const [guideSubStep, setGuideSubStep] = useState(0);

  const steps: OnboardingStepConfig[] = ALL_STEPS.map((id, index) => ({
    id,
    index,
    completed: completedSteps.has(id),
  }));

  const completedCount = completedSteps.size;
  const totalSteps = ALL_STEPS.length;
  const allComplete = completedCount >= totalSteps;
  const isOnboardingVisible = !dismissed && !allComplete;

  const startGuide = useCallback((step: OnboardingStep) => {
    setActiveGuide(step);
    setGuideSubStep(0);
  }, []);

  const completeStep = useCallback((step: OnboardingStep) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(step);
      saveCompleted(next);
      return next;
    });
    setActiveGuide(null);
    setGuideSubStep(0);
  }, []);

  const stopGuide = useCallback(() => {
    setActiveGuide(null);
    setGuideSubStep(0);
  }, []);

  const skipAllSteps = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    setActiveGuide(null);
    setGuideSubStep(0);
  }, []);

  const dismissOnboarding = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  }, []);

  return (
    <OnboardingContext.Provider value={{
      isOnboardingVisible,
      steps,
      completedCount,
      totalSteps,
      activeGuide,
      guideSubStep,
      startGuide,
      completeStep,
      stopGuide,
      skipAllSteps,
      dismissOnboarding,
      setGuideSubStep,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
