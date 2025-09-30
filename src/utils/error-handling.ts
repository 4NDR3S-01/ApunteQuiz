import { logger } from './logger';
import { z } from 'zod';

// Tipos de errores específicos de la aplicación
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, any>;

  constructor(message: string, code: string, statusCode: number = 500, context?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class DocumentProcessingError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DOCUMENT_PROCESSING_ERROR', 422, context);
    this.name = 'DocumentProcessingError';
  }
}

export class AIProviderError extends AppError {
  constructor(message: string, provider: string, context?: Record<string, any>) {
    super(message, 'AI_PROVIDER_ERROR', 502, { provider, ...context });
    this.name = 'AIProviderError';
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', 400, context);
    this.name = 'ConfigurationError';
  }
}

// Función para manejar errores de Zod
export function handleZodError(error: z.ZodError): ValidationError {
  const issues = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

  return new ValidationError('Datos de entrada inválidos', { issues });
}

// Función para manejar errores de APIs externas
export function handleAPIError(error: any, provider: string, operation: string): AIProviderError {
  let message = 'Error de proveedor de IA';
  let context: Record<string, any> = { provider, operation };

  if (error.response) {
    // Error de respuesta HTTP
    const status = error.response.status;
    const data = error.response.data;
    
    message = `Error ${status} del proveedor ${provider}`;
    context = {
      ...context,
      status,
      response: data,
      url: error.response.config?.url
    };
    
    // Manejo específico por proveedor
    if (provider === 'openai' && data?.error) {
      message = data.error.message || message;
      context.type = data.error.type;
      context.code = data.error.code;
    } else if (provider === 'anthropic' && data?.error) {
      message = data.error.message || message;
      context.type = data.error.type;
    }
  } else if (error.request) {
    // Error de red
    message = `Error de conexión con ${provider}`;
    context.networkError = true;
  } else {
    // Error de configuración
    message = error.message || message;
    context.configError = true;
  }

  return new AIProviderError(message, provider, context);
}

// Función para formatear errores para la respuesta de API
export function formatErrorResponse(error: Error, requestPath?: string): { error: { message: string; code: string; statusCode: number; context?: Record<string, any>; timestamp: string; path?: string } } {
  const timestamp = new Date().toISOString();
  let formattedError;

  if (error instanceof AppError) {
    formattedError = {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        timestamp,
        path: requestPath
      }
    };

    // Log según la severidad
    if (error.statusCode >= 500) {
      logger.error('Server error', {
        message: error.message,
        code: error.code,
        context: error.context,
        stack: error.stack,
        path: requestPath
      }, 'ERROR_HANDLER');
    } else {
      logger.warn('Client error', {
        message: error.message,
        code: error.code,
        context: error.context,
        path: requestPath
      }, 'ERROR_HANDLER');
    }
  } else if (error instanceof z.ZodError) {
    const validationError = handleZodError(error);
    formattedError = formatErrorResponse(validationError, requestPath);
  } else {
    // Error genérico
    formattedError = {
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        timestamp,
        path: requestPath
      }
    };

    logger.error('Unexpected error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: requestPath
    }, 'ERROR_HANDLER');
  }

  return formattedError;
}

// Wrapper para APIs con manejo de errores
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: { operation: string; source?: string }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Error in ${context.operation}`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      operation: context.operation
    }, context.source || 'UNKNOWN');
    
    throw error;
  }
}

// Helper para validar configuración requerida
export function validateRequiredConfig(config: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => !config[field]);
  
  if (missing.length > 0) {
    throw new ConfigurationError(
      `Configuración faltante: ${missing.join(', ')}`,
      { missingFields: missing, providedConfig: Object.keys(config) }
    );
  }
}

// Helper para retry con backoff exponencial
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  context?: { operation: string }
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        logger.error('Max retry attempts reached', {
          operation: context?.operation,
          attempts: maxAttempts,
          error: lastError.message
        }, 'RETRY');
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn('Operation failed, retrying...', {
        operation: context?.operation,
        attempt,
        maxAttempts,
        delay,
        error: lastError.message
      }, 'RETRY');
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (!lastError) {
    throw new AppError('Max retry attempts reached', 'RETRY_EXHAUSTED', 500);
  }
  throw lastError;
}

// Helper para timeout de operaciones
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new AppError(timeoutMessage, 'TIMEOUT_ERROR', 408)), timeoutMs);
  });
  
  return Promise.race([operation, timeoutPromise]);
}

// Helper para sanitizar datos sensibles en logs
export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['apiKey', 'password', 'token', 'secret', 'key'];
  const sanitized = { ...data };
  
  for (const field in sanitized) {
    if (sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))) {
      sanitized[field] = '[REDACTED]';
    } else if (typeof sanitized[field] === 'object') {
      sanitized[field] = sanitizeForLogging(sanitized[field]);
    }
  }
  
  return sanitized;
}