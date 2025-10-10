'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

export default function AccessibilitySettings() {
  const {
    themePreference,
    resolvedTheme,
    setThemePreference,
    fontScale,
    setFontScale,
    highContrast,
    toggleHighContrast,
  } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          className="mb-4 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-400/30 backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:shadow-blue-900/30"
        >
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Ajustes de accesibilidad
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personaliza la experiencia visual para estudiar con comodidad.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-transparent p-1 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-200"
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
            <section className="space-y-3 rounded-xl border border-slate-200/70 bg-slate-100/60 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">
                    Tema
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Elige manualmente o sincroniza con tu dispositivo.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'light', label: 'Claro', icon: '☀️' },
                  { value: 'system', label: 'Sistema', icon: '💻' },
                  { value: 'dark', label: 'Oscuro', icon: '🌙' },
                ] as const).map((option) => {
                  const isActive = themePreference === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setThemePreference(option.value)}
                      aria-pressed={isActive}
                      className={`flex flex-col items-center justify-center rounded-lg px-3 py-3 text-xs font-semibold transition-all duration-200 ease-out ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                          : 'bg-white text-slate-700 shadow-sm hover:shadow-md dark:bg-slate-800 dark:text-slate-200'
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

            <section className="space-y-2 rounded-xl border border-slate-200/70 bg-slate-100/60 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">
                    Tamaño del texto
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajusta la escala tipográfica general.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFontScale('base')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-out ${
                    fontScale === 'base'
                      ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500 dark:text-white'
                      : 'bg-white text-slate-700 shadow-sm hover:shadow-md dark:bg-slate-800 dark:text-slate-200'
                  }`}
                  aria-pressed={fontScale === 'base'}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale('large')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-out ${
                    fontScale === 'large'
                      ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500 dark:text-white'
                      : 'bg-white text-slate-700 shadow-sm hover:shadow-md dark:bg-slate-800 dark:text-slate-200'
                  }`}
                  aria-pressed={fontScale === 'large'}
                >
                  Grande
                </button>
              </div>
            </section>

            <section className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-100/60 p-3 dark:border-white/10 dark:bg-white/5">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100">
                  Alto contraste
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mejora la separación entre texto y fondo.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleHighContrast}
                aria-pressed={highContrast}
                className={`relative inline-flex h-10 w-20 items-center rounded-full border border-transparent px-1 transition-all duration-200 ease-out ${
                  highContrast
                    ? 'bg-emerald-500 text-white shadow-inner shadow-emerald-300/40'
                    : 'bg-slate-200 text-slate-800 shadow-inner shadow-slate-400/40 dark:bg-slate-600/60 dark:text-slate-100'
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 shadow transition-all duration-200 ease-out ${
                    highContrast ? 'translate-x-9' : 'translate-x-0'
                  }`}
                >
                  {highContrast ? '✔️' : '○'}
                </span>
              </button>
            </section>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="Abrir ajustes de accesibilidad"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6V18M6 12H18"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
