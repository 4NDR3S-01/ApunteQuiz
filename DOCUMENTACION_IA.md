# 📚 Procesamiento de Documentos y Modelos de IA

## 🔍 ¿Cómo se Procesan los Documentos Grandes?

ApunteQuiz tiene un sistema inteligente de 3 capas para manejar documentos de cualquier tamaño:

### **Capa 1: Validación Inicial**
```
📄 Documento → ¿Es muy largo?
                ↓
         Calcular palabras/tokens
                ↓
      Comparar con límite del modelo
```

### **Capa 2: Reducción Automática** (si es necesario)
Si el documento excede el límite:

1. **Reducción Inteligente**:
   - Mantiene títulos y encabezados importantes
   - Preserva párrafos clave
   - Elimina repeticiones
   - Compacta espacios en blanco

2. **Cálculo del Objetivo**:
   ```
   Token Objetivo = Límite del Modelo - Prompt del Sistema - Margen de Seguridad (1000 tokens)
   ```

3. **Estrategias de Reducción**:
   - `token_limit_reduction`: Reducción preventiva basada en límites
   - `aggressive_retry_reduction`: Reducción más agresiva si falla el primer intento

### **Capa 3: División en Chunks** (desactivado temporalmente)
Para documentos EXTREMADAMENTE grandes:
- Divide el documento en partes (chunks)
- Procesa cada parte por separado
- Combina los resultados

**Configuración por modelo:**
```javascript
'gemini-1.5-flash':  chunks de 300 páginas
'gemini-1.5-pro':    chunks de 500 páginas
'gemini-pro':        chunks de 50 páginas
'groq/compound':     chunks de 20 páginas
```

---

## 🤖 Modelos de IA Disponibles

### **1. GEMINI (Google)** - Recomendado ✨

#### **gemini-2.5-flash** (Más Reciente - Recomendado) 🆕
- **Límite**: 1,000,000 tokens (~4,000 páginas) 🚀
- **TPM**: 250,000 tokens/minuto
- **Disponibilidad**: ✅ Disponible con API key
- **Velocidad**: ⚡⚡⚡⚡⚡ Ultra rápida
- **Costo**: $$ Moderado
- **Mejor para**:
  - Documentos grandes (50-1000 páginas)
  - Procesamiento rápido de PDFs extensos
  - Rendimiento mejorado vs versiones anteriores
  - **IDEAL para uso general y documentos grandes**

#### **gemini-3-flash** (Experimental) 🆕
- **Límite**: 1,000,000 tokens (~4,000 páginas)
- **TPM**: 250,000 tokens/minuto
- **Disponibilidad**: ✅ Disponible con API key
- **Velocidad**: ⚡⚡⚡⚡⚡ Ultra rápida
- **Costo**: $$ Moderado
- **Mejor para**:
  - Probar la última generación
  - Documentos grandes
  - Características experimentales

#### **gemini-2.5-flash-lite** (Ligero) 🆕
- **Límite**: 1,000,000 tokens (~4,000 páginas)
- **TPM**: 250,000 tokens/minuto
- **Disponibilidad**: ✅ Disponible con API key
- **Velocidad**: ⚡⚡⚡⚡⚡ Ultra rápida
- **Costo**: $ Económico
- **Mejor para**:
  - Documentos grandes con bajo costo
  - Uso masivo
  - Cuando el presupuesto es limitado

#### **gemini-pro** (Modelo Base)
- **Límite**: 30,000 tokens (~120 páginas)
- **Disponibilidad**: ✅ Siempre disponible
- **Velocidad**: ⚡⚡⚡ Muy rápida
- **Costo**: $ Económico
- **Mejor para**:
  - Documentos pequeños a medianos (1-50 páginas)
  - Quizzes rápidos
  - Uso general diario
  - Cuando necesitas respuesta inmediata

#### **gemini-1.5-flash** (Generación Anterior)
- **Límite**: 1,000,000 tokens (~4,000 páginas) 🚀
- **Disponibilidad**: 🔓 Requiere acceso API especial
- **Velocidad**: ⚡⚡⚡⚡ Muy rápida
- **Costo**: $$ Moderado
- **Mejor para**:
  - Documentos grandes (100-500 páginas)
  - Procesamiento rápido de PDFs extensos
  - Libros completos o manuales
  - Balance perfecto entre velocidad y capacidad

