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
  recommended_questions?: number; // Número recomendado basado en el contenido (DEPRECATED)
  min_recommended_questions?: number; // Mínimo recomendado (rango conservador)
  max_recommended_questions?: number; // Máximo recomendado (rango equilibrado) - OBJETIVO A ALCANZAR
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
    titulo_quiz_o_tema,
    recommended_questions, // DEPRECATED - mantener para compatibilidad
    min_recommended_questions,
    max_recommended_questions
  } = params;

  const now = new Date().toISOString();
  const temas_prioritarios_json = JSON.stringify(temas_prioritarios);

  // Calcular palabras para el mensaje
  const wordsCount = documents.reduce((acc, doc) => {
    const text = doc.text || (doc.pages || []).map(p => p.text).join(' ');
    return acc + text.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);

  // Usar nuevo sistema de min/max si está disponible, sino usar el deprecated
  const minRecommended = min_recommended_questions ?? recommended_questions;
  const maxRecommended = max_recommended_questions ?? recommended_questions;


  // Generar nota sobre recomendación si aplica
  const recommendationNote = (minRecommended && maxRecommended && n_preguntas > maxRecommended)
    ? `\n📊 INFORMACIÓN DE CONTEXTO: El usuario solicitó ${n_preguntas} preguntas. Basándose en el contenido del documento (${wordsCount} palabras), el rango óptimo recomendado es de ${minRecommended} a ${maxRecommended} preguntas.

⚠️ INSTRUCCIÓN CRÍTICA - TU OBJETIVO:
1. **OBJETIVO PRINCIPAL**: Genera EXACTAMENTE ${n_preguntas} preguntas (lo que el usuario solicitó)
2. **ESTRATEGIA**: Explora TODOS los aspectos del contenido para alcanzar ${n_preguntas} preguntas:
   - Conceptos fundamentales y definiciones
   - Ejemplos y casos prácticos
   - Aplicaciones y usos
   - Comparaciones y diferencias
   - Ventajas y desventajas
   - Relaciones causa-efecto
   - Detalles técnicos
3. **MÍNIMO ABSOLUTO**: Si es IMPOSIBLE generar ${n_preguntas} preguntas con calidad, genera AL MENOS ${Math.max(maxRecommended, Math.ceil(n_preguntas * 0.7))} preguntas (70% de lo solicitado)
4. **EXPLICACIÓN OBLIGATORIA**: Si generas menos de ${n_preguntas} preguntas, DEBES explicar detalladamente en "notes.detalle" por qué fue imposible alcanzar el objetivo

IMPORTANTE: El rango ${minRecommended}-${maxRecommended} es solo INFORMATIVO. Tu meta es ${n_preguntas} preguntas.
`
    : (recommended_questions && recommended_questions < n_preguntas)
      ? `\n📊 INFORMACIÓN DE CONTEXTO: El usuario solicitó ${n_preguntas} preguntas. Basándose en el contenido del documento (${wordsCount} palabras), se recomienda alrededor de ${recommended_questions} preguntas para calidad óptima.

⚠️ INSTRUCCIÓN CRÍTICA - TU OBJETIVO:
1. **OBJETIVO PRINCIPAL**: Genera EXACTAMENTE ${n_preguntas} preguntas (lo que el usuario solicitó)
2. **ESTRATEGIA**: Explora TODOS los aspectos del contenido para alcanzar ${n_preguntas} preguntas
3. **MÍNIMO ABSOLUTO**: Si es IMPOSIBLE generar ${n_preguntas} preguntas con calidad, genera AL MENOS ${Math.max(recommended_questions, Math.ceil(n_preguntas * 0.7))} preguntas (70% de lo solicitado)
4. **EXPLICACIÓN OBLIGATORIA**: Si generas menos de ${n_preguntas} preguntas, DEBES explicar en "notes.detalle" por qué no fue posible

IMPORTANTE: La recomendación de ${recommended_questions} es solo INFORMATIVA. Tu meta es ${n_preguntas} preguntas.
`
      : `\n✓ El número de preguntas solicitadas (${n_preguntas}) es apropiado para el contenido del documento.\n\n⚠️ INSTRUCCIÓN: Genera EXACTAMENTE ${n_preguntas} preguntas explorando todos los aspectos del contenido.\n`;


  return `
Pro Tip: si el archivo es PDF, primero extrae el texto por páginas (pdf.js/tesseract). Pasa ese texto en documents[].pages[].text.
Si son notas sueltas, usa documents[].text.
${recommendationNote}
# INSTRUCCIONES
Quiero que proceses los documentos y devuelvas un RESUMEN y un QUIZ en el idioma indicado, siguiendo el esquema JSON de abajo. 
No uses conocimiento externo. Cita los fragmentos usados.

# PARÁMETROS
idioma_salida: "${idioma}"
nivel_objetivo: "${nivel}"
n_preguntas: ${n_preguntas}
tipos_permitidos: ["opcion_multiple","respuesta_corta","verdadero_falso"]
proporcion_tipos: { "opcion_multiple": ${p_mcq}, "respuesta_corta": ${p_short}, "verdadero_falso": ${p_tf} }

⚠️ DISTRIBUCIÓN REQUERIDA (DEBES CUMPLIR EXACTAMENTE):
- Preguntas de opción múltiple: ${Math.round(p_mcq * n_preguntas)} de ${n_preguntas}
- Preguntas de respuesta corta: ${Math.round(p_short * n_preguntas)} de ${n_preguntas}
- Preguntas verdadero/falso: ${Math.round(p_tf * n_preguntas)} de ${n_preguntas}

temas_prioritarios: ${temas_prioritarios_json}
max_citas_por_pregunta: 2

# CONTEXTO AUTORIZADO (DOCUMENTOS)
documents: ${JSON.stringify(documents, null, 2)}

# EJEMPLO DE DISTRIBUCIÓN CORRECTA
Si n_preguntas=10 y proporcion_tipos={ opcion_multiple:1.0, respuesta_corta:0.0, verdadero_falso:0.0 }
Entonces TODAS las 10 preguntas DEBEN ser de tipo "opcion_multiple"
El array quiz.preguntas debe tener 10 elementos con tipo:"opcion_multiple"

Si n_preguntas=10 y proporcion_tipos={ opcion_multiple:0.5, respuesta_corta:0.3, verdadero_falso:0.2 }
Entonces debes generar: 5 opcion_multiple, 3 respuesta_corta, 2 verdadero_falso

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
    "study_tips": {
      "tecnicas_recomendadas": [
        {
          "tecnica": "Nombre de la técnica (ej: Mapas Conceptuales, Flashcards, Práctica Espaciada)",
          "descripcion": "Breve explicación de cómo aplicar esta técnica al contenido",
          "por_que": "Por qué es efectiva para este material específico",
          "ejemplo": "Ejemplo concreto aplicado a un concepto del documento"
        }
      ],
      "puntos_criticos": [
        "Concepto o tema que requiere especial atención basado en la complejidad del material"
      ],
      "conexiones_clave": [
        "Relación importante entre conceptos que ayuda a la comprensión integral"
      ],
      "errores_comunes": [
        {
          "error": "Error conceptual típico en este tema",
          "correccion": "Cómo evitarlo o pensarlo correctamente"
        }
      ],
      "recursos_extra": [
        {
          "tipo": "ejercicios|lectura|video|práctica",
          "sugerencia": "Qué tipo de recurso buscar para reforzar (sin URLs específicas)"
        }
      ],
      "plan_repaso": {
        "primera_revision": "Qué revisar en las próximas 24 horas",
        "revision_semanal": "Qué practicar durante la semana",
        "antes_examen": "Qué repasar justo antes de un examen"
      }
    },
    "notes": {
      "insuficiente_evidencia": false,
      "detalle": ""
    }
  }
}

🧷 Reglas adicionales

Cobertura: reparte las preguntas para cubrir los temas prioritarios y las secciones más relevantes del resumen.

⚠️ DISTRIBUCIÓN DE TIPOS (MUY IMPORTANTE):
Debes generar EXACTAMENTE las preguntas según la proporción especificada:
- Opción múltiple: ${Math.round(p_mcq * n_preguntas)} preguntas (${Math.round(p_mcq * 100)}%)
- Respuesta corta: ${Math.round(p_short * n_preguntas)} preguntas (${Math.round(p_short * 100)}%)
- Verdadero/Falso: ${Math.round(p_tf * n_preguntas)} preguntas (${Math.round(p_tf * 100)}%)

Si la proporción es 1.0 (100%) para un tipo, TODAS las preguntas deben ser de ese tipo.
Si la proporción es 0.0 (0%) para un tipo, NO debe haber preguntas de ese tipo.
NO ajustes estas proporciones por tu cuenta, respétalas estrictamente.

Claridad: evita enunciados con dependencias externas ("como vimos en clase…").

Verificabilidad: cada explicación debe poder rastrearse a las citas incluidas.

Consistencia: actualiza quiz.n_generadas con el número real que devuelves.

📚 CONSEJOS DE ESTUDIO (REQUERIMIENTOS):

Personalización: Los consejos deben ser ESPECÍFICOS al contenido del documento, no genéricos.
❌ MAL: "Estudia todos los días" 
✅ BIEN: "Practica derivadas de funciones compuestas 15 min diarios, empezando por casos simples"

Técnicas variadas: Sugiere al menos 3 técnicas diferentes (mapas conceptuales, flashcards, práctica espaciada, método Feynman, etc.)

Nivel apropiado: Ajusta los consejos al nivel educativo (${nivel}):
- Secundaria: técnicas visuales, nemotecnias, ejemplos cotidianos
- Universidad: conexiones teóricas, papers, resolución de problemas complejos
- Profesional: aplicaciones prácticas, casos reales, tendencias actuales

Errores comunes: Identifica al menos 2 errores típicos que estudiantes cometen con ESTE contenido específico

Plan de repaso: Debe ser concreto y temporal:
- Primera revisión (24h): Los 3 conceptos más importantes
- Revisión semanal (7 días): Ejercicios de práctica sugeridos
- Antes del examen: Fórmulas/conceptos clave para memorizar

Recursos recomendados: Sugiere tipos de recursos (sin URLs) que complementen el material
`;
};