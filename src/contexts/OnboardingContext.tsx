import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

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

const STEP_TOAST_KEYS: Record<OnboardingStep, string> = {
  'create-building': 'building',
  'create-room': 'room',
  'create-asset': 'asset',
  'generate-qr': 'qr',
  'create-report': 'report',
  'upload-document': 'document',
  'create-recurring-task': 'recurringTask',
};

export const STEP_ROUTES: Record<OnboardingStep, string> = {
  'create-building': '/dashboard/building',
  'create-room': '/dashboard/spaces',
  'create-asset': '/dashboard/assets',
  'generate-qr': '/dashboard/qr-codes',
  'create-report': '/dashboard/',
  'upload-document': '/dashboard/documents',
  'create-recurring-task': '/dashboard/tasks',
};

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

      // Show completion toast - we read translation key and use a fallback
      const key = STEP_TOAST_KEYS[step];
      // Try to get translation from stored language, fallback to English messages
      const toastMessages: Record<string, string> = {
        building: "🎉 You've created your first building!",
        room: "🎉 You've created your first room!",
        asset: "🎉 You've created your first asset!",
        qr: "🎉 You've generated your first QR code!",
        report: "🎉 You've created your first report!",
        document: "🎉 You've uploaded your first document!",
        recurringTask: "🎉 You've created your first recurring task!",
      };
      
      toast.success(toastMessages[key] || "Step completed!", {
        duration: 5000,
        position: "top-center",
      });

      // Check if all steps are now complete
      if (next.size >= ALL_STEPS.length) {
        setTimeout(() => {
          toast.success("🎉 All steps completed! You're all set.", {
            duration: 6000,
            position: "top-center",
          });
        }, 1500);
      }

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
