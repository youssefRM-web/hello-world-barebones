import React from 'react';
import { useOnboarding, type OnboardingStep } from '@/contexts/OnboardingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, ChevronRight, MousePointerClick, Save, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideConfig {
  route: string;
  subSteps: { titleKey: string; descriptionKey: string; icon: React.ReactNode }[];
}

const GUIDE_STEPS: Record<OnboardingStep, GuideConfig> = {
  'create-building': {
    route: '/dashboard/building',
    subSteps: [
      { titleKey: 'guide.building.step1.title', descriptionKey: 'guide.building.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.building.step2.title', descriptionKey: 'guide.building.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.building.step3.title', descriptionKey: 'guide.building.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
  'create-room': {
    route: '/dashboard/spaces',
    subSteps: [
      { titleKey: 'guide.room.step1.title', descriptionKey: 'guide.room.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.room.step2.title', descriptionKey: 'guide.room.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.room.step3.title', descriptionKey: 'guide.room.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
  'create-asset': {
    route: '/dashboard/assets',
    subSteps: [
      { titleKey: 'guide.asset.step1.title', descriptionKey: 'guide.asset.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.asset.step2.title', descriptionKey: 'guide.asset.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.asset.step3.title', descriptionKey: 'guide.asset.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
  'generate-qr': {
    route: '/dashboard/qr-codes',
    subSteps: [
      { titleKey: 'guide.qr.step1.title', descriptionKey: 'guide.qr.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.qr.step2.title', descriptionKey: 'guide.qr.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.qr.step3.title', descriptionKey: 'guide.qr.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
  'create-report': {
    route: '/dashboard',
    subSteps: [
      { titleKey: 'guide.report.step1.title', descriptionKey: 'guide.report.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.report.step2.title', descriptionKey: 'guide.report.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.report.step3.title', descriptionKey: 'guide.report.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
  'upload-document': {
    route: '/dashboard/documents',
    subSteps: [
      { titleKey: 'guide.document.step1.title', descriptionKey: 'guide.document.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.document.step2.title', descriptionKey: 'guide.document.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.document.step3.title', descriptionKey: 'guide.document.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
  'create-recurring-task': {
    route: '/dashboard/tasks',
    subSteps: [
      { titleKey: 'guide.task.step1.title', descriptionKey: 'guide.task.step1.desc', icon: <Navigation className="h-4 w-4" /> },
      { titleKey: 'guide.task.step2.title', descriptionKey: 'guide.task.step2.desc', icon: <MousePointerClick className="h-4 w-4" /> },
      { titleKey: 'guide.task.step3.title', descriptionKey: 'guide.task.step3.desc', icon: <Save className="h-4 w-4" /> },
    ],
  },
};

const STEP_KEYS: Record<OnboardingStep, string> = {
  'create-building': 'building',
  'create-room': 'room',
  'create-asset': 'asset',
  'generate-qr': 'qr',
  'create-report': 'report',
  'upload-document': 'document',
  'create-recurring-task': 'recurringTask',
};

const ALL_STEP_IDS: OnboardingStep[] = [
  'create-building',
  'create-room',
  'create-asset',
  'generate-qr',
  'create-report',
  'upload-document',
  'create-recurring-task',
];

interface GuideSidebarProps {
  isCollapsed: boolean;
}

const GuideSidebar: React.FC<GuideSidebarProps> = ({ isCollapsed }) => {
  const { activeGuide, guideSubStep, setGuideSubStep, completeStep, stopGuide, steps, startGuide } = useOnboarding();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const guide = activeGuide ? GUIDE_STEPS[activeGuide] : null;
  const isOnCorrectPage = guide ? location.pathname.replace(/\/$/, '') === guide.route.replace(/\/$/, '') : false;

  // Navigate to the step's page when sub-step 0 (Navigate)
  React.useEffect(() => {
    if (!activeGuide || !guide) return;
    if (guideSubStep === 0 && !isOnCorrectPage) {
      navigate(guide.route);
    } else if (guideSubStep === 0 && isOnCorrectPage) {
      setGuideSubStep(1);
    }
  }, [activeGuide, guideSubStep, isOnCorrectPage, guide, navigate, setGuideSubStep]);

  if (!activeGuide || !guide) return null;
  if (isCollapsed) return null;

  const subSteps = guide.subSteps;

  const handleBack = () => {
    stopGuide();
    navigate('/dashboard/getting-started');
  };

  const handleSkip = () => {
    stopGuide();
    navigate('/dashboard/getting-started');
  };

  const handleStepClick = (stepId: OnboardingStep) => {
    if (stepId === activeGuide) return;
    const step = steps.find(s => s.id === stepId);
    if (step?.completed) return;
    startGuide(stepId);
    navigate(GUIDE_STEPS[stepId].route);
  };

  const handleFinish = () => {
    completeStep(activeGuide);
    navigate('/dashboard/getting-started');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('gettingStarted.nav')}
        </button>
        <h3 className="font-semibold text-foreground text-base">
          {t(`gettingStarted.steps.${STEP_KEYS[activeGuide]}.title`)}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t(`gettingStarted.steps.${STEP_KEYS[activeGuide]}.description`)}
        </p>
      </div>

      {/* All steps checklist - clickable to switch */}
      <div className="px-4 pt-3 pb-2 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t('gettingStarted.progress')}
        </p>
        <div className="space-y-0.5">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              disabled={step.completed}
              className={cn(
                "flex items-center gap-2 py-1.5 px-2 text-xs rounded-md w-full text-left transition-colors",
                step.id === activeGuide 
                  ? "text-primary font-medium bg-primary/5" 
                  : step.completed 
                    ? "text-muted-foreground cursor-default"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                step.completed 
                  ? "bg-green-100 text-green-600" 
                  : step.id === activeGuide 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
              )}>
                {step.completed ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{step.index + 1}</span>}
              </div>
              <span className={cn(step.completed && "line-through")}>
                {t(`gettingStarted.steps.${STEP_KEYS[step.id]}.title`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current guide sub-steps */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t('guide.currentStep')}
        </p>
        <div className="space-y-1">
          {subSteps.map((subStep, index) => {
            const isCompleted = index < guideSubStep;
            const isCurrent = index === guideSubStep;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                  isCurrent && "bg-primary/10 border border-primary/20",
                  isCompleted && "opacity-60",
                  !isCurrent && !isCompleted && "opacity-40",
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  isCompleted && "bg-green-100 text-green-600",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground",
                )}>
                  {isCompleted ? <Check className="h-4 w-4" /> : subStep.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                    isCompleted && "line-through",
                  )}>
                    {t(subStep.titleKey)}
                  </h4>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(subStep.descriptionKey)}
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          onClick={handleFinish}
          className="w-full"
          size="sm"
        >
          {t('guide.finishGuide')}
        </Button>
        <Button
          onClick={handleSkip}
          variant="ghost"
          className="w-full text-muted-foreground"
          size="sm"
        >
          {t('tutorial.skip')}
        </Button>
      </div>
    </div>
  );
};

export default GuideSidebar;
