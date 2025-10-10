import { NextRequest, NextResponse } from 'next/server';
import { validateGenerateQuizRequest } from '@/lib/validation';
import { generateQuiz, validateAndFixQuizResponse, calculateQuizQuality, AIProvider } from '@/utils/ai-client';
import { UserPromptParams } from '@/prompts/user';
import { logger, startTimer } from '@/utils/logger';
import { 
  formatErrorResponse, 
  ValidationError, 
  AIProviderError, 
  ConfigurationError,
  withErrorHandling,
  retryWithBackoff,
  withTimeout
} from '@/utils/error-handling';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const timer = startTimer('quiz_generation', { requestId });
  
  try {
    logger.info('Quiz generation request started', { requestId }, 'GENERATE_QUIZ_API');
    
    // Parsear y validar el body de la request
    const body = await withErrorHandling(
      () => request.json(),
      { operation: 'parse_request_body', source: 'GENERATE_QUIZ_API' }
    );
    
    const validation = validateGenerateQuizRequest(body);
    
    if (!validation.success) {
      throw new ValidationError('Datos de entrada inválidos', { 
        validationErrors: validation.error,
        requestId 
      });
    }

    const requestData = validation.data;
    
    // Obtener configuración del proveedor de AI desde headers o variables de entorno
    const aiProvider = getAIProviderFromRequest(request);
    if (!aiProvider) {
      throw new ConfigurationError('Configuración de AI no válida. Proporciona API key y proveedor.');
    }

    // Logs de la request validada
    logger.info('Request validation successful', {
      requestId,
      nivel: requestData.nivel,
      n_preguntas: requestData.n_preguntas,
      provider: aiProvider.name,
      documentsCount: requestData.documents.length
    }, 'GENERATE_QUIZ_API');

    // Validar contenido del documento
    const totalTextLength = requestData.documents.reduce((total, doc) => {
      if (doc.text) {
        return total + doc.text.length;
      }
      if (doc.pages) {
        return total + doc.pages.reduce((pageTotal, page) => pageTotal + page.text.length, 0);
      }
      return total;
    }, 0);

    // Validaciones de contenido
    if (totalTextLength < 500) {
      logger.warn('Document content is very short', {
        requestId,
        textLength: totalTextLength,
        nPreguntas: requestData.n_preguntas
      }, 'GENERATE_QUIZ_API');
      
      throw new ValidationError('El documento contiene muy poco texto para generar un quiz. Asegúrate de que el PDF tenga contenido textual suficiente.');
    }

    // Validar proporción de preguntas vs contenido
    const wordsCount = totalTextLength / 5; // Aproximadamente 5 caracteres por palabra
    const maxQuestionsForContent = Math.floor(wordsCount / 50); // 1 pregunta por cada ~50 palabras
    
    if (requestData.n_preguntas > maxQuestionsForContent) {
      logger.warn('Too many questions requested for content length', {
        requestId,
        textLength: totalTextLength,
        wordsCount,
        nPreguntas: requestData.n_preguntas,
        maxRecommended: maxQuestionsForContent
      }, 'GENERATE_QUIZ_API');
      
      throw new ValidationError(`El documento es demasiado corto para generar ${requestData.n_preguntas} preguntas. Se recomienda máximo ${maxQuestionsForContent} preguntas para este contenido.`);
    }

    // Preparar parámetros para el prompt
    const promptParams: UserPromptParams = {
      idioma: requestData.idioma,
      nivel: requestData.nivel,
      n_preguntas: requestData.n_preguntas,
      p_mcq: requestData.proporcion_tipos.opcion_multiple,
      p_short: requestData.proporcion_tipos.respuesta_corta,
      p_tf: requestData.proporcion_tipos.verdadero_falso,
      temas_prioritarios: requestData.temas_prioritarios,
      documents: requestData.documents,
      titulo_quiz_o_tema: requestData.titulo_quiz_o_tema
    };

    // Generar el quiz con retry, timeout y fallback automático
    let aiResponse = await withTimeout(
      retryWithBackoff(
        () => generateQuiz(promptParams, aiProvider),
        3,
        1000,
        { operation: 'generate_quiz' }
      ),
      60000, // 60 segundos timeout
      'Quiz generation timed out'
    );

    // Si OpenAI falla por rate limit, intentar con Groq (gratis) y luego Claude
    if (aiResponse.error && aiProvider.name === 'openai') {
      const errorMessage = aiResponse.error.message.toLowerCase();
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('usage')) {
        logger.info('OpenAI rate limit reached, trying Groq as fallback', { 
          requestId, 
          originalError: aiResponse.error.message 
        }, 'GENERATE_QUIZ_API');

        // Intentar primero con Groq (gratis)
        const groqApiKey = process.env.GROQ_API_KEY;
        if (groqApiKey) {
          const groqProvider: AIProvider = {
            name: 'groq',
            apiKey: groqApiKey,
            model: 'llama-3.1-8b-instant'
          };

          try {
            aiResponse = await withTimeout(
              retryWithBackoff(
                () => generateQuiz(promptParams, groqProvider),
                2,
                1000,
                { operation: 'generate_quiz_groq_fallback' }
              ),
              45000,
              'Groq fallback generation timed out'
            );

            logger.info('Groq fallback successful', { requestId }, 'GENERATE_QUIZ_API');
          } catch (groqError) {
            logger.warn('Groq fallback failed, trying Claude', { 
              requestId, 
              groqError: groqError instanceof Error ? groqError.message : 'Unknown error'
            }, 'GENERATE_QUIZ_API');

            // Si Groq falla, intentar con Claude
            const claudeApiKey = process.env.ANTHROPIC_API_KEY;
            if (claudeApiKey) {
              const claudeProvider: AIProvider = {
                name: 'anthropic',
                apiKey: claudeApiKey,
                model: 'claude-3-5-sonnet-20241022'
              };

              try {
                aiResponse = await withTimeout(
                  retryWithBackoff(
                    () => generateQuiz(promptParams, claudeProvider),
                    2,
                    1000,
                    { operation: 'generate_quiz_claude_fallback' }
                  ),
                  45000,
                  'Claude fallback generation timed out'
                );

                logger.info('Claude fallback successful', { requestId }, 'GENERATE_QUIZ_API');
              } catch (claudeError) {
                logger.error('All fallbacks failed', { 
                  requestId, 
                  claudeError: claudeError instanceof Error ? claudeError.message : 'Unknown error'
                }, 'GENERATE_QUIZ_API');
              }
            }
          }
        } else {
          logger.warn('No Groq API key available, trying Claude directly', { requestId }, 'GENERATE_QUIZ_API');
          
          const claudeApiKey = process.env.ANTHROPIC_API_KEY;
          if (claudeApiKey) {
            const claudeProvider: AIProvider = {
              name: 'anthropic',
              apiKey: claudeApiKey,
              model: 'claude-3-5-sonnet-20241022'
            };

            try {
              aiResponse = await withTimeout(
                retryWithBackoff(
                  () => generateQuiz(promptParams, claudeProvider),
                  2,
                  1000,
                  { operation: 'generate_quiz_claude_fallback' }
                ),
                45000,
                'Claude fallback generation timed out'
              );

              logger.info('Claude fallback successful', { requestId }, 'GENERATE_QUIZ_API');
            } catch (claudeError) {
              logger.error('Claude fallback also failed', { 
                requestId, 
                claudeError: claudeError instanceof Error ? claudeError.message : 'Unknown error'
              }, 'GENERATE_QUIZ_API');
            }
          }
        }
      }
    }
    
    // Log de la respuesta cruda de la IA para debugging
    logger.info('Raw AI response structure', {
      requestId,
      hasResult: !!aiResponse.result,
      hasError: !!aiResponse.error,
      resultKeys: aiResponse.result ? Object.keys(aiResponse.result) : [],
      errorMessage: aiResponse.error?.message
    }, 'GENERATE_QUIZ_API');
    
    // Validar y corregir la respuesta (no es async)
    const validatedResponse = validateAndFixQuizResponse(aiResponse);
    
    if (validatedResponse.error) {
      // Log detallado del error de validación
      logger.error('Quiz response validation failed', {
        requestId,
        provider: aiProvider.name,
        model: aiProvider.model,
        validationError: validatedResponse.error,
        originalResponse: {
          hasResult: !!aiResponse.result,
          resultStructure: aiResponse.result ? {
            hasMetadata: !!aiResponse.result.metadata,
            hasSummary: !!aiResponse.result.summary,
            hasQuiz: !!aiResponse.result.quiz,
            quizStructure: aiResponse.result.quiz ? {
              hasPreguntas: !!aiResponse.result.quiz.preguntas,
              preguntasLength: aiResponse.result.quiz.preguntas?.length,
              firstPregunta: aiResponse.result.quiz.preguntas?.[0]
            } : null
          } : null
        }
      }, 'GENERATE_QUIZ_API');
      
      throw new AIProviderError('Error validando respuesta del AI', aiProvider.name, {
        error: validatedResponse.error,
        requestId
      });
    }

    // Calcular métricas de calidad
    const qualityMetrics = calculateQuizQuality(validatedResponse);

    // Log del éxito y métricas
    timer.end({
      requestId,
      provider: aiProvider.name,
      questionCount: validatedResponse.result?.quiz?.preguntas?.length || 0,
      qualityScore: qualityMetrics?.completitud || 0
    });
    
    logger.info('Quiz generation completed successfully', {
      requestId,
      provider: aiProvider.name,
      questionCount: validatedResponse.result?.quiz?.preguntas?.length || 0
    }, 'GENERATE_QUIZ_API');

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: validatedResponse,
      metadata: {
        requestId,
        provider: aiProvider.name,
        generatedAt: new Date().toISOString(),
        quality_metrics: qualityMetrics
      }
    });

  } catch (error) {
    timer.end({
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });

    const formattedError = formatErrorResponse(error as Error, '/api/generate-quiz');
    const statusCode = formattedError.error.statusCode || 500;
    
    return NextResponse.json(formattedError, { status: statusCode });
  }
}

