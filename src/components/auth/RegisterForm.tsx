'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User, CheckCircle, Home as HomeIcon } from 'lucide-react';
import evaluatePassword from '@/utils/password';
import PasswordMeter from '@/components/PasswordMeter';
import useTranslation from '@/hooks/useTranslation';

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState('');
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

  // use shared password evaluator

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

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
      // if evaluation fails, allow submission to avoid blocking by bug
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${globalThis.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        setSuccess(true);
        try {
          if (rememberMe) {
            globalThis.localStorage.setItem('aq-remember-email', email);
          } else {
            globalThis.localStorage.removeItem('aq-remember-email');
          }
        } catch {
          // ignore
        }
        // Wait a bit before redirecting
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || (t('auth.register.error_generic') as string));
      } else {
        setError(t('auth.register.error_generic') as string);
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
              {t('auth.register.success_title')}
            </h2>
            <p className="text-[color:var(--text-muted)]">
              {t('auth.register.success_desc')}
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400"
              >
                {t('common.go_to_login')}
              </Link>
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
         href="/"
         className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)]"
       >
         <HomeIcon className="h-4 w-4" aria-hidden="true" />
         Volver al inicio
       </Link>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)] transition-colors">
            Comienza a crear quizzes inteligentes gratis
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
          {/* Full Name Field */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-[color:var(--foreground)]">
              Nombre completo
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <User className="h-5 w-5 text-[color:var(--text-muted)]" aria-hidden="true" />
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="a11y-input block w-full rounded-lg py-3 pl-12 pr-4 text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Juan Pérez"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[color:var(--foreground)]">
              Correo electrónico
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
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-[color:var(--foreground)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-[color:var(--border-default)] text-blue-600 focus:ring-blue-500"
              />
              <span>Recordarme</span>
            </label>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[color:var(--foreground)]">
              Contraseña
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
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
              Confirmar contraseña
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
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                <span>Creando cuenta...</span>
              </>
            ) : (
              <span>Crear cuenta</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[color:var(--border-default)]" />
          <span className="text-sm text-[color:var(--text-muted)]">o</span>
          <div className="h-px flex-1 bg-[color:var(--border-default)]" />
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-[color:var(--text-muted)]">
          {t('auth.register.login_prompt')}{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('auth.register.login_cta')}
          </Link>
        </p>
      </div>
    </div>
  );
}
