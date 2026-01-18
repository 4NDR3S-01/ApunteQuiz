import { NextRequest, NextResponse } from 'next/server';
import { validateGenerateQuizRequest } from '@/lib/validation';
import { 
  generateQuiz, 
  validateAndFixQuizResponse, 
  calculateQuizQuality, 
  AIProvider,
  calculatePromptSize,
  exceedsContextLimit,
  getContextLimit
} from '@/utils/ai-client';
import { UserPromptParams } from '@/prompts/user';
import { GenerateQuizResponse } from '@/types';
import { logger, startTimer } from '@/utils/logger';
import { reduceDocumentContent, splitDocumentIntoChunks } from '@/utils/document-processor.server';
import { 
  formatErrorResponse, 
  ValidationError, 
  AIProviderError, 
  ConfigurationError,
  withErrorHandling,
  retryWithBackoff,
  withTimeout
} from '@/utils/error-handling';
import { getRateLimitIdentifier } from '@/utils/rate-limit';

export async function POST(request: NextRequest) {
  // Aplicar rate limiting: 5 requests por minuto por IP
  const identifier = getRateLimitIdentifier(request);
  const rateLimit = await import('@/utils/rate-limit').then(m => 
    m.checkRateLimit(identifier, '/api/generate-quiz', 5, 60000)
  );
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          message: 'Demasiadas solicitudes. Por favor, espera un momento antes de generar otro quiz.',
          code: 'RATE_LIMIT_EXCEEDED',
          statusCode: 429,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetTime)
        }
      }
    );
  }
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
    
    // Validar que los documentos no sean solo imágenes
    // Verificar si algún documento tiene el error DOCUMENT_ONLY_IMAGES
    const hasOnlyImageDocuments = requestData.documents.some(doc => {
      // Verificar si el documento tiene muy poco texto
      const textLength = doc.text?.length || 
        (doc.pages?.reduce((sum, page) => sum + (page.text?.length || 0), 0) || 0);
      return textLength < 200;
    });
    
    if (hasOnlyImageDocuments) {
      throw new ValidationError(
        'El documento contiene solo imágenes y no se puede procesar. ' +
        'Por favor, sube un documento PDF que contenga texto.'
      );
    }
    
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
    // Calcular palabras reales (no estimación)
    const fullText = requestData.documents.reduce((text, doc) => {
      if (doc.text) return text + doc.text;
      if (doc.pages) return text + doc.pages.map(p => p.text).join(' ');
      return text;
    }, '');
    const wordsCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    // Escala progresiva basada en el contenido:
    // - Recomendado equilibrado: 1 pregunta por cada 100 palabras (óptimo)
    // - Máximo generoso: 1 pregunta por cada 50 palabras (extensivo)
    const recommendedBalanced = Math.floor(wordsCount / 100);
    const maxGenerous = Math.floor(wordsCount / 50);
    const maxQuestionsForContent = Math.min(maxGenerous, 100);
    const recommendedMax = Math.min(recommendedBalanced, 100);
    
    if (requestData.n_preguntas > maxQuestionsForContent && maxQuestionsForContent > 0) {
      logger.warn('Too many questions requested for content length', {
        requestId,
        textLength: totalTextLength,
        wordsCount,
        nPreguntas: requestData.n_preguntas,
        maxRecommended: maxQuestionsForContent,
        recommendedBalanced: recommendedMax
      }, 'GENERATE_QUIZ_API');
      
      if (requestData.n_preguntas <= recommendedMax * 1.2) {
        // Si está cerca del recomendado equilibrado, sugerir ese rango
        throw new ValidationError(`Se recomienda máximo ${recommendedMax} preguntas para un quiz equilibrado. Puedes usar hasta ${maxQuestionsForContent} preguntas para un quiz más extensivo.`);
      } else {
        throw new ValidationError(`El documento es demasiado corto para generar ${requestData.n_preguntas} preguntas. Máximo recomendado: ${maxQuestionsForContent} preguntas.`);
      }
    }

    // ESTRATEGIA PARA DOCUMENTOS GRANDES: División automática en chunks
    // Si el documento es muy grande, dividirlo en chunks y procesar por separado
    const totalPages = requestData.documents.reduce((sum, doc) => {
      if (doc.type === 'pdf' && doc.pages) return sum + doc.pages.length;
      return sum + 1;
    }, 0);

    // Ajustar umbrales según el modelo y proveedor
    // Ahora con extracción PDF correcta (sin duplicación), chunks más grandes
    // gemini-pro: 30K tokens -> chunks de 50 páginas, umbral 100
    // gemini-1.5-flash: 1M tokens -> chunks de 300 páginas, umbral 600
    // gemini-1.5-pro: 2M tokens -> chunks de 500 páginas, umbral 1000
    // groq/compound-mini: 70K TPM -> chunks de 20 páginas, umbral 30
    const modelConfig = {
      'gemini-pro': { threshold: 100, chunkSize: 50 },
      'gemini-1.5-flash': { threshold: 600, chunkSize: 300 },
      'gemini-1.5-pro': { threshold: 1000, chunkSize: 500 },
      'groq/compound': { threshold: 30, chunkSize: 20 },
      'groq/compound-mini': { threshold: 30, chunkSize: 20 },
      'meta-llama/llama-4-scout-17b-16e-instruct': { threshold: 25, chunkSize: 15 },
      'mixtral-8x7b-32768': { threshold: 20, chunkSize: 15 },
      'llama-3.3-70b-versatile': { threshold: 20, chunkSize: 15 },
      'llama-3.1-70b-versatile': { threshold: 20, chunkSize: 15 },
      'llama-3.1-8b-instant': { threshold: 15, chunkSize: 10 }
    };
    
    const config = modelConfig[aiProvider.model as keyof typeof modelConfig] || { threshold: 30, chunkSize: 20 };

    // Desactivar chunking por ahora - necesita reimplementación
    let useChunkedProcessing = false;
    let allChunks: string[] = [];
    
    // NOTA: Chunking desactivado temporalmente - necesita reimplementación completa
    // El sistema de chunking requiere que splitDocumentIntoChunks devuelva DocumentInput[] en lugar de string[]

    // Usar el número recomendado que calculó el frontend (que el usuario vio en la UI)
    // Si no viene en el request, calcularlo aquí como fallback
    let recommendedOptimal: number;
    if (requestData.n_preguntas_recomendadas) {
      recommendedOptimal = requestData.n_preguntas_recomendadas;
    } else {
      const fullText = requestData.documents.reduce((text, doc) => {
        if (doc.text) return text + doc.text;
        if (doc.pages) return text + doc.pages.map(p => p.text).join(' ');
        return text;
      }, '');
      const wordsCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
      recommendedOptimal = Math.max(Math.floor(wordsCount / 150), 1);
    }
    
    // Preparar parámetros para el prompt
    let promptParams: UserPromptParams = {
      idioma: requestData.idioma,
      nivel: requestData.nivel,
      n_preguntas: requestData.n_preguntas,
      p_mcq: requestData.proporcion_tipos.opcion_multiple,
      p_short: requestData.proporcion_tipos.respuesta_corta,
      p_tf: requestData.proporcion_tipos.verdadero_falso,
      temas_prioritarios: requestData.temas_prioritarios,
      documents: requestData.documents,
      titulo_quiz_o_tema: requestData.titulo_quiz_o_tema,
      // Pasar el número recomendado si el usuario pidió más de lo óptimo
      recommended_questions: requestData.n_preguntas > recommendedOptimal ? recommendedOptimal : undefined
    };

    let contentReductionApplied = false;
    let reductionStrategies: string[] = [];

    // Calcular tamaño del prompt para uso posterior
    const contextCheck = exceedsContextLimit(promptParams, aiProvider);
    const promptSize = calculatePromptSize(promptParams);

    // Si usamos chunking, saltamos la validación de contexto global
    // porque cada chunk se validará individualmente
    if (useChunkedProcessing && allChunks.length > 0) {
      logger.info('Skipping global context validation (using chunked processing)', {
        requestId,
        totalChunks: allChunks.length,
        provider: aiProvider.name,
        model: aiProvider.model
      }, 'GENERATE_QUIZ_API');
    } else {
      // Validar tamaño del prompt y reducir contenido si es necesario
      
      logger.info('Prompt size validation', {
        requestId,
        provider: aiProvider.name,
        model: aiProvider.model,
        promptTokens: promptSize.totalTokens,
        promptChars: promptSize.totalChars,
        systemTokens: promptSize.systemTokens,
        userTokens: promptSize.userTokens,
        contextLimit: contextCheck.limit,
        exceeds: contextCheck.exceeds,
        excess: contextCheck.excess
      }, 'GENERATE_QUIZ_API');

      // Si excede el límite, reducir contenido automáticamente
      if (contextCheck.exceeds) {
      logger.warn('Prompt exceeds context limit, applying content reduction', {
        requestId,
        provider: aiProvider.name,
        excessTokens: contextCheck.excess,
        excessPercent: ((contextCheck.excess / contextCheck.limit) * 100).toFixed(1) + '%'
      }, 'GENERATE_QUIZ_API');

      // Calcular tokens objetivo para la reducción
      const targetTokens = contextCheck.limit - promptSize.systemTokens - 1000;

      // Reducir todos los documentos
      const reducedDocuments = reduceDocumentContent(requestData.documents, targetTokens);
      
      // Calcular estadísticas de reducción
      const originalChars = requestData.documents.reduce((sum, doc) => {
        return sum + (doc.pages?.reduce((pageSum, page) => pageSum + (page.text?.length || 0), 0) || 0);
      }, 0);
      
      const reducedChars = reducedDocuments.reduce((sum, doc) => {
        return sum + (doc.pages?.reduce((pageSum, page) => pageSum + (page.text?.length || 0), 0) || 0);
      }, 0);
      
      if (reducedChars < originalChars) {
        contentReductionApplied = true;
        reductionStrategies.push('token_limit_reduction');
        
        logger.info('Document content reduced', {
          requestId,
          originalChars,
          reducedChars,
          reductionPercent: ((1 - reducedChars / originalChars) * 100).toFixed(1) + '%',
          targetTokens
        }, 'GENERATE_QUIZ_API');
      }

      // Actualizar promptParams con documentos reducidos
      promptParams = {
        ...promptParams,
        documents: reducedDocuments
      };

      // Revalidar después de la reducción
      const newContextCheck = exceedsContextLimit(promptParams, aiProvider);
      const newPromptSize = calculatePromptSize(promptParams);

      logger.info('Prompt size after reduction', {
        requestId,
        newPromptTokens: newPromptSize.totalTokens,
        newPromptChars: newPromptSize.totalChars,
        stillExceeds: newContextCheck.exceeds,
        remainingExcess: newContextCheck.excess
      }, 'GENERATE_QUIZ_API');

      // Si aún excede después de la reducción, lanzar error con sugerencias
      if (newContextCheck.exceeds) {
        const limitPages = Math.floor(contextCheck.limit / 375); // Aproximación de páginas
        const currentPages = Math.ceil(newPromptSize.totalTokens / 375);
        
        throw new ValidationError(
          `El documento es demasiado extenso para generar el quiz. ` +
          `El modelo puede procesar aproximadamente ${limitPages} páginas de texto, pero tu documento tiene el equivalente a ${currentPages} páginas. ` +
          `\n\nSugerencias para resolver esto:\n` +
          `• Divide el documento en partes más pequeñas y genera quizzes separados\n` +
          `• Reduce el número de preguntas solicitadas (actualmente: ${requestData.n_preguntas})\n` +
          `• Elimina páginas con tablas o imágenes muy extensas del documento\n` +
          `• Si el documento tiene muchas páginas, selecciona solo las secciones más importantes`,
          {
            requestId,
            provider: aiProvider.name,
            model: aiProvider.model,
            limit: contextCheck.limit,
            currentSize: newPromptSize.totalTokens,
            excess: newContextCheck.excess,
            reductionApplied: contentReductionApplied,
            limitPages,
            currentPages
          }
        );
      }
      }
    } // Fin del else para validación sin chunking

    // Función helper para generar quiz con manejo de context_length_exceeded
    const generateQuizWithContextRetry = async (
      params: UserPromptParams,
      provider: AIProvider,
      attempt: number = 1
    ): Promise<GenerateQuizResponse> => {
      try {
        return await generateQuiz(params, provider);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Detectar error de contexto excedido
        if (
          errorMessage.includes('CONTEXT_LENGTH_EXCEEDED') ||
          errorMessage.includes('context_length_exceeded') ||
          errorMessage.includes('reduce the length') ||
          errorMessage.includes('maximum context length')
        ) {
          logger.warn('Context length exceeded during generation, applying aggressive reduction', {
            requestId,
            provider: provider.name,
            attempt,
            errorMessage
          }, 'GENERATE_QUIZ_API');

          // Si es el primer intento y no se aplicó reducción antes, aplicar reducción agresiva
          if (attempt === 1 && !contentReductionApplied) {
            const tokensPerPage = 300; // Reducción más agresiva
            const targetTokens = Math.floor(getContextLimit(provider) - promptSize.systemTokens - 2000);

            const reducedDocuments = reduceDocumentContent(params.documents, targetTokens);
            
            const newParams = { ...params, documents: reducedDocuments };
            contentReductionApplied = true;
            reductionStrategies.push('aggressive_retry_reduction');

            logger.info('Applied aggressive content reduction for context retry', {
              requestId,
              targetTokens
            }, 'GENERATE_QUIZ_API');

            // Retry con contenido reducido
            return generateQuizWithContextRetry(newParams, provider, attempt + 1);
          } else {
            // Ya se intentó reducir, lanzar error descriptivo
            const limitPages = Math.floor(getContextLimit(provider) / 375);
            throw new ValidationError(
              `El documento es demasiado extenso para procesar. ` +
              `Aunque se intentó reducir automáticamente el contenido, aún excede el límite del modelo. ` +
              `\n\nPor favor, intenta una de estas opciones:\n` +
              `• Divide tu documento en 2-3 partes más pequeñas y genera quizzes separados\n` +
              `• Reduce el número de preguntas a ${Math.max(1, Math.floor(requestData.n_preguntas / 2))} o menos\n` +
              `• Selecciona solo las páginas más importantes del documento (máximo ~${limitPages} páginas)\n` +
              `• Si el documento tiene muchas tablas o imágenes, considera extraer solo el texto principal`,
              {
                requestId,
                provider: provider.name,
                model: provider.model,
                limit: getContextLimit(provider),
                attempt,
                limitPages
              }
            );
          }
        }
        
        // Si no es error de contexto, propagar el error
        throw error;
      }
    };

    // Generar el quiz con retry, timeout y fallback automático
    let aiResponse: GenerateQuizResponse;
    
    // CHUNKING DESACTIVADO TEMPORALMENTE
    // El procesamiento por chunks está desactivado hasta reimplementar correctamente
    
    // Procesar documento completo normalmente
    aiResponse = await withTimeout(
      retryWithBackoff(
        () => generateQuizWithContextRetry(promptParams, aiProvider),
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
    
    // Verificar si se generó un número razonable de preguntas
    const generatedCount = validatedResponse.result?.quiz?.preguntas?.length || 0;
    const requestedCount = requestData.n_preguntas;
    const recommendedMinimum = promptParams.recommended_questions || requestedCount;
    
    // Si se solicitó más de lo recomendado, el mínimo aceptable es lo recomendado
    // Si no, el mínimo es 70% de lo solicitado
    const minAcceptable = promptParams.recommended_questions 
      ? recommendedMinimum 
      : Math.ceil(requestedCount * 0.7);
    
    if (generatedCount < minAcceptable) {
      logger.warn('Insufficient questions generated, below minimum threshold', {
        requestId,
        generated: generatedCount,
        requested: requestedCount,
        recommended: recommendedMinimum,
        minAcceptable: minAcceptable,
        ratio: generatedCount / requestedCount
      }, 'GENERATE_QUIZ_API');
      
      // Agregar nota en el resultado
      if (validatedResponse.result?.notes) {
        const message = promptParams.recommended_questions
          ? `Solo se generaron ${generatedCount} de ${requestedCount} preguntas solicitadas (se recomendaban ${recommendedMinimum}). El contenido del documento es insuficiente para generar más preguntas de calidad.`
          : `Solo se generaron ${generatedCount} de ${requestedCount} preguntas solicitadas. El contenido del documento puede ser limitado o muy específico. Considera subir un documento más extenso o reducir el número de preguntas.`;
          
        validatedResponse.result.notes = {
          ...validatedResponse.result.notes,
          insuficiente_evidencia: true,
          detalle: message
        };
      }
    }

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
        quality_metrics: qualityMetrics,
        content_reduction: contentReductionApplied ? {
          applied: true,
          strategies: reductionStrategies
        } : undefined
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
  const envProvider = process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'groq' | 'gemini' | undefined;
  const envApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  const envModel = process.env.AI_MODEL;

  if (envProvider && envApiKey) {
    const getDefaultModel = (provider: string) => {
      switch (provider) {
        case 'openai': return 'gpt-4o-mini';
        case 'anthropic': return 'claude-3-5-sonnet-20241022';
        case 'groq': return 'llama-3.1-8b-instant';
        case 'gemini': return 'gemini-1.5-flash';
        default: return 'gpt-4o-mini';
      }
    };

    return {
      name: envProvider,
      apiKey: envApiKey,
      model: envModel || getDefaultModel(envProvider)
    };
  }

  // Fallback a configuración por defecto - intentar Gemini primero (excelente con documentos grandes)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    return {
      name: 'gemini',
      apiKey: geminiApiKey,
      model: 'gemini-1.5-flash' // Intentar con modelo avanzado primero
    };
  }

  // Fallback a Groq (es gratis)
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