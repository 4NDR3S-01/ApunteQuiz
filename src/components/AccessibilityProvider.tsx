'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type FontScale = 'base' | 'large';
type LineSpacing = 'normal' | 'relaxed';

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
  readonly resetHighContrastPreference: () => void;
  readonly usesSystemContrast: boolean;
  readonly lineSpacing: LineSpacing;
  readonly setLineSpacing: (value: LineSpacing) => void;
  readonly dyslexicFont: boolean;
  readonly setDyslexicFont: (value: boolean) => void;
  readonly isReading: boolean;
  readonly startReading: () => void;
  readonly stopReading: () => void;
  readonly readingSupported: boolean;
  readonly readingMessage: string | null;
  readonly clearReadingMessage: () => void;
}

const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);

const THEME_KEY = 'apq-theme';
const FONT_KEY = 'apq-font-scale';
const CONTRAST_KEY = 'apq-high-contrast';
const LINE_SPACING_KEY = 'apq-line-spacing';
const DYSLEXIC_KEY = 'apq-dyslexic-font';

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

function resolvePreferredLineSpacing(): LineSpacing {
  if (typeof window === 'undefined') return 'normal';
  const stored = window.localStorage.getItem(LINE_SPACING_KEY) as LineSpacing | null;
  return stored === 'relaxed' ? 'relaxed' : 'normal';
}

function resolvePreferredContrast(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(CONTRAST_KEY);
  if (stored === '1') return true;
  if (stored === '0') return false;
  if (window.matchMedia('(prefers-contrast: more)').matches) {
    return true;
  }
  return false;
}

function resolvePreferredDyslexic(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DYSLEXIC_KEY) === '1';
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

function applyLineSpacing(scale: LineSpacing) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.lineSpacing = scale;
  root.style.setProperty('--line-height-base', scale === 'relaxed' ? '1.85' : '1.6');
}

function applyHighContrast(enabled: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('high-contrast', enabled);
  root.dataset.contrast = enabled ? 'high' : 'normal';
}

function applyDyslexicFont(enabled: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dyslexic-font', enabled);
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
  const [lineSpacing, setLineSpacingState] = useState<LineSpacing>(() =>
    resolvePreferredLineSpacing(),
  );
  const [highContrast, setHighContrastState] = useState<boolean>(() =>
    resolvePreferredContrast(),
  );
  const [hasContrastOverride, setHasContrastOverride] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CONTRAST_KEY) !== null;
  });
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(() =>
    resolvePreferredDyslexic(),
  );
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSupported, setReadingSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined'
    );
  });
  const [readingMessage, setReadingMessage] = useState<string | null>(null);
  const clearReadingMessage = useCallback(() => setReadingMessage(null), []);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  useLayoutEffect(() => {
    return () => {
      if (typeof window === 'undefined') return;
      cleanupVoiceListener();
      window.speechSynthesis?.cancel();
    };
  }, []);

