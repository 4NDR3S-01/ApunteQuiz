'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type LanguageValue = 'es' | 'en';

type LanguageContextValue = {
  language: LanguageValue;
  setLanguage: (l: LanguageValue) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageValue>('es');

  useEffect(() => {
    const stored = window.localStorage.getItem('aq-language');
    if (stored === 'es' || stored === 'en') {
      setLanguageState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('aq-language', language);
    window.dispatchEvent(new CustomEvent('aq-language-change', { detail: language }));
  }, [language]);

  const setLanguage = (l: LanguageValue) => setLanguageState(l);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
