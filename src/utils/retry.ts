/**
 * Utilidades para retry automático con exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry automático con exponential backoff
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si es el último intento, lanzar el error
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calcular delay con exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(factor, attempt - 1),
        maxDelay
      );

      // Callback de retry
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Verifica si un error es recuperable (debe reintentarse)
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'network',
    'timeout',
    'fetch',
    'connection',
    'econnrefused',
    'etimedout',
    'rate limit',
    '429',
    '503',
    '502',
    '500'
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Retry solo para errores recuperables
 */
export async function retryOnRetryableError<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithExponentialBackoff(async () => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error && isRetryableError(error)) {
        throw error;
      }
      // Si no es recuperable, no reintentar
      throw error;
    }
  }, options);
}
