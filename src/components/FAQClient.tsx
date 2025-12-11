'use client';

import { useSearchParams } from 'next/navigation';
import { MessageCircleQuestion, UserCog, Layers } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import AccessibleVideo from './AccessibleVideo';

const sectionIcons = {
  generales: MessageCircleQuestion,
  cuenta: UserCog,
  colaboracion: Layers,
} as const;

export default function FAQClient() {
  const searchParams = useSearchParams();
  const query = (searchParams?.get('query') ?? '').trim().toLowerCase();
  const { dictionary } = useTranslation();
  const faq = dictionary.faq;

  const sectionsWithIcons = faq.sections.map((section) => ({
    ...section,
    icon: sectionIcons[section.id as keyof typeof sectionIcons] ?? MessageCircleQuestion,
  }));

  const filtered = query
    ? sectionsWithIcons
        .map((section) => ({
          ...section,
          entries: section.entries.filter((e) =>
            `${e.question} ${e.answer}`.toLowerCase().includes(query),
          ),
        }))
        .filter((s) => s.entries.length > 0)
    : sectionsWithIcons;

  return (
    <div>
      <div className="mt-12 space-y-10">
        {filtered.map((section) => {
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

              {/* Videos para la sección de cuenta */}
              {section.id === 'cuenta' && section.videos && (
                <div className="mt-8 space-y-6 pt-6 border-t border-[color:var(--border-default)]">
                  {section.videos.register && (
                    <AccessibleVideo
                      videoSrc="/videos/register-tutorial.mp4"
                      subtitleSrcEs="/videos/register-tutorial-subtitles-es.vtt"
                      subtitleSrcEn="/videos/register-tutorial-subtitles-en.vtt"
                      title={section.videos.register.title}
                      description={section.videos.register.description}
                      transcript={section.videos.register.transcript}
                      maxHeight="400px"
                    />
                  )}
                  {section.videos.login && (
                    <AccessibleVideo
                      videoSrc="/videos/login-tutorial.mp4"
                      subtitleSrcEs="/videos/login-tutorial-subtitles-es.vtt"
                      subtitleSrcEn="/videos/login-tutorial-subtitles-en.vtt"
                      title={section.videos.login.title}
                      description={section.videos.login.description}
                      transcript={section.videos.login.transcript}
                      maxHeight="400px"
                    />
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
