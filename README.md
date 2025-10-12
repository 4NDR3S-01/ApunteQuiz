# ApunteQuiz - Generador de Materiales de Estudio con IA

<div align="center">

![ApunteQuiz Logo](public/logo.png)

**Convierte tus apuntes en quizzes inteligentes alimentados con IA**

[![GitHub Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/4NDR3S-01)
[![GitHub stars](https://img.shields.io/github/stars/4NDR3S-01/ApunteQuiz?style=for-the-badge&logo=github)](https://github.com/4NDR3S-01/ApunteQuiz/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/4NDR3S-01/ApunteQuiz?style=for-the-badge&logo=github)](https://github.com/4NDR3S-01/ApunteQuiz/network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

Una aplicación Next.js que genera automáticamente resúmenes y quizzes personalizados a partir de documentos PDF y de texto utilizando inteligencia artificial. **Configuración simplificada con API centralizada.**

## 🚀 Características Principales

- **📁 Procesamiento de Documentos**: Sube archivos PDF o de texto plano
- **🔍 Extracción Inteligente**: Soporte para PDFs con texto y OCR para documentos escaneados
- **🤖 Generación con IA**: Utiliza OpenAI GPT-4o o Anthropic Claude-3.5 para generar contenido
- **📝 Quizzes Personalizados**: Preguntas de opción múltiple, respuesta corta y verdadero/falso
- **📊 Resúmenes Estructurados**: Puntos clave, glosarios, fórmulas y ejemplos con citas
- **✅ Validación Completa**: Esquemas Zod para validación de datos y corrección automática
- **🎨 Interfaz Moderna**: UI responsive con Tailwind CSS y diseño accesible
- **⚡ Flujo Simplificado**: Solo 3 pasos - Cargar → Configurar → Generar

## 🆕 Novedades v2.0

- ✅ **API Centralizada**: No más configuración individual de API keys por usuario
- ✅ **Flujo Simplificado**: Eliminado el paso de configuración de API
- ✅ **Modelos Actualizados**: GPT-4o-mini y Claude-3.5-Sonnet como predeterminados
- ✅ **Validación Inteligente**: Corrección automática de respuestas de verdadero/falso
- ✅ **Diseño Responsivo**: Indicador de progreso optimizado para móviles y desktop

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- **API Key de OpenAI o Anthropic (configuración del servidor)**

## � Apoya el Proyecto

<div align="center">

[![GitHub Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/4NDR3S-01)

**¿Te resulta útil ApunteQuiz? ¡Considera apoyar su desarrollo!**

</div>

### ¿Por qué patrocinar?

- 🚀 **Desarrollo continuo**: Nuevas características y mejoras regulares
- 🐛 **Corrección de errores**: Mantenimiento activo y soporte técnico
- 📚 **Documentación**: Guías y tutoriales actualizados
- 🆓 **Siempre gratuito**: Mantenemos el proyecto open source
- ☕ **Apoyo al desarrollador**: Ayuda a mantener la motivación

### ¿Cómo ayuda tu contribución?

Tu apoyo permite:
- ⚡ Mejorar la velocidad y precisión de la generación de quizzes
- 🌍 Agregar soporte para más idiomas
- 📱 Desarrollar una app móvil
- 🤖 Integrar más modelos de IA avanzados
- 🎨 Mejorar la interfaz de usuario
- 🔧 Mantener la infraestructura

**¡Cada contribución, por pequeña que sea, marca la diferencia!** 🙏

---

## �🛠️ Instalación y Configuración

### 1. Clonar e Instalar
```bash
git clone <tu-repositorio>
cd apuntequiz
npm install
```

### 2. Configuración de Variables de Entorno (OBLIGATORIO)
Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

**Para OpenAI (Recomendado):**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
AI_MODEL=gpt-4o-mini
```

**Para Anthropic (Claude):**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
AI_MODEL=claude-3-5-sonnet-20241022
```

### 3. Ejecutar en Desarrollo
```bash
npm run dev
```

### 4. Abrir en el Navegador
```
http://localhost:3000
```

## 📖 Cómo Usar (Flujo Simplificado)

### 🔄 Nuevo Flujo en 3 Pasos

#### Paso 1: Cargar Documentos 📁
- Arrastra y suelta archivos PDF o TXT
- O haz clic en "selecciona archivos"
- **Formatos soportados**: PDF, TXT (máximo 50MB)
- **Vista previa automática** del contenido procesado

#### Paso 2: Configurar Quiz ⚙️
- **Título**: Personaliza el nombre de tu quiz
- **Nivel de Estudio**: Secundaria, Universidad o Profesional
- **Número de Preguntas**: 5-50 preguntas
- **Distribución de Tipos**: Ajusta las proporciones con sliders visuales
  - 🔘 Opción múltiple
  - ✏️ Respuesta corta  
  - ✅ Verdadero/falso
- **Temas Prioritarios**: Palabras clave para enfocar el contenido (opcional)

#### Paso 3: Generar y Realizar Quiz 🎯
- **Generación automática**: La IA procesará tus documentos (≈30-60 segundos)
- **Quiz interactivo**: Preguntas con citas y explicaciones
- **Resumen completo**: Overview, glosario, fórmulas y ejemplos clave
- **Métricas de calidad**: Distribución y completitud del quiz generado

### 🎮 Características del Quiz
- **Preguntas con contexto**: Cada pregunta incluye citas del documento original
- **Explicaciones detalladas**: Retroalimentación educativa para cada respuesta
- **Navegación intuitiva**: Diseño responsivo para todos los dispositivos

## 🔧 Configuración del Servidor

### Variables de Entorno Obligatorias

La aplicación requiere configuración del servidor (no del usuario). Las API keys se configuran una sola vez:

```env
# ✅ Para OpenAI (Recomendado)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
AI_MODEL=gpt-4o-mini

# 🔄 Para Anthropic (Alternativa)
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
# AI_MODEL=claude-3-5-sonnet-20241022
```

### Modelos Soportados

**OpenAI:**
- `gpt-4o` (Premium, más inteligente)
- `gpt-4o-mini` (Recomendado, balance costo/calidad)
- `gpt-4` (Clásico)
- `gpt-4-turbo`
- `gpt-3.5-turbo` (Más económico)

**Anthropic:**
- `claude-3-5-sonnet-20241022` (Más reciente)
- `claude-3-5-haiku-20241022` (Más rápido)
- `claude-3-opus-20240229` (Más potente)
- `claude-3-sonnet-20240229`

### Procesamiento de Documentos

**Tipos de archivo soportados:**
- ✅ PDF con texto extraíble
- ✅ Archivos de texto plano (.txt)
- ⚠️ PDFs escaneados (requiere OCR - implementación opcional)

**Límites:**
- Tamaño máximo: 50MB por archivo
- Páginas máximas: Sin límite específico
- Tokens por request: Según límites del proveedor de IA

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── generate-quiz/ # Generación de quizzes
│   │   └── process-document/ # Procesamiento de archivos
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── DocumentUpload.tsx # Carga de archivos
│   ├── QuizDisplay.tsx    # Visualización de quizzes
│   └── QuizGenerator.tsx  # Componente principal
├── lib/                   # Librerías y configuración
│   └── validation.ts      # Schemas Zod
├── prompts/               # Templates de prompts
│   ├── system.ts         # Prompt del sistema
│   └── user.ts           # Prompt del usuario
├── types/                 # Definiciones TypeScript
│   ├── index.ts          # Exportaciones principales
│   └── quiz.ts           # Tipos del quiz
└── utils/                 # Utilidades
    ├── ai-client.ts      # Cliente de IA
    ├── document-processor.ts # Procesamiento de documentos
    └── index.ts          # Utilidades generales
```

## 🔌 API Endpoints

### `GET /api/generate-quiz`
Verificar estado del servicio.

**Respuesta:**
```json
{
  "status": "active",
  "service": "Quiz Generator API",
  "version": "1.0.0",
  "endpoints": {
    "POST /api/generate-quiz": "Generar quiz a partir de documentos",
    "GET /api/generate-quiz": "Estado del servicio"
  }
}
```

### `POST /api/generate-quiz`
Genera un quiz a partir de documentos. **No requiere headers de autenticación** (API centralizada).

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "idioma": "es",
  "nivel": "universidad",
  "n_preguntas": 10,
  "tipos_permitidos": ["opcion_multiple", "respuesta_corta", "verdadero_falso"],
  "proporcion_tipos": {
    "opcion_multiple": 0.6,
    "respuesta_corta": 0.3,
    "verdadero_falso": 0.1
  },
  "temas_prioritarios": ["cálculo", "derivadas"],
  "titulo_quiz_o_tema": "Quiz de Cálculo I",
  "documents": [
    {
      "doc_id": "doc-1",
      "source_name": "Apuntes de Cálculo",
      "type": "notes",
      "text": "Contenido del documento..."
    }
  ]
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "result": {
      "metadata": { /* metadatos del quiz */ },
      "summary": { /* resumen estructurado */ },
      "quiz": {
        "n_solicitadas": 10,
        "n_generadas": 10,
        "preguntas": [/* array de preguntas */]
      },
      "study_tips": [/* consejos de estudio */],
      "notes": { /* notas adicionales */ }
    }
  },
  "metadata": {
    "requestId": "uuid",
    "provider": "openai",
    "generatedAt": "2025-10-10T21:25:50.074Z",
    "quality_metrics": { /* métricas de calidad */ }
  }
}
```

### `POST /api/process-document`
Procesa archivos PDF o de texto.

**Body (FormData):**
- `file`: Archivo a procesar
- `useOCR`: boolean (opcional)
- `language`: string (opcional, default: "spa")

## 🧪 Testing y Pruebas

### Prueba Rápida con curl
```bash
# 1. Verificar que la API está activa
curl -X GET http://localhost:3000/api/generate-quiz

# 2. Generar un quiz de prueba
curl -X POST http://localhost:3000/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "idioma": "es",
    "nivel": "universidad", 
    "n_preguntas": 3,
    "tipos_permitidos": ["opcion_multiple", "respuesta_corta", "verdadero_falso"],
    "proporcion_tipos": {"opcion_multiple": 0.6, "respuesta_corta": 0.3, "verdadero_falso": 0.1},
    "temas_prioritarios": ["matemáticas"],
    "titulo_quiz_o_tema": "Quiz de Prueba",
    "documents": [{
      "doc_id": "test-1",
      "source_name": "Documento de Prueba",
      "type": "notes",
      "text": "Las matemáticas son fundamentales. El álgebra estudia estructuras y relaciones."
    }]
  }'
```

### Prueba en la Interfaz Web
1. **Abre** http://localhost:3000
2. **Crea un archivo de texto** con contenido académico
3. **Sigue el flujo** de 3 pasos
4. **Verifica** que se genere el quiz correctamente

### Archivo de Prueba Incluido
El proyecto incluye `test-request.json` para pruebas rápidas:
```bash
curl -X POST http://localhost:3000/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

## 🚀 Despliegue en Producción

### Vercel (Recomendado)
```bash
# 1. Build del proyecto
npm run build

# 2. Desplegar
npx vercel --prod

# 3. Configurar variables de entorno en Vercel Dashboard
# - AI_PROVIDER=openai
# - OPENAI_API_KEY=tu_api_key
# - AI_MODEL=gpt-4o-mini
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Construir imagen
docker build -t apuntequiz .

# Ejecutar con variables de entorno
docker run -p 3000:3000 \
  -e AI_PROVIDER=openai \
  -e OPENAI_API_KEY=tu_api_key \
  -e AI_MODEL=gpt-4o-mini \
  apuntequiz
```

### Variables de Entorno para Producción
```env
# Obligatorias
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
AI_MODEL=gpt-4o-mini

# Opcionales
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=ApunteQuiz
LOG_LEVEL=info
```

## 📊 Estructura Actualizada del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── generate-quiz/ # ✅ Generación centralizada
│   │   └── process-document/ # Procesamiento de archivos
│   ├── globals.css        # Estilos globales + variables CSS
│   ├── layout.tsx         # Layout con soporte de accesibilidad
│   └── page.tsx           # ✅ Página principal actualizada
├── components/            # Componentes React
│   ├── DocumentUpload.tsx # Carga de archivos con drag & drop
│   ├── QuizDisplay.tsx    # Visualización interactiva de quizzes
│   ├── QuizGenerator.tsx  # ✅ Componente principal simplificado
│   └── AccessibilityProvider.tsx # Contexto de accesibilidad
├── lib/                   # Librerías y configuración
│   └── validation.ts      # ✅ Schemas Zod actualizados
├── prompts/               # Templates de prompts
│   ├── system.ts         # ✅ Prompt mejorado del sistema
│   └── user.ts           # Prompt del usuario
├── types/                 # Definiciones TypeScript
│   ├── index.ts          # Exportaciones principales
│   └── quiz.ts           # Tipos del quiz
└── utils/                 # Utilidades
    ├── ai-client.ts      # ✅ Cliente de IA con validación mejorada
    ├── document-processor.ts # Procesamiento de documentos
    ├── error-handling.ts # Manejo centralizado de errores
    └── logger.ts         # Sistema de logging
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo y Próximas Características

### ✅ Completado en v2.0
- [x] API centralizada sin configuración por usuario
- [x] Flujo simplificado de 3 pasos
- [x] Validación inteligente con corrección automática
- [x] Modelos de IA actualizados
- [x] Diseño responsivo mejorado
- [x] Indicador de progreso visual

### 🚧 Próximas Características
- [ ] **Más tipos de archivo**: DOCX, PPT, EPUB
- [ ] **Modo avanzado**: Configuración detallada de prompts
- [ ] **Guardado persistente**: Base de datos para quizzes generados
- [ ] **Exportación**: PDF, Word, Markdown
- [ ] **Modo colaborativo**: Compartir quizzes con otros usuarios
- [ ] **Analytics**: Métricas de rendimiento y uso
- [ ] **Plantillas**: Quizzes predefinidos por materia
- [ ] **Integración LMS**: Moodle, Canvas, Blackboard

### ⚠️ Limitaciones Conocidas
- **PDFs escaneados**: Requiere implementación completa de OCR
- **Tamaño de archivo**: Límite de 50MB por documento
- **Tokens por request**: Según límites del proveedor de IA
- **Idiomas**: Optimizado para español, soporte básico para otros idiomas
- **Tipos de pregunta**: Limitado a los 3 tipos actuales

### 🔧 Personalización Avanzada

**Modificar prompts** en `src/prompts/`:
- `system.ts`: Instrucciones base para la IA
- `user.ts`: Template de prompt del usuario

**Agregar nuevos tipos de pregunta**:
1. Actualizar `src/types/quiz.ts`
2. Modificar `src/lib/validation.ts`
3. Actualizar componentes de UI

**Integrar nuevos proveedores de IA**:
1. Extender `AIProvider` en `src/utils/ai-client.ts`
2. Implementar función de generación específica
3. Actualizar configuración de variables de entorno

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📧 Soporte y Contribución

### 🤝 Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 💬 Obtener Ayuda
Si tienes preguntas o problemas:
1. 📖 **Revisa la documentación** completa
2. 🔍 **Busca en los issues existentes** 
3. 🆕 **Crea un nuevo issue** with detalles del problema
4. 📧 **Contacta** al equipo de desarrollo

### 🔧 Desarrollo Local
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd apuntequiz

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu API key

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests (cuando estén disponibles)
npm test

# Build para producción
npm run build
```

---

## 🎯 Resumen de Configuración Rápida

1. **Clona** el repositorio
2. **Instala** dependencias con `npm install`
3. **Copia** `.env.example` a `.env.local`
4. **Configura** tu API key de OpenAI o Anthropic
5. **Ejecuta** `npm run dev`
6. **Abre** http://localhost:3000
7. **¡Empieza a generar quizzes!** 🚀

**✨ ¡Disfruta generando materiales de estudio inteligentes con IA! ✨**

---

*Desarrollado con ❤️ para mejorar la experiencia educativa*
