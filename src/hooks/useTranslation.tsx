import translations from '@/i18n/translations';
import { useLanguage } from '@/components/LanguageProvider';

type Lang = keyof typeof translations;

export default function useTranslation() {
  const { language } = useLanguage();
  const lang = (language as Lang) || 'es';

  const t = (path: string, vars?: Record<string, string | number>) => {
    const parts = path.split('.');
    let cur: any = translations[lang as Lang];
    for (const p of parts) {
      if (!cur) break;
      cur = cur[p];
    }
    let text = typeof cur === 'string' ? cur : path;
    if (vars && typeof text === 'string') {
      for (const k of Object.keys(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
      }
    }
    return text;
  };

  return { t, lang } as const;
}
