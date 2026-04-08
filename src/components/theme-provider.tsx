/**
 * =============================================================================
 * THEME PROVIDER - Light/Dark Mode Management
 * =============================================================================
 * 
 * Provides theme switching functionality across the application.
 * Persists user preference in localStorage and applies CSS classes.
 * 
 * Themes:
 * - 'light': Light mode (default)
 * - 'dark': Dark mode
 * - 'system': Follows OS preference
 * 
 * Usage:
 * - Wrap app with <ThemeProvider>
 * - Use useTheme() hook in components to access/change theme
 * 
 * CSS Integration:
 * - Adds 'light' or 'dark' class to <html> element
 * - Use Tailwind's dark: variant for dark mode styles
 * =============================================================================
 */

import { createContext, useContext, useEffect, useState } from 'react';

/** Available theme options */
type Theme = 'dark' | 'light' | 'system';

/** Props for ThemeProvider component */
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

/** Context state shape */
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

/** Default context value (used before provider mounts) */
const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

/** React Context for theme state */
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * Theme Provider Component
 * ------------------------
 * Manages theme state and applies appropriate CSS class to document.
 * 
 * @param children - Child components to wrap
 * @param defaultTheme - Initial theme if none stored (default: 'light')
 * @param storageKey - localStorage key for persistence
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'mendigo-theme-v2',
  ...props
}: ThemeProviderProps) {
  // Initialize theme from localStorage or default
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (!stored) {
      // Clean up legacy storage key if exists
      localStorage.removeItem('facility-ui-theme');
      return defaultTheme;
    }
    return stored;
  });

  // Apply theme class to document root whenever theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Handle system preference
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    // Apply selected theme
    root.classList.add(theme);
  }, [theme]);

  // Context value with theme state and setter
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * useTheme Hook
 * -------------
 * Access current theme and setTheme function.
 * Must be used within a ThemeProvider.
 * 
 * @returns { theme, setTheme } - Current theme and setter function
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