#### **gemini-1.5-pro** (Máxima Capacidad)
- **Límite**: 2,000,000 tokens (~8,000 páginas) 🏆
- **Disponibilidad**: 🔓 Requiere acceso API especial
- **Velocidad**: ⚡⚡⚡ Rápida
- **Costo**: $$$ Premium
- **Mejor para**:
  - Documentos MASIVOS (500+ páginas)
  - Tesis doctorales completas
  - Compilaciones de varios libros
  - Máxima precisión en documentos complejos

---

### **2. GROQ** (Velocidad Extrema)

#### **groq/compound** y **groq/compound-mini**
- **Límite**: 60,000 tokens (~240 páginas)
- **TPM (Tokens Por Minuto)**: 70,000 🚀 (El más rápido)
- **Velocidad**: ⚡⚡⚡⚡⚡ Ultra rápida
- **Costo**: $$ Moderado
- **Mejor para**:
  - Cuando necesitas respuesta INMEDIATA
  - Documentos medianos (20-100 páginas)
  - Ambiente de producción con alta demanda
  - Testing y desarrollo rápido

#### **llama-3.3-70b-versatile**
- **Límite**: 120,000 tokens (~480 páginas)
- **Velocidad**: ⚡⚡⚡⚡ Muy rápida
- **Costo**: $$ Moderado
- **Mejor para**:
  - Documentos medianos-grandes
  - Balance entre capacidad y velocidad
  - Alternativa a Gemini

#### **llama-3.1-8b-instant**
- **Límite**: 6,000 tokens (~24 páginas)
- **Velocidad**: ⚡⚡⚡⚡⚡ Ultra rápida
- **Costo**: $ Económico
- **Mejor para**:
  - Documentos muy pequeños
  - Pruebas rápidas
  - Notas de clase breves

---

### **3. OPENAI** (Versatilidad)

#### **gpt-4o-mini**
- **Límite**: 100,000 tokens (~400 páginas)
- **Velocidad**: ⚡⚡⚡ Rápida
- **Costo**: $$ Moderado
- **Mejor para**:
  - Uso general
  - Documentos medianos
  - Buena comprensión contextual

#### **gpt-4o**
- **Límite**: 100,000 tokens (~400 páginas)
- **Velocidad**: ⚡⚡ Moderada
- **Costo**: $$$ Premium
- **Mejor para**:
  - Máxima calidad de preguntas
  - Documentos complejos
  - Cuando la precisión es crítica

---

### **4. ANTHROPIC (Claude)** (Alta Calidad)

#### **claude-3-5-sonnet**
- **Límite**: 180,000 tokens (~720 páginas)
- **Velocidad**: ⚡⚡⚡ Rápida
- **Costo**: $$$ Premium
- **Mejor para**:
  - Análisis profundo
  - Documentos académicos complejos
  - Razonamiento avanzado

---

## 📊 Tabla Comparativa Rápida

| Modelo | Límite (páginas) | Velocidad | Costo | Mejor Uso |
|--------|------------------|-----------|-------|-----------|
| gemini-pro | ~120 | ⚡⚡⚡⚡ | $ | Uso diario |
| gemini-1.5-flash | ~4,000 | ⚡⚡⚡⚡ | $$ | Documentos grandes |
| gemini-1.5-pro | ~8,000 | ⚡⚡⚡ | $$$ | Documentos masivos |
| groq/compound | ~240 | ⚡⚡⚡⚡⚡ | $$ | Velocidad extrema |
| llama-3.3-70b | ~480 | ⚡⚡⚡⚡ | $$ | Balance capacidad/velocidad |
| gpt-4o-mini | ~400 | ⚡⚡⚡ | $$ | Versatilidad |
| gpt-4o | ~400 | ⚡⚡ | $$$ | Máxima calidad |
| claude-3-5-sonnet | ~720 | ⚡⚡⚡ | $$$ | Análisis profundo |

---

## 🎯 ¿Qué Modelo Elegir?

### Para Documentos Pequeños (1-20 páginas)
✅ **gemini-2.5-flash** - Nueva generación, rápido y eficiente ✨
✅ **gemini-pro** - Rápido, económico y efectivo
✅ **groq/compound** - Si necesitas velocidad extrema

### Para Documentos Medianos (20-100 páginas)
✅ **gemini-2.5-flash** - **Mejor opción** - nueva generación ✨
✅ **gemini-1.5-flash** - Alternativa sólida
✅ **llama-3.3-70b-versatile** - Alternativa rápida
✅ **gpt-4o-mini** - Si usas OpenAI

