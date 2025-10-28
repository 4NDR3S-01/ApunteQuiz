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
  // New accessibility controls
  readonly keyboardNavigationEnabled: boolean;
  readonly setKeyboardNavigationEnabled: (v: boolean) => void;
  readonly pauseAllMedia: () => void;
  readonly playAllMedia: () => void;
  readonly stopAllMedia: () => void;
  readonly visualAlerts: boolean;
  readonly setVisualAlerts: (v: boolean) => void;
  readonly largeButtonsScale: number;
  readonly setLargeButtonsScale: (v: number) => void;
  readonly linkHighlight: boolean;
  readonly setLinkHighlight: (v: boolean) => void;
  readonly focusVisible: boolean;
  readonly setFocusVisible: (v: boolean) => void;
  readonly subtitlesEnabled: boolean;
  readonly setSubtitlesEnabled: (v: boolean) => void;
  readonly autoTranscripts: boolean;
  readonly setAutoTranscripts: (v: boolean) => void;
  readonly videoInterpreterEnabled: boolean;
  readonly setVideoInterpreterEnabled: (v: boolean) => void;
  readonly customFont: string;
  readonly setCustomFont: (v: string) => void;
  readonly customColor: string;
  readonly setCustomColor: (v: string) => void;
  readonly voiceControlEnabled: boolean;
  readonly setVoiceControlEnabled: (v: boolean) => void;
  readonly blockAutoplay: boolean;
  readonly setBlockAutoplay: (v: boolean) => void;
  readonly customShortcutsEnabled: boolean;
  readonly setCustomShortcutsEnabled: (v: boolean) => void;
  readonly textScale: number;
  readonly setTextScale: (v: number) => void;
}

const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);

