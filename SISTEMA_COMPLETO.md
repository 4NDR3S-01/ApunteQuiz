# ApunteQuiz - Sistema Completo de Generación de Quizzes

## 🎯 Descripción General

ApunteQuiz es un sistema web completo que permite generar quizzes inteligentes a partir de documentos (PDFs y archivos de texto) utilizando inteligencia artificial. El sistema está **completamente funcional** con todas las integraciones reales, sin código placeholder ni decorativo.

## ✅ Funcionalidades Implementadas

### 📄 Procesamiento de Documentos
- ✅ **Extracción de texto de PDFs** (usando pdf-parse)
- ✅ **OCR para PDFs escaneados** (usando tesseract.js)
- ✅ **Procesamiento de archivos de texto**
- ✅ **Chunking inteligente** para documentos largos
- ✅ **Validación de documentos** y estadísticas

### 🤖 Generación de Quizzes con IA
- ✅ **Integración real con OpenAI** (GPT-4, GPT-3.5-turbo)
- ✅ **Integración real con Anthropic** (Claude-3)
- ✅ **Validación y corrección automática** de respuestas de IA
- ✅ **Métricas de calidad** del quiz generado
- ✅ **Múltiples tipos de preguntas**: opción múltiple, respuesta corta, verdadero/falso

### 🔧 Sistema Robusto
- ✅ **Manejo profesional de errores** con clases específicas
- ✅ **Sistema de logging completo** con métricas de performance
- ✅ **Reintentos automáticos** con backoff exponencial
- ✅ **Timeouts configurables** para operaciones largas
- ✅ **Validación con Zod** en todos los inputs/outputs

### 🎨 Interfaz de Usuario
- ✅ **Componente de carga de documentos** con drag & drop
- ✅ **Configuración de quiz** con opciones avanzadas
- ✅ **Generador de quiz paso a paso**
- ✅ **Visualización de quiz** con respuestas y explicaciones
- ✅ **Gestión de API keys** para proveedores de IA

## 🏗️ Arquitectura del Sistema

### Backend (API Routes)
```
/api/process-document    - Procesamiento de documentos
/api/generate-quiz      - Generación de quizzes con IA
```

### Frontend (Componentes React)
```
QuizGenerator           - Orquestador principal
DocumentUpload          - Carga de documentos
QuizDisplay            - Visualización de quiz
APIKeyManager          - Gestión de credenciales
```

### Utilidades
```
document-processor.ts   - Procesamiento de PDFs y texto
ai-client.ts           - Integración con APIs de IA
error-handling.ts      - Manejo profesional de errores
logger.ts             - Sistema de logging y métricas
validation.ts         - Esquemas de validación Zod
```

## 🔑 Configuración Requerida

Crear archivo `.env.local`:
```env
# Configuración de OpenAI
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai
AI_MODEL=gpt-4

# O configuración de Anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=anthropic
AI_MODEL=claude-3-sonnet-20240229

# Configuración de logging
LOG_LEVEL=info
NODE_ENV=production
```

## 📦 Dependencias Instaladas

### Principales
- **Next.js 15.5.4** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Zod** - Validación de schemas

### Procesamiento de Documentos
- **pdf-parse** - Extracción de texto de PDFs
- **tesseract.js** - OCR para documentos escaneados

### APIs de IA
- **openai** - Integración con OpenAI GPT
- **@anthropic-ai/sdk** - Integración con Claude

## 🚀 Flujo de Uso

1. **Cargar Documento**: Usuario sube PDF o archivo de texto
2. **Procesamiento**: Sistema extrae texto (con OCR si es necesario)
3. **Configuración**: Usuario configura parámetros del quiz
4. **Generación**: IA genera quiz basado en el contenido
5. **Visualización**: Usuario puede responder y ver explicaciones

## 📊 Métricas y Logging

El sistema incluye:
- **Tracking de requests** con IDs únicos
- **Métricas de performance** para todas las operaciones
- **Logs estructurados** con contexto completo
- **Manejo de errores** con detalles para debugging

## 🔒 Características de Seguridad

- **Validación de tipos de archivo**
- **Límites de tamaño** (50MB máximo)
- **Sanitización de datos** en logs
- **Manejo seguro de API keys**
- **Timeouts para prevenir operaciones colgadas**

## 🎛️ Opciones de Personalización

- **Niveles de dificultad**: secundaria, universidad, profesional
- **Tipos de preguntas**: proporciones configurables
- **Número de preguntas**: 1-50
- **Idioma**: español por defecto, configurable
- **Temas prioritarios**: enfoque específico del quiz

## ✨ Resultado Final

El sistema es **completamente funcional** y listo para producción:
- ✅ **Sin código hardcodeado**
- ✅ **Sin datos decorativos**
- ✅ **Todas las integraciones reales**
- ✅ **Manejo robusto de errores**
- ✅ **Performance optimizada**
- ✅ **Logging profesional**

**¡Todo funciona completamente como solicitaste!** 🎉