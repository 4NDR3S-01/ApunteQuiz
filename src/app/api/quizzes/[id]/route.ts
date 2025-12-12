import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyQuizOwnership } from '@/lib/auth-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    
    if (!auth) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor, inicia sesión.' },
        { status: 401 }
      );
    }
    
    const { user, supabase } = auth;
    const quizId = params.id;

    if (!quizId || typeof quizId !== 'string') {
      return NextResponse.json(
        { error: 'ID de quiz requerido' },
        { status: 400 }
      );
    }

    // Verificar que el quiz pertenece al usuario
    const hasOwnership = await verifyQuizOwnership(quizId, user.id);
    
    if (!hasOwnership) {
      return NextResponse.json(
        { error: 'Quiz no encontrado o no tienes permisos para eliminarlo' },
        { status: 403 }
      );
    }

    // Eliminar preguntas primero (foreign key constraint)
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', quizId);

    if (questionsError) {
      console.error('Error eliminando preguntas:', questionsError);
      return NextResponse.json(
        { error: 'Error al eliminar las preguntas del quiz', details: questionsError.message },
        { status: 500 }
      );
    }

    // Eliminar el quiz
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error eliminando quiz:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar el quiz', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz eliminado correctamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/quizzes/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
