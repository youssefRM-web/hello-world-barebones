import React, { useEffect, useState, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { createPortal } from 'react-dom';

/**
 * Renders a full-screen backdrop with a "spotlight" cutout around the element
 * matching [data-onboarding-target="<activeGuide>"].
 * The cutout pulses to draw attention.
 */
const OnboardingHighlight: React.FC = () => {
  const { activeGuide, guideSubStep } = useOnboarding();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    if (!activeGuide) { setRect(null); return; }
    // Only highlight on sub-step 1 (the "click the button" step)
    if (guideSubStep !== 1) { setRect(null); return; }
    const el = document.querySelector(`[data-onboarding-target="${activeGuide}"]`) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    setRect(el.getBoundingClientRect());
  }, [activeGuide, guideSubStep]);

  useEffect(() => {
    measure();
    // Re-measure on scroll / resize
    const handler = () => requestAnimationFrame(measure);
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    // Poll briefly in case DOM is still mounting
    const interval = setInterval(measure, 500);
    const timeout = setTimeout(() => clearInterval(interval), 5000);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [measure]);

  if (!rect) return null;

  const pad = 8;

  return createPortal(
    <>
      {/* Backdrop overlay with cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent ${Math.max(rect.width, rect.height) / 2 + pad}px, rgba(0,0,0,0.45) ${Math.max(rect.width, rect.height) / 2 + pad + 40}px)`,
        }}
      />

      {/* Pulsing ring around target */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-lg"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: '0 0 0 3px hsl(var(--primary)), 0 0 20px 4px hsl(var(--primary) / 0.4)',
          animation: 'onboarding-pulse 2s ease-in-out infinite',
        }}
      />

      {/* Tooltip arrow + label below the button */}
      <div
        className="fixed z-[9999] pointer-events-none flex flex-col items-center"
        style={{
          top: rect.bottom + pad + 8,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="w-3 h-3 bg-primary rotate-45 -mb-1.5" />
        <div className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
          👆 Click here
        </div>
      </div>
    </>,
    document.body
  );
};

export default OnboardingHighlight;
