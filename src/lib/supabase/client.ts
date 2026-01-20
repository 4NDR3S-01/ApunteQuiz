import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient(options?: { persistSession?: boolean }) {
  // Por defecto, la sesión persiste en localStorage (true)
  // Si se pasa false, la sesión será temporal (solo en memoria)
  const persistSession = options?.persistSession ?? true;
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Flujo PKCE para mayor seguridad
        flowType: 'pkce',
      },
      // Configuración de cookies para mejor compatibilidad
      cookieOptions: {
        name: 'sb-auth',
        lifetime: persistSession ? 7 * 24 * 60 * 60 : 0, // 7 días si persiste, 0 si es sesión temporal
        domain: undefined,
        path: '/',
        sameSite: 'lax',
      },
    }
  );
}
