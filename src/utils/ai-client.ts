import { SYSTEM_PROMPT } from '@/prompts/system';
import { createUserPrompt, UserPromptParams } from '@/prompts/user';
import { GenerateQuizResponse } from '@/types';

export interface AIProvider {
  name: 'openai' | 'anthropic';
  model: string;
  apiKey: string;
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
        max_tokens: 4000,
        response_format: { type: 'json_object' } // Forzar respuesta JSON
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de OpenAI: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Respuesta vacía de OpenAI');
    }

    try {
      return JSON.parse(content) as GenerateQuizResponse;
    } catch (parseError) {
      throw new Error(`Error parseando JSON de OpenAI: ${parseError}`);
    }
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
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de Claude: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('Respuesta vacía de Claude');
    }

    try {
      return JSON.parse(content) as GenerateQuizResponse;
    } catch (parseError) {
      throw new Error(`Error parseando JSON de Claude: ${parseError}`);
    }
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
  if (response.error) {
    return response;
  }

  if (!response.result) {
    return {
      error: {
        message: 'Respuesta no contiene resultado',
        where: 'validateAndFixQuizResponse'
      }
    };
  }

  const result = response.result;

  // Validar estructura básica
  if (!result.metadata || !result.summary || !result.quiz) {
    return {
      error: {
        message: 'Estructura de respuesta incompleta',
        where: 'validateAndFixQuizResponse'
      }
    };
  }

  // Corregir n_generadas si está mal
  if (result.quiz.n_generadas !== result.quiz.preguntas.length) {
    result.quiz.n_generadas = result.quiz.preguntas.length;
  }

  // Validar y corregir preguntas
  for (const pregunta of result.quiz.preguntas) {
    // Asegurar que preguntas de opción múltiple tengan opciones
    if (pregunta.tipo === 'opcion_multiple' && !pregunta.opciones) {
      return {
        error: {
          message: `Pregunta ${pregunta.id} de opción múltiple sin opciones`,
          where: 'validateAndFixQuizResponse'
        }
      };
    }

    // Corregir preguntas de verdadero/falso con respuesta string
    if (pregunta.tipo === 'verdadero_falso' && typeof pregunta.respuesta_correcta !== 'boolean') {
      const respuestaStr = String(pregunta.respuesta_correcta).toLowerCase();
      if (respuestaStr === 'verdadero' || respuestaStr === 'true' || respuestaStr === 'sí' || respuestaStr === 'si') {
        pregunta.respuesta_correcta = true;
      } else if (respuestaStr === 'falso' || respuestaStr === 'false' || respuestaStr === 'no') {
        pregunta.respuesta_correcta = false;
      } else {
        return {
          error: {
            message: `Pregunta ${pregunta.id} de verdadero/falso con respuesta inválida: ${pregunta.respuesta_correcta}`,
            where: 'validateAndFixQuizResponse'
          }
        };
      }
    }

    // Asegurar que todas las preguntas tengan al menos una cita
    if (!pregunta.citas || pregunta.citas.length === 0) {
      return {
        error: {
          message: `Pregunta ${pregunta.id} sin citas`,
          where: 'validateAndFixQuizResponse'
        }
      };
    }
  }

  return { result };
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
    tieneEvidenciaInsuficiente: response.result.notes.insuficiente_evidencia
  };
}