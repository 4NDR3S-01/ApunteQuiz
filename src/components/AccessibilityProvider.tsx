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
import { usePathname } from 'next/navigation';
import { ToastContainer } from './Toast';

// Tipos para reconocimiento de voz
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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
  readonly customFont: string;
  readonly setCustomFont: (v: string) => void;
  readonly customColor: string;
  readonly setCustomColor: (v: string) => void;
  readonly voiceControlEnabled: boolean;
  readonly setVoiceControlEnabled: (v: boolean) => void;
  readonly voiceControlActive: boolean;
  readonly voiceControlMessage: string | null;
  readonly autoVoiceControlActive: boolean;
  readonly showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  readonly blockAutoplay: boolean;
  readonly setBlockAutoplay: (v: boolean) => void;
  readonly customShortcutsEnabled: boolean;
  readonly setCustomShortcutsEnabled: (v: boolean) => void;
  readonly textScale: number;
  readonly setTextScale: (v: number) => void;
  readonly autoPlay: boolean;
  readonly setAutoPlay: (v: boolean) => void;
  readonly autoScroll: boolean;
  readonly setAutoScroll: (v: boolean) => void;
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
const CUSTOM_FONT_KEY = 'apq-custom-font';
const CUSTOM_COLOR_KEY = 'apq-custom-color';
const VOICE_CONTROL_KEY = 'apq-voice-control';
const BLOCK_AUTOPLAY_KEY = 'apq-block-autoplay';
const CUSTOM_SHORTCUTS_KEY = 'apq-custom-shortcuts-enabled';
const TEXT_SCALE_KEY = 'apq-text-scale';
const AUTO_PLAY_KEY = 'apq-auto-play';
const AUTO_SCROLL_KEY = 'apq-auto-scroll';

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
  // Initialize with safe defaults to avoid hydration mismatch
  const pathname = usePathname();
  // Páginas principales donde el control por voz está habilitado
  const MAIN_PAGES = ['/', '/faq', '/contacto', '/dashboard'];
  const isMainPage = MAIN_PAGES.includes(pathname || '/');
  
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isHydrated, setIsHydrated] = useState(false);
  const [fontScale, setFontScaleState] = useState<FontScale>('base');
  const [lineSpacing, setLineSpacingState] = useState<LineSpacing>('normal');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [hasContrastOverride, setHasContrastOverride] = useState<boolean>(false);
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(false);
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabledState] = useState<boolean>(true);
  const [visualAlerts, setVisualAlertsState] = useState<boolean>(false);
  const [largeButtonsScale, setLargeButtonsScaleState] = useState<number>(1);
  const [linkHighlight, setLinkHighlightState] = useState<boolean>(false);
  const [focusVisible, setFocusVisibleState] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSupported, setReadingSupported] = useState<boolean>(false);
  const [readingMessage, setReadingMessage] = useState<string | null>(null);
  const [subtitlesEnabled, setSubtitlesEnabledState] = useState<boolean>(false);
  const [autoTranscripts, setAutoTranscriptsState] = useState<boolean>(false);
  const [customFont, setCustomFontState] = useState<string>('');
  const [customColor, setCustomColorState] = useState<string>('');
  const [voiceControlEnabled, setVoiceControlEnabledState] = useState<boolean>(false);
  const [voiceControlActive, setVoiceControlActive] = useState<boolean>(false);
  const [voiceControlMessage, setVoiceControlMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>>([]);
  const [userHasInteracted, setUserHasInteracted] = useState<boolean>(false);
  const [autoVoiceControlActive, setAutoVoiceControlActive] = useState<boolean>(false);
  const [blockAutoplay, setBlockAutoplayState] = useState<boolean>(false);
  const [customShortcutsEnabled, setCustomShortcutsEnabledState] = useState<boolean>(false);
  const [textScale, setTextScaleState] = useState<number>(1);
  const [autoPlay, setAutoPlayState] = useState<boolean>(false);
  const [autoScroll, setAutoScrollState] = useState<boolean>(true);
  const clearReadingMessage = useCallback(() => setReadingMessage(null), []);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const browserNotSupportedShownRef = useRef<boolean>(false);
  const voicesLoadedRef = useRef(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const toastCacheRef = useRef<Map<string, number>>(new Map());

  // Función para mostrar toast con prevención de duplicados
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const now = Date.now();
    const cacheKey = `${message}-${type}`;
    const lastShown = toastCacheRef.current.get(cacheKey);
    
    // Prevenir mostrar el mismo toast dentro de 3 segundos
    if (lastShown && (now - lastShown) < 3000) {
      return;
    }
    
    toastCacheRef.current.set(cacheKey, now);
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Limpiar cache después de 5 segundos
    setTimeout(() => {
      toastCacheRef.current.delete(cacheKey);
    }, 5000);
  }, []);

  // Función para remover toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Detectar interacción del usuario (solo interacciones intencionales)
  useEffect(() => {
    if (typeof globalThis.window === 'undefined') return;

    let interactionDebounce: number | null = null;
    let lastToastTime = 0;
    const TOAST_COOLDOWN = 2000; // 2 segundos entre toasts

    const handleInteraction = (e: Event) => {
      // Ignorar eventos que no son interacciones intencionales
      // No contar movimientos de mouse, solo clicks y teclas
      const isIntentional = 
        e.type === 'click' || 
        (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Tab') ||
        e.type === 'touchstart' ||
        (e.type === 'mousedown' && (e as MouseEvent).button === 0);

      if (!isIntentional) return;

      // Debounce para evitar múltiples llamadas
      if (interactionDebounce) {
        clearTimeout(interactionDebounce);
      }

      interactionDebounce = window.setTimeout(() => {
        setUserHasInteracted(true);
        lastInteractionTimeRef.current = Date.now();
        
        // Si el control por voz automático está activo, desactivarlo
        // Pero solo mostrar toast una vez cada cierto tiempo
        const now = Date.now();
        if (autoVoiceControlActive) {
          setAutoVoiceControlActive(false);
          setVoiceControlEnabledState(false);
          
          if (now - lastToastTime > TOAST_COOLDOWN) {
            showToast('Control por voz desactivado debido a interacción del usuario', 'info');
            lastToastTime = now;
          }
        }

        // Limpiar timer de inactividad
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }

        // NO reiniciar timer si el control por voz automático está activo
        // Solo reiniciar si está desactivado y estamos en una página principal
        if (isMainPage && !autoVoiceControlActive && !voiceControlEnabled) {
          inactivityTimerRef.current = window.setTimeout(() => {
            if (isMainPage && !voiceControlEnabled && !userHasInteracted && !autoVoiceControlActive) {
              setVoiceControlEnabledState(true);
              setAutoVoiceControlActive(true);
              showToast('Control por voz activado automáticamente. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"', 'success');
            }
          }, 600000); // 10 minutos = 600000 ms
        }
      }, 300); // Debounce de 300ms
    };

    // Solo eventos que indican interacción intencional del usuario
    const events = ['click', 'keydown', 'touchstart', 'mousedown'];
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    // Iniciar timer de inactividad inicial solo si no hay interacción previa y estamos en una página principal
    if (isMainPage) {
      inactivityTimerRef.current = window.setTimeout(() => {
        if (isMainPage && !voiceControlEnabled && !userHasInteracted && !autoVoiceControlActive) {
          setVoiceControlEnabledState(true);
          setAutoVoiceControlActive(true);
          showToast('Control por voz activado automáticamente. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"', 'success');
        }
      }, 600000); // 10 minutos = 600000 ms
    }

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (interactionDebounce) {
        clearTimeout(interactionDebounce);
      }
    };
  }, [voiceControlEnabled, userHasInteracted, autoVoiceControlActive, showToast, isMainPage]);

  // Auto-scroll suave cuando no hay interactividad
  useEffect(() => {
    if (typeof globalThis.window === 'undefined' || !autoScroll) return;

    let scrollInterval: number | null = null;
    let inactivityTimeout: number | null = null;
    let isAutoScrolling = false;
    let lastMouseMove = Date.now();
    const INACTIVITY_DELAY = 3000; // 3 segundos de inactividad
    const SCROLL_SPEED = 2; // píxeles por intervalo
    const SCROLL_INTERVAL = 30; // ms entre scrolls
    const MOUSE_MOVE_THRESHOLD = 1000; // Ignorar mousemove si no hay movimiento en 1 segundo

    const startAutoScroll = () => {
      if (scrollInterval || !autoScroll) return;
      
      isAutoScrolling = true;
      scrollInterval = window.setInterval(() => {
        // Scroll suave hacia abajo
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY < maxScroll) {
          window.scrollBy({ top: SCROLL_SPEED, behavior: 'auto' });
        } else {
          // Si llegamos al final, detener
          stopAutoScroll();
        }
      }, SCROLL_INTERVAL);
    };

    const stopAutoScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
      isAutoScrolling = false;
    };

    const resetInactivityTimer = () => {
      stopAutoScroll();

      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }

      inactivityTimeout = window.setTimeout(() => {
        if (autoScroll) {
          startAutoScroll();
        }
      }, INACTIVITY_DELAY);
    };

    // Manejador especial para scroll que ignora scroll automático
    const handleScroll = (e: Event) => {
      if (!isAutoScrolling) {
        resetInactivityTimer();
      }
    };

    // Manejador para mousemove con throttling
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove > MOUSE_MOVE_THRESHOLD) {
        lastMouseMove = now;
        resetInactivityTimer();
      }
    };

    // Eventos que indican actividad del usuario
    window.addEventListener('mousedown', resetInactivityTimer, { passive: true });
    window.addEventListener('keydown', resetInactivityTimer, { passive: true });
    window.addEventListener('touchstart', resetInactivityTimer, { passive: true });
    window.addEventListener('wheel', resetInactivityTimer, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Iniciar el timer inicial
    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousedown', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('touchstart', resetInactivityTimer);
      window.removeEventListener('wheel', resetInactivityTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      stopAutoScroll();
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, [autoScroll]);

  // Load preferences from localStorage after hydration to avoid mismatch
  useEffect(() => {
    if (typeof globalThis.window === 'undefined') return;
    
    setIsHydrated(true);
    
    // Load theme
    const storedTheme = resolvePreferredTheme();
    setThemePreferenceState(storedTheme);
    setResolvedTheme(resolveThemeFromPreference(storedTheme));
    
    // Load other preferences
    setFontScaleState(resolvePreferredFontScale());
    setLineSpacingState(resolvePreferredLineSpacing());
    setHighContrastState(resolvePreferredContrast());
    setHasContrastOverride(globalThis.window.localStorage.getItem(CONTRAST_KEY) !== null);
    setDyslexicFontState(resolvePreferredDyslexic());
    
    const kbNavRaw = globalThis.window.localStorage.getItem(KB_NAV_KEY);
    setKeyboardNavigationEnabledState(kbNavRaw === null ? true : kbNavRaw === '1');
    
    setVisualAlertsState(globalThis.window.localStorage.getItem(VISUAL_ALERTS_KEY) === '1');
    
    const largeButtonsRaw = globalThis.window.localStorage.getItem(LARGE_BUTTONS_KEY);
    setLargeButtonsScaleState(largeButtonsRaw ? Number(largeButtonsRaw) : 1);
    
    const linkHighlightRaw = globalThis.window.localStorage.getItem(LINK_HIGHLIGHT_KEY);
    setLinkHighlightState(linkHighlightRaw === '1');
    
    const focusVisibleRaw = globalThis.window.localStorage.getItem(FOCUS_VISIBLE_KEY);
    setFocusVisibleState(focusVisibleRaw === '1');
    
    setReadingSupported(
      'speechSynthesis' in globalThis.window &&
      typeof globalThis.window.SpeechSynthesisUtterance !== 'undefined'
    );
    
    setSubtitlesEnabledState(globalThis.window.localStorage.getItem(SUBTITLES_KEY) === '1');
    setAutoTranscriptsState(globalThis.window.localStorage.getItem(TRANSCRIPTS_KEY) === '1');
    setCustomFontState(globalThis.window.localStorage.getItem(CUSTOM_FONT_KEY) ?? '');
    setCustomColorState(globalThis.window.localStorage.getItem(CUSTOM_COLOR_KEY) ?? '');
    setVoiceControlEnabledState(globalThis.window.localStorage.getItem(VOICE_CONTROL_KEY) === '1');
    setBlockAutoplayState(globalThis.window.localStorage.getItem(BLOCK_AUTOPLAY_KEY) === '1');
    setCustomShortcutsEnabledState(globalThis.window.localStorage.getItem(CUSTOM_SHORTCUTS_KEY) === '1');
    
    const textScaleRaw = globalThis.window.localStorage.getItem(TEXT_SCALE_KEY);
    setTextScaleState(textScaleRaw ? Number(textScaleRaw) : 1);
    
    const autoPlayValue = globalThis.window.localStorage.getItem(AUTO_PLAY_KEY);
    setAutoPlayState(autoPlayValue === '1');
    
    const autoScrollValue = globalThis.window.localStorage.getItem(AUTO_SCROLL_KEY);
    setAutoScrollState(autoScrollValue === null ? true : autoScrollValue === '1');
    
    // Después de cargar todas las preferencias, marcar que la carga inicial terminó
    // Esto evita mostrar toasts de error en la carga inicial
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 1000);
  }, []);

  useLayoutEffect(() => {
    return () => {
      if (typeof globalThis.window === 'undefined') return;
      cleanupVoiceListener();
      globalThis.window.speechSynthesis?.cancel();
    };
  }, []);

