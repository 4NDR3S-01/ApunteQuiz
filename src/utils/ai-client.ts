import { SYSTEM_PROMPT } from '@/prompts/system';
import { createUserPrompt, UserPromptParams } from '@/prompts/user';
import { GenerateQuizResponse } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/utils/logger';
import { jsonrepair } from 'jsonrepair';

export interface AIProvider {
  name: 'openai' | 'anthropic' | 'groq' | 'gemini';
  model: string;
  apiKey: string;
}

/**
 * Límites de contexto por proveedor y modelo (en tokens)
 * Dejamos margen para la respuesta (max_tokens)
 */
const CONTEXT_LIMITS: Record<string, Record<string, number>> = {
  groq: {
    'llama-3.1-8b-instant': 6000, // ~8K total, dejamos 2K para respuesta
    'llama-3.1-70b-versatile': 120000,
    'llama-3.3-70b-versatile': 120000, // 128K total, dejamos espacio para respuesta
    'mixtral-8x7b-32768': 28000,
    'groq/compound': 60000, // 70K TPM - excelente
    'groq/compound-mini': 60000, // 70K TPM - el mejor TPM disponible
    'meta-llama/llama-4-scout-17b-16e-instruct': 25000, // 30K TPM
    'meta-llama/llama-4-maverick-17b-128e-instruct': 5000,
    default: 6000
  },
  openai: {
    'gpt-4o-mini': 100000,
    'gpt-4o': 100000,
    'gpt-4-turbo': 100000,
    default: 100000
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': 180000,
    'claude-3-opus-20240229': 180000,
    default: 180000
  },
  gemini: {
    'gemini-pro': 30000, // Modelo estándar (siempre disponible)
    'gemini-pro-vision': 30000, // Multimodal (siempre disponible)
    'gemini-1.5-flash': 1000000, // 1M tokens - requiere acceso
    'gemini-1.5-pro': 2000000, // 2M tokens - requiere acceso
    'models/gemini-pro': 30000, // Formato alternativo
    'models/gemini-1.5-flash': 1000000, // Formato con prefijo models/
    'models/gemini-1.5-pro': 2000000,
    default: 30000
  }
};

/**
 * Estima el número de tokens en un texto
 * Aproximación: ~4 caracteres por token en español/inglés
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Estimación más precisa: contar palabras y caracteres
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;
  // Promedio: ~1.3 tokens por palabra, o ~4 caracteres por token
  return Math.ceil(Math.max(words * 1.3, chars / 4));
}

/**
 * Calcula el tamaño del prompt completo (system + user) en tokens
 */
export function calculatePromptSize(params: UserPromptParams): {
  systemTokens: number;
  userTokens: number;
  totalTokens: number;
  systemChars: number;
  userChars: number;
  totalChars: number;
} {
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = createUserPrompt(params);
  
  const systemTokens = estimateTokens(systemPrompt);
  const userTokens = estimateTokens(userPrompt);
  const totalTokens = systemTokens + userTokens;
  
  return {
    systemTokens,
    userTokens,
    totalTokens,
    systemChars: systemPrompt.length,
    userChars: userPrompt.length,
    totalChars: systemPrompt.length + userPrompt.length
  };
}

/**
 * Obtiene el límite de contexto para un proveedor y modelo específicos
 */
export function getContextLimit(provider: AIProvider): number {
  const providerLimits = CONTEXT_LIMITS[provider.name];
  if (!providerLimits) {
    // Default conservador
    return 6000;
  }
  
  return providerLimits[provider.model] || providerLimits.default || 6000;
}

/**
 * Verifica si el prompt excede el límite de contexto del proveedor
 */
export function exceedsContextLimit(params: UserPromptParams, provider: AIProvider): {
  exceeds: boolean;
  promptSize: number;
  limit: number;
  excess: number;
} {
  const promptSize = calculatePromptSize(params);
  const limit = getContextLimit(provider);
  const exceeds = promptSize.totalTokens > limit;
  
  return {
    exceeds,
    promptSize: promptSize.totalTokens,
    limit,
    excess: exceeds ? promptSize.totalTokens - limit : 0
  };
}

