'use client';

import { useState } from 'react';
import { QuizResult, Pregunta, isPreguntaOpcionMultiple, isPreguntaVerdaderoFalso } from '@/types';

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

  const handleAnswer = (preguntaId: string, answer: string | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [preguntaId]: answer
    }));
  };

  const calculateResults = (): QuizStats => {
    let correctas = 0;
    const total = quizResult.quiz.preguntas.length;

    quizResult.quiz.preguntas.forEach(pregunta => {
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

  const handleSubmit = () => {
    const results = calculateResults();
    setStats(results);
    setShowResults(true);
    onQuizComplete?.(answers);
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setStats(null);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const allQuestionsAnswered = quizResult.quiz.preguntas.every(
    pregunta => pregunta.id in answers
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metadata del quiz */}
      <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800/60">
        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {quizResult.metadata.titulo}
        </h2>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <p><strong>Nivel:</strong> {quizResult.metadata.nivel}</p>
          <p><strong>Preguntas:</strong> {quizResult.quiz.n_generadas}</p>
          <p><strong>Fuentes:</strong> {quizResult.metadata.fuentes.map(f => f.source_name).join(', ')}</p>
        </div>
      </div>

      {/* Resumen */}
      {quizResult.summary && (
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
          <h3 className="mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200">Resumen</h3>
          <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-100">
            {quizResult.summary.overview}
          </p>
          {quizResult.summary.key_points.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-1 font-medium text-blue-800 dark:text-blue-200">Puntos clave:</h4>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-100">
                {quizResult.summary.key_points.map((point) => (
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
        {quizResult.quiz.preguntas.map((pregunta, index) => (
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

      {/* Controles */}
      <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        {!showResults ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {Object.keys(answers).length} de {quizResult.quiz.preguntas.length} respondidas
            </span>
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
              className={`px-6 py-2 rounded-lg font-medium ${
                allQuestionsAnswered
                  ? 'bg-blue-600 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
                  : 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              }`}
            >
              Terminar Quiz
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getScoreColor(stats?.porcentajeAcierto || 0)}`}>
                {stats?.porcentajeAcierto.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {stats?.respuestasCorrectas} de {stats?.totalPreguntas} correctas
              </div>
            </div>
            <button
              onClick={resetQuiz}
              className="rounded-lg bg-slate-600 px-6 py-2 text-white transition hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Consejos de estudio */}
      {quizResult.study_tips.length > 0 && (
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-500/10">
          <h3 className="mb-2 flex items-center space-x-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Consejos de estudio</span>
          </h3>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-100">
            {quizResult.study_tips.map((tip) => (
              <li key={tip.substring(0, 50)} className="flex items-start space-x-2">
                <span className="mt-1 text-yellow-500 dark:text-yellow-300">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
    <div className="space-y-3">
      {pregunta.opciones?.map((opcion: any) => {
        const isCorrectOption = opcion.id === pregunta.respuesta_correcta;
        const isUserOption = userAnswer === opcion.id;
        const isWrongUserOption = showResult && isUserOption && !isCorrectOption;
        
        const getTextClass = () => {
          if (!showResult) return 'text-slate-700 dark:text-slate-300';
          if (isCorrectOption) return 'font-medium text-green-700 dark:text-green-300';
          if (isWrongUserOption) return 'text-red-700 dark:text-red-400';
          return 'text-slate-700 dark:text-slate-300';
        };
        
        const textClass = getTextClass();

        return (
          <label key={`${pregunta.id}-opcion-${opcion.id}`} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              value={opcion.id}
              checked={userAnswer === opcion.id}
              onChange={() => onAnswer(opcion.id)}
              disabled={showResult}
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
            />
            <span className={textClass}>{opcion.texto}</span>
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
  const getTrueFalseClass = (value: boolean) => {
    if (!showResult) return 'text-slate-700 dark:text-slate-300';
    if (pregunta.respuesta_correcta === value) return 'font-medium text-green-700 dark:text-green-300';
    if (userAnswer === value && pregunta.respuesta_correcta !== value) return 'text-red-700 dark:text-red-400';
    return 'text-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="radio"
          name={`pregunta-${pregunta.id}`}
          value="true"
          checked={userAnswer === true}
          onChange={() => onAnswer(true)}
          disabled={showResult}
          className="h-4 w-4 text-blue-600 dark:text-blue-400"
        />
        <span className={getTrueFalseClass(true)}>Verdadero</span>
      </label>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="radio"
          name={`pregunta-${pregunta.id}`}
          value="false"
          checked={userAnswer === false}
          onChange={() => onAnswer(false)}
          disabled={showResult}
          className="h-4 w-4 text-blue-600 dark:text-blue-400"
        />
        <span className={getTrueFalseClass(false)}>Falso</span>
      </label>
    </div>
  );
}

function QuestionCard({ pregunta, numero, userAnswer, onAnswer, showResult }: QuestionCardProps) {
  const isCorrect = showResult && userAnswer === pregunta.respuesta_correcta;
  const isWrong = showResult && userAnswer !== pregunta.respuesta_correcta;

  const getCardBorderClass = () => {
    if (!showResult) return 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900';
    if (isCorrect) return 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10';
    if (isWrong) return 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10';
    return 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800';
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
    <div className={`rounded-lg border-2 p-5 transition-colors sm:p-6 ${getCardBorderClass()}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
          Pregunta {numero}
        </h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyClass()}`}>
          {pregunta.dificultad}
        </span>
      </div>
      
      <p className="mb-5 text-sm text-slate-700 dark:text-slate-300 sm:text-base">{pregunta.enunciado}</p>
      
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
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
      )}
      
      {showResult && (
        <div className="mt-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
          <div className="mb-3">
            <span className="font-medium text-slate-700 dark:text-slate-200">Respuesta correcta: </span>
            <span className="font-semibold text-green-600 dark:text-green-300">
              {getRespuestaCorrecta()}
            </span>
          </div>
          
          {pregunta.explicacion && (
            <div className="mb-3">
              <span className="font-medium text-slate-700 dark:text-slate-200">Explicación: </span>
              <span className="text-slate-600 dark:text-slate-300">{pregunta.explicacion}</span>
            </div>
          )}
          
          {pregunta.citas && pregunta.citas.length > 0 && (
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Referencias: </span>
              <span className="text-sm text-slate-500 dark:text-slate-300">
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
