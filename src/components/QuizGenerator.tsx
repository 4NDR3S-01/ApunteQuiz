'use client';

import { Fragment, useState } from 'react';
import { DocumentInput, GenerateQuizRequest, QuizResult, NivelEstudio, TipoPregunta } from '@/types';
import DocumentUpload from './DocumentUpload';
import QuizDisplay from './QuizDisplay';
import APIKeyManager from './APIKeyManager';

interface APIKeyConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

interface QuizGeneratorProps {
  readonly className?: string;
}

type Step = 'upload' | 'configure' | 'api-config' | 'generating' | 'quiz';

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

export default function QuizGenerator({ className = '' }: QuizGeneratorProps) {
  const [step, setStep] = useState<Step>('upload');
  const [documents, setDocuments] = useState<DocumentInput[]>([]);
  const [config, setConfig] = useState<QuizConfig>(defaultConfig);
  const [apiConfig, setApiConfig] = useState<APIKeyConfig | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string>('');
  const cardBaseClasses =
    'a11y-card rounded-lg shadow-sm transition-colors';
  const stepsForNav: Step[] = ['upload', 'configure', 'api-config', 'quiz'];

  const getStepButtonClass = (currentStep: Step, stepIndex: number, targetStep: Step) => {
    const steps: Step[] = ['upload', 'configure', 'api-config', 'generating', 'quiz'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentStep === targetStep) {
      return 'a11y-critical text-[color:var(--accent-contrast)]';
    } else if (stepIndex < currentIndex) {
      return 'bg-emerald-500 text-white dark:bg-emerald-400';
    } else {
      return 'a11y-control text-[color:var(--text-muted)]';
    }
  };

  const handleDocumentUploaded = (document: DocumentInput) => {
    setDocuments(prev => [...prev, document]);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleNextStep = () => {
    if (step === 'upload' && documents.length > 0) {
      setStep('configure');
    } else if (step === 'configure') {
      setStep('api-config');
    } else if (step === 'api-config' && apiConfig) {
      generateQuiz();
    }
  };

  const handlePrevStep = () => {
    if (step === 'configure') {
      setStep('upload');
    } else if (step === 'api-config') {
      setStep('configure');
    } else if (step === 'quiz') {
      setStep('api-config');
    }
  };

    const generateQuiz = async () => {
    if (!apiConfig) {
      setError('Por favor configura tu API key primero');
      return;
    }

    setStep('generating');
    setError('');

    try {
      const request: GenerateQuizRequest = {
        ...config,
        documents
      };

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': apiConfig.provider,
          'x-api-key': apiConfig.apiKey,
          'x-ai-model': apiConfig.model
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error?.message || 'Error generando quiz');
      }

      setQuizResult(result.data.result);
      setStep('quiz');
    } catch (error) {
      console.error('Error generando quiz:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setStep('api-config');
    }
  };

  const resetGenerator = () => {
    setStep('upload');
    setDocuments([]);
    setQuizResult(null);
    setError('');
    setConfig(defaultConfig);
    setApiConfig(null);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header con progreso */}
      <div className={`${cardBaseClasses} p-6`}>
        <h1 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
          Generador de Quiz de Estudio
        </h1>
        
        {/* Indicador de pasos */}
        <nav aria-label="Progreso del generador" className="mb-6">
          <ol className="flex flex-col gap-3 md:flex-row md:items-center md:gap-0 md:space-x-4">
            {stepsForNav.map((s, index, arr) => {
              const canonicalStep =
                step === 'generating' ? 'api-config' : step;
              const currentIndex = stepsForNav.indexOf(canonicalStep as Step);
              const isCurrent = step === s;
              const isCompleted = index < currentIndex;
              return (
                <Fragment key={s}>
                  <li className="flex items-center md:flex-1">
                    <div
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition
                        ${getStepButtonClass(step, index, s)}
                      `}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isCompleted ? '✔' : index + 1}
                    </div>
                    <span
                      className={`ml-3 text-sm ${
                        isCurrent
                          ? 'font-medium text-blue-600 dark:text-blue-300'
                          : 'text-[color:var(--text-muted)]'
                      }`}
                    >
                      {s === 'upload' && 'Cargar Documentos'}
                      {s === 'configure' && 'Configurar Quiz'}
                      {s === 'api-config' && 'Configurar API'}
                      {s === 'quiz' && 'Realizar Quiz'}
                    </span>
                  </li>
                  {index < arr.length - 1 && (
                    <>
                      <div className="h-px w-full bg-slate-200 dark:bg-slate-700 md:hidden" aria-hidden />
                      <div className="hidden h-px w-10 flex-none bg-slate-200 dark:bg-slate-700 md:block" aria-hidden />
                    </>
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
            <h2 className="mb-4 text-xl font-semibold text-[color:var(--foreground)]">
              Paso 1: Cargar Documentos
            </h2>
            <DocumentUpload
              onDocumentProcessed={handleDocumentUploaded}
              onError={handleError}
            />
            
            {documents.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-[color:var(--text-muted)]">
                    {documents.length} documento(s) cargado(s)
                  </span>
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
            <h2 className="mb-4 text-xl font-semibold text-[color:var(--foreground)]">
              Paso 2: Configurar Quiz
            </h2>
            <QuizConfigForm
              config={config}
              onChange={setConfig}
              documents={documents}
            />
            
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-between">
              <button
                onClick={handlePrevStep}
                className="rounded-lg bg-slate-600 px-6 py-2 text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-slate-500 dark:hover:bg-slate-400"
              >
                Volver
              </button>
              <button
                onClick={handleNextStep}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'api-config' && (
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-[color:var(--foreground)]">
              Paso 3: Configurar API de IA
            </h2>
            <APIKeyManager
              onConfigChange={setApiConfig}
            />
            
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-between">
              <button
                onClick={handlePrevStep}
                className="rounded-lg bg-slate-600 px-6 py-2 text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-slate-500 dark:hover:bg-slate-400"
              >
                Volver
              </button>
              <button
                onClick={handleNextStep}
                disabled={!apiConfig}
                className={`px-6 py-2 rounded-lg ${
                  apiConfig
                    ? 'bg-blue-600 text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] dark:bg-blue-500 dark:hover:bg-blue-400'
                    : 'cursor-not-allowed bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] opacity-70'
                }`}
              >
                Generar Quiz
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="p-6 text-center">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
                Generando Quiz...
              </h2>
              <p className="text-[color:var(--text-muted)]">
                Esto puede tomar unos momentos. Estamos procesando tus documentos y creando preguntas personalizadas.
              </p>
            </div>
          </div>
        )}

        {step === 'quiz' && quizResult && (
          <div className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
                Tu Quiz Personalizado
              </h2>
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
}

function QuizConfigForm({ config, onChange, documents }: QuizConfigFormProps) {
  const updateConfig = (updates: Partial<QuizConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateProporcion = (tipo: keyof QuizConfig['proporcion_tipos'], value: number) => {
    const newProporcion = { ...config.proporcion_tipos, [tipo]: value };
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
                ({doc.type === 'pdf' ? `${doc.pages?.length} páginas` : 'texto'})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <input
              id="numero-preguntas"
              type="number"
              min="5"
              max="50"
              value={config.n_preguntas}
              onChange={(e) => updateConfig({ n_preguntas: parseInt(e.target.value) || 10 })}
              className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            />
          </div>
        </div>

        {/* Configuración de tipos de pregunta */}
        <div className="space-y-4">
          <div>
            <label htmlFor="distribucion-tipos" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
              Distribución de Tipos de Pregunta
            </label>
            <div id="distribucion-tipos" className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[color:var(--text-muted)]">Opción Múltiple</span>
                  <span className="text-sm font-medium text-[color:var(--foreground)]">{Math.round(config.proporcion_tipos.opcion_multiple * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.proporcion_tipos.opcion_multiple}
                  onChange={(e) => updateProporcion('opcion_multiple', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 dark:accent-blue-400"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[color:var(--text-muted)]">Respuesta Corta</span>
                  <span className="text-sm font-medium text-[color:var(--foreground)]">{Math.round(config.proporcion_tipos.respuesta_corta * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.proporcion_tipos.respuesta_corta}
                  onChange={(e) => updateProporcion('respuesta_corta', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 dark:accent-purple-400"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[color:var(--text-muted)]">Verdadero/Falso</span>
                  <span className="text-sm font-medium text-[color:var(--foreground)]">{Math.round(config.proporcion_tipos.verdadero_falso * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.proporcion_tipos.verdadero_falso}
                  onChange={(e) => updateProporcion('verdadero_falso', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 dark:accent-teal-400"
                />
              </div>
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
              onChange={(e) => updateConfig({ 
                temas_prioritarios: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
              })}
              className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              placeholder="Ej: derivadas, integrales, límites"
            />
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              Separa los temas con comas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