/**
 * Maneja errores de respuesta HTTP de APIs
 * Detecta específicamente errores de contexto excedido
 */
async function handleAPIError(response: Response, providerName: string): Promise<never> {
  try {
    const errorData = await response.text();
    const errorMessage = errorData.includes('<!DOCTYPE') || errorData.includes('<html')
      ? `API Error (${response.status}): HTML response received instead of JSON`
      : (() => {
          try {
            const errorJson = JSON.parse(errorData);
            const message = errorJson.error?.message || errorData;
            const errorType = errorJson.error?.type || '';
            const errorCode = errorJson.error?.code || '';
            
            // Detectar específicamente context_length_exceeded
            if (
              errorCode === 'context_length_exceeded' ||
              errorType === 'invalid_request_error' ||
              message.toLowerCase().includes('context_length') ||
              message.toLowerCase().includes('reduce the length') ||
              message.toLowerCase().includes('maximum context length')
            ) {
              throw new Error(`CONTEXT_LENGTH_EXCEEDED: ${message}`);
            }
            
            return message;
          } catch (parseError) {
            // Si ya lanzamos CONTEXT_LENGTH_EXCEEDED, propagarlo
            if (parseError instanceof Error && parseError.message.includes('CONTEXT_LENGTH_EXCEEDED')) {
              throw parseError;
            }
            return errorData;
          }
        })();
    throw new Error(`Error de ${providerName}: ${errorMessage}`);
  } catch (error) {
    // Propagar errores de contexto excedido
    if (error instanceof Error && error.message.includes('CONTEXT_LENGTH_EXCEEDED')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes(`Error de ${providerName}:`)) {
      throw error;
    }
    throw new Error(`Error de ${providerName}: HTTP ${response.status}: ${response.statusText}`);
  }
}

/**
 * Valida y parsea respuesta JSON de la IA
 */
