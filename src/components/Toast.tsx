'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    info: 'bg-blue-500 text-white border-blue-600',
    success: 'bg-green-500 text-white border-green-600',
    warning: 'bg-orange-500 text-white border-orange-600',
    error: 'bg-red-500 text-white border-red-600',
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${
        typeStyles[type]
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 rounded p-1 hover:bg-white/20 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  // Duración según el tipo de toast
  const getDuration = (type?: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'error':
        return 7000; // 7 segundos para errores
      case 'warning':
        return 6000; // 6 segundos para advertencias
      case 'success':
        return 4000; // 4 segundos para éxito
      case 'info':
      default:
        return 5000; // 5 segundos para información
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={getDuration(toast.type)}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

