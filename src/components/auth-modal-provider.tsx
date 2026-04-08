import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthModals } from '@/components/modals';

interface AuthModalContextType {
  openAuthModal: (type?: "login" | "register" | "forgot-password" | "reset-password") => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"login" | "register" | "forgot-password" | "reset-password">("register");

  const openAuthModal = (type: "login" | "register" | "forgot-password" | "reset-password" = "register") => {
    setModalType(type);
    setIsOpen(true);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      <AuthModals isOpen={isOpen} onClose={() => setIsOpen(false)} initialModal={modalType} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
