'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function ForgotPasswordForm() {
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  // load remembered email on mount
  useEffect(() => {
    try {
      const saved = globalThis.localStorage.getItem('aq-remember-email');
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
      try {
        if (rememberMe) {
          globalThis.localStorage.setItem('aq-remember-email', email);
        }
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || (t('auth.forgot.error_generic') as string));
      } else {
        setError(t('auth.forgot.error_generic') as string);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="a11y-card rounded-3xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
              {t('auth.forgot.success_title')}
            </h2>
            <p className="mb-6 text-[color:var(--text-muted)]">
              {t('auth.forgot.success_desc')}
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400"
              >
                {t('common.go_to_login')}
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition-all hover:bg-[color:var(--surface-muted)]"
              >
                {t('auth.forgot.resend')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="a11y-card rounded-3xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
        {/* Back Link */}
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('auth.forgot.back')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors">
            {t('auth.forgot.title')}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)] transition-colors">
            {t('auth.forgot.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

  {/* Form */}
  <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[color:var(--foreground)]">
              {t('auth.login.emailLabel')}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-[color:var(--text-muted)]" aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="a11y-input block w-full rounded-lg py-3 pl-12 pr-4 text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('auth.shared.placeholders.email') as string}
                autoComplete="email"
              />
            </div>
            <p className="text-xs text-[color:var(--text-muted)]">
              {t('auth.forgot.subtitle')}
            </p>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-[color:var(--foreground)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-[color:var(--border-default)] text-blue-600 focus:ring-blue-500"
              />
              <span>{t('auth.login.remember')}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500 disabled:hover:shadow-lg"
          >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>{t('auth.forgot.loading')}</span>
                  </>
                ) : (
                  <span>{t('auth.forgot.button')}</span>
                )}
          </button>
        </form>
      </div>
    </div>
  );
}
