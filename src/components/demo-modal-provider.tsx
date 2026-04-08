/**
 * =============================================================================
 * DEMO MODAL PROVIDER - Demo Booking Modal State Management
 * =============================================================================
 * 
 * Provides global access to the demo booking modal.
 * Allows any component to open the modal without prop drilling.
 * 
 * Usage:
 * - Wrap app with <DemoModalProvider>
 * - Use useDemoModal() hook in components
 * - Call openDemoModal() to show the modal
 * 
 * The modal contains an embedded Calendly widget for booking demos.
 * =============================================================================
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { DemoModal } from './demo-modal';

/** Context type definition */
interface DemoModalContextType {
  /** Opens the demo booking modal */
  openDemoModal: () => void;
}

/** React Context for demo modal */
const DemoModalContext = createContext<DemoModalContextType | undefined>(undefined);

/**
 * Demo Modal Provider Component
 * -----------------------------
 * Manages demo modal open/close state and renders the modal.
 * 
 * @param children - Child components to wrap
 */
export function DemoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  /** Opens the demo modal */
  const openDemoModal = () => setIsOpen(true);

  return (
    <DemoModalContext.Provider value={{ openDemoModal }}>
      {children}
      <DemoModal open={isOpen} onOpenChange={setIsOpen} />
    </DemoModalContext.Provider>
  );
}

/**
 * useDemoModal Hook
 * -----------------
 * Access demo modal controls.
 * Must be used within a DemoModalProvider.
 * 
 * @returns { openDemoModal } - Function to open the modal
 * @throws Error if used outside DemoModalProvider
 */
export function useDemoModal() {
  const context = useContext(DemoModalContext);
  if (context === undefined) {
    throw new Error('useDemoModal must be used within a DemoModalProvider');
  }
  return context;
}
