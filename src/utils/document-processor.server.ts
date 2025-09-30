import { DocumentInput, PageInput, PDFExtractionResult } from '@/types';

/**
 * Procesa un archivo PDF y extrae el texto página por página (SOLO SERVIDOR)
 */
export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    // Usar pdf-lib que es más compatible con Next.js
    const { PDFDocument } = require('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    const pages: Array<{ pageNumber: number; text: string; confidence?: number }> = [];
    
    // pdf-lib no extrae texto directamente, así que necesitamos una alternativa
    // Por ahora, vamos a usar una implementación básica que extrae el contenido como texto plano
    
    // Como pdf-lib no tiene extracción de texto nativa, vamos a usar una aproximación
    // básica dividiendo el archivo en páginas y usando una heurística simple
    const uint8Array = new Uint8Array(arrayBuffer);
    const textContent = new TextDecoder('utf-8', { ignoreBOM: true }).decode(uint8Array);
    
    // Filtrar solo texto legible (eliminar caracteres de control binarios)
    const cleanText = textContent.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();
    
    if (cleanText.length > 0) {
      // Dividir el texto en páginas aproximadas
      const wordsPerPage = 300; // Aproximadamente 300 palabras por página
      const words = cleanText.split(' ').filter(word => word.length > 0);
      const actualPageCount = Math.max(1, Math.min(pageCount, Math.ceil(words.length / wordsPerPage)));
      
      const wordsPerActualPage = Math.ceil(words.length / actualPageCount);
      
      for (let i = 0; i < actualPageCount; i++) {
        const startWord = i * wordsPerActualPage;
        const endWord = Math.min((i + 1) * wordsPerActualPage, words.length);
        const pageWords = words.slice(startWord, endWord);
        
        if (pageWords.length > 0) {
          pages.push({
            pageNumber: i + 1,
            text: pageWords.join(' '),
            confidence: 0.7 // Confianza menor porque es extracción básica
          });
        }
      }
    }
    
    // Si no se pudo extraer texto, crear una página con mensaje informativo
    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: `PDF procesado con ${pageCount} página(s). El texto no pudo ser extraído automáticamente. Es posible que el PDF contenga imágenes o esté protegido.`,
        confidence: 0.1
      });
    }
    
    const result: PDFExtractionResult = {
      pages,
      metadata: {
        title: file.name,
        creationDate: new Date(),
        modificationDate: new Date()
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error extrayendo texto del PDF:', error);
    
    // Fallback: crear una página con información básica del archivo
    const result: PDFExtractionResult = {
      pages: [{
        pageNumber: 1,
        text: `Error procesando PDF: ${file.name}. Archivo recibido pero no se pudo extraer el contenido. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        confidence: 0.1
      }],
      metadata: {
        title: file.name,
        creationDate: new Date(),
        modificationDate: new Date()
      }
    };
    
    return result;
  }
}

/**
 * Procesa un archivo PDF usando OCR (para PDFs escaneados) (SOLO SERVIDOR)
 */
export async function extractTextFromPDFWithOCR(file: File, language: string = 'spa'): Promise<PDFExtractionResult> {
  try {
    // Importar Tesseract.js dinámicamente
    const Tesseract = require('tesseract.js');
    
    // Convertir PDF a imágenes primero (necesitaríamos pdf2pic o similar para esto)
    // Por simplicidad, asumimos que el archivo ya es una imagen o usamos el PDF directamente
    const { data: { text, confidence } } = await Tesseract.recognize(file, language, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    // Dividir el texto extraído en páginas aproximadas
    const textLines = text.split('\n').filter((line: string) => line.trim());
    const approximatePagesCount = Math.max(1, Math.ceil(textLines.length / 40)); // ~40 líneas por página para OCR
    
    const pages: Array<{ pageNumber: number; text: string; confidence?: number }> = [];
    
    if (approximatePagesCount === 1) {
      pages.push({
        pageNumber: 1,
        text: text.trim(),
        confidence: confidence / 100 // Tesseract devuelve confidence 0-100
      });
    } else {
      const linesPerPage = Math.ceil(textLines.length / approximatePagesCount);
      
      for (let i = 0; i < approximatePagesCount; i++) {
        const startLine = i * linesPerPage;
        const endLine = Math.min((i + 1) * linesPerPage, textLines.length);
        const pageText = textLines.slice(startLine, endLine).join('\n');
        
        if (pageText.trim()) {
          pages.push({
            pageNumber: i + 1,
            text: pageText.trim(),
            confidence: confidence / 100
          });
        }
      }
    }
    
    const result: PDFExtractionResult = {
      pages,
      metadata: {
        title: file.name,
        creationDate: new Date(),
        modificationDate: new Date()
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error en OCR del PDF:', error);
    throw new Error(`Error en OCR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Convierte el resultado de extracción de PDF al formato de documento requerido
 */
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
    pages
  };
}

/**
 * Procesa texto plano y lo convierte al formato de documento requerido
 */
export function convertTextToDocument(
  text: string,
  fileName: string,
  docId?: string
): DocumentInput {
  return {
    doc_id: docId || `text_${Date.now()}`,
    source_name: fileName,
    type: 'notes',
    text
  };
}

/**
 * Divide texto largo en chunks más pequeños para mejorar el procesamiento
 */
export function chunkText(text: string, maxChunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }
    
    currentChunk += trimmedSentence + '. ';
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Divide un documento PDF en chunks más pequeños si las páginas son muy largas
 */
export function chunkPDFDocument(document: DocumentInput, maxChunkSize: number = 2000): DocumentInput {
  if (document.type !== 'pdf' || !document.pages) {
    return document;
  }
  
  const chunkedPages: PageInput[] = [];
  
  document.pages.forEach((page) => {
    if (page.text.length <= maxChunkSize) {
      chunkedPages.push(page);
    } else {
      const chunks = chunkText(page.text, maxChunkSize);
      chunks.forEach((chunk, index) => {
        chunkedPages.push({
          page: page.page,
          chunk_id: `${page.chunk_id}_${index + 1}`,
          text: chunk
        });
      });
    }
  });
  
  return {
    ...document,
    pages: chunkedPages
  };
}

/**
 * Valida que un documento tenga el formato correcto
 */
export function validateDocument(document: DocumentInput): boolean {
  if (!document.doc_id || !document.source_name || !document.type) {
    return false;
  }
  
  if (document.type === 'pdf') {
    return Array.isArray(document.pages) && document.pages.length > 0;
  }
  
  if (document.type === 'notes') {
    return typeof document.text === 'string' && document.text.length > 0;
  }
  
  return false;
}

/**
 * Estima el número de tokens aproximado en un texto (útil para APIs con límites)
 */
export function estimateTokens(text: string): number {
  // Estimación aproximada: ~4 caracteres por token en español
  return Math.ceil(text.length / 4);
}

/**
 * Obtiene estadísticas básicas de un documento
 */
export function getDocumentStats(document: DocumentInput) {
  let totalText = '';
  let pageCount = 0;
  
  if (document.type === 'pdf' && document.pages) {
    pageCount = document.pages.length;
    totalText = document.pages.map(p => p.text).join(' ');
  } else if (document.type === 'notes' && document.text) {
    pageCount = 1;
    totalText = document.text;
  }
  
  return {
    pageCount,
    characterCount: totalText.length,
    wordCount: totalText.split(/\s+/).filter(word => word.length > 0).length,
    estimatedTokens: estimateTokens(totalText),
    hasContent: totalText.length > 0
  };
}