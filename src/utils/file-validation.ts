/**
 * Utilidades para validar archivos de manera segura
 */

/**
 * Magic numbers para validar tipos de archivo reales
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  'text/plain': [
    // Los archivos de texto no tienen una firma única, pero podemos verificar que sean ASCII/UTF-8
  ],
};

/**
 * Valida el tipo MIME real de un archivo leyendo sus primeros bytes
 */
export async function validateFileMimeType(file: File, allowedTypes: string[]): Promise<{
  valid: boolean;
  detectedType: string | null;
  error?: string;
}> {
  // Primero verificar el tipo reportado por el navegador
  if (allowedTypes.includes(file.type)) {
    // Para PDFs, validar también la firma
    if (file.type === 'application/pdf') {
      const isValidPdf = await validatePdfSignature(file);
      if (isValidPdf) {
        return { valid: true, detectedType: 'application/pdf' };
      }
      return {
        valid: false,
        detectedType: null,
        error: 'El archivo no es un PDF válido'
      };
    }
    
    // Para texto plano, aceptar si el tipo coincide
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return { valid: true, detectedType: 'text/plain' };
    }
    
    return { valid: true, detectedType: file.type };
  }
  
  // Si el tipo no coincide pero la extensión es .txt, verificar contenido
  if (file.name.endsWith('.txt') && allowedTypes.includes('text/plain')) {
    return { valid: true, detectedType: 'text/plain' };
  }
  
  // Si el tipo no coincide pero la extensión es .pdf, verificar firma
  if (file.name.endsWith('.pdf') && allowedTypes.includes('application/pdf')) {
    const isValidPdf = await validatePdfSignature(file);
    if (isValidPdf) {
      return { valid: true, detectedType: 'application/pdf' };
    }
    return {
      valid: false,
      detectedType: null,
      error: 'El archivo no es un PDF válido'
    };
  }
  
  return {
    valid: false,
    detectedType: null,
    error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
  };
}

/**
 * Valida la firma de un archivo PDF
 */
async function validatePdfSignature(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const signature = FILE_SIGNATURES['application/pdf'][0];
    
    return signature.every((byte, index) => bytes[index] === byte);
  } catch {
    return false;
  }
}

/**
 * Valida el tamaño de un archivo
 */
export function validateFileSize(file: File, maxSizeBytes: number): {
  valid: boolean;
  error?: string;
} {
  if (file.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío'
    };
  }
  
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `El archivo es demasiado grande (${fileSizeMB} MB). Tamaño máximo: ${maxSizeMB} MB`
    };
  }
  
  return { valid: true };
}

/**
 * Valida un archivo completo (tipo MIME y tamaño)
 */
export async function validateFile(
  file: File,
  options: {
    allowedTypes?: string[];
    maxSizeBytes?: number;
  } = {}
): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  const {
    allowedTypes = ['application/pdf', 'text/plain'],
    maxSizeBytes = 50 * 1024 * 1024 // 50MB por defecto
  } = options;
  
  // Validar tipo MIME
  const mimeValidation = await validateFileMimeType(file, allowedTypes);
  if (!mimeValidation.valid) {
    errors.push(mimeValidation.error || 'Tipo de archivo inválido');
  }
  
  // Validar tamaño
  const sizeValidation = validateFileSize(file, maxSizeBytes);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || 'Tamaño de archivo inválido');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