function parseAIResponse(content: string): GenerateQuizResponse {
  // Limpiar contenido antes de validar
  let trimmedContent = content.trim();
  
  // Log en desarrollo para debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] Raw response length:', trimmedContent.length);
    console.log('[DEBUG] Response preview (first 500 chars):', trimmedContent.substring(0, 500));
    console.log('[DEBUG] Response preview (last 500 chars):', trimmedContent.substring(Math.max(0, trimmedContent.length - 500)));
  }
  
  // Remover posibles caracteres de markdown
  trimmedContent = trimmedContent
    .replace(/^```json?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  
  // Verificar si la respuesta parece truncada
  const endsWithValidChar = trimmedContent.endsWith('}') || 
                           trimmedContent.endsWith('}]') || 
                           trimmedContent.endsWith(']') ||
                           trimmedContent.endsWith('"');
  
  if (!endsWithValidChar) {
    console.warn('[WARN] Response appears truncated, will attempt to repair...');
  }

  // Intentar parsear directamente
  try {
    return JSON.parse(trimmedContent) as GenerateQuizResponse;
  } catch (firstError) {
    console.warn('[WARN] First parse attempt failed:', firstError instanceof Error ? firstError.message : String(firstError));
    
    // Intentar reparar el JSON usando jsonrepair
    try {
      console.log('[DEBUG] Attempting to repair JSON...');
      const repaired = jsonrepair(trimmedContent);
      console.log('[DEBUG] JSON repair successful, attempting to parse...');
      return JSON.parse(repaired) as GenerateQuizResponse;
    } catch (repairError) {
      // Log del error en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('[ERROR] Failed to parse even after repair');
        console.error('[ERROR] Repair error:', repairError instanceof Error ? repairError.message : String(repairError));
        console.error('[ERROR] Original error:', firstError instanceof Error ? firstError.message : String(firstError));
      }
      
      throw new Error(`Error parseando JSON: ${firstError instanceof Error ? firstError.message : String(firstError)}`);
    }
  }
}

/**
 * Genera un quiz usando la API de OpenAI
 */
export async function generateQuizWithOpenAI(
  params: UserPromptParams,
  config: { apiKey: string; model?: string }
): Promise<GenerateQuizResponse> {
  const { apiKey, model = 'gpt-4o-mini' } = config;
  
  try {
    const userPrompt = createUserPrompt(params);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Baja temperatura para consistencia
        max_tokens: 8000, // Aumentado para permitir respuestas completas
        response_format: { type: 'json_object' } // Forzar respuesta JSON
      }),
    });

    if (!response.ok) {
      await handleAPIError(response, 'OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Respuesta vacía de OpenAI');
    }

    // Log condicional para debugging de desarrollo únicamente
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AI_RESPONSES === 'true') {
      console.log('OpenAI response length:', content.length);
    }

    return parseAIResponse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Mejorar mensaje de error para context_length_exceeded
    if (errorMessage.includes('CONTEXT_LENGTH_EXCEEDED') || 
        errorMessage.includes('reduce the length') ||
        errorMessage.includes('context_length_exceeded')) {
      return {
        error: {
          message: 'CONTEXT_LENGTH_EXCEEDED: El documento es demasiado extenso. Se necesita reducir el contenido.',
          where: 'generateQuizWithOpenAI'
        }
      };
    }
    
    console.error('Error generando quiz con OpenAI:', error);
    return {
      error: {
        message: errorMessage,
        where: 'generateQuizWithOpenAI'
      }
    };
  }
}

/**
 * Genera un quiz usando la API
 */
export async function generateQuizWithGroq(
  params: UserPromptParams,
  config: { apiKey: string; model?: string }
): Promise<GenerateQuizResponse> {
  const { apiKey, model = 'llama-3.1-8b-instant' } = config;
  
  try {
    const userPrompt = createUserPrompt(params);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      await handleAPIError(response, 'Groq');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Respuesta vacía de Groq');
    }

    // Log en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[GROQ] Response length:', content.length);
      console.log('[GROQ] Response finish_reason:', data.choices[0]?.finish_reason);
    }

    return parseAIResponse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Mejorar mensaje de error para context_length_exceeded
    if (errorMessage.includes('CONTEXT_LENGTH_EXCEEDED') || 
        errorMessage.includes('reduce the length') ||
        errorMessage.includes('context_length_exceeded')) {
      return {
        error: {
          message: 'CONTEXT_LENGTH_EXCEEDED: El documento es demasiado extenso. Se necesita reducir el contenido.',
          where: 'generateQuizWithGroq'
        }
      };
    }
    
    console.error('Error generando quiz con Groq:', error);
    return {
      error: {
        message: errorMessage,
        where: 'generateQuizWithGroq'
      }
    };
  }
}

/**
 * Genera un quiz usando la API de Google Gemini
 * Solo procesa contenido de texto (no imágenes)
 */
export async function generateQuizWithGemini(
  params: UserPromptParams,
  config: { apiKey: string; model?: string }
): Promise<GenerateQuizResponse> {
  const { apiKey, model = 'gemini-1.5-flash' } = config;
  
  try {
    const userPrompt = createUserPrompt(params);
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Intentar primero con el modelo especificado
    let actualModel = model;
    
    // Si falla con el modelo especificado, hacer fallback a gemini-pro
    let geminiModel;
    try {
      geminiModel = genAI.getGenerativeModel({ 
        model: actualModel,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8000,
          responseMimeType: 'application/json',
        },
      });
    } catch (modelError) {
      logger.warn('Model not available, falling back to gemini-pro', { 
        requestedModel: actualModel,
        error: modelError instanceof Error ? modelError.message : 'Unknown'
      }, 'AI_CLIENT');
      
      actualModel = 'gemini-pro';
      geminiModel = genAI.getGenerativeModel({ 
        model: actualModel,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8000,
          responseMimeType: 'application/json',
        },
      });
    }

    // Modo solo texto - no procesamos imágenes
    logger.info('Generating quiz from text content only', { 
      model: actualModel,
      documentsCount: params.documents.length
    }, 'AI_CLIENT');
    
    const prompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
    const result = await geminiModel.generateContent(prompt);
    
    const response = await result.response;
    
    // Verificar si hay problemas con la respuesta
    if (!response || !response.text) {
      const candidates = result.response?.candidates;
      if (candidates && candidates[0]?.finishReason) {
        const finishReason = candidates[0].finishReason;
        if (finishReason === 'MAX_TOKENS' || finishReason === 'RECITATION') {
          throw new Error('CONTEXT_LENGTH_EXCEEDED: El contenido es demasiado extenso para procesar');
        }
        if (finishReason === 'SAFETY') {
          throw new Error('Gemini bloqueó la respuesta por razones de seguridad. Intenta con otro documento.');
        }
      }
      throw new Error('Respuesta vacía o incompleta de Gemini');
    }
    
    const content = response.text();
    
    if (!content) {
      throw new Error('Respuesta vacía de Gemini');
    }

    // Log condicional para debugging de desarrollo únicamente
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AI_RESPONSES === 'true') {
      console.log('Gemini response length:', content.length);
      console.log('Gemini model used:', actualModel);
    }

    return parseAIResponse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Detectar errores específicos de Gemini
    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
      return {
        error: {
          message: 'La API key de Gemini no es válida. Verifica tu configuración.',
          where: 'generateQuizWithGemini'
        }
      };
    }
    
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      return {
        error: {
          message: 'Se ha excedido la cuota de la API de Gemini. Intenta más tarde o reduce el tamaño del documento.',
          where: 'generateQuizWithGemini'
        }
      };
    }
    
    // Mejorar mensaje de error para context_length_exceeded
    if (errorMessage.includes('CONTEXT_LENGTH_EXCEEDED') || 
        errorMessage.includes('reduce the length') ||
        errorMessage.includes('context_length_exceeded') ||
        errorMessage.includes('MAX_TOKENS')) {
      return {
        error: {
          message: 'CONTEXT_LENGTH_EXCEEDED: El documento es demasiado extenso. Divide el documento en partes más pequeñas o reduce el número de preguntas.',
          where: 'generateQuizWithGemini'
        }
      };
    }
    
    console.error('Error generando quiz con Gemini:', error);
    return {
      error: {
        message: errorMessage,
        where: 'generateQuizWithGemini'
      }
    };
  }
}

/**
 * Genera un quiz usando la API de Anthropic (Claude)
 */
export async function generateQuizWithClaude(
  params: UserPromptParams,
  config: { apiKey: string; model?: string }
): Promise<GenerateQuizResponse> {
  const { apiKey, model = 'claude-3-5-sonnet-20241022' } = config;
  
  try {
    const userPrompt = createUserPrompt(params);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000, // Aumentado para permitir respuestas completas
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      await handleAPIError(response, 'Claude');
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('Respuesta vacía de Claude');
    }

    // Log condicional para debugging de desarrollo únicamente
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AI_RESPONSES === 'true') {
      console.log('Claude response length:', content.length);
    }

    return parseAIResponse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Mejorar mensaje de error para context_length_exceeded
    if (errorMessage.includes('CONTEXT_LENGTH_EXCEEDED') || 
        errorMessage.includes('reduce the length') ||
        errorMessage.includes('context_length_exceeded')) {
      return {
        error: {
          message: 'CONTEXT_LENGTH_EXCEEDED: El documento es demasiado extenso. Se necesita reducir el contenido.',
          where: 'generateQuizWithClaude'
        }
      };
    }
    
    console.error('Error generando quiz con Claude:', error);
    return {
      error: {
        message: errorMessage,
        where: 'generateQuizWithClaude'
      }
    };
  }
}

/**
 * Genera un quiz usando el proveedor especificado
 */
export async function generateQuiz(
  params: UserPromptParams,
  provider: AIProvider
): Promise<GenerateQuizResponse> {
  switch (provider.name) {
    case 'openai':
      return generateQuizWithOpenAI(params, { 
        apiKey: provider.apiKey, 
        model: provider.model 
      });
    case 'anthropic':
      return generateQuizWithClaude(params, { 
        apiKey: provider.apiKey, 
        model: provider.model 
      });
    case 'groq':
      return generateQuizWithGroq(params, { 
        apiKey: provider.apiKey, 
        model: provider.model 
      });
    case 'gemini':
      return generateQuizWithGemini(params, { 
        apiKey: provider.apiKey, 
        model: provider.model 
      });
    default:
      return {
        error: {
          message: `Proveedor no soportado: ${provider.name}`,
          where: 'generateQuiz'
        }
      };
  }
}

/**
 * Valida la respuesta del AI y la reformatea si es necesario
 */
export function validateAndFixQuizResponse(response: GenerateQuizResponse): GenerateQuizResponse {
  // Función auxiliar para validar pregunta individual
  const validatePregunta = (pregunta: any, index: number): { valid: boolean; errors: string[]; fixed?: any } => {
    const errors: string[] = [];
    const fixed = { ...pregunta };
    
    if (!pregunta.enunciado || typeof pregunta.enunciado !== 'string' || pregunta.enunciado.trim().length === 0) {
      errors.push(`Pregunta ${index + 1}: enunciado faltante o inválido`);
    }
    
    if (!pregunta.tipo || !['opcion_multiple', 'verdadero_falso', 'respuesta_corta'].includes(pregunta.tipo)) {
      errors.push(`Pregunta ${index + 1}: tipo inválido (${pregunta.tipo})`);
    }
    
    if (pregunta.tipo === 'opcion_multiple' && (!Array.isArray(pregunta.opciones) || pregunta.opciones.length === 0)) {
      errors.push(`Pregunta ${index + 1}: opciones faltantes para pregunta de opción múltiple`);
    }
    
    if (pregunta.respuesta_correcta === undefined || pregunta.respuesta_correcta === null) {
      errors.push(`Pregunta ${index + 1}: respuesta correcta faltante`);
    }
    
    // Corregir explicación faltante automáticamente
    if (!pregunta.explicacion || typeof pregunta.explicacion !== 'string' || pregunta.explicacion.trim().length === 0) {
      fixed.explicacion = `Explicación generada automáticamente para la pregunta ${index + 1}.`;
    }
    
    // Corregir citas faltantes automáticamente
    if (!Array.isArray(pregunta.citas) || pregunta.citas.length === 0) {
      fixed.citas = [{ chunk_id: 'auto', page: 1, evidencia: 'Cita generada automáticamente' }];
    }
    
    return { valid: errors.length === 0, errors, fixed };
  };

  // Función auxiliar para validar estructura principal
  const validateMainStructure = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Intentar normalizar la respuesta si viene en formato incorrecto
    if (!response.result && (response as any).quiz) {
      // La respuesta tiene quiz directamente sin result
      (response as any).result = {
        quiz: (response as any).quiz,
        metadata: (response as any).metadata || {
          titulo: 'Quiz generado',
          n_documentos: 1,
          total_paginas: 1
        },
        summary: (response as any).summary || 'Resumen no disponible',
        study_tips: (response as any).study_tips || []
      };
      delete (response as any).quiz;
    }
    
    if (!response.result) {
      errors.push('Respuesta sin result');
      return { valid: false, errors };
    }
    
    if (!response.result.metadata) {
      // Crear metadata por defecto
      response.result.metadata = {
        titulo: 'Quiz generado',
        idioma: 'es',
        nivel: 'medio',
        generado_en: new Date().toISOString()
      };
    }
    
    if (!response.result.summary) {
      // Crear summary por defecto
      response.result.summary = {
        overview: 'Resumen generado automáticamente del contenido.',
        sections: [],
        glosario: [],
        formulas_o_tablas: [],
        ejemplos_clave: []
      };
    }
    
    if (!response.result.quiz) {
      errors.push('Quiz faltante');
      return { valid: false, errors };
    }
    
    if (!response.result.quiz.preguntas || !Array.isArray(response.result.quiz.preguntas)) {
      errors.push('Preguntas faltantes o inválidas');
      return { valid: false, errors };
    }
    
    if (response.result.quiz.preguntas.length === 0) {
      errors.push('No hay preguntas en el quiz');
      return { valid: false, errors };
    }
    
    return { valid: errors.length === 0, errors };
  };

  try {
    // Validar estructura principal
    const structureValidation = validateMainStructure();
    if (!structureValidation.valid) {
      // Si tenemos quiz pero con array de preguntas vacío, auto-generar preguntas
      if (response.result?.quiz && Array.isArray(response.result.quiz.preguntas) && response.result.quiz.preguntas.length === 0) {
        
        const autoQuestions = [{
          id: 'auto-q1',
          tipo: 'respuesta_corta' as const,
          dificultad: 'baja' as const,
          etiquetas: ['contenido-general'],
          enunciado: '¿Cuál es el tema principal del documento?',
          respuesta_correcta: response.result.metadata?.titulo || 'Tema del documento',
          explicacion: 'Esta pregunta se basa en el contenido general del documento.',
          citas: [{ chunk_id: 'auto', page: 1, evidencia: 'Contenido del documento' }]
        }];
        
        const correctedResponse = {
          ...response,
          result: {
            ...response.result,
            quiz: {
              ...response.result.quiz,
              n_generadas: 1,
              preguntas: autoQuestions
            },
            notes: {
              ...(response.result.notes || {}),
              insuficiente_evidencia: true,
              detalle: 'Preguntas generadas automáticamente debido a array vacío de preguntas'
            }
          }
        };
        
        return correctedResponse;
      }
      
      // Si falta el quiz pero tenemos metadata y summary, intentar crear un quiz básico
      if (response.result?.metadata && response.result?.summary && !response.result?.quiz) {
        
        const autoQuiz = {
          n_solicitadas: 1,
          n_generadas: 1,
          preguntas: [{
            id: 'auto-q1',
            tipo: 'respuesta_corta' as const,
            dificultad: 'baja' as const,
            etiquetas: ['contenido-general'],
            enunciado: '¿Cuál es el tema principal del documento?',
            respuesta_correcta: response.result.metadata.titulo || 'Tema del documento',
            explicacion: 'Esta pregunta se basa en el contenido general del documento.',
            citas: [{ chunk_id: 'auto', page: 1, evidencia: 'Contenido del documento' }]
          }]
        };
        
        const fixedResponse = {
          ...response,
          result: {
            ...response.result,
            quiz: autoQuiz,
            study_tips: response.result.study_tips || ['Revisar el resumen del documento'],
            notes: {
              insuficiente_evidencia: true,
              detalle: 'Quiz generado automáticamente debido a contenido insuficiente'
            }
          }
        };
        
        return fixedResponse;
      }
      
      return {
        ...response,
        error: {
          message: `Estructura inválida: ${structureValidation.errors.join(', ')}`,
          where: 'validateAndFixQuizResponse'
        }
      };
    }

    const quiz = response.result!.quiz;
    const criticalErrors: string[] = [];
    const fixedQuestions: any[] = [];

    // Validar y corregir cada pregunta
    quiz.preguntas.forEach((pregunta: any, index: number) => {
      const validation = validatePregunta(pregunta, index);
      
      if (validation.valid) {
        // Pregunta válida, usar como está
        fixedQuestions.push(pregunta);
      } else if (validation.fixed) {
        // Pregunta con errores menores que se pueden corregir
        fixedQuestions.push(validation.fixed);
      } else {
        // Errores críticos que no se pueden corregir
        criticalErrors.push(...validation.errors);
      }
    });

    // Solo fallar si hay errores críticos que no se pueden corregir
    if (criticalErrors.length > 0) {
      return {
        ...response,
        error: {
          message: `Errores críticos de validación: ${criticalErrors.join('; ')}`,
          where: 'validateAndFixQuizResponse'
        }
      };
    }

    // Deduplicar preguntas basándose en el enunciado
    const deduplicatedQuestions: any[] = [];
    const seenQuestions = new Set<string>();
    let duplicatesRemoved = 0;
    
    fixedQuestions.forEach(pregunta => {
      // Normalizar el enunciado para comparación
      const normalizedEnunciado = pregunta.enunciado.toLowerCase().trim().replaceAll(/\s+/g, ' ');
      
      if (!seenQuestions.has(normalizedEnunciado)) {
        seenQuestions.add(normalizedEnunciado);
        deduplicatedQuestions.push(pregunta);
      } else {
        duplicatesRemoved++;
      }
    });

    // Preparar notas sobre el proceso de limpieza
    const existingNotes = response.result!.notes || { insuficiente_evidencia: false, detalle: '' };
    let cleanupDetails = [];
    
    if (duplicatesRemoved > 0) {
      cleanupDetails.push(`Se eliminaron ${duplicatesRemoved} pregunta(s) duplicada(s)`);
    }
    
    const correctedQuestions = fixedQuestions.length - deduplicatedQuestions.length;
    if (correctedQuestions > 0) {
      cleanupDetails.push(`Se corrigieron campos faltantes en ${correctedQuestions} pregunta(s)`);
    }

    const finalNotes = {
      ...existingNotes,
      detalle: [existingNotes.detalle, ...cleanupDetails].filter(Boolean).join('. ')
    };

    // Aplicar las correcciones al response
    const fixedResponse = {
      ...response,
      result: {
        ...response.result!,
        quiz: {
          ...quiz,
          preguntas: deduplicatedQuestions,
          n_generadas: deduplicatedQuestions.length // Actualizar el conteo real
        },
        notes: finalNotes
      }
    };

    return fixedResponse;

  } catch (error) {
    return {
      ...response,
      error: {
        message: `Error durante validación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        where: 'validateAndFixQuizResponse'
      }
    };
  }
}

