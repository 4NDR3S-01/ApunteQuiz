'use client';

import useTranslation from '@/hooks/useTranslation';

export default function SkipToContentLink() {
  const { t } = useTranslation();

  return (
    <a href="#contenido-principal" className="skip-to-content">
      {t('layout.skipToContent')}
    </a>
  );
}
