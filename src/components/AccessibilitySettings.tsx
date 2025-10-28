
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import type { ThemePreference, FontScale, LineSpacing } from './AccessibilityProvider';

const THEME_OPTIONS: ReadonlyArray<{
  readonly value: ThemePreference;
  readonly label: string;
  readonly icon: string;
}> = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'system', label: 'Sistema', icon: '💻' },
  { value: 'dark', label: 'Oscuro', icon: '🌙' },
];

const FONT_SCALE_OPTIONS: ReadonlyArray<{
  readonly value: FontScale;
  readonly label: string;
}> = [
  { value: 'base', label: 'Normal' },
  { value: 'large', label: 'Grande' },
];

export default function AccessibilitySettings() {
  const {
    themePreference,
    resolvedTheme,
    setThemePreference,
    fontScale,
    setFontScale,
    highContrast,
    toggleHighContrast,
    resetHighContrastPreference,
    usesSystemContrast,
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
    pauseAllMedia,
    playAllMedia,
    stopAllMedia,
    textScale,
    setTextScale,
    linkHighlight,
    setLinkHighlight,
    focusVisible,
    setFocusVisible,
    keyboardNavigationEnabled,
    setKeyboardNavigationEnabled,
    largeButtonsScale,
    setLargeButtonsScale,
  } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const floatingButtonId = useId();
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const contrastDescriptionId = useId();
  const narratorDescriptionId = useId();

  // Allow opening the panel from external UI via a global event
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('apq:open-accessibility', handler as EventListener);
    return () => window.removeEventListener('apq:open-accessibility', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleThemeSelection = (value: ThemePreference) => {
    if (themePreference !== value) {
      setThemePreference(value);
    }
  };

  const handleLineSpacing = (value: LineSpacing) => {
    if (lineSpacing !== value) {
      setLineSpacing(value);
    }
  };

  const toggleReading = () => {
    if (isReading) {
      stopReading();
    } else {
      startReading();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          ref={panelRef}
          id={`panel-${floatingButtonId}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogDescriptionId}
          className="a11y-card mb-4 w-[min(100vw-2rem,20rem)] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl p-5 shadow-xl shadow-slate-400/30 backdrop-blur scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 dark:shadow-blue-900/10 dark:scrollbar-thumb-slate-600 dark:hover:scrollbar-thumb-slate-500 sm:w-[22rem] sm:max-h-[80vh]"
        >
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p id={dialogTitleId} className="text-sm font-semibold text-[color:var(--foreground)]">
                Ajustes de accesibilidad
              </p>
              <p
                id={dialogDescriptionId}
                className="text-xs text-[color:var(--text-muted)]"
              >
                Personaliza la experiencia visual para estudiar con comodidad.
              </p>
            </div>
            <button
              type="button"
              ref={closeButtonRef}
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-transparent p-1 text-[color:var(--text-muted)] transition hover:border-slate-300 hover:text-[color:var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
              aria-label="Cerrar panel de accesibilidad"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </header>

          <div className="space-y-5 text-sm">
            {/* Auditiva */}
            <section className="a11y-card-muted space-y-3 rounded-xl p-3">
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">Auditiva</h3>
                <p className="text-xs text-[color:var(--text-muted)]">Opciones para mejorar la experiencia auditiva y de medios.</p>
              </header>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={subtitlesEnabled} onChange={(e) => setSubtitlesEnabled(e.target.checked)} className="w-4 h-4" />
                  <span>Subtítulos en videos</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={autoTranscripts} onChange={(e) => setAutoTranscripts(e.target.checked)} className="w-4 h-4" />
                  <span>Transcripciones textuales automáticas</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={videoInterpreterEnabled} onChange={(e) => setVideoInterpreterEnabled(e.target.checked)} className="w-4 h-4" />
                  <span>Video-intérprete / avatar (lengua de señas) — UI</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={pauseAllMedia} className="a11y-control px-3 py-1 rounded">Pausar medios</button>
                  <button type="button" onClick={playAllMedia} className="a11y-control px-3 py-1 rounded">Reproducir medios</button>
                  <button type="button" onClick={stopAllMedia} className="a11y-control px-3 py-1 rounded">Detener medios</button>
                </div>

                <div className="flex gap-2 pt-2 items-center">
                  <button type="button" onClick={isReading ? stopReading : startReading} className="a11y-control px-3 py-1 rounded">{isReading ? 'Detener narrador' : 'Iniciar narrador'}</button>
                  <button type="button" onClick={clearReadingMessage} className="px-2 py-1 rounded border text-sm">Limpiar mensajes</button>
                </div>

                {readingMessage ? <div className="a11y-muted text-sm pt-2">{readingMessage}</div> : null}
              </div>
            </section>

            {/* Visual */}
            <section className="a11y-card-muted space-y-3 rounded-xl p-3">
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">Visual</h3>
                <p className="text-xs text-[color:var(--text-muted)]">Ajustes visuales: tema, tipografía, colores y espaciado.</p>
              </header>

              <div className="grid gap-2 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                  const isActive = themePreference === option.value;
                  return (
                    <button key={option.value} type="button" onClick={() => handleThemeSelection(option.value)} aria-pressed={isActive} className={`flex flex-col items-center justify-center rounded-lg px-3 py-3 text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${isActive ? 'a11y-critical shadow-md' : 'a11y-control shadow-sm hover:shadow-md'}`}>
                      <span className="text-lg">{option.icon}</span>
                      <span>{option.label}</span>
                      {option.value === 'system' && <span className="mt-1 text-[10px] uppercase tracking-wide opacity-70">{resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm mb-1">Escala de texto (barra): {textScale.toFixed(1)}x</label>
                  <input aria-label="Escala de texto" type="range" min={0.8} max={2} step={0.1} value={String(textScale)} onChange={(e) => setTextScale(Number(e.target.value))} className="w-full" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-36 text-sm">Tipo de fuente</span>
                  <select value={customFont ?? ''} onChange={(e) => setCustomFont(e.target.value)} className="a11y-input rounded px-2 py-1">
                    <option value="">Sistema</option>
                    <option value="sans">Sans (predeterminado)</option>
                    <option value="serif">Serif</option>
                    <option value="dyslexic">Fuente amigable (dislexia)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-36 text-sm">Color personalizado</span>
                  <input type="color" value={customColor || '#000000'} onChange={(e) => setCustomColor(e.target.value)} className="h-8 w-12 p-0 border rounded" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-36 text-sm">Espaciado</span>
                  <div className="flex gap-2">
                    {(['normal', 'relaxed'] as const).map((opt) => (
                      <button key={opt} type="button" onClick={() => setLineSpacing(opt)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${lineSpacing === opt ? 'a11y-critical' : 'a11y-control'}`} aria-pressed={lineSpacing === opt}>{opt === 'normal' ? 'Estándar' : 'Amplio'}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={linkHighlight} onChange={(e) => setLinkHighlight(e.target.checked)} className="w-4 h-4" />
                  <span>Resaltar enlaces</span>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={focusVisible} onChange={(e) => setFocusVisible(e.target.checked)} className="w-4 h-4" />
                  <span>Foco visible</span>
                </div>
              </div>
            </section>

            {/* Motriz */}
            <section className="a11y-card-muted space-y-3 rounded-xl p-3">
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">Motriz</h3>
                <p className="text-xs text-[color:var(--text-muted)]">Controles para usuarios con necesidades motrices.</p>
              </header>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={keyboardNavigationEnabled} onChange={(e) => setKeyboardNavigationEnabled(e.target.checked)} className="w-4 h-4" />
                  <span>Navegación por teclado (Tab, Enter, Esc)</span>
                </div>

                <div>
                  <label className="block text-sm mb-1">Escala de botones grandes: {largeButtonsScale.toFixed(1)}x</label>
                  <input aria-label="Escala de botones" type="range" min={1} max={2} step={0.1} value={String(largeButtonsScale)} onChange={(e) => setLargeButtonsScale(Number(e.target.value))} className="w-full" />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={voiceControlEnabled} onChange={(e) => setVoiceControlEnabled(e.target.checked)} className="w-4 h-4" />
                  <span>Control por voz / dictado (UI)</span>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={blockAutoplay} onChange={(e) => setBlockAutoplay(e.target.checked)} className="w-4 h-4" />
                  <span>Bloquear auto-scroll / auto-reproducción</span>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={customShortcutsEnabled} onChange={(e) => setCustomShortcutsEnabled(e.target.checked)} className="w-4 h-4" />
                  <span>Atajos de teclado personalizados (activar)</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Cerrar ajustes de accesibilidad' : 'Abrir ajustes de accesibilidad'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? `panel-${floatingButtonId}` : undefined}
        onClick={() => setIsOpen((value) => !value)}
        id={floatingButtonId}
        className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        {isOpen ? (
          <span aria-hidden className="text-xl">✖️</span>
        ) : (
          <span aria-hidden className="text-2xl">⚙️</span>
        )}
      </button>
    </div>
  );
}
