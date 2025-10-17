import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Iniciar sesión - ApunteQuiz',
  description: 'Inicia sesión en ApunteQuiz para crear quizzes inteligentes',
};

export default function LoginPage() {
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
        <LoginForm />
      </div>
    </div>
  );
}
