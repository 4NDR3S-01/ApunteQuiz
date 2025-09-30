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
      case 'processing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de carga */}
      <button
        type="button"
        className={`
          w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${status.status === 'processing' ? 'opacity-50 pointer-events-none' : ''}
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
          <div className="text-4xl text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-lg font-medium text-gray-700">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra archivos aquí'}
          </div>
          <div className="text-sm text-gray-500">
            o{' '}
            <label
              htmlFor="file-upload"
              className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
            >
              selecciona archivos
            </label>
          </div>
          <div className="text-xs text-gray-400">
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
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{status.message}</span>
            </div>
          )}
          {status.status === 'error' && (
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <h3 className="font-medium text-gray-700">Archivos cargados:</h3>
          <div className="space-y-2">
            {uploadedFiles.map((fileUpload, index) => (
              <div key={fileUpload.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-200 rounded">
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {fileUpload.type === 'application/pdf' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">{fileUpload.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(fileUpload.size)} • {fileUpload.type}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}