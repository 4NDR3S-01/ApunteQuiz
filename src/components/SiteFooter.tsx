"use client";

import Link from 'next/link';
import AppDownloadSection from '@/components/AppDownloadSection';
import { useT } from '@/i18n';

type SiteFooterProps = {
  readonly showDownload?: boolean;
};

export default function SiteFooter({ showDownload = true }: SiteFooterProps) {
  const t = useT();
  return (
    <footer className="border-t border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/80 transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {showDownload ? (
          <div className="pb-6 border-b border-[color:var(--border-default)]">
            <AppDownloadSection variant="footer" />
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-[color:var(--text-muted)] transition-colors sm:flex-row">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear() })}{' '}
            <Link
              href="https://www.instagram.com/andres.cabrera20"
              className="text-blue-600 hover:underline"
            >
              William Cabrera
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/politica" className="transition hover:text-[color:var(--foreground)]">
              {t('footer.privacy')}
            </Link>
            <span className="text-[color:var(--text-muted)]">|</span>
            <Link href="/terminos" className="transition hover:text-[color:var(--foreground)]">
              {t('footer.terms')}
            </Link>
            <span className="text-[color:var(--text-muted)]">|</span>
            <Link href="/faq" className="transition hover:text-[color:var(--foreground)]">
              {t('footer.help')}
            </Link>
            <span className="text-[color:var(--text-muted)]">|</span>
            <Link href="/contacto" className="transition hover:text-[color:var(--foreground)]">
              {t('footer.support')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
