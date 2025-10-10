'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type FontScale = 'base' | 'large';

interface AccessibilityContextValue {
  readonly themePreference: ThemePreference;
  readonly resolvedTheme: ResolvedTheme;
  readonly setThemePreference: (value: ThemePreference) => void;
  readonly toggleTheme: () => void;
  readonly fontScale: FontScale;
  readonly setFontScale: (value: FontScale) => void;
  readonly highContrast: boolean;
  readonly setHighContrast: (value: boolean) => void;
  readonly toggleHighContrast: () => void;
}

const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);

const THEME_KEY = 'apq-theme';
const FONT_KEY = 'apq-font-scale';
const CONTRAST_KEY = 'apq-high-contrast';

function resolvePreferredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_KEY) as
    | ThemePreference
    | null;
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveThemeFromPreference(
  preference: ThemePreference,
): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function resolvePreferredFontScale(): FontScale {
  if (typeof window === 'undefined') return 'base';
  const stored = window.localStorage.getItem(FONT_KEY) as FontScale | null;
  return stored === 'large' ? 'large' : 'base';
}

function resolvePreferredContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CONTRAST_KEY) === '1';
}

function applyTheme(value: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', value === 'dark');
  root.dataset.theme = value;
  root.style.colorScheme = value;
}

function applyFontScale(scale: FontScale) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.fontScale = scale;
  root.style.fontSize = scale === 'large' ? '18px' : '16px';
}

function applyHighContrast(enabled: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('high-contrast', enabled);
  root.dataset.contrast = enabled ? 'high' : 'normal';
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => resolvePreferredTheme(),
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const preference = resolvePreferredTheme();
    return resolveThemeFromPreference(preference);
  });
  const [fontScale, setFontScaleState] = useState<FontScale>(() =>
    resolvePreferredFontScale(),
  );
  const [highContrast, setHighContrastState] = useState<boolean>(() =>
    resolvePreferredContrast(),
  );

  useLayoutEffect(() => {
    applyFontScale(fontScale);
  }, [fontScale]);

  useLayoutEffect(() => {
    applyHighContrast(highContrast);
  }, [highContrast]);

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    if (themePreference !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themePreference]);

  const setThemePreference = (value: ThemePreference) => {
    setThemePreferenceState(value);
    const next = resolveThemeFromPreference(value);
    setResolvedTheme(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, value);
    }
  };

  const toggleTheme = () => {
    const next =
      themePreference === 'dark'
        ? 'light'
        : themePreference === 'system'
          ? resolvedTheme === 'dark'
            ? 'light'
            : 'dark'
          : 'dark';
    setThemePreference(next);
  };

  const setFontScale = (value: FontScale) => {
    setFontScaleState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FONT_KEY, value);
    }
  };

  const setHighContrast = (value: boolean) => {
    setHighContrastState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONTRAST_KEY, value ? '1' : '0');
    }
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference,
      toggleTheme,
      fontScale,
      setFontScale,
      highContrast,
      setHighContrast,
      toggleHighContrast,
    }),
    [themePreference, resolvedTheme, fontScale, highContrast],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider',
    );
  }

  return context;
}

export type { ThemePreference, ResolvedTheme, FontScale };
