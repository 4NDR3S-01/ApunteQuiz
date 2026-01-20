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
        flowType: 'pkce',
      },
    }
  );
}
