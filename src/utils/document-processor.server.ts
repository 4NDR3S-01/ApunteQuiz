import { createRequire } from 'module';
import { DocumentInput, PageInput, PDFExtractionResult } from '@/types';
import { logger } from '@/utils/logger';

const require = createRequire(import.meta.url);

// Importar pdf2json para procesamiento de PDF
const PDFParser = require('pdf2json');

const DEFAULT_CHUNK_SIZE = 2000;
const MIN_CHAR_THRESHOLD = 80;
const LOGGER_CONTEXT = 'DOCUMENT_PROCESSOR';

function sanitizeExtractedText(text?: string | null): string {
  if (!text) {
    return '';
  }

  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

function splitByFormFeed(text: string): PDFExtractionResult['pages'] {
  const segments = text
    .split('\f')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length <= 1) {
    return [];
  }

  return segments.map((segment, index) => ({
    pageNumber: index + 1,
    text: segment,
    confidence: 0.95
  }));
}

function distributeByLineCount(text: string, expectedPages: number): PDFExtractionResult['pages'] {
  const effectivePages = Math.max(expectedPages, 1);
  const lines = text.split('\n');

  if (lines.length === 0) {
    return [];
  }

  const linesPerPage = Math.max(1, Math.ceil(lines.length / effectivePages));
  const pages: PDFExtractionResult['pages'] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    const segment = lines.slice(index, index + linesPerPage).join('\n').trim();

    if (segment.length === 0) {
      continue;
    }

    pages.push({
      pageNumber: pages.length + 1,
      text: segment,
      confidence: 0.85
    });
  }

  return pages;
}

function buildPagesFromText(text: string, expectedPages: number): PDFExtractionResult['pages'] {
  if (!text) {
    return [];
  }

  const byFormFeed = splitByFormFeed(text);

  if (byFormFeed.length > 0) {
    return byFormFeed;
  }

  const byLineDistribution = distributeByLineCount(text, expectedPages);

  if (byLineDistribution.length > 0) {
    return byLineDistribution;
  }

  return [{
    pageNumber: 1,
    text,
    confidence: 0.8
  }];
}

function chunkText(text: string, chunkSize: number): string[] {
  const normalized = text.trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    let end = Math.min(cursor + chunkSize, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(cursor, end);
      let breakPoint = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '));

      if (breakPoint <= 0) {
        breakPoint = slice.lastIndexOf('.');
      }

      if (breakPoint > 0 && breakPoint > Math.floor(slice.length * 0.4)) {
        end = cursor + breakPoint + 1;
      }
    }

    const segment = normalized.slice(cursor, end).trim();

    if (segment.length === 0) {
      end = Math.min(cursor + chunkSize, normalized.length);
      const fallback = normalized.slice(cursor, end).trim();

      if (fallback.length === 0) {
        break;
      }

      chunks.push(fallback);
      cursor = end;
      continue;
    }

    chunks.push(segment);
    cursor = end;
  }

  return chunks;
}

function chunkPages(pages: PageInput[] | undefined, chunkSize: number): PageInput[] {
  if (!pages || pages.length === 0) {
    return [];
  }

  const chunked: PageInput[] = [];
  let chunkIndex = 1;

  for (const page of pages) {
    const text = sanitizeExtractedText(page.text);

    if (!text) {
      continue;
    }

    const fragments = chunkText(text, chunkSize);

    if (fragments.length === 0) {
      continue;
    }

    fragments.forEach((fragment) => {
      chunked.push({
        page: chunkIndex,
        chunk_id: `c${chunkIndex}`,
        text: fragment
      });
      chunkIndex += 1;
    });
  }

  return chunked;
}

function createMetadata(
  fileName: string,
  pageCount: number,
  originalPageCount: number,
  warnings: string[] = [],
  overrides: Partial<NonNullable<PDFExtractionResult['metadata']>> = {}
): NonNullable<PDFExtractionResult['metadata']> {
  return {
    title: fileName,
    creationDate: new Date(),
    modificationDate: new Date(),
    pageCount,
    originalPageCount,
    warnings: warnings.length > 0 ? warnings : undefined,
    ...overrides
  };
}

