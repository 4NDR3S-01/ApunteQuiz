import { DocumentInput } from '@/types';

/**
 * NOTA: Las funciones de extracción de PDF han sido movidas al servidor.
 * Este archivo contiene solo las utilidades que pueden ejecutarse en el cliente.
 */

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