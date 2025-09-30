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
  };
}