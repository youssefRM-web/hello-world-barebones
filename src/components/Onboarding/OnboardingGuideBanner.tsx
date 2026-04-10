import React from 'react';
import { useOnboarding, type OnboardingStep } from '@/contexts/OnboardingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';

/**
 * Renders a guide overlay banner at the top of pages when a guide step is active.
 * Place this inside page components that correspond to onboarding steps.
 */
interface OnboardingGuideBannerProps {
  step: OnboardingStep;
  children?: React.ReactNode;
}

const OnboardingGuideBanner: React.FC<OnboardingGuideBannerProps> = ({ step, children }) => {
  const { activeGuide, completeStep, stopGuide } = useOnboarding();
  const { t } = useLanguage();

  if (activeGuide !== step) return null;

  const stepKeys: Record<OnboardingStep, string> = {
    'create-building': 'building',
    'create-room': 'room',
    'create-asset': 'asset',
    'generate-qr': 'qr',
    'create-report': 'report',
    'upload-document': 'document',
    'create-recurring-task': 'recurringTask',
  };

  const key = stepKeys[step];

  return (
    <div className="mx-4 mt-4 mb-2 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 relative animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={stopGuide}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base mb-1">
            {t(`gettingStarted.steps.${key}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t(`gettingStarted.steps.${key}.description`)}
          </p>
          {children}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button
          size="sm"
          onClick={() => completeStep(step)}
          className="gap-2"
        >
          {t('tutorial.gotIt')}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopGuide}
          className="text-muted-foreground"
        >
          {t('tutorial.skip')}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingGuideBanner;
