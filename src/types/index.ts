// Re-exportar todos los tipos desde aquí para facilitar las importaciones
export * from './quiz';

// Tipos adicionales que pueden ser útiles
export interface FileUpload {
  file: File;
  name: string;
  type: string;
  size: number;
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export interface PDFExtractionResult {
  pages: Array<{
    pageNumber: number;
    text: string;
    confidence?: number; // para OCR
  }>;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount?: number; // Número de páginas extraídas con contenido
    originalPageCount?: number; // Número total de páginas del PDF original
    extractedCharacterCount?: number; // Conteo bruto de caracteres extraídos
    warnings?: string[]; // Advertencias no críticas devueltas por el procesador
    error?: 'DOCUMENT_ONLY_IMAGES' | string; // Indica si el documento solo tiene imágenes
  };
}