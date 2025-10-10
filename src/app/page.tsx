import Link from 'next/link';
import QuizGenerator from '@/components/QuizGenerator';

const features = [
  {
    title: 'Preguntas generadas con IA',
    description: 'Transforma tus apuntes en evaluaciones personalizadas y listas para practicar en segundos.',
    bullets: [
      'Entiende el contexto del PDF para crear preguntas acertadas',
      'Ajusta la dificultad según el nivel académico seleccionado',
      'Genera múltiples tipos de pregunta para reforzar el aprendizaje'
    ]
  },
  {
    title: 'Flujo simplificado y rápido',
    description: 'Controla cada paso del proceso con indicaciones claras y sin complicaciones de configuración.',
    bullets: [
      'Previsualiza los documentos que vas cargando',
      'Define la proporción de tipos de pregunta que prefieras',
      'Sistema pre-configurado listo para usar sin configuraciones adicionales'
    ]
  },
  {
    title: 'Hecho para equipos académicos',
    description: 'Organiza sesiones de estudio, pon a prueba a tus estudiantes o prepara material de repaso con facilidad.',
    bullets: [
      'Comparte quizzes listos para ser resueltos en clase o en casa',
      'Recibe una estructura clara para evaluar resultados',
      'Escala desde apuntes cortos hasta manuales completos'
    ]
  }
] as const;

const steps = [
  {
    title: 'Carga tus PDFs o apuntes',
    description: 'Sube uno o varios documentos y deja que el sistema los procese de manera automática.',
    badge: 'Paso 1'
  },
  {
    title: 'Configura la evaluación',
    description: 'Elige idioma, nivel educativo, número de preguntas y tipos para que el quiz se adapte a tu objetivo.',
    badge: 'Paso 2'
  },
  {
    title: 'Genera y practica el quiz',
    description: 'Obtén tu cuestionario personalizado listo para resolver o compartir de inmediato.',
    badge: 'Paso 3'
  }
] as const;

const faqs = [
  {
    question: '¿Necesito una cuenta o suscripción?',
    answer: 'No. El sistema está pre-configurado y listo para usar. Solo necesitas subir tus documentos y empezar a generar quizzes.'
  },
  {
    question: '¿Se almacenan mis documentos?',
    answer: 'Los documentos se procesan de forma segura durante tu sesión. No se almacenan de manera permanente en nuestros servidores.'
  },
  {
    question: '¿Puedo generar preguntas en otros idiomas?',
    answer: 'Sí. Configura el idioma en la sección de ajustes y el sistema redactará las preguntas en esa lengua.'
  }
] as const;

