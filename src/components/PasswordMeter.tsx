"use client";

import React from 'react';
import evaluatePassword from '@/utils/password';

type Props = Readonly<{
  password: string;
  showSuggestions?: boolean;
}>;

export default function PasswordMeter({ password, showSuggestions = true }: Props) {
  const strength = evaluatePassword(password);
  const segments = [0, 1, 2, 3];

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {segments.map((i) => (
            <div
              key={i}
              aria-hidden
              className={`h-2 w-8 rounded ${i <= (strength.score - 1) ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[color:var(--text-muted)]">{strength.label}</span>
          {showSuggestions && strength.suggestions && strength.suggestions.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[color:var(--text-muted)] text-[11px]">
              {strength.suggestions.slice(0, 3).map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-[color:var(--text-muted)]">Mínimo 8 caracteres</p>
    </div>
  );
}
