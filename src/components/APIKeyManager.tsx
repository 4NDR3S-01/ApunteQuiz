'use client';

import { useState, useEffect, useId } from 'react';

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
  openai: ['gpt-5-nano'],
  anthropic: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
};

export default function APIKeyManager({ onConfigChange, className = '' }: APIKeyManagerProps) {
  const [config, setConfig] = useState<APIKeyConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-5-nano'
  });
  const [isValid, setIsValid] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const connectionStatusMessage = (() => {
    if (testingConnection) return 'Probando conexión...';
    if (connectionStatus === 'success') return 'Conexión verificada correctamente.';
    if (connectionStatus === 'error') return `Error al verificar la conexión${errorMessage ? `: ${errorMessage}` : ''}`;
    return 'Conexión sin probar.';
  })();
  const headingId = useId();
  const statusMessageId = useId();
  const helperTextId = useId();
  const validityMessageId = useId();

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
        const response = await fetch('https://api.openai.com/v1/responses', {
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
      model: 'gpt-5-nano'
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
        return 'text-[color:var(--text-muted)]';
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
          <svg className="h-4 w-4 text-[color:var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
    }
  };

  return (
    <section
      aria-labelledby={headingId}
      className={`a11y-card space-y-6 rounded-lg p-6 transition-colors ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 id={headingId} className="text-lg font-semibold text-[color:var(--foreground)]">
          Configuración de API
        </h3>
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm ${getConnectionStatusColor()}`}
            id={statusMessageId}
            role="status"
            aria-live="polite"
          >
            <span className="flex items-center space-x-1">
              {getConnectionStatusIcon()}
              <span>
                {connectionStatus === 'idle' && !testingConnection && 'No probado'}
                {testingConnection && 'Probando...'}
                {connectionStatus === 'success' && !testingConnection && 'Conectado'}
                {connectionStatus === 'error' && !testingConnection && 'Error'}
              </span>
            </span>
          </span>
        </div>
      </div>

      <p className="text-sm text-[color:var(--text-muted)]" aria-hidden>
        {connectionStatusMessage}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Proveedor */}
        <div>
          <label htmlFor="provider" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
            Proveedor de IA
          </label>
          <select
            id="provider"
            value={config.provider}
            onChange={(e) => updateConfig({ provider: e.target.value as 'openai' | 'anthropic' })}
            className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
            Modelo
          </label>
          <select
            id="model"
            value={config.model}
            onChange={(e) => updateConfig({ model: e.target.value })}
            className="a11y-input w-full rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <label htmlFor="apiKey" className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
          API Key
        </label>
        <div className="relative">
          <input
            id="apiKey"
            type={showKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => updateConfig({ apiKey: e.target.value })}
            placeholder={`Ingresa tu ${config.provider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key`}
            className="a11y-input w-full rounded-lg p-3 pr-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-describedby={helperTextId}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform rounded-full p-1 text-[color:var(--text-muted)] transition hover:text-[color:var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            aria-pressed={showKey}
            aria-label={showKey ? 'Ocultar API key' : 'Mostrar API key'}
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
        <p id={helperTextId} className="mt-1 text-xs text-[color:var(--text-muted)]">
          {config.provider === 'openai' 
            ? 'Obtén tu API key en https://platform.openai.com/api-keys'
            : 'Obtén tu API key en https://console.anthropic.com/'
          }
        </p>
      </div>

      {/* Estado de conexión */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-400/40 dark:bg-red-500/10" role="alert" aria-live="assertive">
          <div className="text-sm text-red-700 dark:text-red-200">
            <strong>Error de conexión:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 border-t border-[color:var(--border-default)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={clearConfig}
          className="a11y-control rounded-lg px-4 py-2 text-[color:var(--text-muted)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
        >
          Limpiar
        </button>
        
        <div className="flex gap-2 sm:justify-end">
          <button
            onClick={testConnection}
            disabled={!isValid || testingConnection}
            className={`px-4 py-2 rounded-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
              isValid && !testingConnection
                ? 'bg-blue-600 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
                : 'cursor-not-allowed bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] opacity-70'
            }`}
            aria-describedby={statusMessageId}
          >
            {testingConnection ? 'Probando...' : 'Probar Conexión'}
          </button>
        </div>
      </div>

      {/* Indicador de estado */}
      <div
        className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-[color:var(--text-muted)]'}`}
        id={validityMessageId}
        role="status"
        aria-live="polite"
      >
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
    </section>
  );
}
