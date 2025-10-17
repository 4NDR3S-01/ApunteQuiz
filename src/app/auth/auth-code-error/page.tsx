import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Error de autenticación - ApunteQuiz',
  description: 'Error al confirmar la autenticación',
};

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-100 px-4 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="a11y-card rounded-3xl p-8 text-center shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
            Error de autenticación
          </h1>
          <p className="mb-6 text-[color:var(--text-muted)]">
            Hubo un problema al verificar tu autenticación. El enlace puede haber expirado o ser inválido.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Volver al inicio
            </Link>
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition-all hover:bg-[color:var(--surface-muted)]"
            >
              Intentar registrarse de nuevo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
