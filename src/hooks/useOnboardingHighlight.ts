import { useEffect } from 'react';
import { useOnboarding, type OnboardingStep } from '@/contexts/OnboardingContext';

/**
 * Adds a pulsing highlight to the button with `data-onboarding-target={step}`
 * when that step is the active guide. Cleans up on unmount or guide change.
 */
export function useOnboardingHighlight(step: OnboardingStep) {
  const { activeGuide } = useOnboarding();

  useEffect(() => {
    if (activeGuide !== step) return;

    const el = document.querySelector(`[data-onboarding-target="${step}"]`);
    if (!el) return;

    el.classList.add('onboarding-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return () => {
      el.classList.remove('onboarding-highlight');
    };
  }, [activeGuide, step]);
}
