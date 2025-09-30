'use client';

import { useState } from 'react';
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

  const getStepButtonClass = (currentStep: Step, stepIndex: number, targetStep: Step) => {
    const steps: Step[] = ['upload', 'configure', 'api-config', 'generating', 'quiz'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentStep === targetStep) {
      return 'bg-blue-600 text-white';
    } else if (stepIndex < currentIndex) {
      return 'bg-green-500 text-white';
    } else {
      return 'bg-gray-300 text-gray-600';
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Generador de Quiz de Estudio
        </h1>
        
        {/* Indicador de pasos */}
        <div className="flex items-center space-x-4 mb-4">
          {(['upload', 'configure', 'api-config', 'quiz'] as const).map((s, index) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${getStepButtonClass(step, index, s)}
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                step === s ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {s === 'upload' && 'Cargar Documentos'}
                {s === 'configure' && 'Configurar Quiz'}
                {s === 'api-config' && 'Configurar API'}
                {s === 'quiz' && 'Realizar Quiz'}
              </span>
              {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>

        {/* Error global */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido según el paso */}
      <div className="bg-white rounded-lg shadow-sm border">
        {step === 'upload' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Paso 1: Cargar Documentos
            </h2>
            <DocumentUpload
              onDocumentProcessed={handleDocumentUploaded}
              onError={handleError}
            />
            
            {documents.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {documents.length} documento(s) cargado(s)
                  </span>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Paso 2: Configurar Quiz
            </h2>
            <QuizConfigForm
              config={config}
              onChange={setConfig}
              documents={documents}
            />
            
            <div className="mt-6 pt-6 border-t flex justify-between">
              <button
                onClick={handlePrevStep}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Volver
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'api-config' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Paso 3: Configurar API de IA
            </h2>
            <APIKeyManager
              onConfigChange={setApiConfig}
            />
            
            <div className="mt-6 pt-6 border-t flex justify-between">
              <button
                onClick={handlePrevStep}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Volver
              </button>
              <button
                onClick={handleNextStep}
                disabled={!apiConfig}
                className={`px-6 py-2 rounded-lg ${
                  apiConfig
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h2 className="text-xl font-semibold text-gray-800">
                Generando Quiz...
              </h2>
              <p className="text-gray-600">
                Esto puede tomar unos momentos. Estamos procesando tus documentos y creando preguntas personalizadas.
              </p>
            </div>
          </div>
        )}

        {step === 'quiz' && quizResult && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Tu Quiz Personalizado
              </h2>
              <div className="space-x-2">
                <button
                  onClick={handlePrevStep}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Configurar Nuevo
                </button>
                <button
                  onClick={resetGenerator}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
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
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Documentos cargados:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          {documents.map((doc, index) => (
            <li key={doc.doc_id} className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{doc.source_name}</span>
              <span className="text-xs text-gray-400">
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
            <label htmlFor="titulo-quiz" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Quiz
            </label>
            <input
              id="titulo-quiz"
              type="text"
              value={config.titulo_quiz_o_tema}
              onChange={(e) => updateConfig({ titulo_quiz_o_tema: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Quiz de Cálculo I"
            />
          </div>

          <div>
            <label htmlFor="nivel-estudio" className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Estudio
            </label>
            <select
              id="nivel-estudio"
              value={config.nivel}
              onChange={(e) => updateConfig({ nivel: e.target.value as NivelEstudio })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="secundaria">Secundaria</option>
              <option value="universidad">Universidad</option>
              <option value="profesional">Profesional</option>
            </select>
          </div>

          <div>
            <label htmlFor="numero-preguntas" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Preguntas
            </label>
            <input
              id="numero-preguntas"
              type="number"
              min="5"
              max="50"
              value={config.n_preguntas}
              onChange={(e) => updateConfig({ n_preguntas: parseInt(e.target.value) || 10 })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Configuración de tipos de pregunta */}
        <div className="space-y-4">
          <div>
            <label htmlFor="distribucion-tipos" className="block text-sm font-medium text-gray-700 mb-2">
              Distribución de Tipos de Pregunta
            </label>
            <div id="distribucion-tipos" className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Opción Múltiple</span>
                  <span className="text-sm font-medium">{Math.round(config.proporcion_tipos.opcion_multiple * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.proporcion_tipos.opcion_multiple}
                  onChange={(e) => updateProporcion('opcion_multiple', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Respuesta Corta</span>
                  <span className="text-sm font-medium">{Math.round(config.proporcion_tipos.respuesta_corta * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.proporcion_tipos.respuesta_corta}
                  onChange={(e) => updateProporcion('respuesta_corta', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Verdadero/Falso</span>
                  <span className="text-sm font-medium">{Math.round(config.proporcion_tipos.verdadero_falso * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.proporcion_tipos.verdadero_falso}
                  onChange={(e) => updateProporcion('verdadero_falso', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="temas-prioritarios" className="block text-sm font-medium text-gray-700 mb-2">
              Temas Prioritarios (opcional)
            </label>
            <input
              id="temas-prioritarios"
              type="text"
              value={config.temas_prioritarios.join(', ')}
              onChange={(e) => updateConfig({ 
                temas_prioritarios: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: derivadas, integrales, límites"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separa los temas con comas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}