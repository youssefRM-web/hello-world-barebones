/**
 * =============================================================================
 * LANGUAGE PROVIDER - Internationalization (i18n)
 * =============================================================================
 * 
 * Provides language switching functionality for German/English support.
 * Persists user preference in localStorage and updates document lang attribute.
 * 
 * Languages:
 * - 'de': German (default)
 * - 'en': English
 * 
 * Usage:
 * - Wrap app with <LanguageProvider>
 * - Use useLanguage() hook to access/change language
 * - Use useTranslation() from lib/translations.ts for translated strings
 * 
 * SEO Integration:
 * - Updates <html lang="..."> attribute for accessibility and SEO
 * =============================================================================
 */

import { createContext, useContext, useEffect, useState } from 'react';

/** Supported languages */
type Language = 'de' | 'en';

/** Props for LanguageProvider component */
type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

/** Context state shape */
type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

/** Default context value (used before provider mounts) */
const initialState: LanguageProviderState = {
  language: 'de',
  setLanguage: () => null,
};

/** React Context for language state */
const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

/**
 * Language Provider Component
 * ---------------------------
 * Manages language state and updates document lang attribute.
 * 
 * @param children - Child components to wrap
 * @param defaultLanguage - Initial language if none stored (default: 'de')
 * @param storageKey - localStorage key for persistence
 */
export function LanguageProvider({
  children,
  defaultLanguage = 'de',
  storageKey = 'language',
  ...props
}: LanguageProviderProps) {
  // Initialize language from localStorage or default
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );

  // Update document lang attribute for accessibility/SEO
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sync with custom language-change events from other providers
  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && (detail === 'en' || detail === 'de') && detail !== language) {
        setLanguage(detail);
      }
    };
    window.addEventListener('language-change', handleLanguageChange);
    return () => window.removeEventListener('language-change', handleLanguageChange);
  }, [language]);

  // Context value with language state and setter
  const value = {
    language,
    setLanguage: (newLang: Language) => {
      localStorage.setItem(storageKey, newLang);
      setLanguage(newLang);
      window.dispatchEvent(new CustomEvent('language-change', { detail: newLang }));
    },
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

/**
 * useLanguage Hook
 * ----------------
 * Access current language and setLanguage function.
 * Must be used within a LanguageProvider.
 * 
 * @returns { language, setLanguage } - Current language and setter function
 * @throws Error if used outside LanguageProvider
 */
export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');

  return context;
};
