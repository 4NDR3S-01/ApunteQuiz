import { SYSTEM_PROMPT } from '@/prompts/system';
import { createUserPrompt, UserPromptParams } from '@/prompts/user';
import { GenerateQuizResponse } from '@/types';

export interface AIProvider {
  name: 'openai' | 'anthropic' | 'groq';
  model: string;
  apiKey: string;
}

/**
 * Maneja errores de respuesta HTTP de APIs
 */
async function handleAPIError(response: Response, providerName: string): Promise<never> {
  try {
    const errorData = await response.text();
    const errorMessage = errorData.includes('<!DOCTYPE') || errorData.includes('<html')
      ? `API Error (${response.status}): HTML response received instead of JSON`
      : (() => {
          try {
            const errorJson = JSON.parse(errorData);
            return errorJson.error?.message || errorData;
          } catch {
            return errorData;
          }
        })();
    throw new Error(`Error de ${providerName}: ${errorMessage}`);
  } catch (error) {
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
  // Verificar si la respuesta parece truncada
  if (!content.trim().endsWith('}') && !content.trim().endsWith('}]')) {
    throw new Error('La respuesta parece estar truncada (no termina con } o }])');
  }

  try {
    return JSON.parse(content) as GenerateQuizResponse;
  } catch (parseError) {
    throw new Error(`Error parseando JSON: ${parseError}`);
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
        max_tokens: 3000, // Reducido considerablemente para evitar rate limits
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
    console.error('Error generando quiz con OpenAI:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
        where: 'generateQuizWithOpenAI'
      }
    };
  }
}

/**
 * Genera un quiz usando la API de Groq (GRATIS)
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
        max_tokens: 3000,
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

    // Log condicional para debugging de desarrollo únicamente
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AI_RESPONSES === 'true') {
      console.log('Groq response length:', content.length);
    }

    return parseAIResponse(content);
  } catch (error) {
    console.error('Error generando quiz con Groq:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
        where: 'generateQuizWithGroq'
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
        max_tokens: 3000, // Reducido considerablemente para evitar rate limits
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
    console.error('Error generando quiz con Claude:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
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
    
    if (!response.result) {
      errors.push('Respuesta sin result');
      return { valid: false, errors };
    }
    
    if (!response.result.metadata) {
      errors.push('Metadata faltante');
    }
    
    if (!response.result.summary) {
      errors.push('Summary faltante');
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
      const normalizedEnunciado = pregunta.enunciado.toLowerCase().trim().replace(/\s+/g, ' ');
      
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