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
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const allQuestionsAnswered = quizResult.quiz.preguntas.every(
    pregunta => pregunta.id in answers
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metadata del quiz */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {quizResult.metadata.titulo}
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Nivel:</strong> {quizResult.metadata.nivel}</p>
          <p><strong>Preguntas:</strong> {quizResult.quiz.n_generadas}</p>
          <p><strong>Fuentes:</strong> {quizResult.metadata.fuentes.map(f => f.source_name).join(', ')}</p>
        </div>
      </div>

      {/* Resumen */}
      {quizResult.summary && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Resumen</h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            {quizResult.summary.overview}
          </p>
          {quizResult.summary.key_points.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-blue-800 mb-1">Puntos clave:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {quizResult.summary.key_points.map((point) => (
                  <li key={point.substring(0, 50)} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
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
      <div className="flex justify-between items-center pt-6 border-t">
        {!showResults ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {Object.keys(answers).length} de {quizResult.quiz.preguntas.length} respondidas
            </span>
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
              className={`px-6 py-2 rounded-lg font-medium ${
                allQuestionsAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Terminar Quiz
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getScoreColor(stats?.porcentajeAcierto || 0)}`}>
                {stats?.porcentajeAcierto.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {stats?.respuestasCorrectas} de {stats?.totalPreguntas} correctas
              </div>
            </div>
            <button
              onClick={resetQuiz}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Consejos de estudio */}
      {quizResult.study_tips.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Consejos de estudio</span>
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {quizResult.study_tips.map((tip) => (
              <li key={tip.substring(0, 50)} className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
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
          if (!showResult) return 'text-gray-700';
          if (isCorrectOption) return 'text-green-700 font-medium';
          if (isWrongUserOption) return 'text-red-700';
          return 'text-gray-700';
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
              className="w-4 h-4 text-blue-600"
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
    if (!showResult) return 'text-gray-700';
    if (pregunta.respuesta_correcta === value) return 'text-green-700 font-medium';
    if (userAnswer === value && pregunta.respuesta_correcta !== value) return 'text-red-700';
    return 'text-gray-700';
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
          className="w-4 h-4 text-blue-600"
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
          className="w-4 h-4 text-blue-600"
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
    if (!showResult) return 'border-gray-300 bg-white';
    if (isCorrect) return 'border-green-500 bg-green-50';
    if (isWrong) return 'border-red-500 bg-red-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getDifficultyClass = () => {
    if (pregunta.dificultad === 'baja') return 'bg-green-100 text-green-800';
    if (pregunta.dificultad === 'media') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRespuestaCorrecta = () => {
    if (typeof pregunta.respuesta_correcta === 'boolean') {
      return pregunta.respuesta_correcta ? 'Verdadero' : 'Falso';
    }
    return pregunta.respuesta_correcta;
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getCardBorderClass()}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Pregunta {numero}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyClass()}`}>
          {pregunta.dificultad}
        </span>
      </div>
      
      <p className="text-gray-700 mb-6">{pregunta.enunciado}</p>
      
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      
      {showResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <span className="font-medium text-gray-700">Respuesta correcta: </span>
            <span className="font-semibold text-green-600">
              {getRespuestaCorrecta()}
            </span>
          </div>
          
          {pregunta.explicacion && (
            <div className="mb-3">
              <span className="font-medium text-gray-700">Explicación: </span>
              <span className="text-gray-600">{pregunta.explicacion}</span>
            </div>
          )}
          
          {pregunta.citas && pregunta.citas.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Referencias: </span>
              <span className="text-sm text-gray-500">
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