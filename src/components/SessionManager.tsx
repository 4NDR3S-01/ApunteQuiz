'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SessionManagerProps {
  /** Tiempo de inactividad en minutos antes de cerrar sesión (por defecto: 30 minutos) */
  inactivityTimeout?: number;
}

/**
 * Componente que maneja:
 * 1. Auto-refresh de tokens de sesión
 * 2. Cierre de sesión automático después de inactividad prolongada
 * 3. Sincronización de sesiones entre tabs
 */
export default function SessionManager({ inactivityTimeout = 30 }: SessionManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSession, setHasSession] = useState(false);

  // Actualizar última actividad
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  useEffect(() => {
    // Verificar si hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      
      // Si hay sesión, inicializar la última actividad
      if (session) {
        lastActivityRef.current = Date.now();
      }
    });
  }, [supabase]);

  useEffect(() => {
    // Si no hay sesión, no hacer nada
    if (!hasSession) return;

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Verificar inactividad cada minuto
    inactivityCheckIntervalRef.current = setInterval(async () => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      const inactivityLimit = inactivityTimeout * 60 * 1000; // convertir a milisegundos

      if (inactiveTime >= inactivityLimit) {
        // Cerrar sesión por inactividad
        await supabase.auth.signOut();
        router.push('/login?reason=inactivity');
        router.refresh();
      }
    }, 60 * 1000); // Verificar cada minuto

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setHasSession(false);
        // Limpiar el intervalo al cerrar sesión
        if (inactivityCheckIntervalRef.current) {
          clearInterval(inactivityCheckIntervalRef.current);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token actualizado exitosamente, actualizar la actividad
        updateActivity();
      } else if (event === 'SIGNED_IN') {
        setHasSession(true);
        // Usuario inició sesión, actualizar la actividad
        updateActivity();
      }
    });

    // Limpiar al desmontar
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
      
      subscription.unsubscribe();
    };
  }, [router, supabase, inactivityTimeout, hasSession]);

  // Este componente no renderiza nada
  return null;
}
