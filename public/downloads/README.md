# 📱 Carpeta de Descargas - ApunteQuiz APK

## 📍 Ubicación
Esta carpeta está diseñada para almacenar el archivo APK de ApunteQuiz que los usuarios podrán descargar.

## 📥 Instrucciones para agregar tu APK

### Paso 1: Coloca tu archivo APK aquí
1. Copia tu archivo APK a esta carpeta
2. Renómbralo exactamente como: **`apuntequiz.apk`**

```bash
# Ejemplo desde terminal:
cp /ruta/a/tu/archivo.apk /home/andres/Documentos/6to-semestre/usabilidad/apuntequiz/public/downloads/apuntequiz.apk
```

### Paso 2: Verifica que funciona
Una vez colocado el archivo, los usuarios podrán:

1. **Descargar directamente**: Haciendo clic en el botón "Descargar APK"
2. **Escanear código QR**: El QR se genera automáticamente y apunta a tu APK

## 🌐 URLs de acceso

- **Desarrollo**: `http://localhost:3000/downloads/apuntequiz.apk`
- **Producción**: `https://tu-dominio.com/downloads/apuntequiz.apk`

## 📍 Dónde aparece la opción de descarga

### 1. Página Principal (Landing)
- **Ubicación**: Footer de la página principal
- **Características**:
  - Botón "Ver QR" para mostrar código QR
  - Botón "Descargar APK" para descarga directa
  - Diseño responsivo para móvil y desktop

### 2. Dashboard
- **Ubicación**: Footer del dashboard (después del contenido principal)
- **Características**:
  - Mismas opciones que en la landing
  - Siempre visible para usuarios autenticados

## 🎨 Funcionalidades implementadas

✅ **Código QR automático**: Se genera dinámicamente con la URL completa del sitio
✅ **Descarga directa**: Botón que descarga el APK inmediatamente
✅ **Modal interactivo**: Popup elegante que muestra el QR
✅ **Diseño responsivo**: Funciona perfectamente en móvil, tablet y desktop
✅ **Temas**: Compatible con modo claro y oscuro
✅ **Accesibilidad**: Controles de teclado y lectores de pantalla

## 🔧 Personalización

Si necesitas cambiar el nombre del archivo APK, edita esta línea en:
`/src/components/AppDownloadSection.tsx`

```typescript
const apkUrl = '/downloads/apuntequiz.apk'; // Cambia el nombre aquí si es necesario
```

## ⚠️ Notas importantes

1. **Tamaño del archivo**: Asegúrate de que tu APK no sea demasiado grande (recomendado < 50MB)
2. **Git**: Si usas control de versiones, considera agregar `*.apk` a `.gitignore` para no subir archivos grandes
3. **Hosting**: Algunos servicios de hosting gratuitos tienen límites de tamaño de archivos estáticos

## 🚀 Para producción

Cuando subas a producción (Vercel, Netlify, etc.):

1. Asegúrate de que la carpeta `public/downloads/` exista en tu repositorio
2. Sube el archivo APK antes de hacer deploy
3. El código QR se generará automáticamente con la URL de producción

## 📞 Soporte

Si tienes problemas con la descarga del APK, contacta a:
- Email: ac20102003@gmail.com
- Instagram: @andres.cabrera20
