"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle, BookOpen } from 'lucide-react';
import evaluatePassword from '@/utils/password';
import PasswordMeter from '@/components/PasswordMeter';
import useTranslation from '@/hooks/useTranslation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) {
      return (t('password.minLength', { n: 6 }) as string) || '';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (password !== confirmPassword) {
      setError(t('password.mismatch') as string);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // enforce minimal strength (score 0..4) - require at least 2 (Aceptable)
    try {
      const strength = evaluatePassword(password);
      if (strength.score < 2) {
        const weakTemplate = (t('password.weak') as string) || 'La contraseña es demasiado débil. {suggestion}';
        setError(weakTemplate.replace('{suggestion}', strength.suggestions[0] ?? 'Mejora la longitud o la variedad de caracteres.'));
        return;
      }
    } catch {
      // ignore evaluator errors
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?password_reset=true');
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || (t('auth.reset.error_generic') as string));
      } else {
        setError(t('auth.reset.error_generic') as string);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-100 px-4 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md">
          <div className="a11y-card rounded-3xl p-8 text-center shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
              {t('auth.reset.success_title')}
            </h2>
            <p className="text-[color:var(--text-muted)]">
              {t('auth.reset.success_desc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-100 via-white to-slate-100 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="group inline-flex items-center gap-2 text-xl font-bold text-[color:var(--foreground)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
            <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
            ApunteQuiz
          </span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="a11y-card rounded-3xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors">
                {t('auth.reset.title')}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--text-muted)] transition-colors">
                {t('auth.reset.subtitle')}
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[color:var(--foreground)]">
                  {t('auth.reset.passwordLabel')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-[color:var(--text-muted)]" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="a11y-input block w-full rounded-lg py-3 pl-12 pr-12 text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('auth.shared.placeholders.password') as string}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? (t('auth.shared.hidePassword') as string)
                        : (t('auth.shared.showPassword') as string)
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                    {/* Password strength meter */}
                    {(() => {
                      const strength = evaluatePassword(password);
                      const segments = [0, 1, 2, 3];
                      return (
                        <div className="mt-3">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {segments.map((i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-8 rounded ${i <= (strength.score - 1) ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                                />
                              ))}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-[color:var(--text-muted)]">{strength.label}</span>
                              {strength.suggestions && strength.suggestions.length > 0 && (
                                <ul className="mt-1 space-y-0.5 text-[color:var(--text-muted)] text-[11px]">
                                  {strength.suggestions.slice(0, 3).map((s) => (
                                    <li key={s}>• {s}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[color:var(--foreground)]">
                  {t('auth.reset.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-[color:var(--text-muted)]" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="a11y-input block w-full rounded-lg py-3 pl-12 pr-12 text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('auth.shared.placeholders.password') as string}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? (t('auth.shared.hidePassword') as string)
                        : (t('auth.shared.showPassword') as string)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
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
                    <span>{t('auth.reset.loading')}</span>
                  </>
                ) : (
                  <span>{t('auth.reset.button')}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
