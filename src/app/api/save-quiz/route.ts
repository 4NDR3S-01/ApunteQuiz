import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { QuizResult, Pregunta } from '@/types/quiz';
import { withAuth, requireAuth } from '@/lib/auth-helpers';
import { ValidationError } from '@/utils/error-handling';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    
    if (!auth) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor, inicia sesión.' },
        { status: 401 }
      );
    }
    
    const { user, supabase } = auth;

    const body = await request.json();
    const { quizData, documentIds, documents }: { 
      quizData: QuizResult; 
      documentIds: string[];
      documents: Array<{ source_name: string; type: string }>;
    } = body;

    // Validar que los datos requeridos estén presentes
    if (!quizData || !quizData.quiz || !quizData.quiz.preguntas) {
      throw new ValidationError('Datos de quiz inválidos o incompletos');
    }

    console.log('Guardando quiz para usuario:', user.id);
    console.log('Datos del quiz:', {
      titulo: quizData.metadata?.titulo,
      nivel: quizData.metadata?.nivel,
      totalPreguntas: quizData.quiz?.preguntas?.length
    });

    const quizInsertData = {
      user_id: user.id,
      title: quizData.metadata?.titulo || 'Quiz sin título',
      description: null,
      education_level: quizData.metadata?.nivel || null,
      language: quizData.metadata?.idioma || 'Español',
      total_questions: 0,
    };

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizInsertData as any)
      .select()
      .single();

    if (quizError || !quiz) {
      console.error('Error creando quiz:', quizError);
      return NextResponse.json(
        { error: 'Error al guardar el quiz', details: quizError },
        { status: 500 }
      );
    }

    const quizId = (quiz as any).id;
    console.log('Quiz creado con ID:', quizId);

    // Mapear tipos de preguntas de español a inglés (formato de la BD)
    const questionTypeMap: Record<string, string> = {
      'opcion_multiple': 'multiple_choice',
      'verdadero_falso': 'true_false',
      'respuesta_corta': 'open_ended'
    };

    const questions = (quizData.quiz?.preguntas || []).map((pregunta: Pregunta) => ({
      quiz_id: quizId,
      question_text: pregunta.enunciado,
      question_type: questionTypeMap[pregunta.tipo] || pregunta.tipo,
      options: pregunta.opciones ? structuredClone(pregunta.opciones) : null,
      correct_answer: String(pregunta.respuesta_correcta),
      explanation: pregunta.explicacion || null,
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questions as any);

    if (questionsError) {
      console.error('Error creando preguntas:', questionsError);
      await supabase.from('quizzes').delete().eq('id', quizId);
      return NextResponse.json(
        { error: 'Error al guardar las preguntas', details: questionsError },
        { status: 500 }
      );
    }

    console.log(`${questions.length} preguntas guardadas exitosamente`);

    // Actualizar el conteo de preguntas en el quiz
    const quizzesTable = supabase.from('quizzes') as any;
    await quizzesTable
      .update({ total_questions: questions.length })
      .eq('id', quizId);

    // Guardar información de los documentos procesados (evitando duplicados)
    if (documentIds && documentIds.length > 0) {
      const documentRecords = documents.map((doc) => ({
        user_id: user.id,
        file_name: doc.source_name,
        file_type: doc.type === 'pdf' ? 'application/pdf' : 'text/plain',
        processed: true,
        file_size: null, // No tenemos el tamaño original aquí
      }));

      // Verificar y guardar documentos evitando duplicados
      const savedDocuments: string[] = [];
      const skippedDocuments: string[] = [];

      for (const docRecord of documentRecords) {
        // Verificar si el documento ya existe para este usuario
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id, file_name')
          .eq('user_id', user.id)
          .eq('file_name', docRecord.file_name)
          .maybeSingle();

        if (existingDoc) {
          // Documento ya existe, actualizar fecha de procesamiento
          await supabase
            .from('documents')
            .update({ 
              processed: true,
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', existingDoc.id);
          
          skippedDocuments.push(docRecord.file_name);
          console.log(`Documento ya existe, actualizado: ${docRecord.file_name}`);
        } else {
          // Documento no existe, insertarlo
          const { data: newDoc, error: insertError } = await supabase
            .from('documents')
            .insert(docRecord as any)
            .select()
            .single();

          if (insertError) {
            console.error(`Error guardando documento ${docRecord.file_name}:`, insertError);
          } else {
            savedDocuments.push(docRecord.file_name);
            console.log(`Documento guardado: ${docRecord.file_name}`);
          }
        }
      }

      if (savedDocuments.length > 0 || skippedDocuments.length > 0) {
        console.log(`${savedDocuments.length} documentos nuevos registrados, ${skippedDocuments.length} documentos ya existían`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        quizId: quizId,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error('Error en save-quiz:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
