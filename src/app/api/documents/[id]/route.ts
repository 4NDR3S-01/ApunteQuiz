import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, verifyDocumentOwnership } from '@/lib/auth-helpers';

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

    const documentId = params.id;

    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      );
    }

    // Validar que el documento pertenece al usuario
    const hasOwnership = await verifyDocumentOwnership(documentId, user.id);
    
    if (!hasOwnership) {
      return NextResponse.json(
        { error: 'Documento no encontrado o no tienes permisos para eliminarlo' },
        { status: 403 }
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