const THEME_KEY = 'apq-theme';
const FONT_KEY = 'apq-font-scale';
const CONTRAST_KEY = 'apq-high-contrast';
const LINE_SPACING_KEY = 'apq-line-spacing';
const DYSLEXIC_KEY = 'apq-dyslexic-font';
const KB_NAV_KEY = 'apq-keyboard-navigation';
const VISUAL_ALERTS_KEY = 'apq-visual-alerts';
const LARGE_BUTTONS_KEY = 'apq-large-buttons-scale';
const LINK_HIGHLIGHT_KEY = 'apq-link-highlight';
const FOCUS_VISIBLE_KEY = 'apq-focus-visible';
const SUBTITLES_KEY = 'apq-subtitles-enabled';
const TRANSCRIPTS_KEY = 'apq-auto-transcripts';
const VIDEO_INTERPRETER_KEY = 'apq-video-interpreter';
const CUSTOM_FONT_KEY = 'apq-custom-font';
const CUSTOM_COLOR_KEY = 'apq-custom-color';
const VOICE_CONTROL_KEY = 'apq-voice-control';
const BLOCK_AUTOPLAY_KEY = 'apq-block-autoplay';
const CUSTOM_SHORTCUTS_KEY = 'apq-custom-shortcuts-enabled';
const TEXT_SCALE_KEY = 'apq-text-scale';

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
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const raw = window.localStorage.getItem(KB_NAV_KEY);
    return raw === null ? true : raw === '1';
  });
  const [visualAlerts, setVisualAlertsState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(VISUAL_ALERTS_KEY) === '1';
  });
  const [largeButtonsScale, setLargeButtonsScaleState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const raw = window.localStorage.getItem(LARGE_BUTTONS_KEY);
    return raw ? Number(raw) : 1;
  });
  const [linkHighlight, setLinkHighlightState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(LINK_HIGHLIGHT_KEY) !== '0';
  });
  const [focusVisible, setFocusVisibleState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(FOCUS_VISIBLE_KEY) !== '0';
  });
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSupported, setReadingSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined'
    );
  });
  const [readingMessage, setReadingMessage] = useState<string | null>(null);
  const [subtitlesEnabled, setSubtitlesEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SUBTITLES_KEY) === '1';
  });
  const [autoTranscripts, setAutoTranscriptsState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(TRANSCRIPTS_KEY) === '1';
  });
  const [videoInterpreterEnabled, setVideoInterpreterEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(VIDEO_INTERPRETER_KEY) === '1';
  });
  const [customFont, setCustomFontState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(CUSTOM_FONT_KEY) ?? '';
  });
  const [customColor, setCustomColorState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(CUSTOM_COLOR_KEY) ?? '';
  });
  const [voiceControlEnabled, setVoiceControlEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(VOICE_CONTROL_KEY) === '1';
  });
  const [blockAutoplay, setBlockAutoplayState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(BLOCK_AUTOPLAY_KEY) === '1';
  });
  const [customShortcutsEnabled, setCustomShortcutsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CUSTOM_SHORTCUTS_KEY) === '1';
  });
  const [textScale, setTextScaleState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const raw = window.localStorage.getItem(TEXT_SCALE_KEY);
    return raw ? Number(raw) : 1;
  });
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
    if (typeof document === 'undefined') return;
    // Apply numerical text scale multiplicatively over the base font-size
    const base = fontScale === 'large' ? 18 : 16;
    const computed = Math.round(base * textScale);
    try {
      document.documentElement.style.fontSize = `${computed}px`;
      document.documentElement.style.setProperty('--a11y-text-scale', String(textScale));
    } catch {}
  }, [textScale, fontScale]);

  useLayoutEffect(() => {
    // apply large buttons scale as CSS variable
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--a11y-large-button-scale', String(largeButtonsScale));
  }, [largeButtonsScale]);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    if (linkHighlight) {
      document.documentElement.classList.add('a11y-link-highlight');
    } else {
      document.documentElement.classList.remove('a11y-link-highlight');
    }
  }, [linkHighlight]);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    if (focusVisible) {
      document.documentElement.classList.add('a11y-focus-visible');
    } else {
      document.documentElement.classList.remove('a11y-focus-visible');
    }
  }, [focusVisible]);

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

  const setKeyboardNavigationEnabled = (value: boolean) => {
    setKeyboardNavigationEnabledState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(KB_NAV_KEY, value ? '1' : '0');
  };

  const setVisualAlerts = (value: boolean) => {
    setVisualAlertsState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(VISUAL_ALERTS_KEY, value ? '1' : '0');
  };

  const setLargeButtonsScale = (value: number) => {
    setLargeButtonsScaleState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(LARGE_BUTTONS_KEY, String(value));
  };

  const setLinkHighlight = (value: boolean) => {
    setLinkHighlightState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(LINK_HIGHLIGHT_KEY, value ? '1' : '0');
  };

  const setFocusVisible = (value: boolean) => {
    setFocusVisibleState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(FOCUS_VISIBLE_KEY, value ? '1' : '0');
  };

  const setSubtitlesEnabled = (value: boolean) => {
    setSubtitlesEnabledState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(SUBTITLES_KEY, value ? '1' : '0');
  };

  const setAutoTranscripts = (value: boolean) => {
    setAutoTranscriptsState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(TRANSCRIPTS_KEY, value ? '1' : '0');
  };

  const setVideoInterpreterEnabled = (value: boolean) => {
    setVideoInterpreterEnabledState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(VIDEO_INTERPRETER_KEY, value ? '1' : '0');
  };

  const setCustomFont = (value: string) => {
    setCustomFontState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(CUSTOM_FONT_KEY, value);
  };

  const setCustomColor = (value: string) => {
    setCustomColorState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CUSTOM_COLOR_KEY, value);
      try {
        document.documentElement.style.setProperty('--a11y-custom-color', value || '');
      } catch {}
    }
  };

  // Map and apply font family and accent color when changed
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    // Apply custom font mapping to CSS variable --a11y-font-family
    const mapFont = (key: string) => {
      switch (key) {
        case 'sans':
          return `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
        case 'serif':
          return `Georgia, 'Times New Roman', Times, serif`;
        case 'dyslexic':
          return `'OpenDyslexic', 'Trebuchet MS', Verdana, Arial, sans-serif`;
        default:
          return `var(--font-sans), Arial, Helvetica, sans-serif`;
      }
    };

    try {
      const family = mapFont(customFont ?? '');
      document.documentElement.style.setProperty('--a11y-font-family', family);
    } catch {}

    // Apply custom color as the accent and also set contrast-aware accent-contrast
    try {
      const color = customColor && customColor.length ? customColor : '';
      if (color) {
        document.documentElement.style.setProperty('--a11y-custom-color', color);
        // override primary accent to match user's chosen color
        document.documentElement.style.setProperty('--accent', color);
        // compute simple contrast (luminance) to pick white or black for accent contrast
        const hex = color.replace('#', '');
        if (hex.length === 3) {
          const r = parseInt(hex[0] + hex[0], 16);
          const g = parseInt(hex[1] + hex[1], 16);
          const b = parseInt(hex[2] + hex[2], 16);
          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const contrast = lum > 0.5 ? '#000000' : '#ffffff';
          document.documentElement.style.setProperty('--accent-contrast', contrast);
        } else if (hex.length === 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const contrast = lum > 0.5 ? '#000000' : '#ffffff';
          document.documentElement.style.setProperty('--accent-contrast', contrast);
        }
      }
    } catch {}
  }, [customFont, customColor]);

  const setVoiceControlEnabled = (value: boolean) => {
    setVoiceControlEnabledState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(VOICE_CONTROL_KEY, value ? '1' : '0');
  };

  const setBlockAutoplay = (value: boolean) => {
    setBlockAutoplayState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(BLOCK_AUTOPLAY_KEY, value ? '1' : '0');
  };

  const setCustomShortcutsEnabled = (value: boolean) => {
    setCustomShortcutsEnabledState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(CUSTOM_SHORTCUTS_KEY, value ? '1' : '0');
  };

  const setTextScale = (value: number) => {
    setTextScaleState(value);
    if (typeof window !== 'undefined') window.localStorage.setItem(TEXT_SCALE_KEY, String(value));
  };

  // media control helpers
  const pauseAllMedia = () => {
    if (typeof document === 'undefined') return;
    const media = Array.from(document.querySelectorAll('audio,video')) as HTMLMediaElement[];
    media.forEach((m) => m.pause());
  };

  const playAllMedia = () => {
    if (typeof document === 'undefined') return;
    const media = Array.from(document.querySelectorAll('audio,video')) as HTMLMediaElement[];
    media.forEach((m) => { try { m.play(); } catch {} });
  };

  const stopAllMedia = () => {
    if (typeof document === 'undefined') return;
    const media = Array.from(document.querySelectorAll('audio,video')) as HTMLMediaElement[];
    media.forEach((m) => {
      try {
        m.pause();
        m.currentTime = 0;
      } catch {}
    });
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
      keyboardNavigationEnabled,
      setKeyboardNavigationEnabled,
      pauseAllMedia,
      playAllMedia,
      stopAllMedia,
      visualAlerts,
      setVisualAlerts,
      largeButtonsScale,
      setLargeButtonsScale,
      linkHighlight,
      setLinkHighlight,
      focusVisible,
      setFocusVisible,
      subtitlesEnabled,
      setSubtitlesEnabled,
      autoTranscripts,
      setAutoTranscripts,
      videoInterpreterEnabled,
      setVideoInterpreterEnabled,
      customFont,
      setCustomFont,
      customColor,
      setCustomColor,
      voiceControlEnabled,
      setVoiceControlEnabled,
      blockAutoplay,
      setBlockAutoplay,
      customShortcutsEnabled,
      setCustomShortcutsEnabled,
      textScale,
      setTextScale,
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
      keyboardNavigationEnabled,
      visualAlerts,
      largeButtonsScale,
      linkHighlight,
      focusVisible,
      subtitlesEnabled,
      autoTranscripts,
      videoInterpreterEnabled,
      customFont,
      customColor,
      voiceControlEnabled,
      blockAutoplay,
      customShortcutsEnabled,
      textScale,
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
