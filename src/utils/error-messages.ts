/**
 * Utilidades para generar mensajes de error más útiles con acciones sugeridas
 */

export interface ErrorSuggestion {
  message: string;
  action?: string;
  link?: string;
}

/**
 * Genera un mensaje de error mejorado con sugerencias
 */
export function getEnhancedErrorMessage(error: Error | string, context?: string): {
  message: string;
  suggestions: ErrorSuggestion[];
} {
  const errorMessage = error instanceof Error ? error.message : error;
  const lowerMessage = errorMessage.toLowerCase();
  
  const suggestions: ErrorSuggestion[] = [];
  let enhancedMessage = errorMessage;

  // Errores de red
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    enhancedMessage = 'Error de conexión. No se pudo conectar con el servidor.';
    suggestions.push({
      message: 'Verifica tu conexión a internet',
      action: 'Revisa que estés conectado a internet'
    });
    suggestions.push({
      message: 'Intenta recargar la página',
      action: 'Presiona F5 o el botón de recargar'
    });
  }

  // Errores de timeout
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    enhancedMessage = 'La operación está tomando demasiado tiempo.';
    suggestions.push({
      message: 'Intenta con un documento más corto',
      action: 'Reduce el tamaño del documento o el número de preguntas'
    });
    suggestions.push({
      message: 'Espera unos momentos e intenta de nuevo',
      action: 'El servidor puede estar ocupado'
    });
  }

  // Errores de validación
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('inválido')) {
    enhancedMessage = 'Los datos proporcionados no son válidos.';
    suggestions.push({
      message: 'Revisa que todos los campos estén completos',
      action: 'Verifica que no falte información requerida'
    });
  }

  // Errores de autenticación
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('no autorizado') || lowerMessage.includes('401')) {
    enhancedMessage = 'No tienes permisos para realizar esta acción.';
    suggestions.push({
      message: 'Inicia sesión nuevamente',
      action: 'Tu sesión puede haber expirado',
      link: '/login'
    });
  }

  // Errores de rate limit
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('demasiadas solicitudes') || lowerMessage.includes('429')) {
    enhancedMessage = 'Demasiadas solicitudes. Por favor, espera un momento.';
    suggestions.push({
      message: 'Espera unos minutos antes de intentar de nuevo',
      action: 'El límite de solicitudes se restablecerá pronto'
    });
  }

  // Errores de contexto excedido
  if (lowerMessage.includes('context') || lowerMessage.includes('too large') || lowerMessage.includes('demasiado grande')) {
    enhancedMessage = 'El documento es demasiado extenso para procesar.';
    suggestions.push({
      message: 'Divide el documento en partes más pequeñas',
      action: 'Intenta con secciones del documento'
    });
    suggestions.push({
      message: 'Reduce el número de preguntas solicitadas',
      action: 'Genera menos preguntas por vez'
    });
  }

  // Errores de servidor
  if (lowerMessage.includes('500') || lowerMessage.includes('internal server') || lowerMessage.includes('error interno')) {
    enhancedMessage = 'Error en el servidor. Nuestro equipo ha sido notificado.';
    suggestions.push({
      message: 'Intenta de nuevo en unos momentos',
      action: 'El problema puede ser temporal'
    });
    suggestions.push({
      message: 'Contacta al soporte si el problema persiste',
      action: 'Envía un email a ac20102003@gmail.com',
      link: 'mailto:ac20102003@gmail.com'
    });
  }

  // Si no hay sugerencias específicas, agregar una genérica
  if (suggestions.length === 0) {
    suggestions.push({
      message: 'Intenta recargar la página',
      action: 'Presiona F5'
    });
    suggestions.push({
      message: 'Si el problema persiste, contacta al soporte',
      action: 'Envía un email a ac20102003@gmail.com',
      link: 'mailto:ac20102003@gmail.com'
    });
  }

  return {
    message: enhancedMessage,
    suggestions
  };
}