async function detectPdfPageCount(file: File): Promise<number> {
  try {
    const { PDFDocument }: any = require('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    return Math.max(pdfDoc.getPageCount(), 1);
  } catch {
    return 1;
  }
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  const startTime = Date.now();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Crear una promesa para manejar el parser
    const extractionPromise = new Promise<{text: string, pageCount: number}>((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      
      let fullText = '';
      let pageCount = 0;
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          pageCount = pdfData.Pages?.length || 0;
          
          // Extraer texto de todas las páginas
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        // Decodificar el texto (está en formato URI encoded)
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
                fullText += '\n';
              }
            }
          }
          
          resolve({ text: fullText, pageCount });
        } catch (error) {
          reject(error);
        }
      });
      
      pdfParser.on('pdfParser_dataError', (error: any) => {
        reject(new Error(error.parserError || 'PDF parsing error'));
      });
      
      // Parsear el buffer
      pdfParser.parseBuffer(buffer);
    });
    
    const { text: fullText, pageCount: originalPageCount } = await extractionPromise;
    
    const sanitizedText = sanitizeExtractedText(fullText);
    const characterCount = sanitizedText.length;
    const warnings: string[] = [];

    if (characterCount < MIN_CHAR_THRESHOLD) {
      warnings.push('INSUFFICIENT_TEXT');
      logger.warn('PDF extraction produced limited text', {
        fileName: file.name,
        characterCount,
        threshold: MIN_CHAR_THRESHOLD,
        pageCount: originalPageCount
      }, LOGGER_CONTEXT);
    }

    // Construir páginas desde el texto extraído
    const pages = buildPagesFromText(sanitizedText, originalPageCount);

    if (pages.length === 0 || characterCount === 0) {
      logger.warn('No textual content detected after PDF extraction', {
        fileName: file.name,
        pageCount: originalPageCount
      }, LOGGER_CONTEXT);

      return {
        pages: [{
          pageNumber: 1,
          text: '',
          confidence: 0
        }],
        metadata: createMetadata(file.name, 0, originalPageCount, [], {
          error: 'DOCUMENT_ONLY_IMAGES'
        })
      };
    }

    logger.info('PDF text extraction completed', {
      fileName: file.name,
      pageCount: originalPageCount,
      extractedPages: pages.length,
      characterCount,
      durationMs: Date.now() - startTime
    }, LOGGER_CONTEXT);

    return {
      pages,
      metadata: createMetadata(
        file.name,
        pages.length,
        originalPageCount,
        warnings,
        {
          extractedCharacterCount: characterCount
        }
      )
    };
  } catch (error) {
    logger.error('PDF text extraction failed', {
      fileName: file.name,
      errorMessage: error instanceof Error ? error.message : String(error)
    }, LOGGER_CONTEXT);

    return {
      pages: [{
        pageNumber: 1,
        text: `Error procesando PDF: ${file.name}. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        confidence: 0.1
      }],
      metadata: createMetadata(file.name, 1, 1, [], {
        error: 'PROCESSING_FAILURE'
      })
    };
  }
}

export async function extractTextFromPDFWithOCR(
  file: File,
  language: string = 'spa'
): Promise<PDFExtractionResult> {
  const startTime = Date.now();

  try {
    const Tesseract: any = require('tesseract.js');

    const { data } = await Tesseract.recognize(
      file,
      language,
      {
        logger: (message: any) => {
          if (message.status === 'recognizing text') {
            logger.debug('OCR progress update', {
              progress: Math.round((message.progress ?? 0) * 100)
            }, LOGGER_CONTEXT);
          }
        }
      }
    );

    const sanitizedText = sanitizeExtractedText(data?.text);
    const characterCount = sanitizedText.length;
    const warnings: string[] = [];

    if (characterCount === 0) {
      warnings.push('INSUFFICIENT_TEXT');
    }

    const estimatedPageCount = await detectPdfPageCount(file);
    const basePages = buildPagesFromText(sanitizedText, estimatedPageCount);
    const ocrConfidence = typeof data?.confidence === 'number' ? data.confidence / 100 : 0.8;

    let pages = basePages;

    if (pages.length === 0) {
      pages = chunkText(sanitizedText, DEFAULT_CHUNK_SIZE).map((segment, index) => ({
        pageNumber: index + 1,
        text: segment,
        confidence: ocrConfidence
      }));
    } else {
      pages = pages.map((page) => ({
        ...page,
        confidence: ocrConfidence
      }));
    }

    if (pages.length === 0) {
      logger.warn('OCR did not detect textual content', {
        fileName: file.name,
        language
      }, LOGGER_CONTEXT);

      return {
        pages: [{
          pageNumber: 1,
          text: '',
          confidence: 0
        }],
        metadata: createMetadata(file.name, 0, estimatedPageCount, warnings, {
          error: 'DOCUMENT_ONLY_IMAGES'
        })
      };
    }

    logger.info('OCR extraction completed', {
      fileName: file.name,
      estimatedPages: estimatedPageCount,
      extractedPages: pages.length,
      characterCount,
      durationMs: Date.now() - startTime
    }, LOGGER_CONTEXT);

    return {
      pages,
      metadata: createMetadata(
        file.name,
        pages.length,
        estimatedPageCount,
        warnings,
        {
          extractedCharacterCount: characterCount
        }
      )
    };
  } catch (error) {
    logger.error('OCR extraction failed', {
      fileName: file.name,
      errorMessage: error instanceof Error ? error.message : String(error)
    }, LOGGER_CONTEXT);
    throw error;
  }
}

export function convertPDFToDocument(
  extractionResult: PDFExtractionResult,
  fileName: string,
  docId?: string
): DocumentInput {
  const pages: PageInput[] = extractionResult.pages.map((page) => ({
    page: page.pageNumber,
    chunk_id: `c${page.pageNumber}`,
    text: page.text
  }));

  return {
    doc_id: docId || `pdf_${Date.now()}`,
    source_name: fileName,
    type: 'pdf',
    pages,
    originalPageCount: extractionResult.metadata?.originalPageCount || pages.length
  };
}

export function convertTextToDocument(text: string, fileName: string, chunkSize: number = DEFAULT_CHUNK_SIZE): DocumentInput {
  const sanitized = sanitizeExtractedText(text);
  const fragments = chunkText(sanitized, chunkSize);

  const pages: PageInput[] = fragments.map((fragment, index) => ({
    page: index + 1,
    chunk_id: `c${index + 1}`,
    text: fragment
  }));

  return {
    doc_id: `notes_${Date.now()}`,
    source_name: fileName,
    type: 'notes',
    pages,
    originalPageCount: pages.length,
    text: sanitized
  };
}

export function chunkPDFDocument(document: DocumentInput, chunkSize: number = DEFAULT_CHUNK_SIZE): DocumentInput {
  const originalPageCount = document.originalPageCount ?? document.pages?.length ?? 0;
  const chunkedPages = chunkPages(document.pages, chunkSize);

  return {
    ...document,
    pages: chunkedPages,
    originalPageCount: originalPageCount || chunkedPages.length
  };
}

export function validateDocument(document: DocumentInput): boolean {
  if (!document) {
    return false;
  }

  if (!document.doc_id || !document.source_name) {
    return false;
  }

  if (!Array.isArray(document.pages) || document.pages.length === 0) {
    return false;
  }

  return document.pages.some((page) => Boolean(page.text && page.text.trim().length > 0));
}

export function getDocumentStats(document: DocumentInput) {
  const pages = document.pages ?? [];
  const characterCount = pages.reduce((total, page) => total + (page.text?.length || 0), 0);
  const wordCount = pages.reduce((total, page) => {
    const words = (page.text || '').split(/\s+/).filter((word) => word.length > 0);
    return total + words.length;
  }, 0);

  const estimatedTokens = Math.ceil(characterCount / 4);

  return {
    pageCount: pages.length,
    characterCount,
    wordCount,
    estimatedTokens,
    hasContent: characterCount > 0
  };
}

/**
 * Divide el contenido de un documento en chunks de tamaño específico
 */
export function splitDocumentIntoChunks(documents: DocumentInput[], maxChunkSize: number = 4000): string[] {
  const chunks: string[] = [];
  
  for (const doc of documents) {
    const pages = doc.pages ?? [];
    let currentChunk = '';
    
    for (const page of pages) {
      const pageText = page.text || '';
      
      if (currentChunk.length + pageText.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = pageText;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + pageText;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
  }
  
  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Reduce el contenido del documento cuando excede el límite de contexto
 */
export function reduceDocumentContent(documents: DocumentInput[], targetTokens: number): DocumentInput[] {
  const totalChars = documents.reduce((sum, doc) => {
    return sum + (doc.pages?.reduce((pageSum, page) => pageSum + (page.text?.length || 0), 0) || 0);
  }, 0);
  
  const estimatedTokens = Math.ceil(totalChars / 4);
  
  // Si ya está dentro del límite, retornar sin cambios
  if (estimatedTokens <= targetTokens) {
    return documents;
  }
  
  // Calcular el ratio de reducción necesario
  const reductionRatio = targetTokens / estimatedTokens;
  
  return documents.map(doc => {
    const pages = doc.pages ?? [];
    const reducedPages = pages.map(page => {
      const text = page.text || '';
      const targetLength = Math.floor(text.length * reductionRatio);
      
      // Tomar las primeras oraciones que quepan en el targetLength
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let reducedText = '';
      
      for (const sentence of sentences) {
        if (reducedText.length + sentence.length <= targetLength) {
          reducedText += sentence;
        } else {
          break;
        }
      }
      
      return {
        ...page,
        text: reducedText || text.slice(0, targetLength)
      };
    });
    
    return {
      ...doc,
      pages: reducedPages
    };
  });
}

