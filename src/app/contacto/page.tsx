import Link from 'next/link';
import { Mail, Headset, ShieldCheck, GraduationCap, Clock3, MapPin, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import FloatingHeader from '@/components/FloatingHeader';
import SiteFooter from '@/components/SiteFooter';

const supportChannels = [
  {
    id: 'correo',
    title: 'Correo directo',
    value: 'ac20102003@gmail.com',
    description: 'Recibe respuesta en menos de 24 horas hábiles.',
    icon: Mail,
    href: 'mailto:ac20102003@gmail.com',
    actionLabel: 'Escribir ahora',
  },
  {
    id: 'telefono',
    title: 'Línea de soporte',
    value: '+57 (300) 123-4567',
    description: 'Atención de lunes a viernes de 8:00 a 18:00 (GMT-5).',
    icon: Headset,
    href: 'tel:+573001234567',
    actionLabel: 'Llamar',
  },
  {
    id: 'oficina',
    title: 'Oficina principal',
    value: 'Cra. 7 # 45-50, Bogotá D.C.',
    description: 'Agenda una visita previa coordinación por correo.',
    icon: MapPin,
    href: 'https://maps.google.com/?q=Cra.+7+%23+45-50,+Bogotá',
    actionLabel: 'Ver ubicación',
  },
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors">
      <Suspense fallback={null}>
        <FloatingHeader />
      </Suspense>
      <main className="pt-24 pb-16 lg:pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <header className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Equipo de soporte
          </span>
          <h1 className="text-3xl font-bold lg:text-4xl">Contacto y ayuda personalizada</h1>
          <p className="mx-auto max-w-2xl text-sm text-[color:var(--text-muted)] lg:text-base">
            Conecta con nuestro equipo para resolver dudas, coordinar entrenamientos y conocer las políticas de uso.
          </p>
        </header>

        <section
          id="soporte"
          className="mt-12 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 p-6 shadow-lg shadow-slate-200/30 transition hover:shadow-xl lg:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Headset className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Soporte directo</h2>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Escoge el medio que prefieras. Estamos listos para ayudarte con tus evaluaciones.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[color:var(--surface-muted)]/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Tiempo de respuesta &lt; 1 día hábil
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{channel.title}</p>
                      <p className="text-xs text-[color:var(--text-muted)]">{channel.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[color:var(--foreground)]">{channel.value}</span>
                    <Link
                      href={channel.href}
                      className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border-default)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600 transition hover:bg-blue-500/10"
                    >
                      {channel.actionLabel}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="politicas"
          className="mt-10 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 p-6 shadow-lg shadow-slate-200/30 transition hover:shadow-xl lg:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Políticas y términos</h2>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Transparencia y protección de datos diseñadas para entornos académicos.
                </p>
              </div>
            </div>
            <Link
              href="mailto:legal@apuntequiz.dev"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
            >
              Solicitar documentación extendida
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Privacidad de la información</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Los documentos que subes se procesan de manera temporal y se eliminan automáticamente cuando finalizas tu
                sesión, salvo que indiques lo contrario.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Términos de uso</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                ApunteQuiz se ofrece para fines educativos. La publicación externa de evaluaciones requiere citar la
                plataforma como fuente del material.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Accesibilidad</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Implementamos estándares WCAG AA para garantizar experiencias utilizables en diferentes dispositivos y
                ayudas técnicas.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Cumplimiento institucional</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Contamos con acuerdos de confidencialidad y respaldo para instituciones educativas públicas y privadas.
              </p>
            </article>
          </div>
        </section>

        <section
          id="capacitacion"
          className="mt-10 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 p-6 shadow-lg shadow-slate-200/30 transition hover:shadow-xl lg:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Capacitaciones y talleres</h2>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Sesiones adaptadas a docentes, coordinadores académicos y equipos de innovación educativa.
                </p>
              </div>
            </div>
            <Link
              href="mailto:capacitaciones@apuntequiz.dev"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
            >
              Coordinar agenda
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Introducción a ApunteQuiz</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Aprende a generar cuestionarios desde cero y configurar los flujos automatizados en menos de una hora.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Buenas prácticas de evaluación</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Diseña rúbricas, calibra niveles de dificultad y comparte resultados accionables con tu equipo académico.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Integraciones avanzadas</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Conecta ApunteQuiz con tu LMS, automatiza notificaciones y genera reportes personalizados.
              </p>
            </article>
          </div>
        </section>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 px-6 py-5 text-sm text-[color:var(--text-muted)] shadow-lg shadow-slate-200/30 sm:flex-row">
          <p>Regresa a la página principal para continuar creando evaluaciones.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
      </main>
      <SiteFooter showDownload={false} />
    </div>
  );
}
