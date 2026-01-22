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
    
    // Calcular tamaño estimado del documento en tokens para selección inteligente de modelo
    const fullText = requestData.documents.reduce((text, doc) => {
      if (doc.text) return text + doc.text;
      if (doc.pages) return text + doc.pages.map(p => p.text).join(' ');
      return text;
    }, '');
    const estimatedTokens = Math.ceil(Math.max(
      fullText.split(/\s+/).filter(w => w.length > 0).length * 1.3, // ~1.3 tokens por palabra
      fullText.length / 4 // ~4 caracteres por token
    ));

    // Obtener configuración del proveedor de AI desde headers o variables de entorno
    // Pasar tamaño estimado para selección inteligente de modelo
    const aiProvider = getAIProviderFromRequest(request, estimatedTokens);
    if (!aiProvider) {
      throw new ConfigurationError('Configuración de AI no válida. Proporciona API key y proveedor.');
    }

    // Logs de la request validada
    logger.info('Request validation successful', {
      requestId,
      nivel: requestData.nivel,
      n_preguntas: requestData.n_preguntas,
      provider: aiProvider.name,
      model: aiProvider.model,
      documentsCount: requestData.documents.length,
      estimatedTokens,
      modelSelectionReason: estimatedTokens 
        ? estimatedTokens > 30000 
          ? 'Large document (>30K tokens) - using high-capacity model'
          : estimatedTokens > 10000
          ? 'Medium document (10K-30K tokens) - using medium-capacity model'
          : 'Small document (<10K tokens) - using efficient model'
        : 'No token estimation available'
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
    // Calcular palabras reales (no estimación) - reutilizar fullText ya calculado
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
    // gemini-2.5-flash: 1M tokens -> chunks de 300 páginas, umbral 600
    // gemini-3-flash: 1M tokens -> chunks de 300 páginas, umbral 600
    // groq/compound: 70K tokens/min -> chunks de 50 páginas, umbral 70 (actualizado)
    // groq/compound-mini: 70K tokens/min -> chunks de 50 páginas, umbral 70 (actualizado)
    // meta-llama/llama-4-scout: 30K tokens/min -> chunks de 20 páginas, umbral 30 (actualizado)
    const modelConfig = {
      'gemini-pro': { threshold: 100, chunkSize: 50 },
      'gemini-1.5-flash': { threshold: 600, chunkSize: 300 },
      'gemini-1.5-pro': { threshold: 1000, chunkSize: 500 },
      'gemini-2.5-flash': { threshold: 600, chunkSize: 300 },
      'gemini-2.5-flash-lite': { threshold: 600, chunkSize: 300 },
      'gemini-3-flash': { threshold: 600, chunkSize: 300 },
      'groq/compound': { threshold: 70, chunkSize: 50 }, // Actualizado: 70K tokens reales
      'groq/compound-mini': { threshold: 70, chunkSize: 50 }, // Actualizado: 70K tokens reales
      'meta-llama/llama-4-scout-17b-16e-instruct': { threshold: 30, chunkSize: 20 }, // Actualizado: 30K tokens reales
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

    // Calcular rangos recomendados si no vienen del frontend
    let minRecommended: number | undefined;
    let maxRecommended: number | undefined;
    let recommendedOptimal: number | undefined; // Para compatibilidad con código legacy
    
    if (requestData.n_preguntas_min_recomendadas && requestData.n_preguntas_max_recomendadas) {
      // Usar nuevo sistema de min/max
      minRecommended = requestData.n_preguntas_min_recomendadas;
      maxRecommended = requestData.n_preguntas_max_recomendadas;
      recommendedOptimal = maxRecommended; // Usar máximo como objetivo
    } else if (requestData.n_preguntas_recomendadas) {
      // Sistema legacy - calcular min/max basado en el recomendado
      recommendedOptimal = requestData.n_preguntas_recomendadas;
      minRecommended = Math.max(1, Math.floor(recommendedOptimal * 0.5)); // Mínimo: 50% del recomendado
      maxRecommended = recommendedOptimal;
    } else {
      // Calcular desde cero - reutilizar fullText ya calculado
      const wordsCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
      recommendedOptimal = Math.max(Math.floor(wordsCount / 150), 1);
      minRecommended = Math.max(1, Math.floor(recommendedOptimal * 0.5));
      maxRecommended = recommendedOptimal;
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
      // Pasar rangos recomendados si el usuario pidió más del máximo recomendado
      min_recommended_questions: requestData.n_preguntas > (maxRecommended || 0) ? minRecommended : undefined,
      max_recommended_questions: requestData.n_preguntas > (maxRecommended || 0) ? maxRecommended : undefined,
      // Mantener para compatibilidad
      recommended_questions: requestData.n_preguntas > (recommendedOptimal || 0) ? recommendedOptimal : undefined
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
      // Reservar espacio para: sistema + respuesta (2000 tokens) + margen de seguridad
      const reservedTokens = promptSize.systemTokens + 2000;
      const targetTokens = Math.max(1000, contextCheck.limit - reservedTokens);

      logger.info('Calculating target tokens for reduction', {
        requestId,
        contextLimit: contextCheck.limit,
        systemTokens: promptSize.systemTokens,
        reservedTokens,
        targetTokens,
        currentUserTokens: promptSize.userTokens
      }, 'GENERATE_QUIZ_API');

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
        const originalPages = Math.ceil(promptSize.totalTokens / 375);
        
        logger.error('Document still exceeds limit after reduction', {
          requestId,
          limitPages,
          originalPages,
          currentPages,
          reductionApplied: contentReductionApplied,
          provider: aiProvider.name,
          model: aiProvider.model
        }, 'GENERATE_QUIZ_API');
        
        throw new ValidationError(
          `El documento es demasiado extenso incluso después de la reducción automática. ` +
          `\n\nDetalles:\n` +
          `• Límite del modelo (${aiProvider.model}): ~${limitPages} páginas\n` +
          `• Tu documento original: ~${originalPages} páginas\n` +
          `• Después de reducción: ~${currentPages} páginas (aún excede)\n` +
          `• Preguntas solicitadas: ${requestData.n_preguntas}\n` +
          `\n💡 Soluciones recomendadas (elige una):\n` +
          `\n1️⃣ DIVIDIR EL DOCUMENTO:\n` +
          `   • Separa en ${Math.ceil(currentPages / limitPages)} partes más pequeñas\n` +
          `   • Genera quizzes separados para cada parte\n` +
          `\n2️⃣ REDUCIR PREGUNTAS:\n` +
          `   • Prueba con ${Math.max(3, Math.floor(requestData.n_preguntas / 2))} preguntas o menos\n` +
          `   • Menos preguntas = más espacio para el documento\n` +
          `\n3️⃣ SELECCIONAR PÁGINAS CLAVE:\n` +
          `   • Extrae solo los capítulos o secciones más importantes\n` +
          `   • Elimina páginas con muchas tablas o imágenes\n` +
          `   • Enfócate en las primeras ${Math.floor(limitPages * 0.8)} páginas\n` +
          {
            requestId,
            provider: aiProvider.name,
            model: aiProvider.model,
            limit: contextCheck.limit,
            currentSize: newPromptSize.totalTokens,
            excess: newContextCheck.excess,
            reductionApplied: contentReductionApplied,
            limitPages,
            currentPages,
            originalPages
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
            // Reducción más agresiva: dejar más espacio para la respuesta
            const reservedTokens = promptSize.systemTokens + 3000;
            const targetTokens = Math.max(1000, Math.floor(getContextLimit(provider) - reservedTokens));

            logger.info('Attempting aggressive reduction', {
              requestId,
              contextLimit: getContextLimit(provider),
              systemTokens: promptSize.systemTokens,
              reservedTokens,
              targetTokens
            }, 'GENERATE_QUIZ_API');

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

    // Si el proveedor falla, intentar con fallbacks automáticos
    if (aiResponse.error) {
      const errorMessage = (aiResponse.error.message || '').toLowerCase();
      
      // Fallback para OpenAI (rate limit)
      if (aiProvider.name === 'openai' && (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('usage'))) {
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
      
      // Fallback para Gemini (API key inválida o cualquier error)
      if (aiProvider.name === 'gemini' && aiResponse.error && (
        errorMessage.includes('api key') || 
        errorMessage.includes('api_key') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('no es válida') ||
        errorMessage.includes('configuración')
      )) {
        logger.warn('Gemini failed, trying Groq as fallback', { 
          requestId, 
          originalError: aiResponse.error.message 
        }, 'GENERATE_QUIZ_API');

        // Intentar con Groq (gratis y confiable)
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

            logger.info('Groq fallback successful after Gemini failure', { requestId }, 'GENERATE_QUIZ_API');
          } catch (groqError) {
            logger.error('Groq fallback also failed', { 
              requestId, 
              groqError: groqError instanceof Error ? groqError.message : 'Unknown error'
            }, 'GENERATE_QUIZ_API');
          }
        } else {
          logger.warn('No Groq API key available for fallback', { requestId }, 'GENERATE_QUIZ_API');
        }
      }
    }
    
    // Log de la respuesta cruda de la IA para debugging
    logger.info('Raw AI response structure', {
      requestId,
      hasResult: !!aiResponse.result,
      hasError: !!aiResponse.error,
      resultKeys: aiResponse.result ? Object.keys(aiResponse.result) : [],
      errorMessage: aiResponse.error?.message,
      errorWhere: aiResponse.error?.where
    }, 'GENERATE_QUIZ_API');
    
    // Si ya hay un error en la respuesta del AI (autenticación, cuota, etc.), 
    // NO intentar validar - retornar el error directamente
    if (aiResponse.error) {
      logger.warn('AI provider returned error, skipping validation', {
        requestId,
        provider: aiProvider.name,
        model: aiProvider.model,
        errorMessage: aiResponse.error.message,
        errorWhere: aiResponse.error.where
      }, 'GENERATE_QUIZ_API');
      
      // Distinguir entre tipos de errores
      const errorMessage = aiResponse.error.message.toLowerCase();
      
      // Errores de autenticación/configuración
      if (
        errorMessage.includes('api key') ||
        errorMessage.includes('api_key') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('no es válida') ||
        errorMessage.includes('configuración')
      ) {
        throw new ConfigurationError(
          `Error de configuración de ${aiProvider.name}: ${aiResponse.error.message}`,
          {
            requestId,
            provider: aiProvider.name,
            model: aiProvider.model,
            errorType: 'authentication',
            suggestion: 'Verifica que la variable de entorno GEMINI_API_KEY esté configurada correctamente y que la API key sea válida.'
          }
        );
      }
      
      // Errores de cuota
      if (
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('resource_exhausted')
      ) {
        throw new AIProviderError(
          aiResponse.error.message,
          aiProvider.name,
          {
            requestId,
            errorType: 'quota_exceeded',
            suggestion: 'Espera unos minutos antes de intentar nuevamente o reduce el tamaño del documento.'
          }
        );
      }
      
      // Otros errores del proveedor
      throw new AIProviderError(
        aiResponse.error.message,
        aiProvider.name,
        {
          requestId,
          errorType: 'provider_error',
          where: aiResponse.error.where
        }
      );
    }
    
    // Log de respuesta antes de validar (solo si no hay error)
    logger.info('AI response received, starting validation', {
      requestId,
      provider: aiProvider.name,
      model: aiProvider.model,
      hasResult: !!aiResponse.result,
      hasError: !!aiResponse.error,
      resultKeys: aiResponse.result ? Object.keys(aiResponse.result) : [],
      quizPreguntasCount: aiResponse.result?.quiz?.preguntas?.length || 0
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
              firstPregunta: aiResponse.result.quiz.preguntas?.[0],
              firstPreguntaTipo: aiResponse.result.quiz.preguntas?.[0]?.tipo,
              firstPreguntaRespuestaTipo: typeof aiResponse.result.quiz.preguntas?.[0]?.respuesta_correcta
            } : null
          } : null
        },
        // Log de estructura completa en modo debug
        fullStructure: process.env.DEBUG_AI_RESPONSES === 'true' ? JSON.stringify(aiResponse, null, 2).substring(0, 2000) : undefined
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
    
    // Obtener rangos recomendados del prompt (ya calculados arriba)
    const promptMinRecommended = promptParams.min_recommended_questions;
    const promptMaxRecommended = promptParams.max_recommended_questions;
    const recommendedLegacy = promptParams.recommended_questions;
    
    // Usar los rangos del prompt si están disponibles, sino usar los calculados arriba
    const validationMinRecommended = promptMinRecommended ?? minRecommended;
    const validationMaxRecommended = promptMaxRecommended ?? maxRecommended;
    
    // Determinar mínimo aceptable basado en el sistema usado
    let minAcceptable: number;
    let maxTarget: number | undefined;
    
    if (validationMinRecommended && validationMaxRecommended) {
      // Nuevo sistema: aceptar cualquier valor entre min y max recomendado
      minAcceptable = validationMinRecommended;
      maxTarget = validationMaxRecommended;
    } else if (recommendedLegacy) {
      // Sistema legacy
      minAcceptable = recommendedLegacy;
      maxTarget = recommendedLegacy;
    } else {
      // Sin recomendaciones: 70% de lo solicitado
      minAcceptable = Math.ceil(requestedCount * 0.7);
      maxTarget = requestedCount;
    }
    
    // Verificar si está dentro del rango aceptable
    const isWithinRange = generatedCount >= minAcceptable && (!maxTarget || generatedCount <= maxTarget);
    const isBelowMinimum = generatedCount < minAcceptable;
    const isAboveTarget = maxTarget && generatedCount > maxTarget;
    
    if (isBelowMinimum) {
      logger.warn('Insufficient questions generated, below minimum threshold', {
        requestId,
        generated: generatedCount,
        requested: requestedCount,
        minRecommended: validationMinRecommended,
        maxRecommended: validationMaxRecommended,
        minAcceptable,
        ratio: generatedCount / requestedCount
      }, 'GENERATE_QUIZ_API');
      
      // Agregar nota en el resultado
      if (validatedResponse.result?.notes) {
        const rangeText = validationMinRecommended && validationMaxRecommended 
          ? `rango recomendado (${validationMinRecommended}-${validationMaxRecommended})`
          : recommendedLegacy
          ? `recomendación (${recommendedLegacy})`
          : `solicitud (${requestedCount})`;
          
        const message = `Solo se generaron ${generatedCount} de ${requestedCount} preguntas solicitadas, por debajo del ${rangeText}. El contenido del documento es insuficiente para generar más preguntas de calidad.`;
          
        validatedResponse.result.notes = {
          ...validatedResponse.result.notes,
          insuficiente_evidencia: true,
          detalle: message
        };
      }
    } else if (validationMinRecommended && validationMaxRecommended && generatedCount < validationMaxRecommended && generatedCount >= validationMinRecommended) {
      // Está en el rango pero no alcanzó el máximo - esto es aceptable pero podemos notarlo
      logger.info('Questions generated within acceptable range but below maximum recommended', {
        requestId,
        generated: generatedCount,
        minRecommended: validationMinRecommended,
        maxRecommended: validationMaxRecommended,
        requested: requestedCount
      }, 'GENERATE_QUIZ_API');
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

function getAIProviderFromRequest(request: NextRequest, estimatedTokens?: number): AIProvider | null {
  // Usar configuración fija del servidor
  const envProvider = process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'groq' | 'gemini' | undefined;
  const envApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  const envModel = process.env.AI_MODEL;

  if (envProvider && envApiKey) {
    const getDefaultModel = (provider: string, docTokens?: number) => {
      switch (provider) {
        case 'openai': return 'gpt-4o-mini';
        case 'anthropic': return 'claude-3-5-sonnet-20241022';
        case 'groq': 
          // Selección inteligente de modelo Groq según tamaño del documento
          if (docTokens && docTokens > 30000) {
            // Documento grande (>30K tokens): usar compound-mini (70K tokens/min)
            return 'groq/compound-mini';
          } else if (docTokens && docTokens > 10000) {
            // Documento mediano (10K-30K tokens): usar llama-4-scout (30K tokens/min)
            return 'meta-llama/llama-4-scout-17b-16e-instruct';
          } else {
            // Documento pequeño (<10K tokens): usar llama-3.1-8b-instant (rápido y eficiente)
            return 'llama-3.1-8b-instant';
          }
        case 'gemini': return 'gemini-1.5-flash';
        default: return 'gpt-4o-mini';
      }
    };

    return {
      name: envProvider,
      apiKey: envApiKey,
      model: envModel || getDefaultModel(envProvider, estimatedTokens)
    };
  }

  // Fallback a configuración por defecto - usar Groq primero (gratis y confiable)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    // Selección inteligente de modelo Groq según tamaño del documento
    let selectedModel = 'llama-3.1-8b-instant'; // Por defecto para documentos pequeños
    
    if (estimatedTokens) {
      if (estimatedTokens > 30000) {
        // Documento grande (>30K tokens): usar compound-mini (70K tokens/min)
        selectedModel = 'groq/compound-mini';
        logger.info('Selecting groq/compound-mini for large document', {
          estimatedTokens,
          reason: 'Document exceeds 30K tokens, using high-capacity model'
        }, 'GENERATE_QUIZ_API');
      } else if (estimatedTokens > 10000) {
        // Documento mediano (10K-30K tokens): usar llama-4-scout (30K tokens/min)
        selectedModel = 'meta-llama/llama-4-scout-17b-16e-instruct';
        logger.info('Selecting llama-4-scout for medium document', {
          estimatedTokens,
          reason: 'Document between 10K-30K tokens, using medium-capacity model'
        }, 'GENERATE_QUIZ_API');
      }
    }
    
    return {
      name: 'groq',
      apiKey: groqApiKey,
      model: selectedModel
    };
  }

  // Si no hay Groq, intentar con Gemini (excelente con documentos grandes)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    return {
      name: 'gemini',
      apiKey: geminiApiKey,
      model: 'gemini-1.5-flash' // Intentar con modelo avanzado primero
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