export default function Home() {
  return (
    <main
      id="contenido-principal"
      className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors"
    >
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_#1e293b,_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 text-[color:var(--foreground)] transition-colors lg:flex-row lg:items-center lg:justify-between lg:py-32">
          <div className="max-w-xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-200">
              Disponible en beta · Potenciado con IA
            </span>
            <h1 className="text-4xl font-bold text-[color:var(--foreground)] transition-colors sm:text-5xl lg:text-6xl">
              Genera quizzes inteligentes a partir de tus PDFs en minutos
            </h1>
            <p className="text-lg text-[color:var(--text-muted)]">
              ApunteQuiz combina el poder de la IA con un flujo pensado para educadores y estudiantes.
              Sube tus apuntes, elige cómo quieres evaluar y obtén cuestionarios personalizados listos para practicar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#generador"
                className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
              >
                Probar el generador
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-[color:var(--border-default)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:brightness-105"
              >
                Ver cómo funciona
              </Link>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-[color:var(--text-muted)]">Documentos soportados</dt>
                <dd className="text-2xl font-semibold text-[color:var(--foreground)]">PDF y texto</dd>
              </div>
              <div>
                <dt className="text-sm text-[color:var(--text-muted)]">Tipos de pregunta</dt>
                <dd className="text-2xl font-semibold text-[color:var(--foreground)]">3 formatos</dd>
              </div>
              <div>
                <dt className="text-sm text-[color:var(--text-muted)]">Tiempo estimado</dt>
                <dd className="text-2xl font-semibold text-[color:var(--foreground)]">≈ 90 seg</dd>
              </div>
            </dl>
          </div>

          <div className="relative flex w-full justify-center lg:max-w-md">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 opacity-40 blur-2xl dark:from-blue-500 dark:via-sky-400 dark:to-teal-400" />
            <div className="relative w-full rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">
                  Así se ve tu flujo
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)] p-4 shadow-sm">
                    <p className="font-semibold text-[color:var(--foreground)]">1. Carga tus documentos</p>
                    <p className="text-[color:var(--text-muted)]">
                      Arrastra archivos PDF o pega notas escritas para iniciar.
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)] p-4 shadow-sm">
                    <p className="font-semibold text-[color:var(--foreground)]">2. Personaliza la evaluación</p>
                    <p className="text-[color:var(--text-muted)]">
                      Define idioma, nivel y distribución de tipos de pregunta.
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)] p-4 shadow-sm">
                    <p className="font-semibold text-[color:var(--foreground)]">3. Genera y practica</p>
                    <p className="text-[color:var(--text-muted)]">
                      Obtén un quiz listo para practicar o compartir al instante.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl space-y-12 px-6 py-20">
        <header className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors sm:text-4xl">
            Diseñado para transformar tus apuntes en experiencias de estudio activas
          </h2>
          <p className="text-lg text-[color:var(--text-muted)]">
            Cada sección del flujo se pensó para ahorrarte tiempo y garantizar preguntas de calidad, sin depender de procesos manuales.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="a11y-card flex flex-col gap-4 rounded-2xl p-6 shadow-lg shadow-slate-200/40 transition-colors"
            >
              <div className="inline-flex w-max rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">
                {feature.title}
              </div>
              <p className="text-[color:var(--text-muted)]">{feature.description}</p>
              <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-200/60 transition-colors dark:bg-slate-900/30">
        <div className="mx-auto max-w-6xl space-y-12 px-6 py-20">
          <header className="space-y-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 transition-colors dark:text-emerald-200">
              ¿Cómo funciona?
            </span>
            <h2 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors sm:text-4xl">
              Un flujo escalonado para que no te pierdas en el proceso
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[color:var(--text-muted)] transition-colors">
              Pasa de un PDF a un cuestionario listo para practicar en menos de dos minutos con una experiencia guiada y clara.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="relative flex flex-col gap-4 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] p-8 text-left shadow-lg shadow-slate-200/60 transition-colors"
              >
                <span className="inline-flex w-max items-center gap-2 rounded-full bg-[color:var(--surface-muted)] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)] transition-colors">
                  {step.badge}
                </span>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-[color:var(--text-muted)] transition-colors">
                  {step.description}
                </p>
                <div className="mt-auto h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="generador" className="mx-auto max-w-5xl px-6 py-24">
        <header className="space-y-4 text-center">
          <h2 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors sm:text-4xl">
            Pruébalo ahora mismo con tus propios documentos
          </h2>
          <p className="text-lg text-[color:var(--text-muted)] transition-colors">
            Sube un PDF de tus clases o apuntes, configura las variables principales y deja que la IA proponga preguntas relevantes.
          </p>
        </header>
        <QuizGenerator className="mt-10" />
      </section>

      <section className="bg-slate-200/70 transition-colors dark:bg-slate-900/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors sm:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-[color:var(--text-muted)] transition-colors">
              Aclaramos las dudas más comunes para que puedas comenzar sin fricciones.
              ¿Necesitas algo más? Escríbenos y con gusto te ayudamos.
            </p>
            <Link
              href="mailto:contacto@apuntequiz.com"
              className="inline-flex w-max items-center justify-center rounded-lg border border-[color:var(--border-default)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:brightness-105"
            >
              Enviar un correo
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] p-5 transition hover:brightness-105"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-[color:var(--foreground)] transition group-hover:text-blue-600">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-[color:var(--text-muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/80 transition-colors">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-[color:var(--text-muted)] transition-colors sm:flex-row">
          <p>© {new Date().getFullYear()} ApunteQuiz. Construido con cariño para impulsar el aprendizaje activo.</p>
          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className="transition hover:text-[color:var(--foreground)]"
            >
              Características
            </Link>
            <Link
              href="#generador"
              className="transition hover:text-[color:var(--foreground)]"
            >
              Generador
            </Link>
            <Link
              href="mailto:contacto@apuntequiz.com"
              className="transition hover:text-[color:var(--foreground)]"
            >
              Soporte
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
