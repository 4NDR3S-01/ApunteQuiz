"use client";

import Link from 'next/link';
import useTranslation from '@/hooks/useTranslation';

export default function TerminosPage() {
  const { dictionary } = useTranslation();
  const termsPage = dictionary.termsPage;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-4 text-2xl font-bold">{termsPage.title}</h1>
      <p className="mb-4 text-[color:var(--text-muted)]">{termsPage.description}</p>

      <section className="mt-6 space-y-4">
        {termsPage.sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-[color:var(--text-muted)]">{section.description}</p>
          </div>
        ))}
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          {termsPage.back}
        </Link>
      </div>
    </main>
  );
}
