'use client';

import { useState, useEffect } from 'react';

interface APIKeyConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

interface APIKeyManagerProps {
  readonly onConfigChange: (config: APIKeyConfig | null) => void;
  readonly className?: string;
}

const DEFAULT_MODELS = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
};

export default function APIKeyManager({ onConfigChange, className = '' }: APIKeyManagerProps) {
  const [config, setConfig] = useState<APIKeyConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4'
  });
  const [isValid, setIsValid] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar configuración desde localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('apiKeyConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as APIKeyConfig;
        setConfig(parsed);
        validateConfig(parsed);
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  // Validar configuración
  const validateConfig = (configToValidate: APIKeyConfig) => {
    const valid = configToValidate.apiKey.length > 0 && configToValidate.model.length > 0;
    setIsValid(valid);
    
    if (valid) {
      onConfigChange(configToValidate);
    } else {
      onConfigChange(null);
    }
  };

  // Actualizar configuración
  const updateConfig = (updates: Partial<APIKeyConfig>) => {
    const newConfig = { ...config, ...updates };
    
    // Si cambió el proveedor, actualizar el modelo por defecto
    if (updates.provider && updates.provider !== config.provider) {
      newConfig.model = DEFAULT_MODELS[updates.provider][0];
    }
    
    setConfig(newConfig);
    validateConfig(newConfig);
    
    // Guardar en localStorage
    localStorage.setItem('apiKeyConfig', JSON.stringify(newConfig));
    
    // Reset connection status when config changes
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  // Probar conexión con la API
  const testConnection = async () => {
    if (!isValid) return;
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');
    
    try {
      const testPrompt = "Test connection. Respond with just 'OK'.";
      
      if (config.provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 10,
            temperature: 0
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `Error ${response.status}`);
        }
        
      } else if (config.provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: testPrompt }],
            temperature: 0
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `Error ${response.status}`);
        }
      }
      
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error de conexión');
    } finally {
      setTestingConnection(false);
    }
  };

  // Limpiar configuración
  const clearConfig = () => {
    const clearedConfig = {
      provider: 'openai' as const,
      apiKey: '',
      model: 'gpt-4'
    };
    setConfig(clearedConfig);
    setIsValid(false);
    setConnectionStatus('idle');
    setErrorMessage('');
    localStorage.removeItem('apiKeyConfig');
    onConfigChange(null);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-300';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'success': 
        return (
          <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error': 
        return (
          <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default: 
        return (
          <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
    }
  };

  return (
    <div className={`space-y-6 rounded-lg border border-slate-200 bg-white p-6 transition-colors dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Configuración de API
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${getConnectionStatusColor()}`}>
            <span className="flex items-center space-x-1">
              {getConnectionStatusIcon()}
              <span>
                {connectionStatus === 'idle' && 'No probado'}
                {connectionStatus === 'success' && 'Conectado'}
                {connectionStatus === 'error' && 'Error'}
              </span>
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proveedor */}
        <div>
          <label htmlFor="provider" className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
            Proveedor de IA
          </label>
          <select
            id="provider"
            value={config.provider}
            onChange={(e) => updateConfig({ provider: e.target.value as 'openai' | 'anthropic' })}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
            Modelo
          </label>
          <select
            id="model"
            value={config.model}
            onChange={(e) => updateConfig({ model: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {DEFAULT_MODELS[config.provider].map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* API Key */}
      <div>
        <label htmlFor="apiKey" className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
          API Key
        </label>
        <div className="relative">
          <input
            id="apiKey"
            type={showKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => updateConfig({ apiKey: e.target.value })}
            placeholder={`Ingresa tu ${config.provider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key`}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 pr-20 text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showKey ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 16.121m6.878-6.243L16.121 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              )}
            </svg>
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {config.provider === 'openai' 
            ? 'Obtén tu API key en https://platform.openai.com/api-keys'
            : 'Obtén tu API key en https://console.anthropic.com/'
          }
        </p>
      </div>

      {/* Estado de conexión */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-400/40 dark:bg-red-500/10">
          <div className="text-sm text-red-700 dark:text-red-200">
            <strong>Error de conexión:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={clearConfig}
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Limpiar
        </button>
        
        <div className="flex gap-2 sm:justify-end">
          <button
            onClick={testConnection}
            disabled={!isValid || testingConnection}
            className={`px-4 py-2 rounded-lg font-medium ${
              isValid && !testingConnection
                ? 'bg-blue-600 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
                : 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}
          >
            {testingConnection ? 'Probando...' : 'Probar Conexión'}
          </button>
        </div>
      </div>

      {/* Indicador de estado */}
      <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-300'}`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isValid ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          )}
        </svg>
        <span>
          {isValid ? 'Configuración válida' : 'Configuración incompleta'}
        </span>
      </div>
    </div>
  );
}
