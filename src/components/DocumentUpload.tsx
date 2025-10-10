'use client';

import { useState, useCallback, useRef } from 'react';
import { DocumentInput, FileUpload, ProcessingStatus } from '@/types';
import { formatFileSize } from '@/utils';

interface DocumentUploadProps {
  onDocumentProcessed: (document: DocumentInput) => void;
  onError: (error: string) => void;
  className?: string;
}

export default function DocumentUpload({ onDocumentProcessed, onError, className = '' }: Readonly<DocumentUploadProps>) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'idle' });
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const fileUpload: FileUpload = {
        file,
        name: file.name,
        type: file.type,
        size: file.size
      };

      setUploadedFiles(prev => [...prev, fileUpload]);
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      setStatus({ status: 'idle' });
    }
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
          w-full cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition sm:p-8
          text-slate-800 dark:text-slate-100
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
              : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500'
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
          <div className="text-4xl text-slate-400 dark:text-slate-500">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-base font-medium text-slate-700 dark:text-slate-200 sm:text-lg">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra archivos aquí'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            o{' '}
            <label
              htmlFor="file-upload"
              className="cursor-pointer font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              selecciona archivos
            </label>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Formatos soportados: PDF, TXT (máx. 50MB)
          </div>
        </div>
      </button>

      {/* Estado de procesamiento */}
      {status.status !== 'idle' && (
        <div className={`text-sm ${getStatusColor()}`}>
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

      {/* Lista de archivos cargados */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">Archivos cargados:</h3>
          <div className="space-y-2">
            {uploadedFiles.map((fileUpload, index) => (
              <div key={fileUpload.name} className="flex flex-col gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded bg-slate-200 p-2 dark:bg-slate-700">
                    <svg className="h-6 w-6 text-slate-600 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {fileUpload.type === 'application/pdf' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{fileUpload.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {formatFileSize(fileUpload.size)} • {fileUpload.type}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeFile(index)}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
