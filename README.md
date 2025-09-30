# ApunteQuiz - Generador de Materiales de Estudio

Una aplicación Next.js que genera automáticamente resúmenes y quizzes personalizados a partir de documentos PDF y de texto utilizando inteligencia artificial.

## 🚀 Características

- **Procesamiento de Documentos**: Sube archivos PDF o de texto plano
- **Extracción de Texto**: Soporte para PDFs con texto y OCR para documentos escaneados
- **Generación con IA**: Utiliza OpenAI GPT-4 o Anthropic Claude para generar contenido
- **Quizzes Personalizados**: Preguntas de opción múltiple, respuesta corta y verdadero/falso
- **Resúmenes Estructurados**: Puntos clave, glosarios, fórmulas y ejemplos
- **Validación Completa**: Esquemas Zod para validación de datos
- **Interfaz Intuitiva**: UI responsive con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- API Key de OpenAI o Anthropic

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd apuntequiz
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local`:
   ```env
   # Configuración de AI (opcional - también se puede configurar en la UI)
   AI_PROVIDER=openai          # o 'anthropic'
   OPENAI_API_KEY=tu_api_key_aqui
   # ANTHROPIC_API_KEY=tu_api_key_aqui
   AI_MODEL=gpt-4              # o 'claude-3-sonnet-20240229'
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📖 Cómo Usar

### Paso 1: Cargar Documentos
- Arrastra y suelta archivos PDF o TXT
- O haz clic en "selecciona archivos"
- Formatos soportados: PDF, TXT (máximo 50MB)

### Paso 2: Configurar Quiz
- **Título**: Personaliza el nombre de tu quiz
- **Nivel**: Secundaria, Universidad o Profesional
- **Número de Preguntas**: 5-50 preguntas
- **Tipos de Pregunta**: Ajusta las proporciones
  - Opción múltiple
  - Respuesta corta  
  - Verdadero/falso
- **Temas Prioritarios**: Palabras clave para enfocar el contenido

### Paso 3: Generar y Realizar Quiz
- La IA procesará tus documentos
- Generará resumen y preguntas con citas
- Realiza el quiz interactivo
- Recibe puntuación y retroalimentación

## 🔧 Configuración Avanzada

### API Keys
Puedes configurar las API keys de dos formas:

1. **Variables de entorno** (recomendado para producción)
2. **Almacenamiento local** (para desarrollo)
   - La aplicación guardará la key en `localStorage`

### Procesamiento de PDFs

Por defecto, la aplicación extrae texto directamente de PDFs. Para documentos escaneados:

1. Instalar Tesseract.js para OCR:
   ```bash
   npm install tesseract.js
   ```

2. Modificar el procesamiento en `src/utils/document-processor.ts`

### Personalización de Prompts

Los prompts están en `src/prompts/`:
- `system.ts`: Instrucciones base para la IA
- `user.ts`: Template de prompt personalizable

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

### `POST /api/generate-quiz`
Genera un quiz a partir de documentos.

**Headers:**
```
Content-Type: application/json
x-ai-provider: openai|anthropic
x-api-key: tu_api_key
x-ai-model: gpt-4|claude-3-sonnet-20240229
```

**Body:**
```json
{
  "idioma": "es",
  "nivel": "universidad",
  "n_preguntas": 10,
  "proporcion_tipos": {
    "opcion_multiple": 0.6,
    "respuesta_corta": 0.3,
    "verdadero_falso": 0.1
  },
  "temas_prioritarios": ["cálculo", "derivadas"],
  "documents": [...],
  "titulo_quiz_o_tema": "Quiz de Cálculo I"
}
```

### `POST /api/process-document`
Procesa archivos PDF o de texto.

**Body (FormData):**
- `file`: Archivo a procesar
- `useOCR`: boolean (opcional)
- `language`: string (opcional, default: "spa")

## 🧪 Testing

Para probar la aplicación:

1. **Documento de prueba**: Crea un archivo TXT con contenido académico
2. **API Key**: Configura una API key válida
3. **Genera quiz**: Sigue los pasos en la interfaz

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo

### Próximas Características
- [ ] Soporte para más tipos de archivo (DOCX, PPT)
- [ ] Integración con más proveedores de IA
- [ ] Guardado de quizzes en base de datos
- [ ] Exportación a PDF
- [ ] Modo colaborativo
- [ ] Analytics de rendimiento

### Limitaciones Conocidas
- PDFs escaneados requieren implementación completa de OCR
- Límite de tamaño de archivo: 50MB
- Límite de tokens por request según proveedor de IA

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📧 Soporte

Si tienes preguntas o problemas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta generando materiales de estudio con IA! 🎓**
