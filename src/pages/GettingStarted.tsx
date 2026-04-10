import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOnboarding, type OnboardingStep } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Rocket, Check, Play, HelpCircle } from 'lucide-react';

const STEP_ROUTES: Record<OnboardingStep, string> = {
  'create-building': '/dashboard/building',
  'create-room': '/dashboard/spaces',
  'create-asset': '/dashboard/assets',
  'generate-qr': '/dashboard/qr-codes',
  'create-report': '/dashboard',
  'upload-document': '/dashboard/documents',
  'create-recurring-task': '/dashboard/tasks',
};

const GettingStarted: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { steps, completedCount, totalSteps, startGuide, skipAllSteps } = useOnboarding();

  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const handleStartGuide = (stepId: OnboardingStep) => {
    startGuide(stepId);
    navigate(STEP_ROUTES[stepId]);
  };

  const stepTranslations: Record<OnboardingStep, { title: string; description: string }> = {
    'create-building': {
      title: t('gettingStarted.steps.building.title'),
      description: t('gettingStarted.steps.building.description'),
    },
    'create-room': {
      title: t('gettingStarted.steps.room.title'),
      description: t('gettingStarted.steps.room.description'),
    },
    'create-asset': {
      title: t('gettingStarted.steps.asset.title'),
      description: t('gettingStarted.steps.asset.description'),
    },
    'generate-qr': {
      title: t('gettingStarted.steps.qr.title'),
      description: t('gettingStarted.steps.qr.description'),
    },
    'create-report': {
      title: t('gettingStarted.steps.report.title'),
      description: t('gettingStarted.steps.report.description'),
    },
    'upload-document': {
      title: t('gettingStarted.steps.document.title'),
      description: t('gettingStarted.steps.document.description'),
    },
    'create-recurring-task': {
      title: t('gettingStarted.steps.recurringTask.title'),
      description: t('gettingStarted.steps.recurringTask.description'),
    },
  };

  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-primary font-medium mb-6">
                <Rocket className="h-4 w-4" />
                {t('gettingStarted.badge')}
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t('gettingStarted.heading')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('gettingStarted.subtitle')}
              </p>
            </div>

            {/* Right: Video placeholder */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 aspect-video flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-1 bg-white/20 rounded-full">
                  <div className="h-1 bg-white/60 rounded-full w-1/3" />
                </div>
                <span className="text-white/70 text-xs mt-1 block text-right">2:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-foreground mb-6">
          {t('gettingStarted.stepsHeading')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step) => {
              const trans = stepTranslations[step.id];
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:shadow-sm transition-shadow"
                >
                  {/* Step number / check */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? <Check className="h-5 w-5" /> : step.index + 1}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {trans.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {trans.description}
                    </p>
                  </div>

                  {/* Button */}
                  {!step.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 text-primary border-primary hover:bg-primary/5"
                      onClick={() => handleStartGuide(step.id)}
                    >
                      {t('gettingStarted.startGuide')}
                    </Button>
                  )}
                  {step.completed && (
                    <span className="text-xs text-green-600 font-medium flex-shrink-0">
                      ✓ {t('gettingStarted.completed')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">
                {t('gettingStarted.progress')}
              </h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{completedCount} {t('gettingStarted.of')} {totalSteps} {t('gettingStarted.stepsCompleted')}</span>
                <span className="font-semibold text-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <Button
                variant="default"
                className="w-full mt-4"
                onClick={skipAllSteps}
              >
                {t('gettingStarted.skipAll')}
              </Button>
            </div>

            {/* Support Card */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  {t('gettingStarted.needSupport')}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('gettingStarted.supportDescription')}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://calendly.com/mendigo', '_blank')}
              >
                {t('gettingStarted.bookCall')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
