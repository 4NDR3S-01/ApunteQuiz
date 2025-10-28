'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, HomeIcon } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  const lockKeyFor = (userEmail: string) => `aq-login-lock:${userEmail.toLowerCase()}`;

  const readLock = (userEmail: string) => {
    try {
      const raw = window.localStorage.getItem(lockKeyFor(userEmail));
      if (!raw) return { attempts: 0, lockedUntil: null };
      const parsed = JSON.parse(raw) as { attempts?: number; lockedUntil?: number | null };
      return { attempts: parsed.attempts ?? 0, lockedUntil: parsed.lockedUntil ?? null };
    } catch {
      return { attempts: 0, lockedUntil: null };
    }
  };

  const writeLock = (userEmail: string, attempts: number, lockedUntilVal: number | null) => {
    try {
      window.localStorage.setItem(lockKeyFor(userEmail), JSON.stringify({ attempts, lockedUntil: lockedUntilVal }));
    } catch {
      // ignore
    }
  };

  const clearLock = (userEmail: string) => {
    try {
      window.localStorage.removeItem(lockKeyFor(userEmail));
    } catch {
      // ignore
    }
  };

  // sync lock status when email changes
  useEffect(() => {
    if (!email) {
      setAttemptsLeft(null);
      setLockedUntil(null);
      return;
    }
    const { attempts, lockedUntil: lu } = readLock(email);
    setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - attempts));
    if (lu && lu > Date.now()) {
      setLockedUntil(lu);
    } else {
      // if lock expired, clear
      if (lu) clearLock(email);
      setLockedUntil(null);
    }
  }, [email]);

  // load remembered email
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('aq-remember-email');
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // countdown timer for lockedUntil
  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => {
      if (lockedUntil && lockedUntil <= Date.now()) {
        clearLock(email);
        setLockedUntil(null);
        setAttemptsLeft(MAX_ATTEMPTS);
        clearInterval(t);
      } else {
        // force rerender by updating attemptsLeft (no change)
        setAttemptsLeft((prev) => (prev === null ? null : prev));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockedUntil, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // check lock
      if (email) {
        const { attempts, lockedUntil: lu } = readLock(email);
        if (lu && lu > Date.now()) {
          const remaining = Math.ceil((lu - Date.now()) / 1000);
          throw new Error(t('auth.login.locked', { minutes: Math.ceil(remaining / 60) }));
        }
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // increment attempts
        if (email) {
          const cur = readLock(email);
          const nextAttempts = (cur.attempts ?? 0) + 1;
          let lockedUntilVal: number | null = null;
          if (nextAttempts >= MAX_ATTEMPTS) {
            lockedUntilVal = Date.now() + LOCK_DURATION_MS;
          }
          writeLock(email, nextAttempts, lockedUntilVal);
          setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - nextAttempts));
          if (lockedUntilVal) setLockedUntil(lockedUntilVal);
        }
        throw signInError;
      }

      if (data.user) {
        // success - clear lock info for this email
        if (email) clearLock(email);
        try {
          if (rememberMe) {
            window.localStorage.setItem('aq-remember-email', email);
          } else {
            window.localStorage.removeItem('aq-remember-email');
          }
        } catch {
          // ignore
        }
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || t('auth.login.error_generic'));
      } else {
        setError(t('auth.login.error_generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="a11y-card rounded-3xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
       {/* Back Link */}
       <Link
         href="/"
         className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)]"
       >
         <HomeIcon className="h-4 w-4" aria-hidden="true" />
         {t('auth.login.back')}
       </Link>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[color:var(--foreground)] transition-colors">
            {t('auth.login.title')}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)] transition-colors">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {/* Lock / Error Message */}
        {lockedUntil && lockedUntil > Date.now() && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{t('auth.login.locked', { minutes: Math.ceil((lockedUntil - Date.now()) / 1000 / 60) })}</p>
            </div>
        )}

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
                disabled={isLoading || (lockedUntil ? lockedUntil > Date.now() : false)}
                className="a11y-input block w-full rounded-lg py-3 pl-12 pr-4 text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('auth.shared.placeholders.email') as string}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[color:var(--foreground)]">
              {t('auth.login.passwordLabel')}
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
                disabled={isLoading || (lockedUntil ? lockedUntil > Date.now() : false)}
                minLength={6}
                className="a11y-input block w-full rounded-lg py-3 pl-12 pr-12 text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('auth.shared.placeholders.password') as string}
                autoComplete="current-password"
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
          </div>

          {/* Remember me and Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-[color:var(--foreground)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || (lockedUntil ? lockedUntil > Date.now() : false)}
                className="h-4 w-4 rounded border-[color:var(--border-default)] text-blue-600 focus:ring-blue-500"
              />
              <span>{t('auth.login.remember')}</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('auth.login.forgot')}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (lockedUntil ? lockedUntil > Date.now() : false)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500 disabled:hover:shadow-lg"
          >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>{t('auth.login.loading')}</span>
                  </>
                ) : (
                  <span>{t('auth.login.button')}</span>
                )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[color:var(--border-default)]" />
          <span className="text-sm text-[color:var(--text-muted)]">{t('common.or')}</span>
          <div className="h-px flex-1 bg-[color:var(--border-default)]" />
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-[color:var(--text-muted)]">
          {t('common.register_prompt')}{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('common.register_cta')}
          </Link>
        </p>
      </div>
    </div>
  );
}
