import useTranslation from '@/hooks/useTranslation';

type Lang = 'es' | 'en';

export function useT() {
  const { t } = useTranslation();
  return t;
}

export type { Lang };
