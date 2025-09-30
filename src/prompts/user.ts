export interface UserPromptParams {
  idioma: string;
  nivel: string;
  n_preguntas: number;
  p_mcq: number;
  p_short: number;
  p_tf: number;
  temas_prioritarios: string[];
  documents: Document[];
  titulo_quiz_o_tema: string;
}

export interface Document {
  doc_id: string;
  source_name: string;
  type: 'pdf' | 'notes';
  pages?: Page[];
  text?: string;
}

export interface Page {
  page: number;
  chunk_id: string;
  text: string;
}

export const createUserPrompt = (params: UserPromptParams): string => {
  const {
    idioma,
    nivel,
    n_preguntas,
    p_mcq,
    p_short,
    p_tf,
    temas_prioritarios,
    documents,
    titulo_quiz_o_tema
  } = params;

  const now = new Date().toISOString();
  const temas_prioritarios_json = JSON.stringify(temas_prioritarios);

  return `
Pro Tip: si el archivo es PDF, primero extrae el texto por páginas (pdf.js/tesseract). Pasa ese texto en documents[].pages[].text.
Si son notas sueltas, usa documents[].text.

# INSTRUCCIONES
Quiero que proceses los documentos y devuelvas un RESUMEN y un QUIZ en el idioma indicado, siguiendo el esquema JSON de abajo. 
No uses conocimiento externo. Cita los fragmentos usados.

# PARÁMETROS
idioma_salida: "${idioma}"
nivel_objetivo: "${nivel}"
n_preguntas: ${n_preguntas}
tipos_permitidos: ["opcion_multiple","respuesta_corta","verdadero_falso"]
proporcion_tipos: { "opcion_multiple": ${p_mcq}, "respuesta_corta": ${p_short}, "verdadero_falso": ${p_tf} }
temas_prioritarios: ${temas_prioritarios_json}
max_citas_por_pregunta: 2

# CONTEXTO AUTORIZADO (DOCUMENTOS)
documents: ${JSON.stringify(documents, null, 2)}

# ESQUEMA DE SALIDA (DEVUELVE SOLO ESTE JSON)
{
  "result": {
    "metadata": {
      "titulo": "${titulo_quiz_o_tema}",
      "idioma": "${idioma}",
      "nivel": "${nivel}",
      "generado_en": "${now}",
      "fuentes": ${JSON.stringify(documents.map(d => ({ doc_id: d.doc_id, source_name: d.source_name })), null, 8)}
    },
    "summary": {
      "overview": "3-6 oraciones que capturen el tema central y el propósito.",
      "key_points": [
        "Punto clave 1...",
        "Punto clave 2..."
      ],
      "sections": [
        {
          "titulo": "Nombre de la sección/tema",
          "ideas": ["idea 1","idea 2","idea 3"],
          "citas": [
            { "chunk_id":"c2", "page": 2, "evidencia":"frase breve (≤30 palabras)" }
          ]
        }
      ],
      "glosario": [
        { "termino":"...", "definicion":"...", "citas":[{"chunk_id":"c1","page":1}] }
      ],
      "formulas_o_tablas": [
        { "nombre":"Regla del producto", "explicacion_breve":"...", "citas":[{"chunk_id":"c2","page":2}] }
      ],
      "ejemplos_clave": [
        { "descripcion":"...", "citas":[{"chunk_id":"c3","page":3}] }
      ]
    },
    "quiz": {
      "n_solicitadas": ${n_preguntas},
      "n_generadas": 0,
      "preguntas": [
        {
          "id": "q1",
          "tipo": "opcion_multiple",
          "dificultad": "baja",
          "etiquetas": ["tema1","tema2"],
          "enunciado": "Texto claro y no ambiguo",
          "opciones": [
            { "id":"A", "texto":"..." },
            { "id":"B", "texto":"..." },
            { "id":"C", "texto":"..." },
            { "id":"D", "texto":"..." }
          ],
          "respuesta_correcta": "A",
          "explicacion": "Justificación breve (1-3 frases) basada en el contexto.",
          "citas": [
            { "chunk_id":"c2", "page": 2, "evidencia":"frase breve (≤30 palabras)" }
          ]
        }
      ]
    },
    "study_tips": [
      "Consejo corto de estudio 1 enfocado a los puntos más débiles",
      "Consejo 2..."
    ],
    "notes": {
      "insuficiente_evidencia": false,
      "detalle": ""
    }
  }
}

🧷 Reglas adicionales

Cobertura: reparte las preguntas para cubrir los temas prioritarios y las secciones más relevantes del resumen.

Variedad: mezcla tipos (MCQ/RC/TF) según proporcion_tipos.

Claridad: evita enunciados con dependencias externas ("como vimos en clase…").

Verificabilidad: cada explicación debe poder rastrearse a las citas incluidas.

Consistencia: actualiza quiz.n_generadas con el número real que devuelves.
`;
};