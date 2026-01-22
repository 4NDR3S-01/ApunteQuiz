'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, BookOpen, HelpCircle, Trash2, PlayCircle, Eye, CheckCircle, AlertCircle, Download } from 'lucide-react';
import type { Database } from '@/types/database';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { exportQuizToMarkdownFile, exportQuizToHTMLFile } from '@/utils/export-quiz';
import ConfirmDialog from '@/components/ConfirmDialog';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

interface QuizDetailClientProps {
  quiz: Quiz;
  questions: Question[];
  userId: string;
}

type ViewMode = 'info' | 'practice' | 'answers';

export default function QuizDetailClient({ quiz, questions, userId }: Readonly<QuizDetailClientProps>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('info');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const supabase = createClient();

  const handleStartPractice = () => {
    setUserAnswers({}); // Limpiar respuestas anteriores
    setQuizCompleted(false); // Resetear estado de completado
    setViewMode('practice');
  };

  const handleBackToInfo = () => {
    setViewMode('info');
  };

  const handleFinishQuiz = () => {
    setQuizCompleted(true);
  };

  const handleRestart = () => {
    setUserAnswers({});
    setQuizCompleted(false);
  };

  // Función para normalizar texto (eliminar acentos, espacios extra, etc.)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/[.,;:!?]/g, '') // Eliminar puntuación
      .trim();
  };

  // Función para verificar si una respuesta es correcta
  const isAnswerCorrect = (question: Question, userAnswer: string): boolean | null => {
    if (!userAnswer) return null; // No ha respondido

    if (question.question_type === 'multiple_choice') {
      return userAnswer === question.correct_answer;
    } else if (question.question_type === 'true_false') {
      const normalizedUser = userAnswer.toLowerCase().trim();
      const normalizedCorrect = question.correct_answer?.toLowerCase().trim();
      return normalizedUser === normalizedCorrect;
    } else {
      // Para respuesta corta, comparación más flexible
      const normalizedUser = normalizeText(userAnswer);
      const normalizedCorrect = normalizeText(question.correct_answer || '');
      
      // Comparación exacta normalizada
      if (normalizedUser === normalizedCorrect) {
        return true;
      }
      
      // Comparación parcial: verificar si la respuesta del usuario contiene las palabras clave
      // o si la respuesta correcta contiene la respuesta del usuario
      const userWords = normalizedUser.split(/\s+/).filter(w => w.length > 2);
      const correctWords = normalizedCorrect.split(/\s+/).filter(w => w.length > 2);
      
      // Si hay al menos 70% de palabras coincidentes, considerar correcto
      if (userWords.length > 0 && correctWords.length > 0) {
        const matchingWords = userWords.filter(word => 
          correctWords.some(correctWord => 
            correctWord.includes(word) || word.includes(correctWord)
          )
        );
        const matchPercentage = matchingWords.length / Math.max(userWords.length, correctWords.length);
        return matchPercentage >= 0.7;
      }
      
      return false;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quiz.id as any)
        .eq('user_id', userId as any);

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error eliminando quiz:', error);
      alert('Error al eliminar el quiz');
      setIsDeleting(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'multiple_choice': 'Opción Múltiple',
      'true_false': 'Verdadero/Falso',
      'open_ended': 'Respuesta Corta'
    };
    return types[type] || type;
  };

  const getEducationLevelLabel = (level: string | null) => {
    if (!level) return 'No especificado';
    const levels: Record<string, string> = {
      'secundaria': 'Secundaria',
      'universidad': 'Universidad',
      'profesional': 'Profesional'
    };
    return levels[level] || level;
  };

  const handleExportMarkdown = () => {
    // Convertir datos de BD al formato QuizResult
    const quizResult: import('@/types/quiz').QuizResult = {
      metadata: {
        titulo: quiz.title || 'Quiz sin título',
        idioma: quiz.language || 'Español',
        nivel: quiz.education_level || 'universidad',
        generado_en: quiz.created_at || new Date().toISOString()
      },
      summary: {
        overview: '',
        key_points: [],
        sections: [],
        glosario: [],
        formulas_o_tablas: [],
        ejemplos_clave: []
      },
      quiz: {
        n_solicitadas: quiz.total_questions || 0,
        n_generadas: questions.length,
        preguntas: questions.map(q => {
          // Mapear tipos de BD a tipos de QuizResult
          let tipo: 'opcion_multiple' | 'respuesta_corta' | 'verdadero_falso';
          if (q.question_type === 'multiple_choice') {
            tipo = 'opcion_multiple';
          } else if (q.question_type === 'true_false') {
            tipo = 'verdadero_falso';
          } else {
            tipo = 'respuesta_corta';
          }

          return {
            id: q.id,
            tipo,
            dificultad: 'media' as const,
            etiquetas: [],
            enunciado: q.question_text,
            opciones: q.options ? (q.options as Array<{ id: string; texto: string }>) : undefined,
            respuesta_correcta: tipo === 'verdadero_falso' 
              ? (q.correct_answer?.toLowerCase() === 'true' || q.correct_answer === '1')
              : q.correct_answer || '',
            explicacion: q.explanation || '',
            citas: []
          };
        })
      },
      notes: {
        insuficiente_evidencia: false,
        detalle: ''
      }
    };

    exportQuizToMarkdownFile(quizResult);
  };

  const handleExportHTML = () => {
    // Convertir datos de BD al formato QuizResult
    const quizResult: import('@/types/quiz').QuizResult = {
      metadata: {
        titulo: quiz.title || 'Quiz sin título',
        idioma: quiz.language || 'Español',
        nivel: quiz.education_level || 'universidad',
        generado_en: quiz.created_at || new Date().toISOString()
      },
      summary: {
        overview: '',
        key_points: [],
        sections: [],
        glosario: [],
        formulas_o_tablas: [],
        ejemplos_clave: []
      },
      quiz: {
        n_solicitadas: quiz.total_questions || 0,
        n_generadas: questions.length,
        preguntas: questions.map(q => {
          // Mapear tipos de BD a tipos de QuizResult
          let tipo: 'opcion_multiple' | 'respuesta_corta' | 'verdadero_falso';
          if (q.question_type === 'multiple_choice') {
            tipo = 'opcion_multiple';
          } else if (q.question_type === 'true_false') {
            tipo = 'verdadero_falso';
          } else {
            tipo = 'respuesta_corta';
          }

          return {
            id: q.id,
            tipo,
            dificultad: 'media' as const,
            etiquetas: [],
            enunciado: q.question_text,
            opciones: q.options ? (q.options as Array<{ id: string; texto: string }>) : undefined,
            respuesta_correcta: tipo === 'verdadero_falso' 
              ? (q.correct_answer?.toLowerCase() === 'true' || q.correct_answer === '1')
              : q.correct_answer || '',
            explicacion: q.explanation || '',
            citas: []
          };
        })
      },
      notes: {
        insuficiente_evidencia: false,
        detalle: ''
      }
    };

    exportQuizToHTMLFile(quizResult);
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="border-b border-[color:var(--border-default)] bg-[color:var(--surface-default)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-[color:var(--text-muted)] transition hover:text-[color:var(--foreground)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
            <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-none w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
              <button
                onClick={handleExportMarkdown}
                className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-emerald-700 min-w-[120px] whitespace-nowrap"
                aria-label="Exportar a Markdown"
              >
                <Download className="h-4 w-4" />
                <span className="truncate">Exportar MD</span>
              </button>
              <button
                onClick={handleExportHTML}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-blue-700 min-w-[120px] whitespace-nowrap"
                aria-label="Exportar a HTML"
              >
                <Download className="h-4 w-4" />
                <span className="truncate">Exportar HTML</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] whitespace-nowrap"
                aria-label="Eliminar quiz"
              >
                <Trash2 className="h-4 w-4" />
                <span className="truncate">{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quiz Info Card */}
        <div className="a11y-card mb-8 rounded-2xl p-6 shadow-lg">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-[color:var(--foreground)]">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="mt-2 text-[color:var(--text-muted)]">
                {quiz.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-[color:var(--text-muted)]">
              <Calendar className="h-4 w-4" />
              <span>
                Creado: {new Date(quiz.created_at || '').toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-[color:var(--text-muted)]">
              <BookOpen className="h-4 w-4" />
              <span>{getEducationLevelLabel(quiz.education_level)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-[color:var(--text-muted)]">
              <HelpCircle className="h-4 w-4" />
              <span>{quiz.total_questions || 0} preguntas</span>
            </div>
          </div>

          {/* Mode Selection Buttons */}
          {viewMode === 'info' && (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleStartPractice}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                <PlayCircle className="h-5 w-5" />
                <span>Realizar Quiz</span>
              </button>
              <button
                onClick={() => setViewMode('answers')}
                className="flex items-center space-x-2 rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Eye className="h-5 w-5" />
                <span>Ver Respuestas</span>
              </button>
            </div>
          )}
        </div>

        {/* Practice Mode */}
        {viewMode === 'practice' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[color:var(--foreground)]">
                Responde las Preguntas
              </h2>
              <button
                onClick={handleBackToInfo}
                className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
              >
                Volver
              </button>
            </div>

            {questions.map((question, index) => (
              <div
                key={question.id}
                className="a11y-card rounded-xl p-6 shadow-sm"
              >
                <div className="mb-4">
                  <div className="mb-2 flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {getQuestionTypeLabel(question.question_type)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    {question.question_text}
                  </h3>
                </div>

                {/* Opciones (solo para multiple choice) */}
                {question.question_type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {(question.options as Array<{ id: string; texto: string }>).map((option) => {
                      const isSelected = userAnswers[question.id] === option.id;
                      const isCorrectOption = option.id === question.correct_answer;
                      const userHasAnswered = !!userAnswers[question.id];
                      
                      let optionClass = 'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800 ';
                      
                      if (userHasAnswered) {
                        if (isSelected) {
                          optionClass += isCorrectOption
                            ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20';
                        } else if (isCorrectOption) {
                          optionClass += 'border-green-300 bg-green-50/50 dark:border-green-600 dark:bg-green-900/10';
                        } else {
                          optionClass += 'border-slate-200 dark:border-slate-700 opacity-50';
                        }
                      } else {
                        optionClass += isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700';
                      }
                      
                      return (
                        <label key={option.id} className={optionClass}>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={(e) => setUserAnswers(prev => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))}
                            className="h-4 w-4"
                          />
                          <span className="flex-1">{option.texto}</span>
                          {userHasAnswered && isSelected && (
                            isCorrectOption ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Opciones para verdadero/falso */}
                {question.question_type === 'true_false' && (
                  <div className="space-y-2">
                    {['true', 'false'].map((option) => {
                      const optionValue = option === 'true';
                      const optionLabel = option === 'true' ? 'Verdadero' : 'Falso';
                      const userAnswer = userAnswers[question.id];
                      const isSelected = userAnswer?.toLowerCase().trim() === option.toLowerCase().trim();
                      const correctAnswer = question.correct_answer?.toLowerCase().trim();
                      const isCorrect = correctAnswer === option.toLowerCase().trim();
                      const hasAnswered = !!userAnswer;
                      
                      let buttonClass = 'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition w-full ';
                      
                      if (hasAnswered) {
                        if (isSelected) {
                          buttonClass += isCorrect
                            ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20';
                        } else if (isCorrect) {
                          buttonClass += 'border-green-300 bg-green-50/50 dark:border-green-600 dark:bg-green-900/10';
                        } else {
                          buttonClass += 'border-slate-200 dark:border-slate-700 opacity-50';
                        }
                      } else {
                        buttonClass += isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800';
                      }
                      
                      return (
                        <label key={option} className={buttonClass}>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => setUserAnswers(prev => ({
                              ...prev,
                              [question.id]: option
                            }))}
                            disabled={quizCompleted}
                            className="h-4 w-4"
                          />
                          <span className="flex-1 font-medium">{optionLabel}</span>
                          {hasAnswered && isSelected && (
                            isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Input para respuesta corta */}
                {question.question_type === 'open_ended' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Escribe tu respuesta"
                        value={userAnswers[question.id] || ''}
                        onChange={(e) => setUserAnswers(prev => ({
                          ...prev,
                          [question.id]: e.target.value
                        }))}
                        disabled={quizCompleted}
                        className={`w-full rounded-lg border p-3 dark:bg-slate-800 ${
                          userAnswers[question.id] 
                            ? (isAnswerCorrect(question, userAnswers[question.id])
                                ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                                : 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20')
                            : 'border-slate-300 dark:border-slate-600'
                        } ${quizCompleted ? 'opacity-75 cursor-not-allowed' : ''}`}
                      />
                      {userAnswers[question.id] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isAnswerCorrect(question, userAnswers[question.id]) ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                    {userAnswers[question.id] && !isAnswerCorrect(question, userAnswers[question.id]) && !quizCompleted && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Respuesta incorrecta. Intenta de nuevo.
                      </p>
                    )}
                    {/* Mostrar respuesta correcta cuando el quiz está completado */}
                    {quizCompleted && (
                      <div className="rounded-lg border border-green-500 bg-green-50 p-3 dark:border-green-400 dark:bg-green-900/20">
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">
                          <span className="font-semibold">Respuesta correcta:</span>{' '}
                          <span className="font-bold">{question.correct_answer || 'No disponible'}</span>
                        </div>
                        {userAnswers[question.id] && !isAnswerCorrect(question, userAnswers[question.id]) && (
                          <div className="mt-2 text-sm text-green-800 dark:text-green-200">
                            <span className="font-medium">Tu respuesta:</span>{' '}
                            <span className="italic">{userAnswers[question.id]}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Progreso y botones */}
            <div className="space-y-4">
              {/* Indicador de progreso */}
              <div className="a11y-card-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[color:var(--foreground)]">
                    Progreso del Quiz
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {Object.keys(userAnswers).filter(id => userAnswers[id]?.toString().trim()).length} / {questions.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(Object.keys(userAnswers).filter(id => userAnswers[id]?.toString().trim()).length / questions.length) * 100}%`
                    }}
                  />
                </div>
                {Object.keys(userAnswers).filter(id => userAnswers[id]?.toString().trim()).length < questions.length && !quizCompleted && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Faltan {questions.length - Object.keys(userAnswers).filter(id => userAnswers[id]?.toString().trim()).length} pregunta(s) por responder
                  </p>
                )}
                {quizCompleted && (() => {
                  // Calcular estadísticas
                  const correctCount = questions.filter(q => {
                    const userAnswer = userAnswers[q.id];
                    if (!userAnswer) return false;
                    
                    if (q.question_type === 'multiple_choice') {
                      return userAnswer === q.correct_answer;
                    } else if (q.question_type === 'true_false') {
                      return userAnswer.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
                    } else {
                      return userAnswer.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
                    }
                  }).length;
                  
                  const incorrectCount = questions.length - correctCount;
                  const percentage = Math.round((correctCount / questions.length) * 100);
                  
                  return (
                    <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        ✅ ¡Quiz completado!
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 dark:text-green-300">Correctas</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between">
                            <span className="text-red-700 dark:text-red-300">Incorrectas</span>
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Calificación</span>
                          <span className={`text-2xl font-bold ${
                            percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                            percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-center text-[color:var(--text-muted)] italic">
                        Usa el botón "Reiniciar" para practicar de nuevo
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between gap-4">
                <button
                  onClick={handleRestart}
                  className="flex items-center space-x-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>Reiniciar</span>
                </button>

                {!quizCompleted && Object.keys(userAnswers).filter(id => userAnswers[id]?.toString().trim()).length === questions.length && (
                  <button
                    onClick={handleFinishQuiz}
                    className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Terminar Quiz</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Answers Mode */}
        {viewMode === 'answers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[color:var(--foreground)]">
                Respuestas Correctas
              </h2>
              <button
                onClick={handleBackToInfo}
                className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
              >
                Volver
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="a11y-card rounded-xl p-8 text-center">
                <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-[color:var(--text-muted)]">
                  No hay preguntas en este quiz
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="a11y-card rounded-xl p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {index + 1}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {getQuestionTypeLabel(question.question_type)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                          {question.question_text}
                        </h3>
                      </div>
                    </div>

                    {/* Opciones (solo para multiple choice) */}
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="mb-4 space-y-2">
                        {(question.options as Array<{ id: string; texto: string }>).map((option) => (
                          <div
                            key={option.id}
                            className={`rounded-lg border p-3 ${
                              option.id === question.correct_answer
                                ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {option.id === question.correct_answer && (
                                <span className="text-green-600 dark:text-green-400">✓</span>
                              )}
                              <span className={option.id === question.correct_answer ? 'font-medium' : ''}>
                                {option.texto}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Respuesta correcta (para otros tipos) */}
                    {question.question_type !== 'multiple_choice' && (
                      <div className="mb-4 rounded-lg border border-green-500 bg-green-50 p-3 dark:border-green-400 dark:bg-green-900/20">
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">
                          Respuesta correcta: <span className="font-bold">{String(question.correct_answer)}</span>
                        </div>
                      </div>
                    )}

                    {/* Explicación */}
                    {question.explanation && (
                      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Explicación:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setIsDeleting(false);
        }}
        onConfirm={handleDelete}
        title="Eliminar quiz"
        message="¿Estás seguro de que deseas eliminar este quiz? Esta acción no se puede deshacer y se eliminarán todas las preguntas asociadas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
