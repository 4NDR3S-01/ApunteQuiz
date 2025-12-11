"use client";

import Link from 'next/link';
import { Suspense } from 'react';
import FloatingHeader from '@/components/FloatingHeader';
import SiteFooter from '@/components/SiteFooter';
import AccessibleVideo from '@/components/AccessibleVideo';
import useTranslation from '@/hooks/useTranslation';

export default function Home() {
  const { dictionary } = useTranslation();
  const home = dictionary.home;

  return (
    <>
      <Suspense fallback={null}>
        <FloatingHeader />
      </Suspense>
      <main
        id="contenido-principal"
        className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors pt-20"
      >
        <section
          id="resumen"
          className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_#1e293b,_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 text-[color:var(--foreground)] transition-colors lg:flex-row lg:items-center lg:justify-between lg:py-32">
          <div className="max-w-xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-200">
              {home.hero.badge}
            </span>
            <h1 className="text-4xl font-bold text-[color:var(--foreground)] transition-colors sm:text-5xl lg:text-6xl">
              {home.hero.title}
            </h1>
            <p className="text-lg text-[color:var(--text-muted)]">
              {home.hero.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
              >
                {home.hero.primaryCta}
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center justify-center rounded-lg border border-[color:var(--border-default)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:brightness-105"
              >
                {home.hero.secondaryCta}
              </Link>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              {home.hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm text-[color:var(--text-muted)]">{stat.label}</dt>
                  <dd className="text-2xl font-semibold text-[color:var(--foreground)]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex w-full justify-center lg:max-w-md">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 opacity-40 blur-2xl dark:from-blue-500 dark:via-sky-400 dark:to-teal-400" />
            <div className="relative w-full rounded-3xl border border-[color:var(--border-default)] bg-white/95 dark:bg-slate-900/95 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 backdrop-blur-sm">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">
                  {home.hero.flowPreview.title}
                </p>
                <ul className="space-y-3 text-sm">
                  {home.hero.flowPreview.steps.map((item) => (
                    <li
                      key={item.title}
                      className="rounded-2xl border border-[color:var(--border-default)] bg-slate-50/80 dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm"
                    >
                      <p className="font-semibold text-[color:var(--foreground)]">{item.title}</p>
                      <p className="text-[color:var(--text-muted)]">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl space-y-12 px-6 py-20">
        <header className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors sm:text-4xl">
            {home.features.title}
          </h2>
          <p className="text-lg text-[color:var(--text-muted)]">
            {home.features.description}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {home.features.items.map((feature) => (
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
        <div id="como-funciona" className="mx-auto max-w-6xl space-y-12 px-6 py-20">
          <header className="space-y-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 transition-colors dark:text-emerald-200">
              {home.howItWorks.badge}
            </span>
            <h2 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors sm:text-4xl">
              {home.howItWorks.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[color:var(--text-muted)] transition-colors">
              {home.howItWorks.description}
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-3">
            {home.howItWorks.steps.map((step) => (
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

          {/* Video Tutorial: Cómo generar un quiz */}
          <div className="mt-12 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] p-6 shadow-lg shadow-slate-200/60 transition-colors lg:p-8">
            <AccessibleVideo
              videoSrc="/videos/quiz-tutorial.mp4"
              subtitleSrcEs="/videos/quiz-tutorial-subtitles-es.vtt"
              subtitleSrcEn="/videos/quiz-tutorial-subtitles-en.vtt"
              captionSrcEs="/videos/quiz-tutorial-captions-es.vtt"
              title={home.videoTutorial?.title || 'Video tutorial: Cómo generar un quiz'}
              description={home.videoTutorial?.description || 'Aprende paso a paso cómo crear un quiz desde tus apuntes. Este video incluye subtítulos y transcripciones para accesibilidad.'}
              transcript={home.videoTutorial?.transcript || 'Este es un video tutorial que muestra cómo generar un quiz en ApunteQuiz. Primero, sube tu documento PDF o pega tus apuntes. Luego, selecciona el idioma, el nivel educativo y el número de preguntas que deseas. Finalmente, haz clic en generar y obtendrás tu quiz personalizado listo para practicar.'}
              maxHeight="500px"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
    </>
  );
}
