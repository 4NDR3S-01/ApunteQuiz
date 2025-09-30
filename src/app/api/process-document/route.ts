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

  const fileValidation = validateFileUpload(file);
  if (!fileValidation.success) {
    throw new ValidationError('Archivo inválido', { validationErrors: fileValidation.error });
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
    
    if (file.type === 'application/pdf') {
      result = await withTimeout(
        processPDFFile(file, useOCR, language, file.name),
        120000, // 2 minutos timeout para PDFs
        'PDF processing timed out'
      );
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      result = await processTextFile(file, file.name);
    } else {
      throw new ValidationError(`Tipo de archivo no soportado: ${file.type}`);
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