/**
 * Calcula métricas de calidad del quiz generado
 */
export function calculateQuizQuality(response: GenerateQuizResponse) {
  if (response.error || !response.result) {
    return null;
  }

  const quiz = response.result.quiz;
  const preguntas = quiz.preguntas;
  
  // Distribución de dificultades
  const dificultades = {
    baja: preguntas.filter(p => p.dificultad === 'baja').length,
    media: preguntas.filter(p => p.dificultad === 'media').length,
    alta: preguntas.filter(p => p.dificultad === 'alta').length
  };

  // Distribución de tipos
  const tipos = {
    opcion_multiple: preguntas.filter(p => p.tipo === 'opcion_multiple').length,
    respuesta_corta: preguntas.filter(p => p.tipo === 'respuesta_corta').length,
    verdadero_falso: preguntas.filter(p => p.tipo === 'verdadero_falso').length
  };

  // Promedio de citas por pregunta
  const totalCitas = preguntas.reduce((sum, p) => sum + p.citas.length, 0);
  const promedioCitas = totalCitas / preguntas.length;

  // Longitud promedio de enunciados
  const longitudEnunciados = preguntas.map(p => p.enunciado.length);
  const promedioLongitud = longitudEnunciados.reduce((sum, len) => sum + len, 0) / longitudEnunciados.length;

  return {
    totalPreguntas: preguntas.length,
    completitud: quiz.n_generadas / quiz.n_solicitadas,
    distribucionDificultades: dificultades,
    distribucionTipos: tipos,
    promedioCitasPorPregunta: promedioCitas,
    promedioLongitudEnunciado: Math.round(promedioLongitud),
    tieneEvidenciaInsuficiente: response.result.notes?.insuficiente_evidencia || false
  };
}