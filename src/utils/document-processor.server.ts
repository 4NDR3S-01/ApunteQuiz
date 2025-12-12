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
    const cleanText = textContent.replaceAll(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ')
                                .replaceAll(/\s+/g, ' ')
                                .trim();
    
    if (cleanText.length > 0) {
      // Usar el número real de páginas del PDF, no una estimación
      // Dividir el texto proporcionalmente entre las páginas reales
      const totalChars = cleanText.length;
      const charsPerPage = Math.ceil(totalChars / pageCount);
      
      // Crear exactamente el número de páginas que tiene el PDF
      for (let i = 0; i < pageCount; i++) {
        const startChar = i * charsPerPage;
        const endChar = Math.min((i + 1) * charsPerPage, totalChars);
        const pageText = cleanText.slice(startChar, endChar).trim();
        
        // Solo crear páginas con contenido, pero mantener el número de página correcto
        if (pageText.length > 0) {
          pages.push({
            pageNumber: i + 1,
            text: pageText,
            confidence: 0.7 // Confianza menor porque es extracción básica
          });
        }
      }
      
      // Si no se creó ninguna página con contenido, crear una página informativa
      if (pages.length === 0) {
        pages.push({
          pageNumber: 1,
          text: `PDF procesado con ${pageCount} página(s). El texto no pudo ser extraído automáticamente. Es posible que el PDF contenga imágenes o esté protegido.`,
          confidence: 0.1
        });
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
        modificationDate: new Date(),
        pageCount: pageCount // Almacenar el número real de páginas del PDF
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
    
    // Para OCR, intentar obtener el número real de páginas del PDF si es posible
    // Si no es posible, usar una estimación conservadora basada en el tamaño del texto
    let estimatedPageCount = 1;
    try {
      // Intentar obtener el número real de páginas del PDF
      const { PDFDocument } = require('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      estimatedPageCount = pdfDoc.getPageCount();
    } catch {
      // Si falla, usar estimación conservadora: ~2000 caracteres por página
      estimatedPageCount = Math.max(1, Math.ceil(text.length / 2000));
    }
    
    const pages: Array<{ pageNumber: number; text: string; confidence?: number }> = [];
    
    if (estimatedPageCount === 1) {
      pages.push({
        pageNumber: 1,
        text: text.trim(),
        confidence: confidence / 100 // Tesseract devuelve confidence 0-100
      });
    } else {
      // Dividir el texto proporcionalmente entre las páginas reales
      const charsPerPage = Math.ceil(text.length / estimatedPageCount);
      
      for (let i = 0; i < estimatedPageCount; i++) {
        const startChar = i * charsPerPage;
        const endChar = Math.min((i + 1) * charsPerPage, text.length);
        const pageText = text.slice(startChar, endChar).trim();
        
        if (pageText.length > 0) {
          pages.push({
            pageNumber: i + 1,
            text: pageText,
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
        modificationDate: new Date(),
        pageCount: estimatedPageCount // Almacenar el número real de páginas del PDF
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
    pages,
    originalPageCount: extractionResult.metadata?.pageCount || pages.length // Usar el número real del PDF
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

/**
 * Calcula la densidad de información de una página (palabras únicas / total palabras)
 */
function calculatePageDensity(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return 0;
  
  const uniqueWords = new Set(words);
  return uniqueWords.size / words.length;
}

/**
 * Reduce el contenido de un documento para que quepa en el límite de contexto
 * Estrategias:
 * 1. Limitar texto por página (máximo caracteres)
 * 2. Mantener primeras y últimas páginas, eliminar del medio
 * 3. Priorizar páginas con mayor densidad de información
 * 4. Eliminar texto duplicado
 */
export function reduceDocumentContent(
  document: DocumentInput,
  maxCharsPerPage: number = 1500,
  maxPages?: number
): {
  document: DocumentInput;
  reductionApplied: boolean;
  originalStats: { pages: number; chars: number };
  reducedStats: { pages: number; chars: number };
  strategy: string[];
} {
  const strategy: string[] = [];
  const originalStats = {
    pages: document.type === 'pdf' ? (document.pages?.length || 0) : 1,
    chars: document.type === 'pdf' 
      ? (document.pages?.reduce((sum, p) => sum + p.text.length, 0) || 0)
      : (document.text?.length || 0)
  };

  // Si no hay contenido, retornar sin cambios
  if (document.type === 'pdf' && (!document.pages || document.pages.length === 0)) {
    return {
      document,
      reductionApplied: false,
      originalStats,
      reducedStats: originalStats,
      strategy: []
    };
  }

  if (document.type === 'notes' && (!document.text || document.text.length === 0)) {
    return {
      document,
      reductionApplied: false,
      originalStats,
      reducedStats: originalStats,
      strategy: []
    };
  }

  let reducedDocument: DocumentInput;

  if (document.type === 'pdf' && document.pages) {
    let pages = [...document.pages];

    // Estrategia 1: Limitar texto por página
    pages = pages.map(page => {
      if (page.text.length > maxCharsPerPage) {
        strategy.push(`Página ${page.page} truncada de ${page.text.length} a ${maxCharsPerPage} caracteres`);
        // Truncar manteniendo el inicio (más importante generalmente)
        return {
          ...page,
          text: page.text.substring(0, maxCharsPerPage) + '... [contenido truncado]'
        };
      }
      return page;
    });

    // Estrategia 2: Si hay demasiadas páginas, mantener primeras y últimas
    if (maxPages && pages.length > maxPages) {
      const keepFirst = Math.ceil(maxPages * 0.4); // 40% primeras
      const keepLast = Math.floor(maxPages * 0.3); // 30% últimas
      const keepMiddle = maxPages - keepFirst - keepLast; // 30% del medio (más densas)

      // Calcular densidad de páginas del medio
      const middlePages = pages.slice(keepFirst, pages.length - keepLast);
      const pagesWithDensity = middlePages.map((page, idx) => ({
        page,
        index: keepFirst + idx,
        density: calculatePageDensity(page.text)
      }));

      // Ordenar por densidad y tomar las mejores
      pagesWithDensity.sort((a, b) => b.density - a.density);
      const bestMiddlePages = pagesWithDensity.slice(0, keepMiddle).sort((a, b) => a.index - b.index);

      const firstPages = pages.slice(0, keepFirst);
      const lastPages = pages.slice(pages.length - keepLast);
      const selectedMiddlePages = bestMiddlePages.map(p => p.page);

      pages = [...firstPages, ...selectedMiddlePages, ...lastPages];
      
      strategy.push(`Reducido de ${originalStats.pages} a ${pages.length} páginas (manteniendo primeras ${keepFirst}, mejores ${keepMiddle} del medio, últimas ${keepLast})`);
    }

    // Estrategia 3: Eliminar páginas con muy poco contenido o duplicadas
    const seenTexts = new Set<string>();
    pages = pages.filter(page => {
      const normalizedText = page.text.toLowerCase().trim().replaceAll(/\s+/g, ' ');
      
      // Eliminar páginas muy cortas (menos de 50 caracteres)
      if (page.text.length < 50) {
        strategy.push(`Página ${page.page} eliminada (muy corta: ${page.text.length} caracteres)`);
        return false;
      }

      // Eliminar páginas duplicadas
      if (seenTexts.has(normalizedText)) {
        strategy.push(`Página ${page.page} eliminada (duplicada)`);
        return false;
      }

      seenTexts.add(normalizedText);
      return true;
    });

    reducedDocument = {
      ...document,
      pages
    };
  } else if (document.type === 'notes' && document.text) {
    // Para texto plano, simplemente truncar
    let text = document.text;
    
    if (text.length > maxCharsPerPage * 10) { // Si es muy largo (más de 10 páginas equivalentes)
      const maxLength = maxCharsPerPage * 5; // Limitar a ~5 páginas equivalentes
      text = text.substring(0, maxLength) + '\n\n... [contenido truncado]';
      strategy.push(`Texto truncado de ${document.text.length} a ${text.length} caracteres`);
    }

    reducedDocument = {
      ...document,
      text
    };
  } else {
    // No se puede reducir, retornar original
    return {
      document,
      reductionApplied: false,
      originalStats,
      reducedStats: originalStats,
      strategy: []
    };
  }

  const reducedStats = {
    pages: reducedDocument.type === 'pdf' ? (reducedDocument.pages?.length || 0) : 1,
    chars: reducedDocument.type === 'pdf'
      ? (reducedDocument.pages?.reduce((sum, p) => sum + p.text.length, 0) || 0)
      : (reducedDocument.text?.length || 0)
  };

  return {
    document: reducedDocument,
    reductionApplied: strategy.length > 0,
    originalStats,
    reducedStats,
    strategy
  };
}