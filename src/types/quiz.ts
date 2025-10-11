// Tipos para el esquema de entrada
export interface DocumentInput {
  doc_id: string;
  source_name: string;
  type: 'pdf' | 'notes';
  pages?: PageInput[];
  text?: string;
}

export interface PageInput {
  page: number;
  chunk_id: string;
  text: string;
}

export interface GenerateQuizRequest {
  idioma: string;
  nivel: 'secundaria' | 'universidad' | 'profesional';
  n_preguntas: number;
  tipos_permitidos: ('opcion_multiple' | 'respuesta_corta' | 'verdadero_falso')[];
  proporcion_tipos: {
    opcion_multiple: number;
    respuesta_corta: number;
    verdadero_falso: number;
  };
  temas_prioritarios: string[];
  documents: DocumentInput[];
  titulo_quiz_o_tema: string;
  max_citas_por_pregunta?: number;
}

// Tipos para el esquema de salida
export interface Cita {
  chunk_id: string;
  page?: number;
  evidencia?: string;
}

export interface Fuente {
  doc_id: string;
  source_name: string;
}

export interface Metadata {
  titulo: string;
  idioma: string;
  nivel: string;
  generado_en: string;
  fuentes?: Fuente[]; // Opcional para evitar errores
  notas_deduplicacion?: string; // Notas sobre el proceso de deduplicación
}

export interface SeccionResumen {
  titulo: string;
  ideas: string[];
  citas: Cita[];
}

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  citas: Cita[];
}

export interface FormulaOTabla {
  nombre: string;
  explicacion_breve: string;
  citas: Cita[];
}

export interface EjemploClave {
  descripcion: string;
  citas: Cita[];
}

export interface Summary {
  overview: string;
  key_points?: string[]; // Opcional para evitar errores
  sections: SeccionResumen[];
  glosario: TerminoGlosario[];
  formulas_o_tablas: FormulaOTabla[];
  ejemplos_clave: EjemploClave[];
}

export interface OpcionPregunta {
  id: string;
  texto: string;
}

export interface Pregunta {
  id: string;
  tipo: 'opcion_multiple' | 'respuesta_corta' | 'verdadero_falso';
  dificultad: 'baja' | 'media' | 'alta';
  etiquetas: string[];
  enunciado: string;
  opciones?: OpcionPregunta[]; // solo para opcion_multiple
  respuesta_correcta: string | boolean;
  explicacion: string;
  citas: Cita[];
}

export interface Quiz {
  n_solicitadas: number;
  n_generadas: number;
  preguntas: Pregunta[];
}

export interface Notes {
  insuficiente_evidencia: boolean;
  detalle: string;
}

export interface QuizResult {
  metadata: Metadata;
  summary: Summary;
  quiz: Quiz;
  study_tips?: string[]; // Opcional en caso de que la API no lo incluya
  notes: Notes;
}

export interface GenerateQuizResponse {
  result?: QuizResult;
  error?: {
    message: string;
    where: string;
  };
}

// Tipos auxiliares para componentes UI
export type TipoPregunta = Pregunta['tipo'];
export type NivelDificultad = Pregunta['dificultad'];
export type NivelEstudio = GenerateQuizRequest['nivel'];

// Constantes útiles
export const TIPOS_PREGUNTA: TipoPregunta[] = ['opcion_multiple', 'respuesta_corta', 'verdadero_falso'];
export const NIVELES_DIFICULTAD: NivelDificultad[] = ['baja', 'media', 'alta'];
export const NIVELES_ESTUDIO: NivelEstudio[] = ['secundaria', 'universidad', 'profesional'];

// Funciones de utilidad para tipos
export const isPreguntaOpcionMultiple = (pregunta: Pregunta): pregunta is Pregunta & { opciones: OpcionPregunta[] } => {
  return pregunta.tipo === 'opcion_multiple';
};

export const isPreguntaVerdaderoFalso = (pregunta: Pregunta): pregunta is Pregunta & { respuesta_correcta: boolean } => {
  return pregunta.tipo === 'verdadero_falso';
};

export const isPreguntaRespuestaCorta = (pregunta: Pregunta): pregunta is Pregunta & { respuesta_correcta: string } => {
  return pregunta.tipo === 'respuesta_corta';
};