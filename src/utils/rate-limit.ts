/**
 * Rate limiting utility para prevenir abuso de APIs
 * Implementación simple en memoria (para producción usar Redis)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Limpia entradas expiradas del store periódicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Limpiar cada minuto

/**
 * Obtiene la clave de rate limiting basada en IP o usuario
 */
function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${endpoint}:${identifier}`;
}

/**
 * Verifica si una solicitud excede el límite de rate
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto por defecto
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const key = getRateLimitKey(identifier, endpoint);
  const now = Date.now();
  
  let entry = store[key];
  
  // Si no existe o expiró, crear nueva entrada
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs
    };
    store[key] = entry;
  }
  
  // Incrementar contador
  entry.count++;
  
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime
  };
}

/**
 * Obtiene el identificador de rate limiting desde una request
 */
export function getRateLimitIdentifier(request: Request | { headers: Headers }): string {
  // Intentar obtener IP del header X-Forwarded-For o X-Real-IP
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback: usar un identificador genérico
  return 'unknown';
}

/**
 * Wrapper para aplicar rate limiting a un endpoint
 */
export async function withRateLimit(
  request: Request,
  endpoint: string,
  handler: () => Promise<Response>,
  options: {
    maxRequests?: number;
    windowMs?: number;
  } = {}
): Promise<Response> {
  const identifier = getRateLimitIdentifier(request);
  const { maxRequests = 10, windowMs = 60000 } = options;
  
  const rateLimit = checkRateLimit(identifier, endpoint, maxRequests, windowMs);
  
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.',
          code: 'RATE_LIMIT_EXCEEDED',
          statusCode: 429,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetTime)
        }
      }
    );
  }
  
  const response = await handler();
  
  // Agregar headers de rate limit a la respuesta
  response.headers.set('X-RateLimit-Limit', String(maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime));
  
  return response;
}
