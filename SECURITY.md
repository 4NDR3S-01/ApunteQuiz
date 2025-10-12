# Política de Seguridad - ApunteQuiz

## Versiones Soportadas

Actualmente mantenemos las siguientes versiones con actualizaciones de seguridad:

| Versión | Soportada          | Estado |
| ------- | ------------------ | ------ |
| 1.x.x   | :white_check_mark: | Desarrollo activo |
| < 1.0   | :x:                | No soportado |

## Reportar una Vulnerabilidad

La seguridad es una prioridad para ApunteQuiz. Si descubres una vulnerabilidad de seguridad, por favor ayúdanos a resolverla de manera responsable.

### ¿Cómo reportar?

1. **NO** crees un issue público para vulnerabilidades de seguridad
2. Envía un email a: **ac20102003@gmail.com**
3. Incluye en el asunto: `[SECURITY] - ApunteQuiz Vulnerability Report`

### Información a incluir:

- Descripción detallada de la vulnerabilidad
- Pasos para reproducir el problema
- Versión afectada del software
- Impacto potencial de la vulnerabilidad
- Cualquier mitigación temporal que conozcas

### Qué esperar:

- **Confirmación inicial**: Dentro de 48 horas
- **Evaluación**: Dentro de 7 días laborables
- **Resolución**: Dependiendo de la severidad
  - Crítica: 24-72 horas
  - Alta: 1-2 semanas
  - Media: 2-4 semanas
  - Baja: En la próxima versión planificada

### Proceso de divulgación:

1. Recibirás una confirmación de que hemos recibido tu reporte
2. Investigaremos y validaremos la vulnerabilidad
3. Desarrollaremos y probaremos una solución
4. Lanzaremos una actualización de seguridad
5. Publicaremos un aviso de seguridad (si es necesario)

### Reconocimiento:

Si reportas una vulnerabilidad válida, te incluiremos en nuestro archivo de reconocimientos (a menos que prefieras permanecer anónimo).

## Mejores Prácticas de Seguridad

### Para Usuarios:

- Mantén siempre actualizada tu versión de ApunteQuiz
- No compartas tus claves de API de forma pública
- Revisa los permisos antes de subir documentos sensibles
- Usa contraseñas seguras para tu cuenta

### Para Desarrolladores:

- Revisa las dependencias regularmente con `npm audit`
- Valida todas las entradas de usuario
- Usa HTTPS para todas las comunicaciones
- Implementa autenticación y autorización adecuadas
- No hardcodees secretos en el código

## Dependencias de Seguridad

Monitoreamos regularmente nuestras dependencias usando:

- GitHub Dependabot
- npm audit
- Snyk (opcional)

## Contacto

Para preguntas sobre seguridad que no sean vulnerabilidades:
- Email: ac20102003@gmail.com
- GitHub Issues: Para discusiones generales de seguridad

---

Gracias por ayudar a mantener ApunteQuiz seguro para todos. 🛡️
