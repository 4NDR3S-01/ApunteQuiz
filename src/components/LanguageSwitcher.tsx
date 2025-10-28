'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

type LanguageValue = 'es' | 'en';

type LanguageOption = {
  value: LanguageValue;
  label: string;
  description: string;
};

const languageOptions: LanguageOption[] = [
  { value: 'es', label: 'Español', description: 'Idioma principal' },
  { value: 'en', label: 'English', description: 'Primary language' },
];

type LanguageSwitcherProps = {
  value: LanguageValue;
  onChange: (value: LanguageValue) => void;
  ariaLabel?: string;
  label?: string;
  currentLabel?: string;
  className?: string;
  fullWidth?: boolean;
};

export default function LanguageSwitcher({
  value,
  onChange,
  ariaLabel,
  label = 'Idioma',
  currentLabel,
  className = '',
  fullWidth = false,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = languageOptions.find((option) => option.value === value) ?? languageOptions[0];
  const dropdownWidthClass = fullWidth ? 'w-full min-w-[12rem]' : 'w-64';
  const dropdownPositionClass = fullWidth ? 'left-0 right-0' : 'right-0';

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-sm shadow-slate-200/40 transition hover:bg-[color:var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? 'Seleccionar idioma'}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
              {label}
            </span>
            <span className="text-sm font-semibold text-[color:var(--foreground)]">
              {currentLabel ?? activeOption.label}
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[color:var(--text-muted)] transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          className={`absolute ${dropdownPositionClass} z-50 mt-2 ${dropdownWidthClass} overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] shadow-xl shadow-slate-200/30`}
          role="listbox"
          aria-label={ariaLabel ?? 'Seleccionar idioma'}
        >
          <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
            {label}
          </p>
          <ul className="py-2">
            {languageOptions.map((option) => {
              const isActive = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      if (!isActive) {
                        onChange(option.value);
                      }
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-700'
                        : 'text-[color:var(--text-muted)] hover:bg-blue-500/5 hover:text-[color:var(--foreground)]'
                    }`}
                  >
                    <span>
                      <span className="text-sm font-semibold text-[color:var(--foreground)]">
                        {option.label}
                      </span>
                      <span className="block text-xs text-[color:var(--text-muted)]">
                        {option.description}
                      </span>
                    </span>
                    {isActive ? <Check className="h-4 w-4 text-blue-600" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
