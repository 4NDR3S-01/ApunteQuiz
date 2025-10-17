'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QuizGenerator from '@/components/QuizGenerator';
import AppDownloadSection from '@/components/AppDownloadSection';
import { LogOut, BarChart3, FileText, HelpCircle, Sparkles, Clock, BookOpen } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

interface DashboardClientProps {
  user: User;
  statsData: {
    quizzes: number;
    documents: number;
    questions: number;
  };
  recentQuizzes: Quiz[];
}

type ViewMode = 'dashboard' | 'generator';

export default function DashboardClient({ user, statsData, recentQuizzes }: Readonly<DashboardClientProps>) {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[color:var(--background)]">
      {/* Header del Dashboard */}
      <header className="border-b border-[color:var(--border-default)] bg-[color:var(--surface-default)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-[color:var(--foreground)]">ApunteQuiz</h1>
              <nav className="hidden md:flex space-x-1">
                <button
                  onClick={() => {
                    setView('dashboard');
                    router.refresh();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === 'dashboard'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="inline-block h-4 w-4 mr-2" />
                  Panel
                </button>
                <button
                  onClick={() => setView('generator')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === 'generator'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="inline-block h-4 w-4 mr-2" />
                  Crear Quiz
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-[color:var(--text-muted)]">
                {user.user_metadata.full_name || user.email}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Saliendo...' : 'Salir'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-[color:var(--border-default)] bg-[color:var(--surface-default)]">
        <div className="flex">
          <button
            onClick={() => {
              setView('dashboard');
              router.refresh();
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              view === 'dashboard'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'text-[color:var(--text-muted)]'
            }`}
          >
            <BarChart3 className="inline-block h-4 w-4 mr-2" />
            Panel
          </button>
          <button
            onClick={() => setView('generator')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              view === 'generator'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'text-[color:var(--text-muted)]'
            }`}
          >
            <Sparkles className="inline-block h-4 w-4 mr-2" />
            Crear Quiz
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--foreground)]">
                ¡Bienvenido, {user.user_metadata.full_name || user.email}!
              </h2>
              <p className="mt-2 text-[color:var(--text-muted)]">
                Gestiona tus quizzes y documentos desde aquí.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="a11y-card rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--text-muted)]">Mis Quizzes</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{statsData.quizzes}</p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                    <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">Quizzes creados</p>
              </div>

              <div className="a11y-card rounded-2xl p-6 shadow-lg border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--text-muted)]">Documentos</h3>
                    <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{statsData.documents}</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                    <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">Documentos procesados</p>
              </div>

              <div className="a11y-card rounded-2xl p-6 shadow-lg border-l-4 border-cyan-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--text-muted)]">Preguntas</h3>
                    <p className="mt-2 text-3xl font-bold text-cyan-600 dark:text-cyan-400">{statsData.questions}</p>
                  </div>
                  <div className="rounded-full bg-cyan-100 p-3 dark:bg-cyan-900/30">
                    <Sparkles className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">Preguntas generadas</p>
              </div>
            </div>

            {/* Quick Action */}
            {statsData.quizzes === 0 ? (
              <div className="a11y-card rounded-2xl p-8 text-center shadow-lg">
                <Sparkles className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--foreground)]">
                  Crea tu primer quiz
                </h3>
                <p className="mt-2 text-[color:var(--text-muted)]">
                  Sube tus documentos y genera quizzes personalizados con IA
                </p>
                <button
                  onClick={() => setView('generator')}
                  className="mt-6 inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Comenzar Ahora</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[color:var(--foreground)]">
                    Quizzes Recientes
                  </h3>
                  <button
                    onClick={() => setView('generator')}
                    className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Crear Nuevo</span>
                  </button>
                </div>

                {recentQuizzes.length > 0 ? (
                  <div className="space-y-3">
                    {recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="a11y-card rounded-xl p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-[color:var(--foreground)]">
                                  {quiz.title}
                                </h4>
                                <div className="mt-1 flex items-center space-x-3 text-sm text-[color:var(--text-muted)]">
                                  <span className="flex items-center space-x-1">
                                    <HelpCircle className="h-3 w-3" />
                                    <span>{quiz.total_questions || 0} preguntas</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(quiz.created_at || '').toLocaleDateString('es-ES', { 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}</span>
                                  </span>
                                  {quiz.education_level && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                      {quiz.education_level === 'secundaria' ? 'Secundaria' : 
                                       quiz.education_level === 'universidad' ? 'Universidad' : 
                                       quiz.education_level === 'profesional' ? 'Profesional' : 
                                       quiz.education_level}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="a11y-card rounded-xl p-8 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                      No hay quizzes recientes
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'generator' && (
          <QuizGenerator className="pb-8" />
        )}
      </main>

      {/* Footer del Dashboard */}
      <footer className="border-t border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {/* Sección de descarga de APK */}
          <AppDownloadSection variant="footer" />
          
          {/* Información del footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[color:var(--border-default)] text-xs text-[color:var(--text-muted)]">
            <p>© {new Date().getFullYear()} ApunteQuiz. Potenciado con IA 🚀</p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:ac20102003@gmail.com" 
                className="transition hover:text-[color:var(--foreground)]"
              >
                Soporte
              </a>
              <a 
                href="/" 
                className="transition hover:text-[color:var(--foreground)]"
              >
                Inicio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
