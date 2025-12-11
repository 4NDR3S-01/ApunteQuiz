# ApunteQuiz - Generador de Materiales de Estudio con IA

<div align="center">

![ApunteQuiz Logo](public/logo.png)

**Convierte tus apuntes en quizzes inteligentes alimentados con IA**

[![GitHub Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/4NDR3S-01)
[![GitHub stars](https://img.shields.io/github/stars/4NDR3S-01/ApunteQuiz?style=for-the-badge&logo=github)](https://github.com/4NDR3S-01/ApunteQuiz/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/4NDR3S-01/ApunteQuiz?style=for-the-badge&logo=github)](https://github.com/4NDR3S-01/ApunteQuiz/network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

Una aplicación Next.js moderna que genera automáticamente resúmenes y quizzes personalizados a partir de documentos PDF y de texto utilizando inteligencia artificial. **Incluye sistema completo de accesibilidad, autenticación de usuarios y dashboard personalizado.**

## 🚀 Características Principales

### 📚 Generación de Contenido
- **📁 Procesamiento de Documentos**: Sube archivos PDF o de texto plano
- **🔍 Extracción Inteligente**: Soporte para PDFs con texto y OCR para documentos escaneados
- **🤖 Generación con IA**: Utiliza OpenAI GPT-4o o Anthropic Claude-3.5 para generar contenido
- **📝 Quizzes Personalizados**: Preguntas de opción múltiple, respuesta corta y verdadero/falso
- **📊 Resúmenes Estructurados**: Puntos clave, glosarios, fórmulas y ejemplos con citas
- **✅ Validación Completa**: Esquemas Zod para validación de datos y corrección automática

### ♿ Accesibilidad (A11y)
- **🎨 Alto Contraste**: Modo de alto contraste para mejor visibilidad
- **🔤 Escalado de Fuente**: Ajuste de tamaño de fuente y escala de texto
- **📖 Fuente Disléxica**: Fuente amigable para personas con dislexia
- **⌨️ Navegación por Teclado**: Soporte completo para navegación sin mouse
- **🔍 Foco Visible**: Indicadores de foco mejorados para navegación por teclado
- **🔗 Resaltado de Enlaces**: Opción para resaltar enlaces automáticamente
- **📹 Videos Accesibles**: Videos con subtítulos, transcripciones y controles accesibles
- **🌐 Soporte Multiidioma**: Español e Inglés con cambio dinámico de idioma
- **📱 Diseño Responsivo**: Optimizado para todos los dispositivos

### 👤 Autenticación y Usuarios
- **🔐 Autenticación Segura**: Sistema de autenticación con Supabase
- **📊 Dashboard Personalizado**: Panel de usuario para gestionar tus quizzes
- **💾 Guardado de Quizzes**: Guarda y accede a tus quizzes generados
- **🔑 Recuperación de Contraseña**: Sistema de recuperación de acceso
- **📧 Verificación de Email**: Verificación de correo electrónico al registrarse

### 🎨 Interfaz de Usuario
- **🎨 Tema Claro/Oscuro**: Soporte para modo claro y oscuro con detección del sistema
- **📱 Diseño Responsive**: Interfaz adaptativa para móviles, tablets y desktop
- **🎯 Navegación Intuitiva**: Header flotante con menús desplegables
- **🔍 Búsqueda Integrada**: Búsqueda rápida en la navegación
- **📖 FAQ Interactivo**: Preguntas frecuentes con videos tutoriales

## 🆕 Novedades v2.0+

### ✅ Características Recientes
- ✅ **Sistema de Accesibilidad Completo**: Panel de configuración de accesibilidad
- ✅ **Autenticación de Usuarios**: Registro, login y gestión de sesiones
- ✅ **Dashboard de Usuario**: Panel personalizado para gestionar quizzes
- ✅ **Videos Tutoriales**: Videos accesibles con subtítulos y transcripciones
- ✅ **Multiidioma**: Soporte para Español e Inglés
- ✅ **Alto Contraste**: Modo de alto contraste adaptativo
- ✅ **API Centralizada**: No más configuración individual de API keys por usuario
- ✅ **Flujo Simplificado**: Solo 3 pasos - Cargar → Configurar → Generar
- ✅ **Modelos Actualizados**: GPT-4o-mini y Claude-3.5-Sonnet como predeterminados
- ✅ **Validación Inteligente**: Corrección automática de respuestas de verdadero/falso

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- **API Key de OpenAI o Anthropic** (configuración del servidor)
- **Supabase** (para autenticación y base de datos)

## 🛠️ Instalación y Configuración

### 1. Clonar e Instalar
```bash
git clone https://github.com/4NDR3S-01/ApunteQuiz.git
cd ApunteQuiz
npm install
```

### 2. Configuración de Variables de Entorno
Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

**Variables de Entorno Requeridas:**

```env
# Configuración de IA (Obligatorio)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
AI_MODEL=gpt-4o-mini

# Supabase (Obligatorio para autenticación)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Opcional: Para Anthropic (Claude)
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
# AI_MODEL=claude-3-5-sonnet-20241022
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Obtén las URLs y keys de tu proyecto
3. Configura las tablas necesarias (ver documentación de Supabase)
4. Agrega las variables de entorno en `.env.local`

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

### 5. Abrir en el Navegador
```
http://localhost:3000
```

## 📖 Cómo Usar

### 🔄 Flujo en 3 Pasos

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
- **Guardar**: Opción para guardar el quiz en tu dashboard

### 🎮 Características del Quiz
- **Preguntas con contexto**: Cada pregunta incluye citas del documento original
- **Explicaciones detalladas**: Retroalimentación educativa para cada respuesta
- **Navegación intuitiva**: Diseño responsivo para todos los dispositivos
- **Accesibilidad completa**: Compatible con lectores de pantalla y navegación por teclado

## ♿ Características de Accesibilidad

### Panel de Accesibilidad
Accede al panel de accesibilidad desde el botón flotante en la esquina inferior derecha.

**Opciones Disponibles:**
- **Tema**: Claro, Oscuro o Sistema
- **Alto Contraste**: Activa/desactiva modo de alto contraste
- **Escala de Fuente**: Base o Grande
- **Escala de Texto**: Control deslizante (0.8x - 2.0x)
- **Fuente Disléxica**: Activa fuente amigable para dislexia
- **Tipo de Fuente**: Selección de fuente personalizada
- **Foco Visible**: Indicadores de foco mejorados
- **Resaltar Enlaces**: Resaltado automático de enlaces
- **Subtítulos en Videos**: Activa/desactiva subtítulos automáticos
- **Narrador**: Lectura de texto en voz alta

### Estándares de Accesibilidad
- ✅ **WCAG 2.1 AA**: Cumplimiento con estándares de accesibilidad web
- ✅ **Navegación por Teclado**: Soporte completo para navegación sin mouse
- ✅ **Lectores de Pantalla**: Compatible con NVDA, JAWS, VoiceOver
- ✅ **Contraste de Colores**: Cumplimiento con ratios de contraste mínimos
- ✅ **ARIA Labels**: Etiquetas descriptivas para elementos interactivos

## 🔧 Configuración del Servidor

### Variables de Entorno Obligatorias

```env
# ✅ Para OpenAI (Recomendado)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
AI_MODEL=gpt-4o-mini

# 🔄 Para Anthropic (Alternativa)
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
# AI_MODEL=claude-3-5-sonnet-20241022

# 🔐 Supabase (Obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
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

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── generate-quiz/ # Generación de quizzes
│   │   ├── process-document/ # Procesamiento de archivos
│   │   └── save-quiz/     # Guardado de quizzes
│   ├── auth/              # Rutas de autenticación
│   │   ├── callback/      # Callback de OAuth
│   │   └── auth-code-error/ # Manejo de errores
│   ├── dashboard/         # Dashboard de usuario
│   │   └── quiz/[id]/     # Detalle de quiz
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── faq/               # Preguntas frecuentes
│   ├── contacto/          # Página de contacto
│   ├── globals.css        # Estilos globales + accesibilidad
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── AccessibilityProvider.tsx # Contexto de accesibilidad
│   ├── AccessibilitySettings.tsx # Panel de accesibilidad
│   ├── AccessibleVideo.tsx # Componente de video accesible
│   ├── DocumentUpload.tsx # Carga de archivos
│   ├── QuizDisplay.tsx    # Visualización de quizzes
│   ├── QuizGenerator.tsx  # Componente principal
│   ├── FloatingHeader.tsx # Header de navegación
│   ├── LanguageSwitcher.tsx # Selector de idioma
│   ├── FAQClient.tsx      # FAQ interactivo
│   └── auth/              # Componentes de autenticación
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── ForgotPasswordForm.tsx
├── lib/                   # Librerías y configuración
│   ├── supabase/          # Clientes de Supabase
│   │   ├── client.ts      # Cliente del lado del cliente
│   │   ├── server.ts      # Cliente del lado del servidor
│   │   └── middleware.ts  # Middleware de autenticación
│   └── validation.ts      # Schemas Zod
├── hooks/                 # Custom hooks
│   └── useTranslation.tsx # Hook de traducción
├── i18n/                  # Internacionalización
│   ├── translations.ts    # Traducciones ES/EN
│   └── index.ts          # Configuración i18n
├── prompts/               # Templates de prompts
│   ├── system.ts         # Prompt del sistema
│   └── user.ts           # Prompt del usuario
├── types/                 # Definiciones TypeScript
│   ├── database.ts       # Tipos de Supabase
│   ├── index.ts          # Exportaciones principales
│   └── quiz.ts           # Tipos del quiz
└── utils/                 # Utilidades
    ├── ai-client.ts      # Cliente de IA
    ├── document-processor.ts # Procesamiento de documentos
    ├── error-handling.ts # Manejo de errores
    ├── logger.ts         # Sistema de logging
    └── password.ts       # Utilidades de contraseña
```

## 🔌 API Endpoints

### `GET /api/generate-quiz`
Verificar estado del servicio.

### `POST /api/generate-quiz`
Genera un quiz a partir de documentos. **No requiere headers de autenticación** (API centralizada).

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

### `POST /api/process-document`
Procesa archivos PDF o de texto.

**Body (FormData):**
- `file`: Archivo a procesar
- `useOCR`: boolean (opcional)
- `language`: string (opcional, default: "spa")

### `POST /api/save-quiz`
Guarda un quiz en la base de datos del usuario.

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
# - NEXT_PUBLIC_SUPABASE_URL=...
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# - SUPABASE_SERVICE_ROLE_KEY=...
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
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  apuntequiz
```

## 🧪 Testing

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
    "tipos_permitidos": ["opcion_multiple"],
    "proporcion_tipos": {"opcion_multiple": 1.0},
    "temas_prioritarios": ["matemáticas"],
    "titulo_quiz_o_tema": "Quiz de Prueba",
    "documents": [{
      "doc_id": "test-1",
      "source_name": "Documento de Prueba",
      "type": "notes",
      "text": "Las matemáticas son fundamentales."
    }]
  }'
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución
- Sigue las convenciones de código existentes
- Asegúrate de que las características de accesibilidad funcionen correctamente
- Prueba en múltiples navegadores y dispositivos
- Actualiza la documentación cuando sea necesario

## 📝 Próximas Características

### 🚧 En Desarrollo
- [ ] **Más tipos de archivo**: DOCX, PPT, EPUB
- [ ] **Modo avanzado**: Configuración detallada de prompts
- [ ] **Exportación**: PDF, Word, Markdown
- [ ] **Modo colaborativo**: Compartir quizzes con otros usuarios
- [ ] **Analytics**: Métricas de rendimiento y uso
- [ ] **Plantillas**: Quizzes predefinidos por materia
- [ ] **Integración LMS**: Moodle, Canvas, Blackboard
- [ ] **App Móvil**: Aplicación nativa para iOS y Android

### ⚠️ Limitaciones Conocidas
- **PDFs escaneados**: Requiere implementación completa de OCR
- **Tamaño de archivo**: Límite de 50MB por documento
- **Tokens por request**: Según límites del proveedor de IA
- **Idiomas**: Optimizado para español, soporte básico para otros idiomas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📧 Soporte

### 💬 Obtener Ayuda
Si tienes preguntas o problemas:
1. 📖 **Revisa la documentación** completa
2. 🔍 **Busca en los issues existentes** 
3. 🆕 **Crea un nuevo issue** con detalles del problema
4. 📧 **Contacta** al equipo de desarrollo

### 🔧 Desarrollo Local
```bash
# Clonar el repositorio
git clone https://github.com/4NDR3S-01/ApunteQuiz.git
cd ApunteQuiz

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus API keys

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## 🎯 Resumen de Configuración Rápida

1. **Clona** el repositorio
2. **Instala** dependencias con `npm install`
3. **Copia** `.env.example` a `.env.local`
4. **Configura** tus API keys (OpenAI/Anthropic y Supabase)
5. **Ejecuta** `npm run dev`
6. **Abre** http://localhost:3000
7. **¡Empieza a generar quizzes!** 🚀

**✨ ¡Disfruta generando materiales de estudio inteligentes con IA! ✨**

---

*Desarrollado con ❤️ para mejorar la experiencia educativa y hacerla accesible para todos*
