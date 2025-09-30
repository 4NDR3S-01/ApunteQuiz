export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  source?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, source?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source
    };
  }

  private output(logEntry: LogEntry): void {
    const { timestamp, level, message, context, source } = logEntry;
    
    if (this.isDevelopment) {
      // Formato de desarrollo con colores
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m'  // red
      };
      const reset = '\x1b[0m';
      
      console.log(
        `${colors[level]}[${level.toUpperCase()}]${reset} ${timestamp} ${source ? `[${source}]` : ''} ${message}`,
        context ? context : ''
      );
    } else {
      // Formato de producción JSON
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatMessage('debug', message, context, source));
    }
  }

  info(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('info')) {
      this.output(this.formatMessage('info', message, context, source));
    }
  }

  warn(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatMessage('warn', message, context, source));
    }
  }

  error(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('error')) {
      this.output(this.formatMessage('error', message, context, source));
    }
  }

  // Métodos específicos para la aplicación
  requestStart(method: string, url: string, requestId?: string): void {
    this.info('Request started', { method, url, requestId }, 'API');
  }

  requestEnd(method: string, url: string, statusCode: number, duration: number, requestId?: string): void {
    this.info('Request completed', { method, url, statusCode, duration, requestId }, 'API');
  }

  documentProcessingStart(fileName: string, fileSize: number, fileType: string): void {
    this.info('Document processing started', { fileName, fileSize, fileType }, 'DOCUMENT_PROCESSOR');
  }

  documentProcessingEnd(fileName: string, pageCount: number, processingTime: number): void {
    this.info('Document processing completed', { fileName, pageCount, processingTime }, 'DOCUMENT_PROCESSOR');
  }

  quizGenerationStart(provider: string, model: string, questionCount: number): void {
    this.info('Quiz generation started', { provider, model, questionCount }, 'QUIZ_GENERATOR');
  }

  quizGenerationEnd(questionCount: number, generationTime: number, tokensUsed?: number): void {
    this.info('Quiz generation completed', { questionCount, generationTime, tokensUsed }, 'QUIZ_GENERATOR');
  }

  validationError(field: string, value: any, expectedType: string): void {
    this.warn('Validation error', { field, value, expectedType }, 'VALIDATION');
  }

  performanceMetric(operation: string, duration: number, metadata?: LogContext): void {
    this.info('Performance metric', { operation, duration, ...metadata }, 'PERFORMANCE');
  }
}

// Crear instancia singleton
export const logger = new Logger();

// Middleware para logging de requests (para usar en APIs)
export function createRequestLogger(source: string = 'API') {
  return (req: any, res: any, next?: () => void) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    logger.requestStart(req.method, req.url, requestId);
    
    // Para Next.js API routes
    if (!next) {
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.requestEnd(req.method, req.url, res.statusCode, duration, requestId);
      });
    } else {
      // Para middlewares tradicionales
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.requestEnd(req.method, req.url, res.statusCode, duration, requestId);
      });
      next();
    }
  };
}

// Helper para capturar errores no manejados
export function setupErrorLogging(): void {
  if (typeof window === 'undefined') {
    // Solo en el servidor
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', { 
        name: error.name, 
        message: error.message, 
        stack: error.stack 
      }, 'SYSTEM');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled rejection', { 
        reason: reason?.toString(), 
        promise: promise?.toString() 
      }, 'SYSTEM');
    });
  } else {
    // En el cliente
    window.addEventListener('error', (event) => {
      logger.error('Client error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      }, 'CLIENT');
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason?.toString()
      }, 'CLIENT');
    });
  }
}

// Clase para medir performance
export class PerformanceTimer {
  private startTime: number;
  private operation: string;
  private metadata: LogContext;

  constructor(operation: string, metadata: LogContext = {}) {
    this.operation = operation;
    this.metadata = metadata;
    this.startTime = Date.now();
  }

  end(additionalMetadata: LogContext = {}): number {
    const duration = Date.now() - this.startTime;
    logger.performanceMetric(this.operation, duration, { ...this.metadata, ...additionalMetadata });
    return duration;
  }
}

// Helper para crear timers
export function startTimer(operation: string, metadata: LogContext = {}): PerformanceTimer {
  return new PerformanceTimer(operation, metadata);
}