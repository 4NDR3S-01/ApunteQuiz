'use client';

import { useState } from 'react';
import { QuizResult, Pregunta, isPreguntaOpcionMultiple, isPreguntaVerdaderoFalso } from '@/types';
import { CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface QuizDisplayProps {
  readonly quizResult: QuizResult;
  readonly onQuizComplete?: (results: QuizAnswers) => void;
  readonly className?: string;
}

interface QuizAnswers {
  [preguntaId: string]: string | boolean;
}

interface QuizStats {
  totalPreguntas: number;
  respuestasCorrectas: number;
  porcentajeAcierto: number;
}

export default function QuizDisplay({ quizResult, onQuizComplete, className = '' }: QuizDisplayProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Debug logging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('QuizDisplay - quizResult:', quizResult);
    console.log('QuizDisplay - quiz structure:', {
      hasQuiz: !!quizResult?.quiz,
      hasPreguntas: !!quizResult?.quiz?.preguntas,
      preguntasLength: quizResult?.quiz?.preguntas?.length || 0,
      preguntasType: Array.isArray(quizResult?.quiz?.preguntas) ? 'array' : typeof quizResult?.quiz?.preguntas
    });
  }

  // Protección defensiva: verificar que el quiz tenga la estructura esperada
  if (!quizResult?.quiz?.preguntas || !Array.isArray(quizResult.quiz.preguntas) || quizResult.quiz.preguntas.length === 0) {
    return (
      <div className="a11y-card rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">
          No se pudieron generar preguntas
        </h3>
        <p className="text-[color:var(--text-muted)] mb-4">
          El documento no contenía suficiente información para generar un quiz válido.
        </p>
        <p className="text-sm text-[color:var(--text-muted)]">
          Intenta subir un documento con más contenido educativo o prueba con otro archivo.
        </p>
      </div>
    );
  }

  const handleAnswer = (preguntaId: string, answer: string | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [preguntaId]: answer
    }));
  };

  const calculateResults = (): QuizStats => {
    let correctas = 0;
    const preguntas = quizResult?.quiz?.preguntas || [];
    const total = preguntas.length;

    if (total === 0) {
      return {
        totalPreguntas: 0,
        respuestasCorrectas: 0,
        porcentajeAcierto: 0
      };
    }

    preguntas.forEach(pregunta => {
      const userAnswer = answers[pregunta.id];
      if (userAnswer === pregunta.respuesta_correcta) {
        correctas++;
      }
    });

    return {
      totalPreguntas: total,
      respuestasCorrectas: correctas,
      porcentajeAcierto: (correctas / total) * 100
    };
  };

  const calculateTypeDistribution = () => {
    const preguntas = quizResult?.quiz?.preguntas || [];
    const total = preguntas.length;
    
    if (total === 0) return null;

    const counts = {
      opcion_multiple: 0,
      respuesta_corta: 0,
      verdadero_falso: 0
    };

    preguntas.forEach(pregunta => {
      counts[pregunta.tipo]++;
    });

    return {
      opcion_multiple: {
        count: counts.opcion_multiple,
        percentage: Math.round((counts.opcion_multiple / total) * 100)
      },
      respuesta_corta: {
        count: counts.respuesta_corta,
        percentage: Math.round((counts.respuesta_corta / total) * 100)
      },
      verdadero_falso: {
        count: counts.verdadero_falso,
        percentage: Math.round((counts.verdadero_falso / total) * 100)
      }
    };
  };

  const calculateDetailedResults = () => {
    const preguntas = quizResult?.quiz?.preguntas || [];
    const results = {
      opcion_multiple: { total: 0, correctas: 0, porcentaje: 0 },
      respuesta_corta: { total: 0, correctas: 0, porcentaje: 0 },
      verdadero_falso: { total: 0, correctas: 0, porcentaje: 0 }
    };

    preguntas.forEach(pregunta => {
      const userAnswer = answers[pregunta.id];
      const isCorrect = userAnswer === pregunta.respuesta_correcta;
      
      results[pregunta.tipo].total++;
      if (isCorrect) {
        results[pregunta.tipo].correctas++;
      }
    });

    // Calcular porcentajes
    Object.keys(results).forEach(tipo => {
      const result = results[tipo as keyof typeof results];
      result.porcentaje = result.total > 0 ? (result.correctas / result.total) * 100 : 0;
    });

    return results;
  };

  const handleSubmit = () => {
    setQuizCompleted(true);
    onQuizComplete?.(answers);
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setStats(null);
    setQuizCompleted(false);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const typeDistribution = calculateTypeDistribution();
  const detailedResults = showResults ? calculateDetailedResults() : null;
  const preguntas = quizResult?.quiz?.preguntas || [];
  const allQuestionsAnswered = preguntas.every(
    pregunta => pregunta.id in answers
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metadata del quiz */}
      <div className="a11y-card rounded-lg p-4">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {quizResult.metadata.titulo}
        </h2>
        <div className="space-y-1 text-sm text-[color:var(--text-muted)]">
          <p><strong>Nivel:</strong> {quizResult.metadata.nivel}</p>
          <p><strong>Preguntas generadas:</strong> {quizResult.quiz.n_generadas}</p>
          {Boolean(quizResult.quiz.n_solicitadas && quizResult.quiz.n_solicitadas !== quizResult.quiz.n_generadas) && (
            <p className="text-amber-600 dark:text-amber-400">
              <strong>Solicitadas:</strong> {quizResult.quiz.n_solicitadas} 
              <span className="ml-1 text-xs">(se generaron menos debido al contenido disponible)</span>
            </p>
          )}
          <p><strong>Fuentes:</strong> {(quizResult.metadata.fuentes || []).map(f => f.source_name).join(', ')}</p>
          {Boolean(quizResult.metadata.notas_deduplicacion) && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
              <p className="font-medium text-blue-700 dark:text-blue-300">Proceso de optimización:</p>
              <p className="text-blue-600 dark:text-blue-400">{quizResult.metadata.notas_deduplicacion}</p>
            </div>
          )}
          
          {/* Distribución de tipos de preguntas */}
          {typeDistribution && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-medium text-[color:var(--foreground)] mb-2">Distribución de tipos de preguntas:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {typeDistribution.opcion_multiple.count > 0 && (
                  <div className="flex justify-between items-center">
                    <span>🔘 Opción múltiple:</span>
                    <span className="font-medium">{typeDistribution.opcion_multiple.count} ({typeDistribution.opcion_multiple.percentage}%)</span>
                  </div>
                )}
                {typeDistribution.respuesta_corta.count > 0 && (
                  <div className="flex justify-between items-center">
                    <span>✏️ Respuesta corta:</span>
                    <span className="font-medium">{typeDistribution.respuesta_corta.count} ({typeDistribution.respuesta_corta.percentage}%)</span>
                  </div>
                )}
                {typeDistribution.verdadero_falso.count > 0 && (
                  <div className="flex justify-between items-center">
                    <span>✅ Verdadero/Falso:</span>
                    <span className="font-medium">{typeDistribution.verdadero_falso.count} ({typeDistribution.verdadero_falso.percentage}%)</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      {quizResult.summary && (
        <div className="a11y-card-muted rounded-lg border-l-4 border-blue-500 p-4 dark:border-blue-400">
          <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">Resumen</h3>
          <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">
            {quizResult.summary.overview}
          </p>
          {quizResult.summary.key_points && quizResult.summary.key_points.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-1 font-medium text-[color:var(--foreground)]">Puntos clave:</h4>
              <ul className="space-y-1 text-sm text-[color:var(--text-muted)]">
                {(quizResult.summary.key_points || []).map((point) => (
                  <li key={point.substring(0, 50)} className="flex items-start space-x-2">
                    <span className="mt-1 text-blue-500 dark:text-blue-300">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preguntas */}
      <div className="space-y-6">
        {preguntas.map((pregunta, index) => (
          <QuestionCard
            key={pregunta.id}
            pregunta={pregunta}
            numero={index + 1}
            userAnswer={answers[pregunta.id]}
            onAnswer={(answer) => handleAnswer(pregunta.id, answer)}
            showResult={showResults}
          />
        ))}
      </div>

      {/* Controles - Progreso y botones */}
      <div className="space-y-4 border-t border-[color:var(--border-default)] pt-6">
        {/* Indicador de progreso */}
        <div className="a11y-card-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Progreso del Quiz
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(answers).length} / {preguntas.length}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(Object.keys(answers).length / preguntas.length) * 100}%`
              }}
            />
          </div>
          {Object.keys(answers).length < preguntas.length && !quizCompleted && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Faltan {preguntas.length - Object.keys(answers).length} pregunta(s) por responder
            </p>
          )}
          {quizCompleted && (() => {
            // Calcular estadísticas
            const correctCount = preguntas.filter(pregunta => {
              const userAnswer = answers[pregunta.id];
              return userAnswer === pregunta.respuesta_correcta;
            }).length;
            
            const incorrectCount = preguntas.length - correctCount;
            const percentage = Math.round((correctCount / preguntas.length) * 100);
            
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

        {/* Guía de Estudio - Aparece después de completar el quiz */}
        {quizCompleted && quizResult?.study_tips && (
          <div className="mt-6">
            <StudyTipsSection tips={quizResult.study_tips} />
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between gap-4">
          <button
            onClick={resetQuiz}
            className="flex items-center space-x-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <PlayCircle className="h-5 w-5" />
            <span>Reiniciar</span>
          </button>

          {!quizCompleted && allQuestionsAnswered && (
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Terminar Quiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import type { StudyTips } from '@/types/quiz';

interface StudyTipsSectionProps {
  readonly tips: StudyTips | string[];
}

function StudyTipsSection({ tips }: StudyTipsSectionProps) {
  const [activeTab, setActiveTab] = useState<'tecnicas' | 'plan' | 'errores' | 'recursos'>('tecnicas');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Debug: Ver qué datos recibe el componente
  console.log('StudyTipsSection - tips recibidos:', tips);
  console.log('StudyTipsSection - es array?:', Array.isArray(tips));
  
  // Verificar si es el nuevo formato o el legacy
  const isNewFormat = !Array.isArray(tips);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Error copying text:', err);
    }
  };

  // Si es formato legacy (array de strings), mostrar componente antiguo
  if (Array.isArray(tips)) {
    return <LegacyStudyTipsSection tips={tips} />;
  }

  // Nuevo formato mejorado
  const studyTips = tips as StudyTips;

  // Verificar si tiene datos
  const hasData = studyTips.tecnicas_recomendadas?.length > 0 || 
                  studyTips.errores_comunes?.length > 0 || 
                  studyTips.recursos_extra?.length > 0 ||
                  studyTips.plan_repaso;

  if (!hasData) {
    return (
      <div className="a11y-card rounded-lg border-l-4 border-yellow-500 p-6 dark:border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10">
        <h3 className="flex items-center space-x-2 text-xl font-bold text-[color:var(--foreground)] mb-4">
          <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Guía de Estudio Personalizada</span>
        </h3>
        <p className="text-sm text-[color:var(--text-muted)] text-center py-4">
          ℹ️ No se generaron consejos de estudio para este quiz. 
          <br />
          Esto puede ocurrir si el contenido era muy breve o específico.
        </p>
      </div>
    );
  }

  return (
    <div className="a11y-card rounded-lg border-l-4 border-yellow-500 p-6 dark:border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10">
      <h3 className="flex items-center space-x-2 text-xl font-bold text-[color:var(--foreground)] mb-6">
        <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Guía de Estudio Personalizada</span>
      </h3>

      {/* Tabs de navegación */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-yellow-200 dark:border-yellow-700 pb-4">
        <button
          onClick={() => setActiveTab('tecnicas')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'tecnicas'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
        >
          🎯 Técnicas ({studyTips.tecnicas_recomendadas?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'plan'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
        >
          📅 Plan de Repaso
        </button>
        <button
          onClick={() => setActiveTab('errores')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'errores'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
        >
          ⚠️ Errores Comunes ({studyTips.errores_comunes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('recursos')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'recursos'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
        >
          📚 Recursos ({studyTips.recursos_extra?.length || 0})
        </button>
      </div>

      {/* Contenido según el tab activo */}
      <div className="space-y-4">
        {activeTab === 'tecnicas' && studyTips.tecnicas_recomendadas && (
          <>
            {/* Puntos críticos */}
            {studyTips.puntos_criticos && studyTips.puntos_criticos.length > 0 && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Puntos que Requieren Atención Especial</span>
                </h4>
                <ul className="space-y-1">
                  {studyTips.puntos_criticos.map((punto, i) => (
                    <li key={`critico-${i.toString()}`} className="text-sm text-red-700 dark:text-red-300 flex items-start space-x-2">
                      <span className="mt-1">•</span>
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Técnicas recomendadas */}
            <div className="space-y-4">
              {studyTips.tecnicas_recomendadas.map((tecnica, index) => (
                <div key={`tecnica-${index.toString()}`} className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">{tecnica.tecnica}</h4>
                    <button
                      onClick={() => copyToClipboard(`${tecnica.tecnica}: ${tecnica.descripcion}`)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      title="Copiar técnica"
                    >
                      {copiedText === `${tecnica.tecnica}: ${tecnica.descripcion}` ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-3">{tecnica.descripcion}</p>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 dark:text-green-400 font-semibold text-sm">¿Por qué?</span>
                      <p className="text-sm text-[color:var(--text-muted)]">{tecnica.por_que}</p>
                    </div>
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Ejemplo:</span>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{tecnica.ejemplo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Conexiones clave */}
            {studyTips.conexiones_clave && studyTips.conexiones_clave.length > 0 && (
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center space-x-2">
                  <span>🔗</span>
                  <span>Conexiones Importantes Entre Conceptos</span>
                </h4>
                <ul className="space-y-1">
                  {studyTips.conexiones_clave.map((conexion, i) => (
                    <li key={`conexion-${i.toString()}`} className="text-sm text-purple-700 dark:text-purple-300 flex items-start space-x-2">
                      <span className="mt-1">→</span>
                      <span>{conexion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === 'plan' && studyTips.plan_repaso && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
              <h4 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center space-x-2">
                <span>⏰</span>
                <span>Primera Revisión (24 horas)</span>
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">{studyTips.plan_repaso.primera_revision}</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center space-x-2">
                <span>📆</span>
                <span>Revisión Semanal</span>
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{studyTips.plan_repaso.revision_semanal}</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500">
              <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center space-x-2">
                <span>🎓</span>
                <span>Antes del Examen</span>
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">{studyTips.plan_repaso.antes_examen}</p>
            </div>
          </div>
        )}

        {activeTab === 'errores' && studyTips.errores_comunes && (
          <div className="space-y-3">
            {studyTips.errores_comunes.map((error, index) => (
              <div key={`error-${index.toString()}`} className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                <div className="flex items-start space-x-3 mb-2">
                  <span className="text-xl">❌</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error Común:</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{error.error}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pl-8">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Corrección:</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">{error.correccion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recursos' && studyTips.recursos_extra && (
          <div className="space-y-3">
            {studyTips.recursos_extra.map((recurso, index) => {
              const iconMap = {
                ejercicios: '📝',
                lectura: '📖',
                video: '🎥',
                práctica: '🎯'
              };
              const colorMap = {
                ejercicios: 'blue',
                lectura: 'green',
                video: 'purple',
                práctica: 'amber'
              };
              const icon = iconMap[recurso.tipo] || '📚';
              const color = colorMap[recurso.tipo] || 'gray';

              return (
                <div key={`recurso-${index.toString()}`} className={`p-4 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-700`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h4 className={`font-semibold text-${color}-800 dark:text-${color}-200 capitalize mb-1`}>
                        {recurso.tipo}
                      </h4>
                      <p className={`text-sm text-${color}-700 dark:text-${color}-300`}>{recurso.sugerencia}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="mt-6 pt-4 border-t border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Esta guía ha sido personalizada específicamente para el contenido de tus documentos. Usa los iconos de copia para guardar secciones importantes.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente legacy para formato antiguo (array de strings)
interface LegacyStudyTipsSectionProps {
  readonly tips: string[];
}

function LegacyStudyTipsSection({ tips }: LegacyStudyTipsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedTip, setCopiedTip] = useState<number | null>(null);
  
  const categories = {
    memory: { 
      name: 'Memorización', 
      icon: '🧠', 
      color: 'purple',
      keywords: ['memorizar', 'recordar', 'memoria', 'repetir', 'repasar', 'mnemo', 'flashcard'] 
    },
    practice: { 
      name: 'Práctica', 
      icon: '📝', 
      color: 'blue',
      keywords: ['practicar', 'ejercicio', 'problema', 'resolver', 'aplicar', 'ejemplos'] 
    },
    organization: { 
      name: 'Organización', 
      icon: '📊', 
      color: 'green',
      keywords: ['organizar', 'esquema', 'mapa', 'estructura', 'outline', 'diagrama'] 
    },
    understanding: { 
      name: 'Comprensión', 
      icon: '💡', 
      color: 'amber',
      keywords: ['entender', 'comprender', 'explicar', 'concepto', 'analizar', 'relacionar'] 
    },
    general: { 
      name: 'General', 
      icon: '🎯', 
      color: 'gray',
      keywords: [] 
    }
  };

  const categorized: { [key: string]: string[] } = {
    memory: [],
    practice: [],
    organization: [],
    understanding: [],
    general: []
  };

  for (const tip of tips) {
    const tipLower = tip.toLowerCase();
    let assigned = false;
    
    for (const [categoryKey, category] of Object.entries(categories)) {
      if (categoryKey !== 'general' && category.keywords.some(keyword => tipLower.includes(keyword))) {
        categorized[categoryKey].push(tip);
        assigned = true;
        break;
      }
    }
    
    if (!assigned) {
      categorized.general.push(tip);
    }
  }

  const visibleTips = isExpanded ? tips : tips.slice(0, 3);
  const hasMoreTips = tips.length > 3;

  const copyTip = async (tip: string, index: number) => {
    try {
      await navigator.clipboard.writeText(tip);
      setCopiedTip(index);
      setTimeout(() => setCopiedTip(null), 2000);
    } catch (err) {
      console.error('Error copying tip:', err);
    }
  };

  const getCategoryColorClasses = (color: string) => {
    const colorMap = {
      purple: 'border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20',
      blue: 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20',
      green: 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20',
      amber: 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20',
      gray: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="a11y-card rounded-lg border-l-4 border-yellow-500 p-4 dark:border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center space-x-2 text-lg font-semibold text-[color:var(--foreground)]">
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Consejos de estudio</span>
          <span className="text-sm font-normal text-[color:var(--text-muted)] bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded-full">
            {tips.length} consejo{tips.length !== 1 ? 's' : ''}
          </span>
        </h3>
        
        {hasMoreTips && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
          >
            <span>{isExpanded ? 'Ver menos' : 'Ver todos'}</span>
            <svg 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Vista categorizada cuando está expandido */}
      {isExpanded ? (
        <div className="space-y-4">
          {Object.entries(categorized).map(([categoryKey, categoryTips]) => {
            if (categoryTips.length === 0) return null;
            
            const category = categories[categoryKey as keyof typeof categories];
            
            return (
              <div key={categoryKey} className={`rounded-lg border p-3 ${getCategoryColorClasses(category.color)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{category.icon}</span>
                  <h4 className="font-medium text-[color:var(--foreground)] text-sm">{category.name}</h4>
                  <span className="text-xs text-[color:var(--text-muted)] bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                    {categoryTips.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {categoryTips.map((tip, index) => {
                    const globalIndex = tips.indexOf(tip);
                    return (
                      <li key={`${categoryKey}-${index}`} className="group">
                        <div className="flex items-start justify-between space-x-2">
                          <div className="flex items-start space-x-2 flex-1">
                            <span className="mt-1 text-yellow-500 text-xs">•</span>
                            <span className="text-sm text-[color:var(--text-muted)] leading-relaxed">{tip}</span>
                          </div>
                          <button
                            onClick={() => copyTip(tip, globalIndex)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white dark:hover:bg-gray-700 rounded"
                            title="Copiar consejo"
                          >
                            {copiedTip === globalIndex ? (
                              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista simple cuando está colapsado */
        <ul className="space-y-3">
          {visibleTips.map((tip, index) => (
            <li key={`simple-${tip.substring(0, 30)}`} className="group">
              <div className="flex items-start justify-between space-x-2">
                <div className="flex items-start space-x-2 flex-1">
                  <span className="mt-1 text-yellow-500">•</span>
                  <span className="text-sm text-[color:var(--text-muted)] leading-relaxed">{tip}</span>
                </div>
                <button
                  onClick={() => copyTip(tip, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white dark:hover:bg-yellow-800 rounded"
                  title="Copiar consejo"
                >
                  {copiedTip === index ? (
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
          
          {hasMoreTips && (
            <li className="pt-2 border-t border-yellow-200 dark:border-yellow-700">
              <p className="text-xs text-center text-[color:var(--text-muted)]">
                + {tips.length - 3} consejos más
              </p>
            </li>
          )}
        </ul>
      )}

      {/* Nota informativa */}
      <div className="mt-4 pt-3 border-t border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Consejos generados específicamente para este contenido. Haz clic en el ícono de copia para guardar un consejo.
          </p>
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  readonly pregunta: Pregunta;
  readonly numero: number;
  readonly userAnswer?: string | boolean;
  readonly onAnswer: (answer: string | boolean) => void;
  readonly showResult: boolean;
}

function MultipleChoiceOptions({ pregunta, userAnswer, onAnswer, showResult }: Readonly<{
  pregunta: Pregunta;
  userAnswer: any;
  onAnswer: (answer: any) => void;
  showResult: boolean;
}>) {
  return (
    <div className="space-y-2">
      {pregunta.opciones?.map((opcion: any) => {
        const isCorrectOption = opcion.id === pregunta.respuesta_correcta;
        const isSelected = userAnswer === opcion.id;
        const userHasAnswered = !!userAnswer;
        
        let optionClass = 'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800 ';
        
        if (userHasAnswered && !showResult) {
          // Feedback instantáneo
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
          <label key={`${pregunta.id}-opcion-${opcion.id}`} className={optionClass}>
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              value={opcion.id}
              checked={isSelected}
              onChange={() => onAnswer(opcion.id)}
              disabled={showResult}
              className="h-4 w-4"
            />
            <span className="flex-1">{opcion.texto}</span>
            {userHasAnswered && !showResult && isSelected && (
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
  );
}

function TrueFalseOptions({ pregunta, userAnswer, onAnswer, showResult }: Readonly<{
  pregunta: Pregunta;
  userAnswer: any;
  onAnswer: (answer: any) => void;
  showResult: boolean;
}>) {
  const userHasAnswered = userAnswer !== undefined;
  const isCorrect = pregunta.respuesta_correcta;

  const getOptionClass = (value: boolean) => {
    const isSelected = userAnswer === value;
    const isCorrectAnswer = pregunta.respuesta_correcta === value;
    
    let baseClass = 'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800 ';
    
    if (userHasAnswered && !showResult) {
      // Feedback instantáneo
      if (isSelected) {
        baseClass += isCorrectAnswer
          ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
          : 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20';
      } else if (isCorrectAnswer) {
        baseClass += 'border-green-300 bg-green-50/50 dark:border-green-600 dark:bg-green-900/10';
      } else {
        baseClass += 'border-slate-200 dark:border-slate-700 opacity-50';
      }
    } else {
      baseClass += isSelected
        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
        : 'border-slate-200 dark:border-slate-700';
    }
    
    return baseClass;
  };

  return (
    <div className="space-y-2">
      <label className={getOptionClass(true)}>
        <input
          type="radio"
          name={`pregunta-${pregunta.id}`}
          value="true"
          checked={userAnswer === true}
          onChange={() => onAnswer(true)}
          disabled={showResult}
          className="h-4 w-4"
        />
        <span className="flex-1">Verdadero</span>
        {userHasAnswered && !showResult && userAnswer === true && (
          pregunta.respuesta_correcta === true ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )
        )}
      </label>
      <label className={getOptionClass(false)}>
        <input
          type="radio"
          name={`pregunta-${pregunta.id}`}
          value="false"
          checked={userAnswer === false}
          onChange={() => onAnswer(false)}
          disabled={showResult}
          className="h-4 w-4"
        />
        <span className="flex-1">Falso</span>
        {userHasAnswered && !showResult && userAnswer === false && (
          pregunta.respuesta_correcta === false ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )
        )}
      </label>
    </div>
  );
}

function QuestionCard({ pregunta, numero, userAnswer, onAnswer, showResult }: QuestionCardProps) {
  const isCorrect = showResult && userAnswer === pregunta.respuesta_correcta;
  const isWrong = showResult && userAnswer !== pregunta.respuesta_correcta;

  const getCardClass = () => {
    if (!showResult) return 'a11y-card border border-[color:var(--border-default)]';
    if (isCorrect) return 'border-2 border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10';
    if (isWrong) return 'border-2 border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10';
    return 'a11y-card-muted border border-[color:var(--border-default)]';
  };

  const getDifficultyClass = () => {
    if (pregunta.dificultad === 'baja') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200';
    if (pregunta.dificultad === 'media') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200';
  };

  const getRespuestaCorrecta = () => {
    if (typeof pregunta.respuesta_correcta === 'boolean') {
      return pregunta.respuesta_correcta ? 'Verdadero' : 'Falso';
    }
    return pregunta.respuesta_correcta;
  };

  return (
    <div className={`rounded-lg p-5 transition-colors sm:p-6 ${getCardClass()}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-[color:var(--foreground)] sm:text-lg">
          Pregunta {numero}
        </h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyClass()}`}>
          {pregunta.dificultad}
        </span>
      </div>
      
      <p className="mb-5 text-sm text-[color:var(--text-muted)] sm:text-base">{pregunta.enunciado}</p>
      
      {isPreguntaOpcionMultiple(pregunta) && (
        <MultipleChoiceOptions 
          pregunta={pregunta}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          showResult={showResult}
        />
      )}
      
      {isPreguntaVerdaderoFalso(pregunta) && (
        <TrueFalseOptions 
          pregunta={pregunta}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          showResult={showResult}
        />
      )}
      
      {pregunta.tipo === 'respuesta_corta' && (
        <input
          type="text"
          value={typeof userAnswer === 'string' ? userAnswer : ''}
          onChange={(e) => onAnswer(e.target.value)}
          disabled={showResult}
          placeholder="Escribe tu respuesta..."
          className="a11y-input w-full rounded-lg p-3 placeholder:text-[color:var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      )}
      
      {showResult && (
        <div className="a11y-card-muted mt-6 rounded-lg p-4">
          <div className="mb-3">
            <span className="font-medium text-[color:var(--foreground)]">Respuesta correcta: </span>
            <span className="font-semibold text-green-600 dark:text-green-300">
              {getRespuestaCorrecta()}
            </span>
          </div>
          
          {pregunta.explicacion && (
            <div className="mb-3">
              <span className="font-medium text-[color:var(--foreground)]">Explicación: </span>
              <span className="text-[color:var(--text-muted)]">{pregunta.explicacion}</span>
            </div>
          )}
          
          {pregunta.citas && pregunta.citas.length > 0 && (
            <div>
              <span className="font-medium text-[color:var(--foreground)]">Referencias: </span>
              <span className="text-sm text-[color:var(--text-muted)]">
                {pregunta.citas.map(cita => {
                  const pageInfo = cita.page ? ` (p.${cita.page})` : '';
                  return cita.chunk_id + pageInfo;
                }).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
