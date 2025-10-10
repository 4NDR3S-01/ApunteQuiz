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
    title: 'Flujo guiado y seguro',
    description: 'Controla cada paso del proceso con indicaciones claras y sin exponer tus claves de forma insegura.',
    bullets: [
      'Previsualiza los documentos que vas cargando',
      'Define la proporción de tipos de pregunta que prefieras',
      'Gestiona tus API keys de OpenAI o Anthropic sin complicaciones'
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
    title: 'Conecta tu proveedor de IA',
    description: 'Introduce tu API key favorita y genera el cuestionario listo para resolver o compartir.',
    badge: 'Paso 3'
  }
] as const;

const faqs = [
  {
    question: '¿Necesito una cuenta o suscripción?',
    answer: 'No. Solo necesitarás una API key válida del proveedor de IA que quieras usar para generar tus quizzes.'
  },
  {
    question: '¿Se almacenan mis documentos?',
    answer: 'Los documentos se procesan de forma local dentro de tu sesión. No se envían a servidores externos distintos a tu proveedor de IA.'
  },
  {
    question: '¿Puedo generar preguntas en otros idiomas?',
    answer: 'Sí. Configura el idioma en la sección de ajustes y el sistema redactará las preguntas en esa lengua.'
  }
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_#1e293b,_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 text-slate-900 transition-colors lg:flex-row lg:items-center lg:justify-between lg:py-32 dark:text-slate-100">
          <div className="max-w-xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-200">
              Disponible en beta · Potenciado con IA
            </span>
            <h1 className="text-4xl font-bold text-slate-900 transition-colors sm:text-5xl lg:text-6xl dark:text-white">
              Genera quizzes inteligentes a partir de tus PDFs en minutos
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
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
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-white/20 dark:text-slate-100 dark:hover:border-white/40"
              >
                Ver cómo funciona
              </Link>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Documentos soportados</dt>
                <dd className="text-2xl font-semibold text-slate-900 dark:text-white">PDF y texto</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Tipos de pregunta</dt>
                <dd className="text-2xl font-semibold text-slate-900 dark:text-white">3 formatos</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Tiempo estimado</dt>
                <dd className="text-2xl font-semibold text-slate-900 dark:text-white">≈ 90 seg</dd>
              </div>
            </dl>
          </div>

          <div className="relative flex w-full justify-center lg:max-w-md">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 opacity-40 blur-2xl dark:from-blue-500 dark:via-sky-400 dark:to-teal-400" />
            <div className="relative w-full rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-blue-900/20">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">
                  Así se ve tu flujo
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
                    <p className="font-semibold text-slate-900 dark:text-white">1. Carga tus documentos</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Arrastra archivos PDF o pega notas escritas para iniciar.
                    </p>
                  </li>
                  <li className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
                    <p className="font-semibold text-slate-900 dark:text-white">2. Personaliza la evaluación</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Define idioma, nivel y distribución de tipos de pregunta.
                    </p>
                  </li>
                  <li className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
                    <p className="font-semibold text-slate-900 dark:text-white">3. Genera y comparte</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Obtén un quiz listo para practicar o replicar con tu grupo.
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
          <h2 className="text-3xl font-bold text-slate-900 transition-colors sm:text-4xl dark:text-white">
            Diseñado para transformar tus apuntes en experiencias de estudio activas
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Cada sección del flujo se pensó para ahorrarte tiempo y garantizar preguntas de calidad, sin depender de procesos manuales.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 transition-colors dark:border-white/10 dark:bg-white/5 dark:shadow-blue-900/10"
            >
              <div className="inline-flex w-max rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">
                {feature.title}
              </div>
              <p className="text-slate-700 dark:text-slate-200">{feature.description}</p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
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
            <h2 className="text-3xl font-bold text-slate-900 transition-colors sm:text-4xl dark:text-white">
              Un flujo escalonado para que no te pierdas en el proceso
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 transition-colors dark:text-slate-300">
              Pasa de un PDF a un cuestionario listo para practicar en menos de dos minutos con una experiencia guiada y clara.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-lg shadow-slate-200/60 transition-colors dark:border-white/10 dark:bg-white/5 dark:shadow-teal-900/10"
              >
                <span className="inline-flex w-max items-center gap-2 rounded-full bg-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 transition-colors dark:bg-white/10 dark:text-slate-200">
                  {step.badge}
                </span>
                <h3 className="text-xl font-semibold text-slate-900 transition-colors dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 transition-colors dark:text-slate-300">
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
          <h2 className="text-3xl font-bold text-slate-900 transition-colors sm:text-4xl dark:text-white">
            Pruébalo ahora mismo con tus propios documentos
          </h2>
          <p className="text-lg text-slate-600 transition-colors dark:text-slate-300">
            Sube un PDF de tus clases o apuntes, configura las variables principales y deja que la IA proponga preguntas relevantes.
          </p>
        </header>
        <QuizGenerator className="mt-10" />
      </section>

      <section className="bg-slate-200/70 transition-colors dark:bg-slate-900/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 transition-colors sm:text-4xl dark:text-white">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-slate-600 transition-colors dark:text-slate-300">
              Aclaramos las dudas más comunes para que puedas comenzar sin fricciones.
              ¿Necesitas algo más? Escríbenos y con gusto te ayudamos.
            </p>
            <Link
              href="mailto:contacto@apuntequiz.com"
              className="inline-flex w-max items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-white/20 dark:text-slate-100 dark:hover:border-white/40"
            >
              Enviar un correo
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-200">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 transition-colors dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-600 transition-colors sm:flex-row dark:text-slate-400">
          <p>© {new Date().getFullYear()} ApunteQuiz. Construido con cariño para impulsar el aprendizaje activo.</p>
          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className="transition hover:text-slate-900 dark:hover:text-slate-200"
            >
              Características
            </Link>
            <Link
              href="#generador"
              className="transition hover:text-slate-900 dark:hover:text-slate-200"
            >
              Generador
            </Link>
            <Link
              href="mailto:contacto@apuntequiz.com"
              className="transition hover:text-slate-900 dark:hover:text-slate-200"
            >
              Soporte
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
