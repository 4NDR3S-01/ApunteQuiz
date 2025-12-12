/**
 * Utilidades para sanitizar inputs de usuario y prevenir XSS
 */

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript: protocol
    .replace(/on\w+=/gi, '') // Remover event handlers (onclick=, onerror=, etc.)
    .trim();
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const sanitizedKey = sanitizeString(key);
        (sanitized as any)[sanitizedKey] = sanitizeObject((obj as any)[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Escapa HTML para prevenir XSS
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Valida y sanitiza un título de quiz
 */
export function sanitizeQuizTitle(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }
  
  // Limitar longitud
  const maxLength = 200;
  const sanitized = sanitizeString(title).substring(0, maxLength);
  
  return sanitized;
}

/**
 * Valida y sanitiza un nombre de archivo
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'archivo';
  }
  
  // Remover caracteres peligrosos y limitar longitud
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .substring(0, 255)
    .trim() || 'archivo';
}