function getAIProviderFromRequest(request: NextRequest): AIProvider | null {
  // Usar configuración fija del servidor
  const envProvider = process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'groq' | undefined;
  const envApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY;
  const envModel = process.env.AI_MODEL;

  if (envProvider && envApiKey) {
    const getDefaultModel = (provider: string) => {
      switch (provider) {
        case 'openai': return 'gpt-4o-mini';
        case 'anthropic': return 'claude-3-5-sonnet-20241022';
        case 'groq': return 'llama-3.1-8b-instant';
        default: return 'gpt-4o-mini';
      }
    };

    return {
      name: envProvider,
      apiKey: envApiKey,
      model: envModel || getDefaultModel(envProvider)
    };
  }

  // Fallback a configuración por defecto - intentar Groq primero (es gratis)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    return {
      name: 'groq',
      apiKey: groqApiKey,
      model: 'llama-3.1-8b-instant'
    };
  }

  // Fallback a configuración por defecto de OpenAI
  const defaultApiKey = process.env.OPENAI_API_KEY;
  if (defaultApiKey) {
    return {
      name: 'openai',
      apiKey: defaultApiKey,
      model: 'gpt-4o-mini'
    };
  }

  return null;
}

// Método GET para verificar el estado del servicio
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Quiz Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate-quiz': 'Generar quiz a partir de documentos',
      'GET /api/generate-quiz': 'Estado del servicio'
    }
  });
}