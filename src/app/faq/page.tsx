import Link from 'next/link';
import { Suspense } from 'react';
import FloatingHeader from '@/components/FloatingHeader';
import SiteFooter from '@/components/SiteFooter';
import FAQClient from '@/components/FAQClient';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors">
      <Suspense fallback={null}>
        <FloatingHeader />
      </Suspense>
      <main className="pt-24 pb-16 lg:pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <header className="space-y-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <span className="h-4 w-4" aria-hidden="true">?</span>
              Centro de ayuda
            </span>
            <h1 className="text-3xl font-bold lg:text-4xl">Preguntas frecuentes</h1>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--text-muted)] lg:text-base">
              Encuentra respuestas rápidas y recomendaciones prácticas para sacar el máximo provecho del generador de
              quizzes. Si necesitas asesoría personalizada, escríbenos a{' '}
              <Link href="mailto:ac20102003@gmail.com" className="text-blue-600 transition hover:text-blue-500">
                ac20102003@gmail.com
              </Link>
              .
            </p>
          </header>

          {/* Shortcuts panel */}
          <div className="mt-8 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 p-4 shadow-sm shadow-slate-200/20">
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Atajos de teclado</h3>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">Usa estos atajos para navegar más rápido por la aplicación:</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-3">
                <kbd className="rounded-md border border-[color:var(--border-default)] px-2 py-1 text-xs">/</kbd>
                <span className="text-[color:var(--text-muted)]">Abrir búsqueda</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className="rounded-md border border-[color:var(--border-default)] px-2 py-1 text-xs">Alt + 1</kbd>
                <span className="text-[color:var(--text-muted)]">Ir a Inicio</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className="rounded-md border border-[color:var(--border-default)] px-2 py-1 text-xs">Alt + 2</kbd>
                <span className="text-[color:var(--text-muted)]">Ir a FAQ</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className="rounded-md border border-[color:var(--border-default)] px-2 py-1 text-xs">Alt + 3</kbd>
                <span className="text-[color:var(--text-muted)]">Ir a Contacto</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className="rounded-md border border-[color:var(--border-default)] px-2 py-1 text-xs">Esc</kbd>
                <span className="text-[color:var(--text-muted)]">Cerrar menú / cancelar</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className="rounded-md border border-[color:var(--border-default)] px-2 py-1 text-xs">⌘ / Ctrl</kbd>
                <span className="text-[color:var(--text-muted)]">En macOS usa ⌘ en lugar de Alt cuando corresponda</span>
              </li>
            </ul>
          </div>

          <Suspense fallback={null}>
            <FAQClient />
          </Suspense>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 px-6 py-5 text-sm text-[color:var(--text-muted)] shadow-lg shadow-slate-200/30 sm:flex-row">
            <p>¿No encontraste lo que buscabas? Nuestro equipo está listo para ayudarte.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter showDownload={false} />
    </div>
  );
}
