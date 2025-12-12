'use client';

import { useEffect } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * Componente para anunciar cambios a lectores de pantalla
 */
export default function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite' 
}: ScreenReaderAnnouncementProps) {
  useEffect(() => {
    if (!message) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remover después de que el lector de pantalla lo haya leído
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    return () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [message, priority]);

  return null;
}
