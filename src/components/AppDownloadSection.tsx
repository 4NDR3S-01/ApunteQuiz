'use client';

import { useState } from 'react';
import { Download, Smartphone, QrCode, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface AppDownloadSectionProps {
  variant?: 'landing' | 'footer';
  className?: string;
}

export default function AppDownloadSection({ variant = 'landing', className = '' }: AppDownloadSectionProps) {
  const [showQR, setShowQR] = useState(false);
  const apkUrl = '/downloads/apuntequiz.apk';
  
  // URL completa para el código QR (se generará con la URL completa del sitio)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + apkUrl : apkUrl)}`;

  if (variant === 'footer') {
    return (
      <div className={`relative ${className}`}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {/* Texto descriptivo */}
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                ¿Prefieres usar la app móvil?
              </p>
              <p className="text-xs text-[color:var(--text-muted)]">
                Descarga ApunteQuiz APK
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
              title="Mostrar código QR"
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Ver QR</span>
            </button>
            <a
              href={apkUrl}
              download="apuntequiz.apk"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              <Download className="h-4 w-4" />
              Descargar APK
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
                aria-label="Cerrar"
              >
                ✕
              </button>
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-500/10 p-3">
                  <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                  Escanea con tu móvil
                </h3>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Apunta la cámara de tu teléfono al código QR para descargar la APK
                </p>
                <div className="flex justify-center rounded-xl bg-white p-4">
                  <Image 
                    src={qrCodeUrl}
                    alt="Código QR para descargar ApunteQuiz APK"
                    width={200}
                    height={200}
                    unoptimized
                  />
                </div>
                <div className="space-y-2 text-xs text-[color:var(--text-muted)]">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Android 5.0 o superior
                  </p>
                  <p>Asegúrate de permitir instalación de fuentes desconocidas</p>
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
            Disponible en móvil
          </div>
          <h3 className="text-3xl font-bold text-[color:var(--foreground)]">
            Lleva ApunteQuiz contigo
          </h3>
          <p className="text-[color:var(--text-muted)]">
            Descarga la aplicación móvil de ApunteQuiz y genera quizzes desde tu dispositivo Android. 
            Estudia en cualquier lugar, en cualquier momento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              <QrCode className="h-5 w-5" />
              Ver código QR
            </button>
            <a
              href={apkUrl}
              download="apuntequiz.apk"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
            >
              <Download className="h-5 w-5" />
              Descargar APK
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Compatible con Android 5.0+</span>
          </div>
        </div>

        <div className="relative flex justify-center">
          {showQR ? (
            <div className="rounded-2xl border border-[color:var(--border-default)] bg-white p-6 shadow-xl">
              <div className="space-y-4 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  Escanea para descargar
                </p>
                <Image 
                  src={qrCodeUrl}
                  alt="Código QR para descargar ApunteQuiz APK"
                  width={250}
                  height={250}
                  unoptimized
                  className="rounded-lg"
                />
                <button
                  onClick={() => setShowQR(false)}
                  className="text-xs text-blue-600 hover:text-blue-500 underline"
                >
                  Ocultar QR
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
                      ApunteQuiz
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      Aplicación Android
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-[color:var(--text-muted)]">
                    <p>✨ Generación de quizzes</p>
                    <p>📚 Acceso offline a tus quizzes</p>
                    <p>🎯 Interfaz optimizada</p>
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
