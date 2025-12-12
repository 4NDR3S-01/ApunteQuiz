'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Aquí podrías enviar el error a un servicio de logging
    if (process.env.NODE_ENV === 'production') {
      // Enviar a servicio de logging (Sentry, LogRocket, etc.)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)] p-4">
          <div className="max-w-2xl w-full a11y-card rounded-lg p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-[color:var(--foreground)] mb-4">
              Algo salió mal
            </h1>
            
            <p className="text-[color:var(--text-muted)] mb-6">
              Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página o regresa al inicio.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold text-red-700 dark:text-red-300 mb-2">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Reintentar"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reintentar
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                aria-label="Ir al inicio"
              >
                <Home className="h-5 w-5 mr-2" />
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
