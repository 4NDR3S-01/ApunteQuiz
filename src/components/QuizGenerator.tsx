'use client';

import { Fragment, useMemo, useState } from 'react';
import { DocumentInput, GenerateQuizRequest, QuizResult, NivelEstudio, TipoPregunta } from '@/types';
import DocumentUpload from './DocumentUpload';
import QuizDisplay from './QuizDisplay';

interface QuizGeneratorProps {
  readonly className?: string;
}

type Step = 'upload' | 'configure' | 'generating' | 'quiz';

interface QuizConfig {
  idioma: string;
  nivel: NivelEstudio;
  n_preguntas: number;
  tipos_permitidos: TipoPregunta[];
  proporcion_tipos: {
    opcion_multiple: number;
    respuesta_corta: number;
    verdadero_falso: number;
  };
  temas_prioritarios: string[];
  titulo_quiz_o_tema: string;
}

const defaultConfig: QuizConfig = {
  idioma: 'es',
  nivel: 'universidad',
  n_preguntas: 10,
  tipos_permitidos: ['opcion_multiple', 'respuesta_corta', 'verdadero_falso'],
  proporcion_tipos: {
    opcion_multiple: 0.6,
    respuesta_corta: 0.3,
    verdadero_falso: 0.1
  },
  temas_prioritarios: [],
  titulo_quiz_o_tema: 'Quiz de Estudio'
};

function validateQuizConfig(config: QuizConfig, documents: DocumentInput[]): string[] {
  const errors: string[] = [];

  // Validar número de preguntas
  if (config.n_preguntas < 1) {
    errors.push('El número de preguntas debe ser mayor a 0');
  } else if (config.n_preguntas > 50) {
    errors.push('El número máximo de preguntas es 50');
  }

  // Validar título
  if (!config.titulo_quiz_o_tema.trim()) {
    errors.push('El título del quiz es obligatorio');
  } else if (config.titulo_quiz_o_tema.trim().length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  }

  // Validar proporción de tipos
  const total =
    config.proporcion_tipos.opcion_multiple +
    config.proporcion_tipos.respuesta_corta +
    config.proporcion_tipos.verdadero_falso;

  if (Math.abs(total - 1) > 0.01) {
    errors.push('La suma de las proporciones debe ser exactamente 100%');
  }

  // Validar documentos
  if (documents.length === 0) {
    errors.push('Debe cargar al menos un documento');
  }

  // Validar contenido suficiente vs número de preguntas solicitadas
  const totalTextLength = documents.reduce((acc, doc) => {
    if (doc.text) return acc + doc.text.length;
    if (doc.pages) return acc + doc.pages.reduce((pAcc, p) => pAcc + (p.text?.length ?? 0), 0);
    return acc;
  }, 0);

  const wordsCount = totalTextLength / 5;
  const maxRecommendedQuestions = Math.floor(wordsCount / 50);

  if (config.n_preguntas > maxRecommendedQuestions && maxRecommendedQuestions > 0) {
    errors.push(`Para el contenido disponible se recomiendan máximo ${maxRecommendedQuestions} preguntas`);
  }

  return errors;
}