useEffect(() => {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth) return;

    const ensureVoices = () => {
      if (synth.getVoices().length > 0) {
        synth.removeEventListener('voiceschanged', ensureVoices);
      }
    };

    synth.addEventListener('voiceschanged', ensureVoices);
    synth.getVoices();

    return () => synth.removeEventListener('voiceschanged', ensureVoices);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported =
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined';
    setReadingSupported(supported);
    if (!supported) {
      setReadingMessage(
        'Narrador no disponible en este navegador. Intenta con la versión más reciente o habilita la síntesis de voz en tu sistema.',
      );
    }
  }, []);

  useLayoutEffect(() => {
    applyFontScale(fontScale);
  }, [fontScale]);

  useLayoutEffect(() => {
    applyLineSpacing(lineSpacing);
  }, [lineSpacing]);

  useLayoutEffect(() => {
    applyHighContrast(highContrast);
  }, [highContrast]);

  useLayoutEffect(() => {
    applyDyslexicFont(dyslexicFont);
  }, [dyslexicFont]);

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const ensureVoices = () => {
      const voices = synth.getVoices();
      if (voices && voices.length > 0) {
        voicesLoadedRef.current = true;
      }
    };

    ensureVoices();
    synth.addEventListener('voiceschanged', ensureVoices);

    return () => {
      synth.removeEventListener('voiceschanged', ensureVoices);
    };
  }, []);

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

  const setLineSpacing = (value: LineSpacing) => {
    setLineSpacingState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LINE_SPACING_KEY, value);
    }
  };

  const setHighContrast = (value: boolean) => {
    setHighContrastState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONTRAST_KEY, value ? '1' : '0');
    }
    setHasContrastOverride(true);
  };

  const setDyslexicFont = (value: boolean) => {
    setDyslexicFontState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DYSLEXIC_KEY, value ? '1' : '0');
    }
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const resetHighContrastPreference = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CONTRAST_KEY);
    }
    setHasContrastOverride(false);
    setHighContrastState(resolvePreferredContrast());
  };

  const voiceListenerRef = useRef<(() => void) | null>(null);

  const cleanupVoiceListener = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (voiceListenerRef.current) {
      synth.removeEventListener('voiceschanged', voiceListenerRef.current);
      voiceListenerRef.current = null;
    }
  };

  const stopReading = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    cleanupVoiceListener();
    setIsReading(false);
    utteranceRef.current = null;
    synth.cancel();
  };

  const startReading = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (!readingSupported) {
      setReadingMessage(
        'Narrador no disponible en este navegador. Intenta actualizarlo o habilitar la síntesis de voz.',
      );
      return;
    }

    const content =
      document.querySelector('main')?.innerText ||
      document.body.innerText ||
      '';

    const textContent = content.replace(/\s+/g, ' ').trim();
    if (!textContent) {
      setReadingMessage(
        'No encontramos texto legible en esta pantalla. Prueba en una sección con contenido descriptivo.',
      );
      return;
    }

    cleanupVoiceListener();
    synth.cancel();
    setReadingMessage(null);

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;

      const voices = synth.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find((voice) => voice.lang.toLowerCase().startsWith('es')) ||
          voices[0];
        if (preferred) {
          utterance.voice = preferred;
        }
      }

      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => {
        setIsReading(false);
        utteranceRef.current = null;
        setReadingMessage('Lectura finalizada.');
      };
      utterance.onerror = () => {
        setIsReading(false);
        utteranceRef.current = null;
        setReadingMessage(
          'No pudimos reproducir la lectura. Revisa que tu navegador tenga voces habilitadas.',
        );
      };

      utteranceRef.current = utterance;
      setIsReading(true);

      try {
        if (synth.paused) {
          synth.resume();
        }
        synth.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis error:', error);
        setIsReading(false);
        utteranceRef.current = null;
      }
    };

    if ((synth.getVoices() || []).length === 0) {
      setReadingMessage('Cargando voces disponibles… vuelve a intentar en unos segundos.');
      const handleVoices = () => {
        cleanupVoiceListener();
        setReadingMessage(null);
        speak();
      };
      voiceListenerRef.current = handleVoices;
      synth.addEventListener('voiceschanged', handleVoices, { once: true });
      return;
    }

    speak();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || hasContrastOverride) return;
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = () => {
      setHighContrastState(mediaQuery.matches);
    };
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasContrastOverride]);

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
      resetHighContrastPreference,
      usesSystemContrast: !hasContrastOverride,
      lineSpacing,
      setLineSpacing,
      dyslexicFont,
      setDyslexicFont,
      isReading,
      startReading,
      stopReading,
      readingSupported,
      readingMessage,
      clearReadingMessage,
    }),
    [
      themePreference,
      resolvedTheme,
      fontScale,
      highContrast,
      lineSpacing,
      dyslexicFont,
      isReading,
      resetHighContrastPreference,
      hasContrastOverride,
      readingSupported,
      readingMessage,
      clearReadingMessage,
    ],
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

export type { ThemePreference, ResolvedTheme, FontScale, LineSpacing };