### Para Documentos Grandes (100-500 páginas)
✅ **gemini-2.5-flash** - **Óptimo** - hasta 4,000 páginas ✨
✅ **gemini-3-flash** - Experimental, hasta 4,000 páginas
✅ **gemini-1.5-flash** - Generación anterior
✅ **gemini-1.5-pro** - Para máxima capacidad
✅ **claude-3-5-sonnet** - Para análisis profundo

### Para Documentos Masivos (500+ páginas)
✅ **gemini-2.5-flash** - Hasta 4,000 páginas con velocidad ✨
✅ **gemini-1.5-pro** - Hasta 8,000 páginas (generación anterior)

---

## 💡 Consejos Prácticos

### Si tu documento es rechazado por ser muy grande:

1. **Opción 1: Cambia de modelo**
   ```
   gemini-pro (falló) → gemini-1.5-flash → gemini-1.5-pro
   ```

2. **Opción 2: Divide el documento**
   - Separa por capítulos
   - Crea quizzes temáticos
   - Procesa por partes

3. **Opción 3: Reduce preguntas**
   - Menos preguntas = menos procesamiento
   - Permite documentos más grandes

4. **Opción 4: Selecciona páginas clave**
   - Extrae solo las secciones importantes
   - Elimina páginas con muchas tablas/imágenes

---

## 🔧 Cómo Funciona Internamente

### Flujo de Procesamiento:

```
1. 📄 Usuario sube documento
        ↓
2. 🔢 Sistema calcula palabras y tokens
        ↓
3. 🤖 Selecciona modelo apropiado
        ↓
4. ✅ Valida tamaño vs límite del modelo
        ↓
5a. ✅ Si cabe → Procesa directamente
        ↓
5b. ⚠️ Si es grande → Aplica reducción automática
        ↓
6. 🎯 Genera quiz
        ↓
7. 📊 Retorna resultado
```

### Cálculo de Tokens:

```javascript
// Estimación de tokens
tokens ≈ palabras × 1.3
tokens ≈ caracteres ÷ 4

// Ejemplo:
Documento de 1000 palabras = ~1,300 tokens
Documento de 50 páginas (250 palabras/página) = ~16,250 tokens
```

---

## ⚡ Optimizaciones Automáticas

El sistema SIEMPRE intenta optimizar:

1. **Pre-validación**: Verifica antes de enviar a la IA
2. **Reducción Inteligente**: Mantiene la información clave
3. **Reintentos Automáticos**: Si falla, intenta con reducción más agresiva
4. **Mensajes Claros**: Te dice exactamente qué hacer si algo falla

---

## 🆘 Mensajes de Error Comunes

### "El documento es demasiado extenso"
- **Causa**: Excede el límite del modelo
- **Solución**: Usa gemini-1.5-flash o gemini-1.5-pro

### "Context length exceeded"
- **Causa**: El documento es demasiado largo incluso después de reducción
- **Solución**: Divide en partes o reduce páginas

### "Reduce el número de preguntas"
- **Causa**: Muchas preguntas + documento grande
- **Solución**: Genera menos preguntas (permite más contenido)

---

## 📈 Recomendaciones por Tipo de Usuario

### 👨‍🎓 Estudiante
- **Modelo**: gemini-pro o gemini-1.5-flash
- **Por qué**: Balance entre costo y capacidad
- **Documentos típicos**: Apuntes de clase (10-50 páginas)

### 👨‍🏫 Profesor
- **Modelo**: gemini-1.5-flash o gemini-1.5-pro
- **Por qué**: Documentos más grandes, necesita confiabilidad
- **Documentos típicos**: Libros de texto (100-500 páginas)

### 🏢 Institución
- **Modelo**: groq/compound (velocidad) o gemini-1.5-pro (capacidad)
- **Por qué**: Alto volumen, necesita velocidad o máxima capacidad
- **Documentos típicos**: Manuales, compilaciones (variable)

---

## 🔐 Configuración Actual

El sistema usa variables de entorno para configurar los modelos:

```bash
# Proveedor y modelo activo
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash

# API Keys
GOOGLE_GENERATIVE_AI_API_KEY=tu_key_aqui
OPENAI_API_KEY=tu_key_aqui
ANTHROPIC_API_KEY=tu_key_aqui
GROQ_API_KEY=tu_key_aqui
```

Para cambiar de modelo, solo necesitas actualizar estas variables en tu archivo `.env`.
