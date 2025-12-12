import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Verifica que el usuario esté autenticado
 */
export async function requireAuth(): Promise<{
  user: { id: string; email?: string };
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never;
} | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return { user, supabase };
}

/**
 * Verifica que un quiz pertenezca al usuario
 */
export async function verifyQuizOwnership(
  quizId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, user_id')
    .eq('id', quizId)
    .eq('user_id', userId)
    .single();
  
  return !error && !!data;
}

/**
 * Verifica que un documento pertenezca al usuario
 */
export async function verifyDocumentOwnership(
  documentId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();
  
  return !error && !!data;
}

/**
 * Wrapper para endpoints que requieren autenticación
 */
export async function withAuth<T>(
  handler: (context: { user: { id: string; email?: string }; supabase: Awaited<ReturnType<typeof createClient>> }) => Promise<T>
): Promise<T | NextResponse> {
  const auth = await requireAuth();
  
  if (!auth) {
    return NextResponse.json(
      { error: 'No autorizado. Por favor, inicia sesión.' },
      { status: 401 }
    );
  }
  
  return handler(auth);
}
