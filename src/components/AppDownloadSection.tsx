'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, QrCode, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import useTranslation from '@/hooks/useTranslation';

interface AppDownloadSectionProps {
  variant?: 'landing' | 'footer';
  className?: string;
}

export default function AppDownloadSection({ variant = 'landing', className = '' }: AppDownloadSectionProps) {
  const { dictionary } = useTranslation();
  const appDownload = dictionary.appDownload;
  const [showQR, setShowQR] = useState(false);
  const apkUrl = '/downloads/apuntequiz.apk';
  const qrBase = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=`;
  const [qrCodeUrl, setQrCodeUrl] = useState(() => `${qrBase}${encodeURIComponent(apkUrl)}`);

  useEffect(() => {
    if (typeof globalThis.window === 'undefined') return;
    const absoluteUrl = `${globalThis.window.location.origin}${apkUrl}`;
    setQrCodeUrl(`${qrBase}${encodeURIComponent(absoluteUrl)}`);
  }, [apkUrl, qrBase]);

  if (variant === 'footer') {
    return (
      <div className={`relative ${className}`}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {/* Texto descriptivo */}
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {appDownload.footer.prompt}
              </p>
              <p className="text-xs text-[color:var(--text-muted)]">
                {appDownload.footer.description}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
              title={appDownload.footer.toggleTitle}
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">{appDownload.footer.showQr}</span>
            </button>
            <a
              href={apkUrl}
              download="apuntequiz.apk"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              <Download className="h-4 w-4" />
              {appDownload.footer.download}
            </a>
          </div>
        </div>

        {/* Modal/Popup del código QR */}
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowQR(false)}>
            <div 
              className="relative rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] p-6 shadow-2xl max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute right-4 top-4 text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] transition"
                aria-label={appDownload.footer.modal.close}
              >
                ✕
              </button>
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-500/10 p-3">
                  <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                  {appDownload.footer.modal.title}
                </h3>
                <p className="text-sm text-[color:var(--text-muted)]">
                  {appDownload.footer.modal.description}
                </p>
                <div className="flex justify-center rounded-xl bg-white p-4">
                  <Image 
                    src={qrCodeUrl}
                    alt={appDownload.qrAlt}
                    width={200}
                    height={200}
                    unoptimized
                  />
                </div>
                <div className="space-y-2 text-xs text-[color:var(--text-muted)]">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[color:var(--color-success-text)]" />
                    {appDownload.footer.modal.compatibility}
                  </p>
                  <p>{appDownload.footer.modal.instructions}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant 'landing' - Versión más elaborada para la landing page
  return (
    <div className={`rounded-3xl border border-[color:var(--border-default)] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 ${className}`}>
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-200">
            <Smartphone className="h-4 w-4" />
            {appDownload.landing.badge}
          </div>
          <h3 className="text-3xl font-bold text-[color:var(--foreground)]">
            {appDownload.landing.title}
          </h3>
          <p className="text-[color:var(--text-muted)]">
            {appDownload.landing.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              <QrCode className="h-5 w-5" />
              {appDownload.landing.qrButton}
            </button>
            <a
              href={apkUrl}
              download="apuntequiz.apk"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
            >
              <Download className="h-5 w-5" />
              {appDownload.landing.downloadButton}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
            <CheckCircle className="h-4 w-4 text-[color:var(--color-success-text)]" />
            <span>{appDownload.landing.compatibility}</span>
          </div>
        </div>

        <div className="relative flex justify-center">
          {showQR ? (
            <div className="rounded-2xl border border-[color:var(--border-default)] bg-white p-6 shadow-xl">
              <div className="space-y-4 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  {appDownload.landing.modalTitle}
                </p>
                <Image 
                  src={qrCodeUrl}
                  alt={appDownload.qrAlt}
                  width={250}
                  height={250}
                  unoptimized
                  className="rounded-lg"
                />
                <button
                  onClick={() => setShowQR(false)}
                  className="text-xs text-blue-600 hover:text-blue-500 underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {appDownload.landing.hideQr}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-2xl" />
              <div className="relative rounded-3xl border border-[color:var(--border-default)] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-8 shadow-xl">
                <div className="space-y-4 text-center">
                  <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/50">
                    <Smartphone className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-[color:var(--foreground)]">
                      {appDownload.landing.phoneCard.name}
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      {appDownload.landing.phoneCard.subtitle}
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-[color:var(--text-muted)]">
                    {Array.isArray(appDownload?.landing?.phoneCard?.features) ? (
                      appDownload.landing.phoneCard.features.map((feature: any, idx: number) => (
                        <p key={typeof feature === 'string' ? feature : `feature-${idx}`}>{feature}</p>
                      ))
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