export default function QuizGenerator({ className = '' }: QuizGeneratorProps) {
  const [step, setStep] = useState<Step>('upload');
  const [documents, setDocuments] = useState<DocumentInput[]>([]);
  const [config, setConfig] = useState<QuizConfig>(defaultConfig);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string>('');

  // ✅ FIX: calcular isFormValid en el padre
  const isFormValid = useMemo(() => validateQuizConfig(config, documents).length === 0, [config, documents]);

  const cardBaseClasses = 'a11y-card rounded-lg shadow-sm transition-colors';
  const stepsForNav: Step[] = ['upload', 'configure', 'quiz'];

  const getStepButtonClass = (currentStep: Step, stepIndex: number, targetStep: Step) => {
    const steps: Step[] = ['upload', 'configure', 'generating', 'quiz'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentStep === targetStep) {
      return 'bg-blue-600 text-white shadow-lg dark:bg-blue-500';
    } else if (stepIndex < currentIndex) {
      return 'bg-emerald-500 text-white shadow-md dark:bg-emerald-400';
    } else {
      return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const handleDocumentUploaded = (document: DocumentInput) => {
    setDocuments(prev => [...prev, document]);
    setError('');
  };

  const handleDocumentRemoved = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.doc_id !== documentId));
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleNextStep = () => {
    if (step === 'upload' && documents.length > 0) {
      setStep('configure');
    } else if (step === 'configure') {
      // Validar configuración antes de generar
      const configErrors = validateQuizConfig(config, documents);
      if (configErrors.length > 0) {
        setError(configErrors.join('. '));
        return;
      }
      generateQuiz();
    }
  };

  const handlePrevStep = () => {
    if (step === 'configure') {
      setStep('upload');
    } else if (step === 'quiz') {
      setStep('configure');
    }
  };

  const generateQuiz = async () => {
    setStep('generating');
    setError('');

    try {
      const request: GenerateQuizRequest = {
        ...config,
        documents
      };

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || `Error HTTP ${response.status}: ${result.message || 'Error generando quiz'}`);
      }

      // La API devuelve { success: true, data: { result: QuizResult }, metadata: {...} }
      if (!result.success || !result.data?.result) {
        throw new Error(result.error?.message || 'Respuesta inválida del servidor');
      }

      setQuizResult(result.data.result as QuizResult);
      setStep('quiz');
    } catch (err) {
      console.error('Error generando quiz:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('configure');
    }
  };

  const resetGenerator = () => {
    setStep('upload');
    setDocuments([]);
    setQuizResult(null);
    setError('');
    setConfig(defaultConfig);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header con progreso */}
      <div className={`${cardBaseClasses} p-6`}>
        <h1 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">Generador de Quiz de Estudio</h1>

        {/* Indicador de pasos */}
        <nav aria-label="Progreso del generador" className="mb-6">
          <ol className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-center md:space-y-0 md:space-x-8">
            {stepsForNav.map((s, index, arr) => {
              const canonicalStep = step === 'generating' ? 'configure' : step;
              const currentIndex = stepsForNav.indexOf(canonicalStep as Step);
              const isCurrent = step === s;
              const isCompleted = index < currentIndex;
              return (
                <Fragment key={s}>
                  <li className="flex items-center">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200
                          ${getStepButtonClass(step, index, s)}
                        `}
                        aria-current={isCurrent ? 'step' : undefined}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-300'
                              : isCompleted
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-[color:var(--text-muted)]'
                          }`}
                        >
                          {s === 'upload' && 'Cargar Documentos'}
                          {s === 'configure' && 'Configurar Quiz'}
                          {s === 'quiz' && 'Realizar Quiz'}
                        </span>
                      </div>
                    </div>
                  </li>
                  {index < arr.length - 1 && (
                    <div className="flex items-center">
                      {/* Línea vertical en móviles, horizontal en desktop */}
                      <div
                        className={`transition-colors md:h-px md:w-16 h-8 w-px ml-5 md:ml-0 ${
                          index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                        aria-hidden
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </nav>

        {/* Error global */}
        {error && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-400/40 dark:bg-red-500/10"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-red-500 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido según el paso */}
      <div className={cardBaseClasses}>
        {step === 'upload' && (
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-[color:var(--foreground)]">Paso 1: Cargar Documentos</h2>
            <DocumentUpload
              existingDocuments={documents}
              onDocumentProcessed={handleDocumentUploaded}
              onDocumentRemoved={handleDocumentRemoved}
              onError={handleError}
            />

            {documents.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-[color:var(--text-muted)]">{documents.length} documento(s) cargado(s)</span>
                  <button
                    onClick={handleNextStep}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'configure' && (
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-[color:var(--foreground)]">Paso 2: Configurar Quiz</h2>

            <QuizConfigForm
              config={config}
              onChange={setConfig}
              documents={documents}
              handlePrevStep={handlePrevStep}
              handleNextStep={handleNextStep}
            />

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-between">
              <button
                onClick={handlePrevStep}
                className="flex items-center justify-center space-x-2 rounded-lg bg-slate-600 px-6 py-3 text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-slate-500 dark:hover:bg-slate-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Volver</span>
              </button>
              <button
                onClick={handleNextStep}
                disabled={!isFormValid}
                className={`flex items-center justify-center space-x-2 rounded-lg px-6 py-3 text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
                    : 'bg-slate-400 cursor-not-allowed dark:bg-slate-600'
                }`}
                aria-disabled={!isFormValid || undefined}
              >
                <span>Generar Quiz</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="p-6 text-center">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Generando Quiz...</h2>
              <div className="space-y-2">
                <p className="text-[color:var(--text-muted)]">
                  Procesando {documents.length} documento(s) y creando {config.n_preguntas} preguntas personalizadas.
                </p>
                <div className="text-xs text-[color:var(--text-muted)] space-y-1">
                  <p>✨ Analizando contenido y extrayendo conceptos clave</p>
                  <p>🧠 Generando preguntas con IA ({config.nivel})</p>
                  <p>🔍 Validando y optimizando respuestas</p>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">Este proceso puede tomar 30-60 segundos...</p>
              </div>
            </div>
          </div>
        )}

        {step === 'quiz' && quizResult && (
          <div className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Tu Quiz Personalizado</h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                <button
                  onClick={handlePrevStep}
                  className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-slate-500 dark:hover:bg-slate-400"
                >
                  Configurar Nuevo
                </button>
                <button
                  onClick={resetGenerator}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  Empezar de Nuevo
                </button>
              </div>
            </div>

            <QuizDisplay
              quizResult={quizResult}
              onQuizComplete={(answers) => console.log('Quiz completado:', answers)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface QuizConfigFormProps {
  readonly config: QuizConfig;
  readonly onChange: (config: QuizConfig) => void;
  readonly documents: DocumentInput[];
  readonly handlePrevStep: () => void;
  readonly handleNextStep: () => void;
}

function QuizConfigForm({ config, onChange, documents }: QuizConfigFormProps) {
  const updateConfig = (updates: Partial<QuizConfig>) => {
    onChange({ ...config, ...updates });
  };

  // Calcular validaciones en tiempo real
  const validationErrors = useMemo(() => validateQuizConfig(config, documents), [config, documents]);

  // Calcular métricas del contenido
  const totalTextLength = useMemo(() => {
    return documents.reduce((total, doc) => {
      if (doc.text) return total + doc.text.length;
      if (doc.pages) return total + doc.pages.reduce((pageTotal, page) => pageTotal + (page.text?.length ?? 0), 0);
      return total;
    }, 0);
  }, [documents]);

  const wordsCount = Math.floor(totalTextLength / 5);
  const maxRecommendedQuestions = Math.floor(wordsCount / 50);
  const isQuestionCountOptimal = config.n_preguntas <= maxRecommendedQuestions;

  const updateProporcion = (tipo: keyof QuizConfig['proporcion_tipos'], value: number) => {
    const newProporcion: QuizConfig['proporcion_tipos'] = { ...config.proporcion_tipos };

    // Normalizar a [0,1]
    const v = Math.max(0, Math.min(1, value));
    newProporcion[tipo] = v;

    const keys = Object.keys(newProporcion) as Array<keyof typeof newProporcion>;
    const otherTypes = keys.filter(t => t !== tipo);
    const otherSum = otherTypes.reduce((sum, t) => sum + newProporcion[t], 0);

    // Si la suma total excede 1, ajustar proporcionalmente los otros tipos
    if (v + otherSum > 1) {
      const remaining = Math.max(0, 1 - v);
      const currentOtherSum = otherSum;
      if (currentOtherSum > 0) {
        otherTypes.forEach(t => {
          newProporcion[t] = (newProporcion[t] / currentOtherSum) * remaining;
        });
      } else {
        const equalShare = remaining / otherTypes.length;
        otherTypes.forEach(t => {
          newProporcion[t] = equalShare;
        });
      }
    }

    // Redondear a 1 decimal para evitar errores de punto flotante
    (Object.keys(newProporcion) as Array<keyof typeof newProporcion>).forEach(key => {
      newProporcion[key] = Math.round(newProporcion[key] * 10) / 10;
    });

    updateConfig({ proporcion_tipos: newProporcion });
  };

  return (
    <div className="space-y-6">
      {/* Información de documentos */}
      <div className="a11y-card-muted rounded-lg p-4">
        <h3 className="mb-2 font-medium text-[color:var(--foreground)]">Documentos cargados:</h3>
        <ul className="space-y-1 text-sm text-[color:var(--text-muted)]">
          {documents.map((doc) => (
            <li key={doc.doc_id} className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{doc.source_name}</span>
              <span className="text-xs text-[color:var(--text-muted)]">
                ({doc.type === 'pdf' ? `${doc.pages?.length ?? 0} páginas` : 'texto'})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración básica */}
        <div className="space-y-4">
          <div>
            <label htmlFor="titulo-quiz" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
              Título del Quiz
            </label>
            <input
              id="titulo-quiz"
              type="text"
              value={config.titulo_quiz_o_tema}
              onChange={(e) => updateConfig({ titulo_quiz_o_tema: e.target.value })}
              className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              placeholder="Ej: Quiz de Cálculo I"
            />
          </div>

          <div>
            <label htmlFor="nivel-estudio" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
              Nivel de Estudio
            </label>
            <select
              id="nivel-estudio"
              value={config.nivel}
              onChange={(e) => updateConfig({ nivel: e.target.value as NivelEstudio })}
              className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            >
              <option value="secundaria">Secundaria</option>
              <option value="universidad">Universidad</option>
              <option value="profesional">Profesional</option>
            </select>
          </div>

          <div>
            <label htmlFor="numero-preguntas" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
              Número de Preguntas
            </label>
            <div className="space-y-2">
              <input
                id="numero-preguntas"
                inputMode="numeric"
                type="number"
                min={5}
                max={50}
                value={config.n_preguntas}
                onChange={(e) => updateConfig({ n_preguntas: Number.isNaN(parseInt(e.target.value, 10)) ? 10 : parseInt(e.target.value, 10) })}
                className={`a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 ${
                  isQuestionCountOptimal ? 'focus-visible:ring-blue-500/60' : 'focus-visible:ring-amber-500/60 border-amber-300'
                }`}
              />
              {maxRecommendedQuestions > 0 && (
                <div
                  className={`text-xs p-2 rounded ${
                    isQuestionCountOptimal
                      ? 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/20'
                      : 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20'
                  }`}
                >
                  <p className="flex items-center space-x-1">
                    {isQuestionCountOptimal ? (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{isQuestionCountOptimal ? `Óptimo para el contenido (máx. ${maxRecommendedQuestions})` : `Se recomienda máximo ${maxRecommendedQuestions} preguntas`}</span>
                  </p>
                  <p className="text-xs mt-1">Contenido: ~{wordsCount.toLocaleString()} palabras</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="temas-prioritarios" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
              Temas Prioritarios (opcional)
            </label>
            <input
              id="temas-prioritarios"
              type="text"
              value={config.temas_prioritarios.join(', ')}
              onChange={(e) =>
                updateConfig({
                  temas_prioritarios: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })
              }
              className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              placeholder="Ej: derivadas, integrales, límites"
            />
          </div>
        </div>

        {/* Distribución de tipos - Columnas 2 y 3 */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">Distribución de Tipos de Pregunta</h3>
            <p className="text-xs text-[color:var(--text-muted)] mb-4">
              Configure la proporción deseada para cada tipo. La API ajustará estos valores según el contenido del documento.
            </p>
          </div>

          {/* Grid compacto para los tipos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Opción Múltiple */}
            <div className="a11y-card rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🔘</span>
                  <div>
                    <h4 className="text-sm font-medium text-[color:var(--foreground)]">Opción Múltiple</h4>
                    <p className="text-xs text-[color:var(--text-muted)]">4 opciones</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(config.proporcion_tipos.opcion_multiple * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={config.proporcion_tipos.opcion_multiple}
                onChange={(e) => updateProporcion('opcion_multiple', parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg accent-blue-600 dark:accent-blue-400"
              />
            </div>

            {/* Respuesta Corta */}
            <div className="a11y-card rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">✏️</span>
                  <div>
                    <h4 className="text-sm font-medium text-[color:var(--foreground)]">Respuesta Corta</h4>
                    <p className="text-xs text-[color:var(--text-muted)]">Texto breve</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(config.proporcion_tipos.respuesta_corta * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={config.proporcion_tipos.respuesta_corta}
                onChange={(e) => updateProporcion('respuesta_corta', parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg accent-purple-600 dark:accent-purple-400"
              />
            </div>

            {/* Verdadero/Falso */}
            <div className="a11y-card rounded-lg p-4 border-l-4 border-teal-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">✅</span>
                  <div>
                    <h4 className="text-sm font-medium text-[color:var(--foreground)]">Verdadero/Falso</h4>
                    <p className="text-xs text-[color:var(--text-muted)]">V o F</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                  {Math.round(config.proporcion_tipos.verdadero_falso * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={config.proporcion_tipos.verdadero_falso}
                onChange={(e) => updateProporcion('verdadero_falso', parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg accent-teal-600 dark:accent-teal-400"
              />
            </div>
          </div>

          {/* Indicadores de estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Indicador del total */}
            <div className="a11y-card-muted rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[color:var(--foreground)]">Total distribución:</span>
                <span
                  className={`font-bold text-lg ${
                    Math.abs(
                      config.proporcion_tipos.opcion_multiple +
                        config.proporcion_tipos.respuesta_corta +
                        config.proporcion_tipos.verdadero_falso -
                        1
                    ) < 0.1
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {Math.round(
                    (config.proporcion_tipos.opcion_multiple +
                      config.proporcion_tipos.respuesta_corta +
                      config.proporcion_tipos.verdadero_falso) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Math.abs(
                      config.proporcion_tipos.opcion_multiple +
                        config.proporcion_tipos.respuesta_corta +
                        config.proporcion_tipos.verdadero_falso -
                        1
                    ) < 0.1
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (config.proporcion_tipos.opcion_multiple +
                        config.proporcion_tipos.respuesta_corta +
                        config.proporcion_tipos.verdadero_falso) *
                        100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Nota informativa */}
            <div className="a11y-card-muted rounded-lg p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Nota:</p>
                  <p>La distribución final puede variar según el contenido.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de validación */}
      <div className="space-y-4">
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-400/40 dark:bg-red-500/10">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="text-sm font-medium text-red-700 dark:text-red-300">Problemas de configuración:</h4>
            </div>
            <ul className="text-sm text-red-600 dark:text-red-200 space-y-1">
              {validationErrors.map((e) => (
                <li key={e} className="flex items-start space-x-1">
                  <span className="text-red-500">•</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
