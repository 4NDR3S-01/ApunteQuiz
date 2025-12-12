import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      );
    }

    // Verificar que el documento pertenece al usuario antes de eliminarlo
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Documento no encontrado o no tienes permisos para eliminarlo' },
        { status: 404 }
      );
    }

    // Eliminar el documento
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error eliminando documento:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar el documento', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado correctamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

