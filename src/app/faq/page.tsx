import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { HelpCircle, MessageCircleQuestion, UserCog, Layers, ArrowLeft } from 'lucide-react';
import FloatingHeader from '@/components/FloatingHeader';
import SiteFooter from '@/components/SiteFooter';

type FAQEntry = {
  question: string;
  answer: string;
};

type FAQSection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  entries: FAQEntry[];
};

const sections: FAQSection[] = [
  {
    id: 'generales',
    title: 'Preguntas generales',
    description: 'Resuelve las dudas más comunes antes de generar tu primer formulario.',
    icon: MessageCircleQuestion,
    entries: [
      {
        question: '¿Necesito instalar algo para usar ApunteQuiz?',
        answer:
          'No. Todo se ejecuta desde el navegador y puedes comenzar a generar cuestionarios apenas inicias sesión.',
      },
      {
        question: '¿Puedo trabajar con documentos en diferentes idiomas?',
        answer:
          'Sí. Carga tus PDFs o textos en el idioma que prefieras y ajusta el idioma de salida desde el panel principal.',
      },
      {
        question: '¿Qué tipo de preguntas se generan automáticamente?',
        answer:
          'Puedes combinar selección múltiple, verdadero/falso y respuesta abierta. Define la proporción desde el flujo guiado.',
      },
    ],
  },
  {
    id: 'cuenta',
    title: 'Cuenta y acceso',
    description: 'Administra perfiles, roles y configuraciones de seguridad en segundos.',
    icon: UserCog,
    entries: [
      {
        question: '¿Cómo invito a mi equipo docente?',
        answer:
          'Desde el panel “Colaborar” ingresa los correos institucionales. Cada invitado recibe acceso a los formularios compartidos.',
      },
      {
        question: '¿Puedo usar autenticación con mi institución?',
        answer:
          'ApunteQuiz soporta inicio de sesión con Google, Microsoft 365 y credenciales institucionales mediante SSO.',
      },
      {
        question: '¿Qué sucede si olvido mi contraseña?',
        answer:
          'Utiliza la opción “Recuperar acceso” en la pantalla de inicio de sesión para generar un enlace temporal de restablecimiento.',
      },
    ],
  },
  {
    id: 'colaboracion',
    title: 'Colaboración y resultados',
    description: 'Comparte quizzes, obtén retroalimentación y analiza métricas en conjunto.',
    icon: Layers,
    entries: [
      {
        question: '¿Cómo comparto un cuestionario con mis estudiantes?',
        answer:
          'Publica el quiz y envía el enlace generado. Puedes restringir el acceso con contraseña o correos específicos.',
      },
      {
        question: '¿Se puede descargar el resultado en formatos alternativos?',
        answer:
          'Sí. Exporta cada quiz en PDF o CSV para integrarlo con tu LMS o archivarlo en tu nube institucional.',
      },
      {
        question: '¿Puedo recibir comentarios del equipo en tiempo real?',
        answer:
          'Activa la revisión colaborativa para que colegas añadan notas y sugerencias directamente sobre cada pregunta.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors">
      <FloatingHeader />
      <main className="pt-24 pb-16 lg:pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <header className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
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

        <div className="mt-12 space-y-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 p-6 shadow-lg shadow-slate-200/30 transition hover:shadow-xl lg:p-8"
                aria-label={section.title}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{section.title}</h2>
                      <p className="text-sm text-[color:var(--text-muted)]">{section.description}</p>
                    </div>
                  </div>
                  <Link
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600 transition hover:text-blue-500"
                  >
                    Navegar a sección
                  </Link>
                </div>
                <dl className="mt-6 space-y-4">
                  {section.entries.map((entry) => (
                    <div
                      key={entry.question}
                      className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4"
                    >
                      <dt className="text-sm font-semibold text-[color:var(--foreground)]">{entry.question}</dt>
                      <dd className="mt-2 text-sm text-[color:var(--text-muted)]">{entry.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 px-6 py-5 text-sm text-[color:var(--text-muted)] shadow-lg shadow-slate-200/30 sm:flex-row">
          <p>¿No encontraste lo que buscabas? Nuestro equipo está listo para ayudarte.</p>
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