useEffect(() => {
  if (typeof globalThis.window === 'undefined') return;
  const synth = globalThis.window.speechSynthesis;
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
      'speechSynthesis' in globalThis.window &&
      typeof globalThis.window.SpeechSynthesisUtterance !== 'undefined';
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
    if (typeof globalThis.window === 'undefined') return;
    const synth = globalThis.window.speechSynthesis;
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
    if (themePreference !== 'system' || typeof globalThis.window === 'undefined') return;

    const mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)');
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
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.localStorage.setItem(THEME_KEY, value);
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
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.localStorage.setItem(FONT_KEY, value);
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
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(KB_NAV_KEY, value ? '1' : '0');
  };

  const setVisualAlerts = (value: boolean) => {
    setVisualAlertsState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(VISUAL_ALERTS_KEY, value ? '1' : '0');
  };

  const setLargeButtonsScale = (value: number) => {
    setLargeButtonsScaleState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(LARGE_BUTTONS_KEY, String(value));
  };

  const setLinkHighlight = (value: boolean) => {
    setLinkHighlightState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(LINK_HIGHLIGHT_KEY, value ? '1' : '0');
  };

  const setFocusVisible = (value: boolean) => {
    setFocusVisibleState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(FOCUS_VISIBLE_KEY, value ? '1' : '0');
  };

  const setSubtitlesEnabled = (value: boolean) => {
    setSubtitlesEnabledState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(SUBTITLES_KEY, value ? '1' : '0');
  };

  const setAutoTranscripts = (value: boolean) => {
    setAutoTranscriptsState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(TRANSCRIPTS_KEY, value ? '1' : '0');
  };

  const setCustomFont = (value: string) => {
    setCustomFontState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(CUSTOM_FONT_KEY, value);
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
    
    // Add/remove class for custom color styling
    const root = document.documentElement;
    if (customColor && customColor.length) {
      root.classList.add('has-custom-color');
    } else {
      root.classList.remove('has-custom-color');
    }

    // Apply custom color as the accent and also set contrast-aware accent-contrast
    try {
      const color = customColor && customColor.length ? customColor : '';
      if (color) {
        document.documentElement.style.setProperty('--a11y-custom-color', color);
        // override primary accent to match user's chosen color
        document.documentElement.style.setProperty('--accent', color);
        
        // Helper function to parse hex color
        const parseHex = (hex: string): { r: number; g: number; b: number } => {
          const cleanHex = hex.replace('#', '');
          if (cleanHex.length === 3) {
            return {
              r: parseInt(cleanHex[0] + cleanHex[0], 16),
              g: parseInt(cleanHex[1] + cleanHex[1], 16),
              b: parseInt(cleanHex[2] + cleanHex[2], 16),
            };
          } else if (cleanHex.length === 6) {
            return {
              r: parseInt(cleanHex.slice(0, 2), 16),
              g: parseInt(cleanHex.slice(2, 4), 16),
              b: parseInt(cleanHex.slice(4, 6), 16),
            };
          }
          return { r: 0, g: 0, b: 0 };
        };

        // Helper function to calculate luminance
        const getLuminance = (r: number, g: number, b: number): number => {
          return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        };

        // Helper function to darken/lighten color
        const adjustBrightness = (hex: string, percent: number): string => {
          const { r, g, b } = parseHex(hex);
          const factor = 1 + (percent / 100);
          const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
          const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
          const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        };

        // Helper function to create rgba from hex
        const hexToRgba = (hex: string, alpha: number): string => {
          const { r, g, b } = parseHex(hex);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const { r, g, b } = parseHex(color);
        const lum = getLuminance(r, g, b);
        const contrast = lum > 0.5 ? '#000000' : '#ffffff';
        
        // Set contrast color
        document.documentElement.style.setProperty('--accent-contrast', contrast);
        
        // Apply to primary colors for broader coverage
        document.documentElement.style.setProperty('--color-primary', color);
        document.documentElement.style.setProperty('--color-primary-hover', adjustBrightness(color, -10));
        document.documentElement.style.setProperty('--color-primary-light', hexToRgba(color, 0.1));
        document.documentElement.style.setProperty('--color-primary-text', adjustBrightness(color, -20));
        
        // Also apply to info color (commonly used for buttons)
        document.documentElement.style.setProperty('--color-info', color);
        document.documentElement.style.setProperty('--color-info-light', hexToRgba(color, 0.1));
        document.documentElement.style.setProperty('--color-info-text', adjustBrightness(color, -20));
        
        // Apply to focus ring
        document.documentElement.style.setProperty('--focus-ring', hexToRgba(color, 0.6));
      } else {
        // Reset to defaults when color is cleared
        document.documentElement.style.removeProperty('--a11y-custom-color');
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--accent-contrast');
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-primary-hover');
        document.documentElement.style.removeProperty('--color-primary-light');
        document.documentElement.style.removeProperty('--color-primary-text');
        document.documentElement.style.removeProperty('--color-info');
        document.documentElement.style.removeProperty('--color-info-light');
        document.documentElement.style.removeProperty('--color-info-text');
        document.documentElement.style.removeProperty('--focus-ring');
        // Remove custom color class
        root.classList.remove('has-custom-color');
      }
    } catch {}
  }, [customFont, customColor]);

  const setVoiceControlEnabled = (value: boolean) => {
    setVoiceControlEnabledState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(VOICE_CONTROL_KEY, value ? '1' : '0');
    
    // Marcar que ya no es la carga inicial cuando el usuario cambia manualmente
    isInitialLoadRef.current = false;
    
    // Si el usuario activa manualmente, marcar como interactuado
    if (value && !autoVoiceControlActive) {
      setUserHasInteracted(true);
    }
    
    // Si desactiva manualmente, también marcar como interactuado
    if (!value && autoVoiceControlActive) {
      setAutoVoiceControlActive(false);
      setUserHasInteracted(true);
    }
  };

  const setBlockAutoplay = (value: boolean) => {
    setBlockAutoplayState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(BLOCK_AUTOPLAY_KEY, value ? '1' : '0');
  };

  const setCustomShortcutsEnabled = (value: boolean) => {
    setCustomShortcutsEnabledState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(CUSTOM_SHORTCUTS_KEY, value ? '1' : '0');
  };

  const setTextScale = (value: number) => {
    setTextScaleState(value);
    if (typeof globalThis.window !== 'undefined') globalThis.window.localStorage.setItem(TEXT_SCALE_KEY, String(value));
  };

  const setAutoPlay = (value: boolean) => {
    setAutoPlayState(value);
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.localStorage.setItem(AUTO_PLAY_KEY, value ? '1' : '0');
    }
  };

  const setAutoScroll = (value: boolean) => {
    setAutoScrollState(value);
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.localStorage.setItem(AUTO_SCROLL_KEY, value ? '1' : '0');
    }
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
    if (typeof globalThis.window === 'undefined') return;
    const synth = globalThis.window.speechSynthesis;
    if (!synth) return;
    if (voiceListenerRef.current) {
      synth.removeEventListener('voiceschanged', voiceListenerRef.current);
      voiceListenerRef.current = null;
    }
  };

  const stopReading = () => {
    if (typeof globalThis.window === 'undefined') return;
    const synth = globalThis.window.speechSynthesis;
    if (!synth) return;
    cleanupVoiceListener();
    setIsReading(false);
    utteranceRef.current = null;
    synth.cancel();
  };

  const startReading = () => {
    if (typeof globalThis.window === 'undefined') return;
    const synth = globalThis.window.speechSynthesis;
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
    if (typeof globalThis.window === 'undefined' || hasContrastOverride) return;
    const mediaQuery = globalThis.window.matchMedia('(prefers-contrast: more)');
    const handleChange = () => {
      setHighContrastState(mediaQuery.matches);
    };
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasContrastOverride]);

  // Implementar reconocimiento de voz
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const errorCountRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(0);
  const errorToastCooldownRef = useRef<number>(0);
  const isReconnectingRef = useRef<boolean>(false);
  const hasNetworkErrorRef = useRef<boolean>(false);
  const networkRetryCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const MAX_NETWORK_RETRIES = 3;
  
  useEffect(() => {
    // Solo activar reconocimiento de voz en páginas principales
    if (typeof globalThis.window === 'undefined' || !voiceControlEnabled || !isMainPage) {
      setVoiceControlActive(false);
      setVoiceControlMessage(null);
      // Limpiar todos los refs cuando se desactiva
      errorCountRef.current = 0;
      isReconnectingRef.current = false;
      hasNetworkErrorRef.current = false;
      networkRetryCountRef.current = 0;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      return;
    }

    // Verificar soporte de reconocimiento de voz
    const SpeechRecognition = 
      (globalThis.window as any).SpeechRecognition || 
      (globalThis.window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Solo mostrar el mensaje una vez, no en bucle
      if (!browserNotSupportedShownRef.current) {
        const errorMsg = 'Reconocimiento de voz no disponible en este navegador. Prueba con Chrome o Edge.';
        setVoiceControlMessage(errorMsg);
        setVoiceControlActive(false);
        showToast(errorMsg, 'error');
        browserNotSupportedShownRef.current = true;
      }
      return;
    }
    
    // Resetear el flag si el reconocimiento está disponible
    browserNotSupportedShownRef.current = false;

    // Función asíncrona para inicializar el reconocimiento
    const initRecognition = async () => {
      // Verificar permisos del micrófono antes de continuar
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (result.state === 'denied') {
            const errorMsg = 'Permisos del micrófono denegados. Habilítalos en la configuración del navegador.';
            setVoiceControlMessage(errorMsg);
            setVoiceControlActive(false);
            setVoiceControlEnabledState(false);
            // Solo mostrar toast si NO es la carga inicial (es decir, el usuario lo activó manualmente)
            if (!isInitialLoadRef.current) {
              showToast(errorMsg, 'error');
            }
            return; // NO continuar creando el reconocimiento
          }
        } catch (err) {
          // Algunos navegadores no soportan la API de permisos, continuar de todas formas
        }
      }

      const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setVoiceControlActive(true);
      setVoiceControlMessage('Escuchando... Di un comando.');
      // Resetear contador de errores cuando inicia correctamente
      errorCountRef.current = 0;
      // Limpiar flags de error de red cuando inicia correctamente
      hasNetworkErrorRef.current = false;
      networkRetryCountRef.current = 0;
      isReconnectingRef.current = false;
      // Mostrar toast de éxito solo cuando realmente inicia
      showToast('Control por voz activado. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"', 'success');
    };

    recognition.onresult = (event: any) => {
      const results = event.results as SpeechRecognitionResultList;
      const lastResult = results[results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.toLowerCase().trim();
        setVoiceControlMessage(`Comando reconocido: "${command}"`);
        
        // Comandos de navegación
        if (command.includes('ir a inicio') || command.includes('inicio')) {
          setTimeout(() => {
            globalThis.window.location.href = '/';
          }, 500);
        } else if (command.includes('ir a faq') || command.includes('faq')) {
          setTimeout(() => {
            globalThis.window.location.href = '/faq';
          }, 500);
        } else if (command.includes('ir a contacto') || command.includes('contacto')) {
          setTimeout(() => {
            globalThis.window.location.href = '/contacto';
          }, 500);
        } else if (command.includes('abrir ajustes') || command.includes('ajustes')) {
          globalThis.dispatchEvent(new Event('apq:open-accessibility'));
          setVoiceControlMessage('Ajustes abiertos');
        } else if (command.includes('cerrar') || command.includes('salir')) {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && 'blur' in activeElement) {
            activeElement.blur();
          }
          setVoiceControlMessage('Cerrado');
        } else if (command.includes('pausar video') || command.includes('pausar medios')) {
          pauseAllMedia();
          setVoiceControlMessage('Medios pausados');
        } else if (command.includes('reproducir video') || command.includes('reproducir medios')) {
          playAllMedia();
          setVoiceControlMessage('Medios reproducidos');
        } else {
          setVoiceControlMessage(`Comando no reconocido: "${command}"`);
          showToast(`Comando no reconocido. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"`, 'warning');
        }
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setVoiceControlMessage('Escuchando... Di un comando.');
        }, 3000);
      }
    };

    recognition.onerror = (event: any) => {
      const error = event.error as string;
      const now = Date.now();
      
      // Incrementar contador de errores
      errorCountRef.current += 1;
      
      // Si hay demasiados errores seguidos (más de 5 en 10 segundos), desactivar
      if (errorCountRef.current > 5 && (now - lastErrorTimeRef.current) < 10000) {
        setVoiceControlActive(false);
        setVoiceControlEnabledState(false);
        setAutoVoiceControlActive(false);
        setVoiceControlMessage('Control por voz desactivado debido a múltiples errores. Verifica tu conexión a internet y los permisos del micrófono.');
        showToast('Control por voz desactivado. Verifica tu conexión a internet y los permisos del micrófono.', 'error');
        return;
      }
      
      lastErrorTimeRef.current = now;
      
      // Cooldown para toasts de error (máximo 1 cada 5 segundos)
      const canShowErrorToast = (now - errorToastCooldownRef.current) > 5000;
      
      if (error === 'not-allowed') {
        setVoiceControlActive(false);
        setVoiceControlMessage('Permisos del micrófono denegados. Por favor, habilítalos en la configuración del navegador.');
        if (canShowErrorToast) {
          showToast('Permisos del micrófono denegados. Habilítalos en la configuración del navegador.', 'error');
          errorToastCooldownRef.current = now;
        }
      } else if (error === 'no-speech') {
        // No mostrar mensaje para este error común, solo mantener escuchando
        setVoiceControlMessage('Escuchando... Di un comando.');
        setVoiceControlActive(true);
        // Resetear contador si es solo falta de habla
        errorCountRef.current = Math.max(0, errorCountRef.current - 1);
      } else if (error === 'audio-capture') {
        setVoiceControlActive(false);
        setVoiceControlMessage('No se pudo acceder al micrófono. Verifica que esté conectado y habilitado.');
        if (canShowErrorToast) {
          showToast('No se pudo acceder al micrófono. Verifica que esté conectado.', 'error');
          errorToastCooldownRef.current = now;
        }
      } else if (error === 'network') {
        setVoiceControlActive(false);
        networkRetryCountRef.current += 1;
        
        // Verificar si realmente hay conexión a internet
        // El error "network" puede ser un falso positivo (problemas temporales del servicio)
        const hasConnection = navigator.onLine;
        
        if (!hasConnection) {
          // Realmente no hay conexión
          hasNetworkErrorRef.current = true;
          
          if (networkRetryCountRef.current > MAX_NETWORK_RETRIES) {
            setVoiceControlEnabledState(false);
            setAutoVoiceControlActive(false);
            const finalMsg = 'Control por voz desactivado. No hay conexión a internet. El reconocimiento de voz requiere conexión a internet.';
            setVoiceControlMessage(finalMsg);
            showToast(finalMsg, 'error');
            return;
          }
          
          setVoiceControlMessage(`Error de red. El reconocimiento de voz requiere conexión a internet. Intento ${networkRetryCountRef.current}/${MAX_NETWORK_RETRIES}.`);
          if (canShowErrorToast) {
            showToast(`Error de red. Intentando reconectar (${networkRetryCountRef.current}/${MAX_NETWORK_RETRIES})...`, 'warning');
            errorToastCooldownRef.current = now;
          }
        } else {
          // Hay conexión, probablemente es un error temporal del servicio de reconocimiento
          // No marcar como error crítico, solo reintentar
          hasNetworkErrorRef.current = false;
          setVoiceControlMessage('Error temporal del servicio. Reintentando...');
          
          // Resetear contador después de algunos intentos si hay conexión
          if (networkRetryCountRef.current > 3) {
            networkRetryCountRef.current = 0;
          }
        }
        
        // Intentar reconectar después de un delay (más corto si hay conexión)
        if (voiceControlEnabled && !isReconnectingRef.current) {
          isReconnectingRef.current = true;
          // Delay más corto si hay conexión (error temporal) vs sin conexión (error real)
          const delay = hasNetworkErrorRef.current ? 5000 : 2000;
          
          setTimeout(() => {
            isReconnectingRef.current = false;
            if (voiceControlEnabled && recognitionRef.current === recognition) {
              // Solo intentar si no excedimos el máximo o si hay conexión (error temporal)
              if (!hasNetworkErrorRef.current || networkRetryCountRef.current <= MAX_NETWORK_RETRIES) {
                try {
                  recognition.start();
                } catch (e) {
                  console.warn('No se pudo reconectar después de error de red:', e);
                  isReconnectingRef.current = false;
                }
              }
            }
          }, delay);
        }
      } else if (error === 'aborted') {
        // Reconocimiento abortado, intentar reiniciar solo si no hay errores de red activos
        setVoiceControlActive(false);
        if (voiceControlEnabled && !hasNetworkErrorRef.current && !isReconnectingRef.current && networkRetryCountRef.current <= MAX_NETWORK_RETRIES) {
          setTimeout(() => {
            if (voiceControlEnabled && recognitionRef.current === recognition && !hasNetworkErrorRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.warn('No se pudo reiniciar reconocimiento:', e);
              }
            }
          }, 1000);
        }
      } else {
        setVoiceControlActive(false);
        setVoiceControlMessage(`Error: ${error}. Intenta desactivar y reactivar el control por voz.`);
        if (canShowErrorToast) {
          showToast(`Error en reconocimiento de voz: ${error}. Intenta reactivarlo.`, 'error');
          errorToastCooldownRef.current = now;
        }
      }
    };

    recognition.onend = () => {
      // NO reiniciar si hay errores de red activos o si ya se está reconectando
      if (hasNetworkErrorRef.current || isReconnectingRef.current || networkRetryCountRef.current > MAX_NETWORK_RETRIES) {
        setVoiceControlActive(false);
        return;
      }
      
      if (voiceControlEnabled) {
        setVoiceControlActive(false);
        // Reintentar después de un breve delay solo si no hay errores activos
        setTimeout(() => {
          if (
            voiceControlEnabled && 
            recognitionRef.current === recognition &&
            !hasNetworkErrorRef.current &&
            !isReconnectingRef.current &&
            networkRetryCountRef.current <= MAX_NETWORK_RETRIES
          ) {
            try {
              recognition.start();
            } catch (e: any) {
              console.warn('No se pudo reiniciar reconocimiento:', e);
            }
          }
        }, 1000);
      } else {
        setVoiceControlActive(false);
      }
    };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e: any) {
        const errorMsg = e?.message || 'Error desconocido';
        setVoiceControlMessage(`No se pudo iniciar el reconocimiento de voz: ${errorMsg}. Asegúrate de dar permisos al micrófono.`);
        setVoiceControlActive(false);
        showToast(`No se pudo iniciar el reconocimiento de voz. Verifica los permisos del micrófono.`, 'error');
        console.warn('No se pudo iniciar el reconocimiento de voz:', e);
      }
    };

    // Iniciar el reconocimiento
    initRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      // Limpiar todos los refs al desmontar
      isReconnectingRef.current = false;
      hasNetworkErrorRef.current = false;
      networkRetryCountRef.current = 0;
      errorCountRef.current = 0;
      setVoiceControlActive(false);
      setVoiceControlMessage(null);
      browserNotSupportedShownRef.current = false;
    };
  }, [voiceControlEnabled, pauseAllMedia, playAllMedia, isMainPage]);

  // Mejorar navegación por teclado cuando está habilitada
  useEffect(() => {
    if (typeof globalThis.window === 'undefined' || !keyboardNavigationEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.isContentEditable
      );

      // Solo aplicar mejoras si no está escribiendo
      if (isTyping) return;

      // Mejorar navegación con flechas en elementos interactivos
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const focusableElements = Array.from(
          document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });

        const currentIndex = focusableElements.indexOf(activeElement);
        if (currentIndex === -1) return;

        let nextIndex: number;
        if (e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % focusableElements.length;
        } else {
          nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        }

        e.preventDefault();
        focusableElements[nextIndex]?.focus();
      }

      // Enter en enlaces actúa como clic
      if (e.key === 'Enter' && activeElement?.tagName === 'A') {
        const link = activeElement as HTMLAnchorElement;
        if (link.href) {
          e.preventDefault();
          link.click();
        }
      }
    };

    globalThis.window.addEventListener('keydown', handleKeyDown);
    return () => globalThis.window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigationEnabled]);

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
      customFont,
      setCustomFont,
      customColor,
      setCustomColor,
      voiceControlEnabled,
      setVoiceControlEnabled,
      voiceControlActive,
      voiceControlMessage,
      autoVoiceControlActive,
      showToast,
      blockAutoplay,
      setBlockAutoplay,
      customShortcutsEnabled,
      setCustomShortcutsEnabled,
      textScale,
      setTextScale,
      autoPlay,
      setAutoPlay,
      autoScroll,
      setAutoScroll,
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
      customFont,
      customColor,
      voiceControlEnabled,
      voiceControlActive,
      voiceControlMessage,
      autoVoiceControlActive,
      showToast,
      blockAutoplay,
      customShortcutsEnabled,
      textScale,
      autoPlay,
      autoScroll,
      clearReadingMessage,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
