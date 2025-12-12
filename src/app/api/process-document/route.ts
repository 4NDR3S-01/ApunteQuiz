import { NextRequest, NextResponse } from 'next/server';
import { 
  extractTextFromPDF, 
  extractTextFromPDFWithOCR, 
  convertPDFToDocument, 
  convertTextToDocument,
  validateDocument,
  chunkPDFDocument,
  getDocumentStats
} from '@/utils/document-processor.server';
import { validateFileUpload } from '@/lib/validation';
import { validateFile } from '@/utils/file-validation';
import { checkRateLimit, getRateLimitIdentifier } from '@/utils/rate-limit';
import { logger, startTimer } from '@/utils/logger';
import { 
  formatErrorResponse, 
  ValidationError, 
  DocumentProcessingError,
  withErrorHandling,
  withTimeout
} from '@/utils/error-handling';

// Función auxiliar para validar archivo
async function validateRequestFile(formData: FormData): Promise<{ file: File; useOCR: boolean; language: string }> {
  const file = formData.get('file') as File;
  const useOCR = formData.get('useOCR') === 'true';
  const language = (formData.get('language') as string) || 'spa';
  
  if (!file) {
    throw new ValidationError('No se proporcionó archivo');
  }

  // Validar tipo MIME real y tamaño
  const fileValidation = await validateFile(file, {
    allowedTypes: ['application/pdf', 'text/plain'],
    maxSizeBytes: 50 * 1024 * 1024
  });
  
  if (!fileValidation.valid) {
    throw new ValidationError('Archivo inválido', { 
      validationErrors: fileValidation.errors 
    });
  }

  // Validación adicional con schema Zod
  const schemaValidation = validateFileUpload(file);
  if (!schemaValidation.success) {
    throw new ValidationError('Archivo inválido', { 
      validationErrors: schemaValidation.error 
    });
  }

  return { file, useOCR, language };
}

// Función auxiliar para procesar PDF
async function processPDFFile(file: File, useOCR: boolean, language: string, fileName: string) {
  const extractionResult = useOCR 
    ? await extractTextFromPDFWithOCR(file, language)
    : await extractTextFromPDF(file);
  
  const document = convertPDFToDocument(extractionResult, fileName);
  const processedDocument = chunkPDFDocument(document, 2000);
  
  if (!validateDocument(processedDocument)) {
    throw new DocumentProcessingError('Documento PDF procesado inválido');
  }

  return {
    document: processedDocument,
    stats: getDocumentStats(processedDocument),
    extractionMethod: useOCR ? 'OCR' : 'Standard',
    extractionDetails: extractionResult
  };
}

// Función auxiliar para procesar archivo de texto
async function processTextFile(file: File, fileName: string) {
  const text = await file.text();
  const document = convertTextToDocument(text, fileName);
  
  if (!validateDocument(document)) {
    throw new DocumentProcessingError('Documento de texto procesado inválido');
  }

  return {
    document,
    stats: getDocumentStats(document),
    extractionMethod: 'Text',
    extractionDetails: { totalCharacters: text.length }
  };
}

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests por minuto por IP
  const identifier = getRateLimitIdentifier({ headers: request.headers });
  const rateLimit = checkRateLimit(identifier, '/api/process-document', 10, 60000);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          message: 'Demasiadas solicitudes. Por favor, espera un momento antes de procesar otro documento.',
          code: 'RATE_LIMIT_EXCEEDED',
          statusCode: 429
        }
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        }
      }
    );
  }

  const requestId = crypto.randomUUID();
  const timer = startTimer('document_processing', { requestId });
  
  try {
    logger.info('Document processing request started', { requestId }, 'PROCESS_DOC_API');
    
    // Obtener y validar FormData
    const formData = await withErrorHandling(
      () => request.formData(),
      { operation: 'parse_form_data', source: 'PROCESS_DOC_API' }
    );
    
    const { file, useOCR, language } = await validateRequestFile(formData);
    
    logger.info('File validation successful', {
      requestId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      useOCR,
      language
    }, 'PROCESS_DOC_API');

    // Procesar según el tipo de archivo
    let result;
    
    // Validar estructura antes de procesar
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt');
    
    if (!isPdf && !isText) {
      throw new ValidationError(`Tipo de archivo no soportado: ${file.type}`);
    }
    
    if (isPdf) {
      result = await withTimeout(
        processPDFFile(file, useOCR, language, file.name),
        120000, // 2 minutos timeout para PDFs
        'PDF processing timed out'
      );
    } else {
      result = await processTextFile(file, file.name);
    }
    
    // Validar estructura del documento procesado
    if (!result.document || !validateDocument(result.document)) {
      throw new DocumentProcessingError(
        'El documento procesado no tiene una estructura válida. Por favor, intenta con otro archivo.'
      );
    }
    
    // Validar que el documento tenga contenido suficiente
    if (result.stats.characterCount < 100) {
      throw new DocumentProcessingError(
        'El documento contiene muy poco texto. Asegúrate de que el archivo tenga contenido suficiente.'
      );
    }

    // Log del éxito
    timer.end({
      requestId,
      fileName: file.name,
      fileType: file.type,
      extractionMethod: result.extractionMethod,
      documentPages: result.document.pages?.length || 0,
      characterCount: result.stats.characterCount
    });
    
    logger.info('Document processing completed successfully', {
      requestId,
      fileName: file.name,
      stats: result.stats
    }, 'PROCESS_DOC_API');

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        requestId,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    timer.end({
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });

    const formattedError = formatErrorResponse(error as Error, '/api/process-document');
    const statusCode = formattedError.error.statusCode || 500;
    
    return NextResponse.json(formattedError, { status: statusCode });
  }
}

// Método GET para obtener información sobre tipos de archivo soportados
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Document Processing API',
    version: '1.0.0',
    supportedTypes: {
      'application/pdf': {
        description: 'Archivos PDF',
        methods: ['text-extraction', 'OCR'],
        maxSize: '50MB'
      },
      'text/plain': {
        description: 'Archivos de texto plano',
        methods: ['text-parsing'],
        maxSize: '50MB'
      }
    },
    parameters: {
      file: 'Archivo a procesar (requerido)',
      useOCR: 'Usar OCR para PDFs escaneados (opcional, default: false)',
      language: 'Idioma para OCR (opcional, default: "spa")'
    }
  });
}