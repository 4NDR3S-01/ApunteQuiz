'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap y manejo de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableElements = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus en el botón de confirmar
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    warning: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
    info: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="a11y-card rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 rounded-full p-2 ${
            variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
            variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <AlertTriangle className={`h-6 w-6 ${
              variant === 'danger' ? 'text-red-600 dark:text-red-400' :
              variant === 'warning' ? 'text-amber-600 dark:text-amber-400' :
              'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-[color:var(--foreground)] mb-2"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-description"
              className="text-sm text-[color:var(--text-muted)] mb-4"
            >
              {message}
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[color:var(--foreground)] bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {cancelText}
              </button>
              <button
                ref={confirmButtonRef}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  variantStyles[variant]
                } ${
                  variant === 'danger' ? 'focus:ring-red-500' :
                  variant === 'warning' ? 'focus:ring-amber-500' :
                  'focus:ring-blue-500'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
