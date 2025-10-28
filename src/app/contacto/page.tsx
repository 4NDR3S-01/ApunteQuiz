"use client";

import Link from 'next/link';
import { Mail, Headset, ShieldCheck, GraduationCap, Clock3, MapPin, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import FloatingHeader from '@/components/FloatingHeader';
import SiteFooter from '@/components/SiteFooter';
import useTranslation from '@/hooks/useTranslation';

const channelIcons = {
  correo: Mail,
  telefono: Headset,
  oficina: MapPin,
} as const;

export default function ContactoPage() {
  const { dictionary } = useTranslation();
  const contact = dictionary.contact;

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
            {contact.hero.badge}
          </span>
          <h1 className="text-3xl font-bold lg:text-4xl">{contact.hero.title}</h1>
          <p className="mx-auto max-w-2xl text-sm text-[color:var(--text-muted)] lg:text-base">
            {contact.hero.description}
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
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{contact.support.title}</h2>
                <p className="text-sm text-[color:var(--text-muted)]">{contact.support.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[color:var(--surface-muted)]/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {contact.support.responseTime}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {contact.support.channels.map((channel) => {
              const Icon = channelIcons[channel.id as keyof typeof channelIcons] ?? Mail;
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
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{contact.policies.title}</h2>
                <p className="text-sm text-[color:var(--text-muted)]">{contact.policies.description}</p>
              </div>
            </div>
            <Link
              href={contact.policies.cta.href}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
            >
              {contact.policies.cta.label}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {contact.policies.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4"
              >
                <h3 className="text-sm font-semibold text-[color:var(--foreground)]">{card.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{card.description}</p>
              </article>
            ))}
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
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{contact.training.title}</h2>
                <p className="text-sm text-[color:var(--text-muted)]">{contact.training.description}</p>
              </div>
            </div>
            <Link
              href={contact.training.cta.href}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
            >
              {contact.training.cta.label}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {contact.training.items.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-muted)]/30 p-4"
              >
                <h3 className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 px-6 py-5 text-sm text-[color:var(--text-muted)] shadow-lg shadow-slate-200/30 sm:flex-row">
          <p>{contact.backToHome.message}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-blue-500/10 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {contact.backToHome.ctaLabel}
          </Link>
        </div>
      </div>
      </main>
      <SiteFooter showDownload={false} />
    </div>
  );
}
