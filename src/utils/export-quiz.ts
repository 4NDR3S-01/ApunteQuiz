/**
 * Utilidades para exportar quizzes a diferentes formatos
 */

import type { QuizResult } from '@/types';

/**
 * Exporta un quiz a formato Markdown
 */
export function exportQuizToMarkdown(quizResult: QuizResult): string {
  const { metadata, quiz, summary } = quizResult;
  
  let markdown = `# ${metadata.titulo}\n\n`;
  markdown += `**Nivel:** ${metadata.nivel}\n`;
  markdown += `**Idioma:** ${metadata.idioma}\n`;
  markdown += `**Generado:** ${new Date(metadata.generado_en).toLocaleDateString()}\n\n`;
  
  if (summary.overview) {
    markdown += `## Resumen\n\n${summary.overview}\n\n`;
  }
  
  if (summary.key_points && summary.key_points.length > 0) {
    markdown += `## Puntos Clave\n\n`;
    summary.key_points.forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += `\n`;
  }
  
  markdown += `## Preguntas del Quiz\n\n`;
  markdown += `**Total:** ${quiz.n_generadas} de ${quiz.n_solicitadas} preguntas solicitadas\n\n`;
  
  quiz.preguntas.forEach((pregunta, index) => {
    markdown += `### Pregunta ${index + 1}: ${pregunta.tipo}\n\n`;
    markdown += `**Enunciado:** ${pregunta.enunciado}\n\n`;
    
    if (pregunta.tipo === 'opcion_multiple' && pregunta.opciones) {
      markdown += `**Opciones:**\n`;
      pregunta.opciones.forEach(opcion => {
        const isCorrect = opcion.id === pregunta.respuesta_correcta;
        markdown += `- ${isCorrect ? '✓' : ' '} ${opcion.texto}${isCorrect ? ' (Correcta)' : ''}\n`;
      });
      markdown += `\n`;
    } else if (pregunta.tipo === 'verdadero_falso') {
      markdown += `**Respuesta correcta:** ${pregunta.respuesta_correcta ? 'Verdadero' : 'Falso'}\n\n`;
    } else {
      markdown += `**Respuesta correcta:** ${pregunta.respuesta_correcta}\n\n`;
    }
    
    if (pregunta.explicacion) {
      markdown += `**Explicación:** ${pregunta.explicacion}\n\n`;
    }
    
    if (pregunta.citas && pregunta.citas.length > 0) {
      markdown += `**Referencias:**\n`;
      pregunta.citas.forEach(cita => {
        markdown += `- Página ${cita.page || 'N/A'}: ${cita.evidencia || 'Sin evidencia'}\n`;
      });
      markdown += `\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
}

/**
 * Descarga un archivo de texto
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta quiz a Markdown y lo descarga
 */
export function exportQuizToMarkdownFile(quizResult: QuizResult) {
  const markdown = exportQuizToMarkdown(quizResult);
  const filename = `${quizResult.metadata.titulo.replace(/[^a-z0-9]/gi, '_')}_quiz.md`;
  downloadTextFile(markdown, filename, 'text/markdown');
}

/**
 * Genera HTML para impresión/PDF
 */
export function exportQuizToHTML(quizResult: QuizResult): string {
  const { metadata, quiz, summary } = quizResult;
  
  let html = `<!DOCTYPE html>
<html lang="${metadata.idioma}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.titulo}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    h3 { color: #3b82f6; margin-top: 20px; }
    .question { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc; }
    .correct { color: #059669; font-weight: bold; }
    .explanation { margin-top: 10px; padding: 10px; background: #ecfdf5; border-radius: 4px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(metadata.titulo)}</h1>
  <p><strong>Nivel:</strong> ${escapeHtml(metadata.nivel)}</p>
  <p><strong>Idioma:</strong> ${escapeHtml(metadata.idioma)}</p>
  <p><strong>Generado:</strong> ${new Date(metadata.generado_en).toLocaleDateString()}</p>
`;
  
  if (summary.overview) {
    html += `  <h2>Resumen</h2>\n  <p>${escapeHtml(summary.overview)}</p>\n`;
  }
  
  html += `  <h2>Preguntas del Quiz</h2>\n`;
  html += `  <p><strong>Total:</strong> ${quiz.n_generadas} de ${quiz.n_solicitadas} preguntas</p>\n`;
  
  quiz.preguntas.forEach((pregunta, index) => {
    html += `  <div class="question">\n`;
    html += `    <h3>Pregunta ${index + 1}: ${escapeHtml(pregunta.enunciado)}</h3>\n`;
    
    if (pregunta.tipo === 'opcion_multiple' && pregunta.opciones) {
      html += `    <ul>\n`;
      pregunta.opciones.forEach(opcion => {
        const isCorrect = opcion.id === pregunta.respuesta_correcta;
        html += `      <li class="${isCorrect ? 'correct' : ''}">${escapeHtml(opcion.texto)}${isCorrect ? ' ✓' : ''}</li>\n`;
      });
      html += `    </ul>\n`;
    } else {
      html += `    <p class="correct">Respuesta correcta: ${escapeHtml(String(pregunta.respuesta_correcta))}</p>\n`;
    }
    
    if (pregunta.explicacion) {
      html += `    <div class="explanation">\n`;
      html += `      <strong>Explicación:</strong> ${escapeHtml(pregunta.explicacion)}\n`;
      html += `    </div>\n`;
    }
    
    html += `  </div>\n`;
  });
  
  html += `</body>\n</html>`;
  
  return html;
}

/**
 * Exporta quiz a HTML y lo descarga
 */
export function exportQuizToHTMLFile(quizResult: QuizResult) {
  const html = exportQuizToHTML(quizResult);
  const filename = `${quizResult.metadata.titulo.replace(/[^a-z0-9]/gi, '_')}_quiz.html`;
  downloadTextFile(html, filename, 'text/html');
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
