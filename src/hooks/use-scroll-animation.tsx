/**
 * =============================================================================
 * SCROLL ANIMATION HOOKS - Intersection Observer Based Animations
 * =============================================================================
 * 
 * Custom hooks for triggering animations when elements scroll into view.
 * Uses the Intersection Observer API for performance-optimized detection.
 * 
 * Hooks:
 * - useScrollAnimation: Single element visibility detection
 * - useStaggeredAnimation: Multiple elements with delayed reveal
 * =============================================================================
 */

import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation Hook
 * -----------------------
 * Detects when a component enters the viewport and triggers visibility state.
 * Once visible, the element stays visible (no re-hiding on scroll out).
 * 
 * @param threshold - Intersection threshold (unused, kept for compatibility)
 * @returns { ref, isVisible } - Ref to attach to element and visibility state
 * 
 * @example
 * function AnimatedSection() {
 *   const { ref, isVisible } = useScrollAnimation();
 *   return (
 *     <div ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
 *       Content that animates on scroll
 *     </div>
 *   );
 * }
 */
export function useScrollAnimation(threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing (animation only happens once)
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.1,                    // Trigger when 10% visible
        rootMargin: '50px 0px 0px 0px'     // Start animation 50px before entering viewport
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup observer on unmount
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * useStaggeredAnimation Hook
 * --------------------------
 * Animates multiple items with a staggered delay when container enters viewport.
 * Creates a "cascade" or "wave" animation effect.
 * 
 * @param itemCount - Number of items to animate
 * @param delay - Delay in milliseconds between each item (default: 100ms)
 * @returns { containerRef, visibleItems } - Ref for container and array of visibility states
 * 
 * @example
 * function AnimatedList({ items }) {
 *   const { containerRef, visibleItems } = useStaggeredAnimation(items.length, 150);
 *   return (
 *     <div ref={containerRef}>
 *       {items.map((item, i) => (
 *         <div key={i} className={visibleItems[i] ? 'animate-fade-in' : 'opacity-0'}>
 *           {item}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useStaggeredAnimation(itemCount: number, delay = 100) {
  // Initialize all items as not visible
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger staggered animation - each item appears after a delay
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev];
                newState[i] = true;
                return newState;
              });
            }, i * delay);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [itemCount, delay]);

  return { containerRef, visibleItems };
}
