'use client';

import { useState, useId, useCallback, useRef, useEffect } from 'react';
import { DocumentInput, ProcessingStatus } from '@/types';
import { formatFileSize } from '@/utils';

interface DocumentUploadProps {
  onDocumentProcessed: (document: DocumentInput) => void;
  onDocumentRemoved: (documentId: string) => void;
  onError: (error: string) => void;
  existingDocuments?: DocumentInput[]; // Documentos ya cargados
  className?: string;
}

export default function DocumentUpload({ 
  onDocumentProcessed, 
  onDocumentRemoved, 
  onError, 
  existingDocuments = [], 
  className = '' 
}: Readonly<DocumentUploadProps>) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'idle' });
  const [processedDocuments, setProcessedDocuments] = useState<DocumentInput[]>(existingDocuments);

  // Sincronizar documentos existentes cuando cambian
  useEffect(() => {
    setProcessedDocuments(existingDocuments);
  }, [existingDocuments]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instructionsId = useId();
  const statusMessageId = useId();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0]; // Por ahora, procesar solo el primer archivo
    
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      onError(`Tipo de archivo no soportado: ${file.type}. Usa PDF o TXT.`);
      return;
    }

    // Validar tamaño (50MB máximo)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      onError(`Archivo demasiado grande: ${formatFileSize(file.size)}. Máximo: 50MB.`);
      return;
    }

    setStatus({ status: 'processing', message: 'Procesando archivo...' });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useOCR', 'false'); // Por defecto no usar OCR
      formData.append('language', 'spa'); // Idioma español por defecto

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error?.message || 'Error procesando archivo');
      }

      // Actualizar estado
      setProcessedDocuments(prev => [...prev, result.data.document]);
      setStatus({ status: 'success', message: 'Archivo procesado exitosamente' });
      
      // Notificar al componente padre
      onDocumentProcessed(result.data.document);

    } catch (error) {
      console.error('Error procesando archivo:', error);
      setStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Error desconocido' 
      });
      onError(error instanceof Error ? error.message : 'Error procesando archivo');
    }
  };

  const removeProcessedDocument = (index: number) => {
    const documentToRemove = processedDocuments[index];
    
    // Notificar al componente padre sobre la eliminación
    if (documentToRemove) {
      onDocumentRemoved(documentToRemove.doc_id);
    }
    
    // Actualizar estado de documentos procesados
    setProcessedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de carga */}
      <button
        type="button"
        className={`
          a11y-surface w-full cursor-pointer border-2 border-dashed border-[color:var(--border-default)] p-6 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] sm:p-8
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
              : 'hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
          }
          ${status.status === 'processing' ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        disabled={status.status === 'processing'}
        aria-describedby={instructionsId}
        aria-busy={status.status === 'processing'}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.txt,text/plain,application/pdf"
          onChange={handleFileSelect}
          disabled={status.status === 'processing'}
        />

        <div className="space-y-2">
          <div className="text-4xl text-[color:var(--text-muted)]">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-base font-medium text-[color:var(--foreground)] sm:text-lg">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra archivos aquí'}
          </div>
          <div id={instructionsId} className="text-sm text-[color:var(--text-muted)]">
            o{' '}
            <label
              htmlFor="file-upload"
              className="cursor-pointer font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              selecciona archivos
            </label>
          </div>
          <div className="text-xs text-[color:var(--text-muted)]">
            Formatos soportados: PDF, TXT (máx. 50MB)
          </div>
        </div>
      </button>

      {/* Estado de procesamiento */}
      {status.status !== 'idle' && (
        <div
          id={statusMessageId}
          className={`text-sm ${getStatusColor()}`}
          role="status"
          aria-live="polite"
        >
          {status.status === 'processing' && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>{status.message}</span>
            </div>
          )}
          {status.status === 'success' && (
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{status.message}</span>
            </div>
          )}
          {status.status === 'error' && (
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{status.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Lista de documentos procesados (existentes) */}
      {processedDocuments.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-[color:var(--foreground)]">Documentos procesados:</h3>
          <div className="space-y-2">
            {processedDocuments.map((document, index) => (
              <div key={document.doc_id} className="a11y-card-muted flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="rounded bg-[color:var(--surface-highlight)] p-2">
                    <svg className="h-6 w-6 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[color:var(--foreground)] truncate" title={document.source_name}>
                      {document.source_name}
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)]">
                      Procesado - {document.pages?.length} páginas
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeProcessedDocument(index)}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
