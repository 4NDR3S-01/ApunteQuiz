import { z } from 'zod';

// Schema para validar documentos de entrada
export const PageInputSchema = z.object({
  page: z.number().min(1),
  chunk_id: z.string().min(1),
  text: z.string().min(1)
});

export const DocumentInputSchema = z.object({
  doc_id: z.string().min(1),
  source_name: z.string().min(1),
  type: z.enum(['pdf', 'notes']),
  pages: z.array(PageInputSchema).optional(),
  text: z.string().optional()
}).refine(
  (data) => {
    if (data.type === 'pdf') {
      return data.pages && data.pages.length > 0;
    }
    if (data.type === 'notes') {
      return data.text && data.text.length > 0;
    }
    return false;
  },
  {
    message: "PDF documents must have pages, notes documents must have text"
  }
);

// Schema para la request de generación de quiz
export const GenerateQuizRequestSchema = z.object({
  idioma: z.string().min(1),
  nivel: z.enum(['secundaria', 'universidad', 'profesional']),
  n_preguntas: z.number().min(1).max(50),
  tipos_permitidos: z.array(z.enum(['opcion_multiple', 'respuesta_corta', 'verdadero_falso'])).min(1),
  proporcion_tipos: z.object({
    opcion_multiple: z.number().min(0).max(1),
    respuesta_corta: z.number().min(0).max(1),
    verdadero_falso: z.number().min(0).max(1)
  }).refine(
    (data) => {
      const suma = data.opcion_multiple + data.respuesta_corta + data.verdadero_falso;
      return Math.abs(suma - 1) < 0.01; // Permitir pequeñas diferencias por punto flotante
    },
    {
      message: "Las proporciones deben sumar 1.0"
    }
  ),
  temas_prioritarios: z.array(z.string()),
  documents: z.array(DocumentInputSchema).min(1),
  titulo_quiz_o_tema: z.string().min(1),
  max_citas_por_pregunta: z.number().min(1).max(5).optional()
});

// Schemas para la respuesta del quiz
export const CitaSchema = z.object({
  chunk_id: z.string(),
  page: z.number().optional(),
  evidencia: z.string().optional()
});

export const FuenteSchema = z.object({
  doc_id: z.string(),
  source_name: z.string()
});

export const MetadataSchema = z.object({
  titulo: z.string(),
  idioma: z.string(),
  nivel: z.string(),
  generado_en: z.string(),
  fuentes: z.array(FuenteSchema)
});

export const SeccionResumenSchema = z.object({
  titulo: z.string(),
  ideas: z.array(z.string()),
  citas: z.array(CitaSchema)
});

export const TerminoGlosarioSchema = z.object({
  termino: z.string(),
  definicion: z.string(),
  citas: z.array(CitaSchema)
});

export const FormulaOTablaSchema = z.object({
  nombre: z.string(),
  explicacion_breve: z.string(),
  citas: z.array(CitaSchema)
});

export const EjemploClaveSchema = z.object({
  descripcion: z.string(),
  citas: z.array(CitaSchema)
});

export const SummarySchema = z.object({
  overview: z.string(),
  key_points: z.array(z.string()),
  sections: z.array(SeccionResumenSchema),
  glosario: z.array(TerminoGlosarioSchema),
  formulas_o_tablas: z.array(FormulaOTablaSchema),
  ejemplos_clave: z.array(EjemploClaveSchema)
});

export const OpcionPreguntaSchema = z.object({
  id: z.string(),
  texto: z.string()
});

export const PreguntaSchema = z.object({
  id: z.string(),
  tipo: z.enum(['opcion_multiple', 'respuesta_corta', 'verdadero_falso']),
  dificultad: z.enum(['baja', 'media', 'alta']),
  etiquetas: z.array(z.string()),
  enunciado: z.string().min(10),
  opciones: z.array(OpcionPreguntaSchema).optional(),
  respuesta_correcta: z.union([z.string(), z.boolean()]),
  explicacion: z.string().min(10),
  citas: z.array(CitaSchema).min(1)
}).refine(
  (data) => {
    // Validar que preguntas de opción múltiple tengan opciones
    if (data.tipo === 'opcion_multiple') {
      return data.opciones && data.opciones.length >= 2;
    }
    return true;
  },
  {
    message: "Preguntas de opción múltiple deben tener al menos 2 opciones"
  }
).refine(
  (data) => {
    // Validar que preguntas de verdadero/falso tengan respuesta booleana
    if (data.tipo === 'verdadero_falso') {
      return typeof data.respuesta_correcta === 'boolean';
    }
    return true;
  },
  {
    message: "Preguntas de verdadero/falso deben tener respuesta booleana"
  }
).refine(
  (data) => {
    // Validar que preguntas de opción múltiple y respuesta corta tengan respuesta string
    if (data.tipo === 'opcion_multiple' || data.tipo === 'respuesta_corta') {
      return typeof data.respuesta_correcta === 'string';
    }
    return true;
  },
  {
    message: "Preguntas de opción múltiple y respuesta corta deben tener respuesta string"
  }
);

export const QuizSchema = z.object({
  n_solicitadas: z.number(),
  n_generadas: z.number(),
  preguntas: z.array(PreguntaSchema)
}).refine(
  (data) => data.n_generadas === data.preguntas.length,
  {
    message: "n_generadas debe coincidir con el número de preguntas"
  }
);

export const NotesSchema = z.object({
  insuficiente_evidencia: z.boolean(),
  detalle: z.string()
});

export const QuizResultSchema = z.object({
  metadata: MetadataSchema,
  summary: SummarySchema,
  quiz: QuizSchema,
  study_tips: z.array(z.string()),
  notes: NotesSchema
});

export const GenerateQuizResponseSchema = z.object({
  result: QuizResultSchema.optional(),
  error: z.object({
    message: z.string(),
    where: z.string()
  }).optional()
}).refine(
  (data) => !!(data.result || data.error),
  {
    message: "Debe tener result o error"
  }
);

// Schema para archivos subidos
export const FileUploadSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().min(1).max(50 * 1024 * 1024), // Máximo 50MB
  lastModified: z.number()
});

// Schema para configuración de AI
export const AIProviderSchema = z.object({
  name: z.enum(['openai', 'anthropic']),
  model: z.string().min(1),
  apiKey: z.string().min(1)
});

// Funciones de validación helper
export function validateGenerateQuizRequest(data: unknown) {
  try {
    return {
      success: true as const,
      data: GenerateQuizRequestSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof z.ZodError ? error.issues : 'Error de validación desconocido'
    };
  }
}

export function validateQuizResponse(data: unknown) {
  try {
    return {
      success: true as const,
      data: GenerateQuizResponseSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof z.ZodError ? error.issues : 'Error de validación desconocido'
    };
  }
}

export function validateDocument(data: unknown) {
  try {
    return {
      success: true as const,
      data: DocumentInputSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof z.ZodError ? error.issues : 'Error de validación desconocido'
    };
  }
}

export function validateFileUpload(file: File) {
  try {
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    };
    
    return {
      success: true as const,
      data: FileUploadSchema.parse(fileData)
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof z.ZodError ? error.issues : 'Error de validación desconocido'
    };
  }
}

// Tipos inferidos desde los schemas
export type ValidatedGenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;
export type ValidatedQuizResponse = z.infer<typeof GenerateQuizResponseSchema>;
export type ValidatedDocument = z.infer<typeof DocumentInputSchema>;
export type ValidatedFileUpload = z.infer<typeof FileUploadSchema>;