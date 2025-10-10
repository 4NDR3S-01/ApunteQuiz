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
  } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const floatingButtonId = useId();
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const contrastDescriptionId = useId();
  const narratorDescriptionId = useId();

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
            <section className="a11y-card-muted space-y-3 rounded-xl p-3">
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">
                  Tema
                </h3>
                <p className="text-xs text-[color:var(--text-muted)]">
                  Elige manualmente o sincroniza con tu dispositivo.
                </p>
              </header>
              <div className="grid gap-2 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                  const isActive = themePreference === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleThemeSelection(option.value)}
                      aria-pressed={isActive}
                      className={`flex flex-col items-center justify-center rounded-lg px-3 py-3 text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                        isActive
                          ? 'a11y-critical shadow-md'
                          : 'a11y-control shadow-sm hover:shadow-md'
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span>{option.label}</span>
                      {option.value === 'system' && (
                        <span className="mt-1 text-[10px] uppercase tracking-wide opacity-70">
                          {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="a11y-card-muted space-y-2 rounded-xl p-3">
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">
                  Tamaño del texto
                </h3>
                <p className="text-xs text-[color:var(--text-muted)]">
                  Ajusta la escala tipográfica general.
                </p>
              </header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {FONT_SCALE_OPTIONS.map((option) => {
                  const isActive = fontScale === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFontScale(option.value)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                        isActive
                          ? 'a11y-critical shadow-md'
                          : 'a11y-control shadow-sm hover:shadow-md'
                      }`}
                      aria-pressed={isActive}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="a11y-card-muted space-y-3 rounded-xl p-3">
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">
                  Comodidad de lectura
                </h3>
                <p className="text-xs text-[color:var(--text-muted)]">
                  Ajusta el espaciado y activa una tipografía amigable.
                </p>
              </header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {([
                  { value: 'normal', label: 'Estándar' },
                  { value: 'relaxed', label: 'Amplio' },
                ] as const).map((option) => {
                  const isActive = lineSpacing === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleLineSpacing(option.value)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                        isActive
                          ? 'a11y-critical shadow-md'
                          : 'a11y-control shadow-sm hover:shadow-md'
                      }`}
                      aria-pressed={isActive}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="a11y-surface flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-[color:var(--foreground)]">
                    Fuente amigable
                  </p>
                  <p className="text-[11px] text-[color:var(--text-muted)]">
                    Mejora la legibilidad para dislexia y fatiga visual.
                  </p>
                </div>
                <div className="flex justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setDyslexicFont(!dyslexicFont)}
                    aria-pressed={dyslexicFont}
                    className={`relative inline-flex h-9 w-24 items-center rounded-full border border-transparent px-1 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                      dyslexicFont
                        ? 'bg-purple-600 text-white shadow-inner shadow-purple-400/40'
                        : 'a11y-control shadow-inner shadow-slate-400/40 dark:shadow-slate-900/40'
                    }`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 shadow transition-all duration-200 ease-out ${
                        dyslexicFont ? 'translate-x-14' : 'translate-x-0'
                      }`}
                    >
                      {dyslexicFont ? 'On' : 'Off'}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section
              className="a11y-card-muted flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center sm:justify-between"
              aria-describedby={contrastDescriptionId}
            >
              <header className="space-y-1 sm:w-2/3">
                <h3 className="font-medium text-[color:var(--foreground)]">
                  Alto contraste
                </h3>
                <p id={contrastDescriptionId} className="text-xs text-[color:var(--text-muted)]">
                  Mejora la separación entre texto y fondo.
                </p>
                <p className="text-[11px] text-[color:var(--text-muted)]">
                  {usesSystemContrast
                    ? 'Siguiendo la preferencia de contraste del sistema.'
                    : 'Preferencia personalizada aplicada.'}
                </p>
              </header>
              <div className="flex justify-start sm:w-1/3 sm:justify-end">
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  aria-pressed={highContrast}
                  className={`relative inline-flex h-10 w-28 items-center rounded-full border border-transparent px-1 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                    highContrast
                      ? 'bg-emerald-500 text-white shadow-inner shadow-emerald-300/40'
                      : 'a11y-control shadow-inner shadow-slate-400/40 dark:shadow-slate-900/40'
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 shadow transition-all duration-200 ease-out ${
                      highContrast ? 'translate-x-14' : 'translate-x-0'
                    }`}
                  >
                    {highContrast ? '✔️' : '○'}
                  </span>
                </button>
              </div>
              {!usesSystemContrast && (
                <div className="sm:w-full">
                  <button
                    type="button"
                    className="mt-1 text-xs font-semibold text-[color:var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
                    onClick={resetHighContrastPreference}
                  >
                    Volver a usar el contraste del sistema
                  </button>
                </div>
              )}
            </section>

            <section
              className="a11y-card-muted space-y-3 rounded-xl p-3"
              aria-describedby={narratorDescriptionId}
            >
              <header className="space-y-1">
                <h3 className="font-medium text-[color:var(--foreground)]">
                  Narrador de lectura
                </h3>
                <p id={narratorDescriptionId} className="text-xs text-[color:var(--text-muted)]">
                  Escucha el contenido usando la voz del navegador.
                </p>
              </header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={toggleReading}
                  aria-pressed={isReading}
                  disabled={!readingSupported}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                    !readingSupported
                      ? 'cursor-not-allowed bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] opacity-70'
                      : isReading
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {isReading ? 'Detener narrador' : 'Iniciar narrador'}
                </button>
                <button
                  type="button"
                  onClick={stopReading}
                  disabled={!isReading}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isReading
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}
                >
                  Cancelar
                </button>
              </div>
              <p className="text-[11px] text-[color:var(--text-muted)]">
                Consejo: ajusta la voz y velocidad desde las preferencias de tu dispositivo o navegador.
              </p>
              <div className="space-y-1 text-[11px] text-[color:var(--text-muted)]" aria-live="polite">
                {readingMessage ? (
                  <div className="flex items-center justify-between gap-2">
                    <span>{readingMessage}</span>
                    <button
                      type="button"
                      className="text-[10px] font-semibold text-[color:var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
                      onClick={clearReadingMessage}
                    >
                      Entendido
                    </button>
                  </div>
                ) : (
                  <span>{isReading ? 'Narrador en reproducción.' : readingSupported ? 'Narrador listo.' : 'Narrador no disponible.'}</span>
                )}
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
