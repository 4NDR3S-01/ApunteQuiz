const translations = {
  es: {
    auth: {
      shared: {
        placeholders: {
          email: 'tu@email.com',
          password: '••••••••',
          fullName: 'Juan Pérez',
        },
        showPassword: 'Mostrar contraseña',
        hidePassword: 'Ocultar contraseña',
      },
      login: {
        title: 'Iniciar sesión',
        subtitle: 'Accede a tu cuenta para crear quizzes inteligentes',
        back: 'Volver al inicio',
        emailLabel: 'Correo electrónico',
        passwordLabel: 'Contraseña',
        remember: 'Recordarme',
        forgot: '¿Olvidaste tu contraseña?',
        button: 'Iniciar sesión',
        loading: 'Iniciando sesión...',
        locked: 'Cuenta bloqueada temporalmente. Intenta nuevamente en {minutes} minuto(s).',
        error_generic: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
        session_expired: 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
        register_prompt: '¿No tienes una cuenta?',
        register_cta: 'Regístrate gratis',
      },
      register: {
        title: 'Crear cuenta',
        subtitle: 'Comienza a crear quizzes inteligentes gratis',
        back: 'Volver al inicio',
        fullNameLabel: 'Nombre completo',
        confirmPasswordLabel: 'Confirmar contraseña',
        success_title: '¡Registro exitoso!',
        success_desc: 'Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada y confirma tu correo electrónico.',
        button: 'Crear cuenta',
        loading: 'Creando cuenta...',
        error_generic: 'Error al registrarse. Por favor, intenta de nuevo.',
        login_prompt: '¿Ya tienes una cuenta?',
        login_cta: 'Iniciar sesión',
      },
      forgot: {
        title: '¿Olvidaste tu contraseña?',
        subtitle: 'No te preocupes, te enviaremos instrucciones para restablecerla',
        button: 'Enviar enlace de recuperación',
        loading: 'Enviando...',
        back: 'Volver al inicio de sesión',
        resend: 'Enviar otro correo',
        success_title: '¡Correo enviado!',
        success_desc: 'Te hemos enviado un correo con instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.',
        error_generic: 'Error al enviar el correo de recuperación. Por favor, intenta de nuevo.',
      },
      reset: {
        title: 'Restablecer contraseña',
        subtitle: 'Ingresa tu nueva contraseña',
        success_title: '¡Contraseña actualizada!',
        success_desc: 'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión...',
        button: 'Restablecer contraseña',
        loading: 'Actualizando...',
        error_generic: 'Error al restablecer la contraseña. Por favor, intenta de nuevo.',
        passwordLabel: 'Nueva contraseña',
        confirmPasswordLabel: 'Confirmar contraseña',
      },
    },
    password: {
      minLength: 'La contraseña debe tener al menos {n} caracteres',
      mismatch: 'Las contraseñas no coinciden',
      weak: 'La contraseña es demasiado débil. {suggestion}',
    },
    common: {
      or: 'o',
      back_home: 'Volver al inicio',
      go_to_login: 'Ir al inicio de sesión',
      register_prompt: '¿No tienes una cuenta?',
      register_cta: 'Regístrate gratis',
    },
    languageSwitcher: {
      buttonLabel: 'Idioma',
      ariaLabel: 'Seleccionar idioma',
      options: {
        es: {
          label: 'Español',
          description: 'Idioma principal',
        },
        en: {
          label: 'English',
          description: 'Disponible en inglés',
        },
      },
    },
    footer: {
      copyright: '© {year} ApunteQuiz. Construido con cariño por William Cabrera.',
      privacy: 'Política de privacidad',
      terms: 'Términos de uso',
      help: 'Ayuda',
      support: 'Soporte',
    },
    layout: {
      skipToContent: 'Saltar al contenido principal',
    },
    nav: {
      home: 'Inicio',
      faq: 'FAQ',
      contact: 'Contacto',
    },
    header: {
      login: 'Iniciar sesión',
      register: 'Registrarse',
      searchPlaceholder: 'Buscar formularios, sesiones o miembros…',
      searchAria: 'Búsqueda global',
      primaryNavAria: 'Navegación principal',
      mobileNavAria: 'Navegación móvil',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      nav: {
        home: {
          overview: {
            title: 'Visión general',
            description: 'Accede al panorama general con métricas esenciales.',
          },
          features: {
            title: 'Características',
            description: 'Explora el potencial de cada módulo clave.',
          },
          how: {
            title: 'Cómo funciona',
            description: 'Recorre el flujo completo paso a paso.',
          },
        },
        faq: {
          overview: {
            title: 'Visitar FAQ',
            description: 'Reúne todas las preguntas frecuentes.',
          },
          generales: {
            title: 'Preguntas generales',
            description: 'Las respuestas más consultadas por nuevos usuarios.',
          },
          account: {
            title: 'Cuenta y seguridad',
            description: 'Gestiona credenciales, roles y sesiones activas.',
          },
        },
        contact: {
          overview: {
            title: 'Página de contacto',
            description: 'Encuentra horarios, ubicaciones y nuestros canales oficiales.',
          },
          support: {
            title: 'Soporte directo',
            description: 'Elige el canal ideal para enviar tus consultas.',
          },
          training: {
            title: 'Capacitaciones',
            description: 'Coordina sesiones de entrenamiento personalizadas.',
          },
        },
      },
    },
    home: {
      hero: {
        badge: 'Disponible en beta · Potenciado con IA',
        title: 'Genera quizzes inteligentes a partir de tus PDFs en minutos',
        description:
          'ApunteQuiz combina el poder de la IA con un flujo pensado para educadores y estudiantes. Sube tus apuntes, elige cómo quieres evaluar y obtén cuestionarios personalizados listos para practicar.',
        primaryCta: 'Comenzar gratis',
        secondaryCta: 'Ver cómo funciona',
        stats: [
          { label: 'Documentos soportados', value: 'PDF y texto' },
          { label: 'Tipos de pregunta', value: '3 formatos' },
          { label: 'Tiempo estimado', value: '≈ 90 seg' },
        ],
        flowPreview: {
          title: 'Así se ve tu flujo',
          steps: [
            {
              title: '1. Carga tus documentos',
              description: 'Arrastra archivos PDF o pega notas escritas para iniciar.',
            },
            {
              title: '2. Personaliza la evaluación',
              description: 'Define idioma, nivel y distribución de tipos de pregunta.',
            },
            {
              title: '3. Genera y practica',
              description: 'Obtén un quiz listo para practicar o compartir al instante.',
            },
          ],
        },
      },
      features: {
        title: 'Diseñado para transformar tus apuntes en experiencias de estudio activas',
        description:
          'Cada sección del flujo se pensó para ahorrarte tiempo y garantizar preguntas de calidad, sin depender de procesos manuales.',
        items: [
          {
            title: 'Preguntas generadas con IA',
            description: 'Transforma tus apuntes en evaluaciones personalizadas y listas para practicar en segundos.',
            bullets: [
              'Entiende el contexto del PDF para crear preguntas acertadas',
              'Ajusta la dificultad según el nivel académico seleccionado',
              'Genera múltiples tipos de pregunta para reforzar el aprendizaje',
            ],
          },
          {
            title: 'Flujo simplificado y rápido',
            description: 'Controla cada paso del proceso con indicaciones claras y sin complicaciones de configuración.',
            bullets: [
              'Previsualiza los documentos que vas cargando',
              'Define la proporción de tipos de pregunta que prefieras',
              'Sistema pre-configurado listo para usar sin configuraciones adicionales',
            ],
          },
          {
            title: 'Hecho para equipos académicos',
            description: 'Organiza sesiones de estudio, pon a prueba a tus estudiantes o prepara material de repaso con facilidad.',
            bullets: [
              'Comparte quizzes listos para ser resueltos en clase o en casa',
              'Recibe una estructura clara para evaluar resultados',
              'Escala desde apuntes cortos hasta manuales completos',
            ],
          },
        ],
      },
      howItWorks: {
        badge: '¿Cómo funciona?',
        title: 'Un flujo escalonado para que no te pierdas en el proceso',
        description:
          'Pasa de un PDF a un cuestionario listo para practicar en menos de dos minutos con una experiencia guiada y clara.',
        steps: [
          {
            badge: 'Paso 1',
            title: 'Carga tus PDFs o apuntes',
            description: 'Sube uno o varios documentos y deja que el sistema los procese de manera automática.',
          },
          {
            badge: 'Paso 2',
            title: 'Configura la evaluación',
            description: 'Elige idioma, nivel educativo, número de preguntas y tipos para que el quiz se adapte a tu objetivo.',
          },
          {
            badge: 'Paso 3',
            title: 'Genera y practica el quiz',
            description: 'Obtén tu cuestionario personalizado listo para resolver o compartir de inmediato.',
          },
        ],
      },
      videoTutorial: {
        title: 'Video tutorial: Cómo generar un quiz',
        description: 'Aprende paso a paso cómo crear un quiz desde tus apuntes. Este video incluye subtítulos y transcripciones para accesibilidad.',
        transcript: 'Este es un video tutorial que muestra cómo generar un quiz en ApunteQuiz. Primero, sube tu documento PDF o pega tus apuntes. Luego, selecciona el idioma, el nivel educativo y el número de preguntas que deseas. Finalmente, haz clic en generar y obtendrás tu quiz personalizado listo para practicar.',
      },
    },
    contact: {
      hero: {
        badge: 'Equipo de soporte',
        title: 'Contacto y ayuda personalizada',
        description:
          'Conecta con nuestro equipo para resolver dudas, coordinar entrenamientos y conocer las políticas de uso.',
      },
      support: {
        title: 'Soporte directo',
        description: 'Escoge el medio que prefieras. Estamos listos para ayudarte con tus evaluaciones.',
        responseTime: 'Tiempo de respuesta < 1 día hábil',
        channels: [
          {
            id: 'correo',
            title: 'Correo directo',
            value: 'ac20102003@gmail.com',
            description: 'Recibe respuesta en menos de 24 horas hábiles.',
            actionLabel: 'Escribir ahora',
            href: 'mailto:ac20102003@gmail.com',
          },
          {
            id: 'telefono',
            title: 'Línea de soporte',
            value: '+593 (096) 392-4479',
            description: 'Atención de lunes a viernes de 8:00 a 18:00 (GMT-5).',
            actionLabel: 'Llamar',
            href: 'tel:+5930963924479',
          },
          {
            id: 'oficina',
            title: 'Oficina principal',
            value: 'Ecuador, Manta',
            description: 'Agenda una visita previa coordinación por correo.',
            actionLabel: 'Ver ubicación',
            href: 'https://maps.google.com/?q=Ecuador,+Manta',
          },
        ],
      },
      policies: {
        title: 'Políticas y términos',
        description: 'Transparencia y protección de datos diseñadas para entornos académicos.',
        cta: {
          label: 'Solicitar documentación extendida',
          href: 'mailto:legal@apuntequiz.dev',
        },
        cards: [
          {
            title: 'Privacidad de la información',
            description:
              'Los documentos que subes se procesan de manera temporal y se eliminan automáticamente cuando finalizas tu sesión, salvo que indiques lo contrario.',
          },
          {
            title: 'Términos de uso',
            description:
              'ApunteQuiz se ofrece para fines educativos. La publicación externa de evaluaciones requiere citar la plataforma como fuente del material.',
          },
          {
            title: 'Accesibilidad',
            description:
              'Implementamos estándares WCAG AA para garantizar experiencias utilizables en diferentes dispositivos y ayudas técnicas.',
          },
          {
            title: 'Cumplimiento institucional',
            description:
              'Contamos con acuerdos de confidencialidad y respaldo para instituciones educativas públicas y privadas.',
          },
        ],
      },
      training: {
        title: 'Capacitaciones y talleres',
        description: 'Sesiones adaptadas a docentes, coordinadores académicos y equipos de innovación educativa.',
        cta: {
          label: 'Coordinar agenda',
          href: 'mailto:capacitaciones@apuntequiz.dev',
        },
        items: [
          {
            title: 'Introducción a ApunteQuiz',
            description: 'Aprende a generar cuestionarios desde cero y configurar los flujos automatizados en menos de una hora.',
          },
          {
            title: 'Buenas prácticas de evaluación',
            description: 'Diseña rúbricas, calibra niveles de dificultad y comparte resultados accionables con tu equipo académico.',
          },
          {
            title: 'Integraciones avanzadas',
            description: 'Conecta ApunteQuiz con tu LMS, automatiza notificaciones y genera reportes personalizados.',
          },
        ],
      },
      backToHome: {
        message: 'Regresa a la página principal para continuar creando evaluaciones.',
        ctaLabel: 'Volver al inicio',
      },
    },
    faqPage: {
      badge: 'Centro de ayuda',
      title: 'Preguntas frecuentes',
      description: {
        beforeEmail:
          'Encuentra respuestas rápidas y recomendaciones prácticas para sacar el máximo provecho del generador de quizzes. Si necesitas asesoría personalizada, escríbenos a',
        afterEmail: '.',
      },
      email: 'ac20102003@gmail.com',
      shortcutsTitle: 'Atajos de teclado',
      shortcutsDescription: 'Usa estos atajos para navegar más rápido por la aplicación. Los atajos básicos requieren "Navegación por teclado" habilitada en ajustes de accesibilidad. Los atajos personalizados requieren "Atajos de teclado personalizados" habilitados:',
      shortcuts: [
        { combo: '/', label: 'Abrir búsqueda (básico)' },
        { combo: 'Alt + 1', label: 'Ir a Inicio (básico)' },
        { combo: 'Alt + 2', label: 'Ir a FAQ (básico)' },
        { combo: 'Alt + 3', label: 'Ir a Contacto (básico)' },
        { combo: 'Esc', label: 'Cerrar menú / cancelar (básico)' },
        { combo: 'Ctrl/Cmd + K', label: 'Abrir ajustes de accesibilidad (personalizado)' },
        { combo: 'Alt + S', label: 'Enfocar búsqueda (personalizado)' },
        { combo: 'Alt + H', label: 'Ir a Inicio (personalizado)' },
        { combo: 'Alt + F', label: 'Ir a FAQ (personalizado)' },
        { combo: 'Alt + C', label: 'Ir a Contacto (personalizado)' },
        { combo: '⌘ / Ctrl', label: 'En macOS usa ⌘ en lugar de Alt cuando corresponda' },
      ],
      cta: {
        message: '¿No encontraste lo que buscabas? Nuestro equipo está listo para ayudarte.',
        button: 'Volver al inicio',
      },
    },
    faq: {
      sections: [
        {
          id: 'generales',
          title: 'Preguntas generales',
          description: 'Resuelve las dudas más comunes antes de generar tu primer formulario.',
          entries: [
            {
              question: '¿Necesito instalar algo para usar ApunteQuiz?',
              answer:
                'No. Todo se ejecuta desde el navegador y puedes comenzar a generar cuestionarios apenas inicias sesión.',
            },
            {
              question: '¿Puedo trabajar con documentos en diferentes idiomas?',
              answer:
                'Sí. Carga tus PDFs o textos en el idioma que prefieras y ajusta el idioma de salida desde el panel principal.',
            },
            {
              question: '¿Qué tipo de preguntas se generan automáticamente?',
              answer:
                'Puedes combinar selección múltiple, verdadero/falso y respuesta abierta. Define la proporción desde el flujo guiado.',
            },
          ],
        },
        {
          id: 'cuenta',
          title: 'Cuenta y acceso',
          description: 'Administra perfiles, roles y configuraciones de seguridad en segundos.',
          entries: [
            {
              question: '¿Cómo invito a mi equipo docente?',
              answer:
                'Desde el panel “Colaborar” ingresa los correos institucionales. Cada invitado recibe acceso a los formularios compartidos.',
            },
            {
              question: '¿Puedo usar autenticación con mi institución?',
              answer:
                'ApunteQuiz soporta inicio de sesión con Google, Microsoft 365 y credenciales institucionales mediante SSO.',
            },
            {
              question: '¿Qué sucede si olvido mi contraseña?',
              answer:
                'Utiliza la opción “Recuperar acceso” en la pantalla de inicio de sesión para generar un enlace temporal de restablecimiento.',
            },
          ],
          videos: {
            register: {
              title: 'Video tutorial: Cómo crear una cuenta',
              description: 'Aprende paso a paso cómo crear tu cuenta en ApunteQuiz. Este video incluye subtítulos y transcripciones para accesibilidad.',
              transcript: 'Este video muestra cómo crear una cuenta en ApunteQuiz. Primero, ve a la página de registro. Luego, completa el formulario con tu nombre completo, correo electrónico y contraseña. Asegúrate de que tu contraseña sea segura. Finalmente, haz clic en "Crear cuenta" y verifica tu correo electrónico para activar tu cuenta.',
            },
            login: {
              title: 'Video tutorial: Cómo iniciar sesión',
              description: 'Aprende paso a paso cómo iniciar sesión en ApunteQuiz. Este video incluye subtítulos y transcripciones para accesibilidad.',
              transcript: 'Este video muestra cómo iniciar sesión en ApunteQuiz. Primero, ve a la página de inicio de sesión. Luego, ingresa tu correo electrónico y contraseña. Si lo deseas, puedes marcar la opción "Recordarme" para mantener tu sesión activa. Finalmente, haz clic en "Iniciar sesión" y serás redirigido a tu dashboard.',
            },
          },
        },
        {
          id: 'colaboracion',
          title: 'Colaboración y resultados',
          description: 'Comparte quizzes, obtén retroalimentación y analiza métricas en conjunto.',
          entries: [
            {
              question: '¿Cómo comparto un cuestionario con mis estudiantes?',
              answer:
                'Publica el quiz y envía el enlace generado. Puedes restringir el acceso con contraseña o correos específicos.',
            },
            {
              question: '¿Se puede descargar el resultado en formatos alternativos?',
              answer:
                'Sí. Exporta cada quiz en PDF o CSV para integrarlo con tu LMS o archivarlo en tu nube institucional.',
            },
            {
              question: '¿Puedo recibir comentarios del equipo en tiempo real?',
              answer:
                'Activa la revisión colaborativa para que colegas añadan notas y sugerencias directamente sobre cada pregunta.',
            },
          ],
        },
      ],
    },
    policyPage: {
      title: 'Política de privacidad',
      description:
        'Aquí encontrarás la política de privacidad de ApunteQuiz. Esta página describe cómo recopilamos y usamos tus datos. (Contenido de ejemplo — reemplaza con la política real).',
      sections: [
        {
          title: 'Datos que recopilamos',
          description:
            'Recopilamos información mínima necesaria para ofrecer el servicio: correo electrónico para autenticación, preferencias de idioma y datos opcionales proporcionados por el usuario.',
        },
        {
          title: 'Uso de la información',
          description:
            'Usamos tus datos para autenticación, personalización y para mejorar el servicio. No compartimos datos sin tu consentimiento.',
        },
      ],
      back: 'Volver al inicio',
    },
    termsPage: {
      title: 'Términos de uso',
      description:
        'Estos son los términos y condiciones de uso de ApunteQuiz. (Contenido de ejemplo — reemplaza con los términos reales).',
      sections: [
        {
          title: 'Aceptación de términos',
          description:
            'Al usar ApunteQuiz aceptas los presentes términos; no utilices el servicio para actividades prohibidas.',
        },
        {
          title: 'Modificaciones',
          description:
            'Podemos actualizar estos términos; las modificaciones se reflejarán en esta página y entrarán en vigor al publicarse.',
        },
      ],
      back: 'Volver al inicio',
    },
    documentUpload: {
      dropzone: {
        idle: 'Arrastra archivos aquí',
        active: 'Suelta el archivo aquí',
        or: 'o',
        select: 'selecciona archivos',
        formats: 'Formatos soportados: PDF, TXT (máx. 50MB)',
      },
      errors: {
        unsupportedType: 'Tipo de archivo no soportado: {type}. Usa PDF o TXT.',
        tooLarge: 'Archivo demasiado grande: {size}. Máximo: 50MB.',
        default: 'Error procesando archivo',
        unknown: 'Error desconocido',
      },
      statuses: {
        processing: 'Procesando archivo...',
        success: 'Archivo procesado exitosamente',
      },
      processedListTitle: 'Documentos procesados:',
      processedStatus: 'Procesado - {pages} páginas',
      remove: 'Eliminar',
    },
    appDownload: {
      footer: {
        prompt: '¿Prefieres usar la app móvil?',
        description: 'Descarga ApunteQuiz APK',
        showQr: 'Ver QR',
        toggleTitle: 'Mostrar código QR',
        download: 'Descargar APK',
        modal: {
          title: 'Escanea con tu móvil',
          description: 'Apunta la cámara de tu teléfono al código QR para descargar la APK',
          compatibility: 'Android 5.0 o superior',
          instructions: 'Asegúrate de permitir instalación de fuentes desconocidas',
          close: 'Cerrar',
          features: 'Compatible con Android 5.0+',
          rescan: 'Escanea para descargar',
          hide: 'Ocultar QR',
        },
      },
      landing: {
        badge: 'Disponible en móvil',
        title: 'Lleva ApunteQuiz contigo',
        description:
          'Descarga la aplicación móvil de ApunteQuiz y genera quizzes desde tu dispositivo Android. Estudia en cualquier lugar, en cualquier momento.',
        qrButton: 'Ver código QR',
        downloadButton: 'Descargar APK',
        compatibility: 'Compatible con Android 5.0+',
        modalTitle: 'Escanea para descargar',
        hideQr: 'Ocultar QR',
        phoneCard: {
          name: 'ApunteQuiz',
          subtitle: 'Aplicación Android',
          features: ['Generación de quizzes', 'Acceso offline a tus quizzes', 'Interfaz optimizada'],
        },
      },
      qrAlt: 'Código QR para descargar ApunteQuiz APK',
    },
    accessibility: {
      videoTutorial: {
        title: 'Video tutorial: Cómo generar un quiz',
        description: 'Aprende paso a paso cómo crear un quiz desde tus apuntes. Este video incluye subtítulos y transcripciones para accesibilidad.',
        playButton: 'Reproducir video',
        pauseButton: 'Pausar video',
        loading: 'Cargando video...',
        error: 'Error al cargar el video',
        transcriptButton: 'Ver transcripción',
        hideTranscript: 'Ocultar transcripción',
        transcriptTitle: 'Transcripción del video',
        ariaLabel: 'Video tutorial sobre cómo generar un quiz en ApunteQuiz',
      },
      settings: {
        title: 'Ajustes de accesibilidad',
        close: 'Cerrar',
        resetAll: 'Restaurar todo',
        sections: {
          visual: 'Visual',
          cognitive: 'Cognitivo',
          auditory: 'Auditiva',
          motor: 'Motriz',
        },
        theme: {
          label: 'Tema',
          light: 'Claro',
          dark: 'Oscuro',
          system: 'Sistema',
        },
        fontSize: {
          label: 'Tamaño de fuente',
          normal: 'Normal',
          large: 'Grande',
        },
        contrast: {
          label: 'Alto contraste',
          system: 'Predeterminado del sistema',
        },
        lineSpacing: {
          label: 'Espaciado de líneas',
          comfortable: 'Cómodo',
          relaxed: 'Relajado',
          loose: 'Espaciado',
        },
        dyslexicFont: {
          label: 'Fuente para dislexia',
        },
        textScale: {
          label: 'Escala de texto',
          description: 'Multiplica el tamaño de fuente base',
        },
        customFont: {
          label: 'Fuente personalizada',
          sans: 'Sans-serif',
          serif: 'Serif',
          dyslexic: 'OpenDyslexic',
          default: 'Por defecto',
        },
        customColor: {
          label: 'Color de acento personalizado',
          description: 'Personaliza el color de los elementos interactivos',
        },
        reading: {
          label: 'Lectura en voz alta (narrador)',
          start: 'Iniciar lectura',
          stop: 'Detener lectura',
          notSupported: 'Narrador no disponible en este navegador',
        },
        subtitles: {
          label: 'Subtítulos en videos',
        },
        autoTranscripts: {
          label: 'Transcripciones automáticas',
        },
        autoPlay: {
          label: 'Auto-reproducción de videos',
          help: 'Reproduce videos automáticamente cuando sean visibles',
        },
        keyboardNav: {
          label: 'Navegación mejorada con teclado',
        },
        visualAlerts: {
          label: 'Alertas visuales',
        },
        largeButtons: {
          label: 'Escala de botones',
          description: 'Aumenta el tamaño de los botones para facilitar el clic',
        },
        linkHighlight: {
          label: 'Resaltar enlaces',
        },
        focusVisible: {
          label: 'Indicadores de foco visibles',
        },
        voiceControl: {
          label: 'Control por voz',
          message: 'Estado: {message}',
          help: 'Di comandos como "ir a inicio", "ir a faq", "abrir ajustes"',
        },
        autoScroll: {
          label: 'Auto-scroll en inactividad',
          help: 'Desplaza la página automáticamente después de 3 segundos sin interacción',
        },
      },
      toasts: {
        voiceControl: {
          activated: 'Control por voz activado. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"',
          autoActivated: 'Control por voz activado automáticamente. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"',
          deactivated: 'Control por voz desactivado debido a interacción del usuario',
          commandNotRecognized: 'Comando no reconocido. Di: "ir a inicio", "ir a faq", "ir a contacto", "abrir ajustes", "pausar video" o "reproducir video"',
          networkError: 'Control por voz desactivado. Verifica tu conexión a internet y los permisos del micrófono.',
          permissionDenied: 'Permisos del micrófono denegados. Habilítalos en la configuración del navegador.',
          microphoneNotAccessible: 'No se pudo acceder al micrófono. Verifica que esté conectado.',
          networkRetry: 'Error de red detectado. Reintentando... ({attempt}/{max})',
          networkMaxRetries: 'Control por voz desactivado después de {max} intentos fallidos. Verifica tu conexión a internet.',
          genericError: 'Error en reconocimiento de voz: {error}. Intenta reactivarlo.',
          startError: 'No se pudo iniciar el reconocimiento de voz. Verifica los permisos del micrófono.',
          browserNotSupported: 'Reconocimiento de voz no disponible en este navegador. Prueba con Chrome o Edge.',
        },
      },
    },
  },
  en: {
    auth: {
      shared: {
        placeholders: {
          email: 'you@example.com',
          password: '••••••••',
          fullName: 'Jane Doe',
        },
        showPassword: 'Show password',
        hidePassword: 'Hide password',
      },
      login: {
        title: 'Sign in',
        subtitle: 'Access your account to create smart quizzes',
        back: 'Back to home',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        remember: 'Remember me',
        forgot: 'Forgot your password?',
        button: 'Sign in',
        loading: 'Signing in...',
        locked: 'Account temporarily locked. Try again in {minutes} minute(s).',
        error_generic: 'Error signing in. Please try again.',
        session_expired: 'Your session has expired due to inactivity. Please sign in again.',
        register_prompt: "Don't have an account?",
        register_cta: 'Sign up for free',
      },
      register: {
        title: 'Create account',
        subtitle: 'Start creating smart quizzes for free',
        back: 'Back to home',
        fullNameLabel: 'Full name',
        confirmPasswordLabel: 'Confirm password',
        success_title: 'Registration successful!',
        success_desc: 'We sent a confirmation email. Please check your inbox and confirm your email address.',
        button: 'Create account',
        loading: 'Creating account...',
        error_generic: 'Error signing up. Please try again.',
        login_prompt: 'Already have an account?',
        login_cta: 'Sign in',
      },
      forgot: {
        title: "Forgot your password?",
        subtitle: "Don't worry — we'll send instructions to reset it",
        button: 'Send recovery link',
        loading: 'Sending...',
        back: 'Back to sign in',
        resend: 'Send another email',
        success_title: 'Email sent!',
        success_desc: 'We sent an email with instructions to reset your password. Please check your inbox.',
        error_generic: 'Error sending recovery email. Please try again.',
      },
      reset: {
        title: 'Reset password',
        subtitle: 'Enter your new password',
        success_title: 'Password updated!',
        success_desc: 'Your password was reset successfully. You will be redirected to sign in...',
        button: 'Reset password',
        loading: 'Updating...',
        error_generic: 'Error resetting password. Please try again.',
        passwordLabel: 'New password',
        confirmPasswordLabel: 'Confirm new password',
      },
    },
    password: {
      minLength: 'Password must be at least {n} characters',
      mismatch: 'Passwords do not match',
      weak: 'Password is too weak. {suggestion}',
    },
    common: {
      or: 'or',
      back_home: 'Back to home',
      go_to_login: 'Go to sign in',
      register_prompt: "Don't have an account?",
      register_cta: 'Sign up for free',
    },
    languageSwitcher: {
      buttonLabel: 'Language',
      ariaLabel: 'Select language',
      options: {
        es: {
          label: 'Spanish',
          description: 'Interface available in Spanish',
        },
        en: {
          label: 'English',
          description: 'Main language',
        },
      },
    },
    footer: {
      copyright: '© {year} ApunteQuiz. Built with care by William Cabrera.',
      privacy: 'Privacy policy',
      terms: 'Terms of use',
      help: 'Help',
      support: 'Support',
    },
    layout: {
      skipToContent: 'Skip to main content',
    },
    nav: {
      home: 'Home',
      faq: 'FAQ',
      contact: 'Contact',
    },
    header: {
      login: 'Sign in',
      register: 'Register',
      searchPlaceholder: 'Search forms, sessions, or people…',
      searchAria: 'Global search',
      primaryNavAria: 'Primary navigation',
      mobileNavAria: 'Mobile navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      nav: {
        home: {
          overview: {
            title: 'Overview',
            description: 'Access the big picture with key metrics.',
          },
          features: {
            title: 'Features',
            description: 'Explore the potential of every core module.',
          },
          how: {
            title: 'How it works',
            description: 'Walk through the guided flow step by step.',
          },
        },
        faq: {
          overview: {
            title: 'Visit FAQ',
            description: 'Browse all frequently asked questions.',
          },
          generales: {
            title: 'General questions',
            description: 'Discover the answers most new users look for.',
          },
          account: {
            title: 'Account and security',
            description: 'Manage credentials, roles, and active sessions.',
          },
        },
        contact: {
          overview: {
            title: 'Contact page',
            description: 'Find schedules, locations, and our official channels.',
          },
          support: {
            title: 'Support channels',
            description: 'Choose the right channel to send your questions.',
          },
          training: {
            title: 'Training sessions',
            description: 'Arrange personalized workshops.',
          },
        },
      },
    },
    home: {
      hero: {
        badge: 'Available in beta · AI powered',
        title: 'Generate intelligent quizzes from your PDFs in minutes',
        description:
          'ApunteQuiz combines the power of AI with a workflow designed for educators and students. Upload your notes, choose how you want to assess, and receive tailored quizzes ready to practice.',
        primaryCta: 'Get started for free',
        secondaryCta: 'See how it works',
        stats: [
          { label: 'Supported documents', value: 'PDF and text' },
          { label: 'Question types', value: '3 formats' },
          { label: 'Estimated time', value: '≈ 90 sec' },
        ],
        flowPreview: {
          title: 'Your guided flow',
          steps: [
            {
              title: '1. Upload your documents',
              description: 'Drag PDFs or paste written notes to get started.',
            },
            {
              title: '2. Personalize the assessment',
              description: 'Set language, level, and question mix to match your goal.',
            },
            {
              title: '3. Generate and practice',
              description: 'Receive a quiz ready to solve or share instantly.',
            },
          ],
        },
      },
      features: {
        title: 'Designed to turn your notes into active learning experiences',
        description:
          'Every step of the flow saves you time and guarantees quality questions without manual work.',
        items: [
          {
            title: 'AI-generated questions',
            description: 'Transform your notes into personalized evaluations ready to practice in seconds.',
            bullets: [
              'Understands PDF context to craft accurate questions',
              'Adjusts difficulty based on the academic level you choose',
              'Generates multiple question types to reinforce learning',
            ],
          },
          {
            title: 'Fast, simplified flow',
            description: 'Control each step with clear guidance and zero setup headaches.',
            bullets: [
              'Preview documents as you upload them',
              'Set the proportion of question types you prefer',
              'Pre-configured system ready to use without extra setup',
            ],
          },
          {
            title: 'Built for academic teams',
            description: 'Organize study sessions, challenge students, or prepare review material with ease.',
            bullets: [
              'Share quizzes ready to solve in class or at home',
              'Receive a clear structure to grade and analyze results',
              'Scale from short notes to full textbooks effortlessly',
            ],
          },
        ],
      },
      howItWorks: {
        badge: 'How does it work?',
        title: 'A guided flow so you never lose the thread',
        description:
          'Go from a PDF to a practice-ready quiz in under two minutes with a clear, guided experience.',
        steps: [
          {
            badge: 'Step 1',
            title: 'Upload your PDFs or notes',
            description: 'Add one or several documents and let the system process them automatically.',
          },
          {
            badge: 'Step 2',
            title: 'Configure the assessment',
            description: 'Choose language, education level, number of questions, and types that fit your goal.',
          },
          {
            badge: 'Step 3',
            title: 'Generate and practice the quiz',
            description: 'Receive a personalized quiz ready to solve or share right away.',
          },
        ],
      },
      videoTutorial: {
        title: 'Video tutorial: How to generate a quiz',
        description: 'Learn step by step how to create a quiz from your notes. This video includes subtitles and transcripts for accessibility.',
        transcript: 'This is a video tutorial showing how to generate a quiz in ApunteQuiz. First, upload your PDF document or paste your notes. Then, select the language, education level, and number of questions you want. Finally, click generate and you will get your personalized quiz ready to practice.',
      },
    },
    contact: {
      hero: {
        badge: 'Support team',
        title: 'Contact and personalized help',
        description:
          'Connect with our team to resolve questions, schedule training, and review usage policies.',
      },
      support: {
        title: 'Direct support',
        description: 'Choose the channel you prefer. We are ready to help with your assessments.',
        responseTime: 'Response time < 1 business day',
        channels: [
          {
            id: 'correo',
            title: 'Direct email',
            value: 'ac20102003@gmail.com',
            description: 'Get a response in under 24 business hours.',
            actionLabel: 'Write now',
            href: 'mailto:ac20102003@gmail.com',
          },
          {
            id: 'telefono',
            title: 'Support line',
            value: '+593 (096) 392-4479',
            description: 'Available Monday to Friday from 8:00 to 18:00 (GMT-5).',
            actionLabel: 'Call',
            href: 'tel:+5930963924479',
          },
          {
            id: 'oficina',
            title: 'Head office',
            value: 'Ecuador, Manta',
            description: 'Schedule a visit after coordinating by email.',
            actionLabel: 'View location',
            href: 'https://maps.google.com/?q=Ecuador,+Manta',
          },
        ],
      },
      policies: {
        title: 'Policies and terms',
        description: 'Transparency and data protection tailored to academic environments.',
        cta: {
          label: 'Request extended documentation',
          href: 'mailto:legal@apuntequiz.dev',
        },
        cards: [
          {
            title: 'Information privacy',
            description:
              'Documents you upload are processed temporarily and deleted automatically when you finish your session unless you state otherwise.',
          },
          {
            title: 'Terms of use',
            description:
              'ApunteQuiz is provided for educational purposes. Publishing quizzes elsewhere requires citing the platform as the source.',
          },
          {
            title: 'Accessibility',
            description:
              'We implement WCAG AA standards to ensure usable experiences across devices and assistive technologies.',
          },
          {
            title: 'Institutional compliance',
            description:
              'We offer confidentiality agreements and support for public and private educational institutions.',
          },
        ],
      },
      training: {
        title: 'Training and workshops',
        description: 'Sessions tailored for teachers, academic coordinators, and innovation teams.',
        cta: {
          label: 'Schedule a session',
          href: 'mailto:capacitaciones@apuntequiz.dev',
        },
        items: [
          {
            title: 'Introduction to ApunteQuiz',
            description: 'Learn to generate quizzes from scratch and configure automated flows in under an hour.',
          },
          {
            title: 'Assessment best practices',
            description: 'Design rubrics, calibrate difficulty levels, and share actionable results with your academic team.',
          },
          {
            title: 'Advanced integrations',
            description: 'Connect ApunteQuiz with your LMS, automate notifications, and produce custom reports.',
          },
        ],
      },
      backToHome: {
        message: 'Return to the home page to keep creating assessments.',
        ctaLabel: 'Back to home',
      },
    },
    faqPage: {
      badge: 'Help center',
      title: 'Frequently asked questions',
      description: {
        beforeEmail:
          'Find quick answers and practical tips to get the most out of the quiz generator. If you need personalized assistance, email us at',
        afterEmail: '.',
      },
      email: 'ac20102003@gmail.com',
      shortcutsTitle: 'Keyboard shortcuts',
      shortcutsDescription: 'Use these shortcuts to navigate through the app faster. Basic shortcuts require "Keyboard navigation" enabled in accessibility settings. Custom shortcuts require "Custom keyboard shortcuts" enabled:',
      shortcuts: [
        { combo: '/', label: 'Open search (basic)' },
        { combo: 'Alt + 1', label: 'Go to Home (basic)' },
        { combo: 'Alt + 2', label: 'Go to FAQ (basic)' },
        { combo: 'Alt + 3', label: 'Go to Contact (basic)' },
        { combo: 'Esc', label: 'Close menu / cancel (basic)' },
        { combo: 'Ctrl/Cmd + K', label: 'Open accessibility settings (custom)' },
        { combo: 'Alt + S', label: 'Focus search (custom)' },
        { combo: 'Alt + H', label: 'Go to Home (custom)' },
        { combo: 'Alt + F', label: 'Go to FAQ (custom)' },
        { combo: 'Alt + C', label: 'Go to Contact (custom)' },
        { combo: '⌘ / Ctrl', label: 'On macOS use ⌘ instead of Alt when needed' },
      ],
      cta: {
        message: "Didn't find what you were looking for? Our team is ready to help.",
        button: 'Back to home',
      },
    },
    faq: {
      sections: [
        {
          id: 'generales',
          title: 'General questions',
          description: 'Clear up the most common doubts before generating your first quiz.',
          entries: [
            {
              question: 'Do I need to install anything to use ApunteQuiz?',
              answer:
                'No. Everything runs in the browser and you can start generating quizzes as soon as you sign in.',
            },
            {
              question: 'Can I work with documents in different languages?',
              answer:
                'Yes. Upload your PDFs or text in whichever language you prefer and adjust the output language from the main dashboard.',
            },
            {
              question: 'What types of questions are generated automatically?',
              answer:
                'You can combine multiple choice, true/false, and open-ended questions. Define the distribution from the guided flow.',
            },
          ],
        },
        {
          id: 'cuenta',
          title: 'Account and access',
          description: 'Manage profiles, roles, and security settings in seconds.',
          entries: [
            {
              question: 'How do I invite my teaching team?',
              answer:
                'From the “Collaborate” panel, enter institutional emails. Each invitee receives access to the shared quizzes.',
            },
            {
              question: 'Can I use my institution’s authentication?',
              answer:
                'ApunteQuiz supports sign-in with Google, Microsoft 365, and institutional credentials through SSO.',
            },
            {
              question: 'What happens if I forget my password?',
              answer:
                'Use the “Recover access” option on the sign-in screen to generate a temporary reset link.',
            },
          ],
          videos: {
            register: {
              title: 'Video tutorial: How to create an account',
              description: 'Learn step by step how to create your account in ApunteQuiz. This video includes subtitles and transcripts for accessibility.',
              transcript: 'This video shows how to create an account in ApunteQuiz. First, go to the registration page. Then, complete the form with your full name, email address, and password. Make sure your password is secure. Finally, click "Create account" and verify your email to activate your account.',
            },
            login: {
              title: 'Video tutorial: How to sign in',
              description: 'Learn step by step how to sign in to ApunteQuiz. This video includes subtitles and transcripts for accessibility.',
              transcript: 'This video shows how to sign in to ApunteQuiz. First, go to the sign-in page. Then, enter your email address and password. If you want, you can check the "Remember me" option to keep your session active. Finally, click "Sign in" and you will be redirected to your dashboard.',
            },
          },
        },
        {
          id: 'colaboracion',
          title: 'Collaboration and results',
          description: 'Share quizzes, gather feedback, and review metrics together.',
          entries: [
            {
              question: 'How do I share a quiz with my students?',
              answer:
                'Publish the quiz and send the generated link. You can restrict access with a password or specific email addresses.',
            },
            {
              question: 'Can results be downloaded in other formats?',
              answer:
                'Yes. Export each quiz as a PDF or CSV to integrate it with your LMS or store it in your institutional cloud.',
            },
            {
              question: 'Can I receive real-time feedback from the team?',
              answer:
                'Enable collaborative review so colleagues can add notes and suggestions directly on each question.',
            },
          ],
        },
      ],
    },
    policyPage: {
      title: 'Privacy policy',
      description:
        'Here you\'ll find ApunteQuiz\'s privacy policy. This page explains how we collect and use your data. (Sample content — replace with the actual policy.)',
      sections: [
        {
          title: 'Data we collect',
          description:
            'We collect only the information needed to provide the service: email for authentication, language preferences, and any optional data provided by the user.',
        },
        {
          title: 'How we use information',
          description:
            'We use your data for authentication, personalization, and to improve the service. We do not share data without your consent.',
        },
      ],
      back: 'Back to home',
    },
    termsPage: {
      title: 'Terms of use',
      description:
        'These are the terms and conditions for using ApunteQuiz. (Sample content — replace with the actual terms.)',
      sections: [
        {
          title: 'Acceptance of terms',
          description:
            'By using ApunteQuiz you agree to these terms; do not use the service for prohibited activities.',
        },
        {
          title: 'Changes',
          description:
            'We may update these terms; any changes will appear on this page and take effect once published.',
        },
      ],
      back: 'Back to home',
    },
    documentUpload: {
      dropzone: {
        idle: 'Drag files here',
        active: 'Drop the file here',
        or: 'or',
        select: 'choose files',
        formats: 'Supported formats: PDF, TXT (max. 50MB)',
      },
      errors: {
        unsupportedType: 'Unsupported file type: {type}. Please use PDF or TXT.',
        tooLarge: 'File is too large: {size}. Maximum: 50MB.',
        default: 'Error processing file',
        unknown: 'Unknown error',
      },
      statuses: {
        processing: 'Processing file...',
        success: 'File processed successfully',
      },
      processedListTitle: 'Processed documents:',
      processedStatus: 'Processed - {pages} pages',
      remove: 'Remove',
    },
    appDownload: {
      footer: {
        prompt: 'Prefer to use the mobile app?',
        description: 'Download the ApunteQuiz APK',
        showQr: 'View QR',
        toggleTitle: 'Show QR code',
        download: 'Download APK',
        modal: {
          title: 'Scan with your phone',
          description: 'Point your phone camera at the QR code to download the APK',
          compatibility: 'Android 5.0 or higher',
          instructions: 'Make sure to allow installation from unknown sources',
          close: 'Close',
          features: 'Android 5.0 compatible',
          rescan: 'Scan to download',
          hide: 'Hide QR',
        },
      },
      landing: {
        badge: 'Available on mobile',
        title: 'Take ApunteQuiz with you',
        description:
          'Download the ApunteQuiz mobile app and generate quizzes from your Android device. Study anywhere, anytime.',
        qrButton: 'View QR code',
        downloadButton: 'Download APK',
        compatibility: 'Compatible with Android 5.0+',
        modalTitle: 'Scan to download',
        hideQr: 'Hide QR',
        phoneCard: {
          name: 'ApunteQuiz',
          subtitle: 'Android application',
          features: ['Quiz generation', 'Offline access to your quizzes', 'Optimized interface'],
        },
      },
      qrAlt: 'QR code to download the ApunteQuiz APK',
    },
    accessibility: {
      videoTutorial: {
        title: 'Video tutorial: How to generate a quiz',
        description: 'Learn step by step how to create a quiz from your notes. This video includes subtitles and transcripts for accessibility.',
        playButton: 'Play video',
        pauseButton: 'Pause video',
        loading: 'Loading video...',
        error: 'Error loading video',
        transcriptButton: 'View transcript',
        hideTranscript: 'Hide transcript',
        transcriptTitle: 'Video transcript',
        ariaLabel: 'Video tutorial on how to generate a quiz in ApunteQuiz',
      },
      settings: {
        title: 'Accessibility Settings',
        close: 'Close',
        resetAll: 'Reset All',
        sections: {
          visual: 'Visual',
          cognitive: 'Cognitive',
          auditory: 'Auditory',
          motor: 'Motor',
        },
        theme: {
          label: 'Theme',
          light: 'Light',
          dark: 'Dark',
          system: 'System',
        },
        fontSize: {
          label: 'Font size',
          normal: 'Normal',
          large: 'Large',
        },
        contrast: {
          label: 'High contrast',
          system: 'System default',
        },
        lineSpacing: {
          label: 'Line spacing',
          comfortable: 'Comfortable',
          relaxed: 'Relaxed',
          loose: 'Loose',
        },
        dyslexicFont: {
          label: 'Dyslexia font',
        },
        textScale: {
          label: 'Text scale',
          description: 'Multiplies base font size',
        },
        customFont: {
          label: 'Custom font',
          sans: 'Sans-serif',
          serif: 'Serif',
          dyslexic: 'OpenDyslexic',
          default: 'Default',
        },
        customColor: {
          label: 'Custom accent color',
          description: 'Customize interactive elements color',
        },
        reading: {
          label: 'Read aloud (narrator)',
          start: 'Start reading',
          stop: 'Stop reading',
          notSupported: 'Narrator not available in this browser',
        },
        subtitles: {
          label: 'Video subtitles',
        },
        autoTranscripts: {
          label: 'Auto transcripts',
        },
        autoPlay: {
          label: 'Video auto-play',
          help: 'Automatically play videos when visible',
        },
        keyboardNav: {
          label: 'Enhanced keyboard navigation',
        },
        visualAlerts: {
          label: 'Visual alerts',
        },
        largeButtons: {
          label: 'Button scale',
          description: 'Increase button size for easier clicking',
        },
        linkHighlight: {
          label: 'Highlight links',
        },
        focusVisible: {
          label: 'Visible focus indicators',
        },
        voiceControl: {
          label: 'Voice control',
          message: 'Status: {message}',
          help: 'Say commands like "go to home", "go to faq", "open settings"',
        },
        autoScroll: {
          label: 'Auto-scroll on inactivity',
          help: 'Automatically scrolls page after 3 seconds without interaction',
        },
      },
      toasts: {
        voiceControl: {
          activated: 'Voice control activated. Say: "go to home", "go to faq", "go to contact", "open settings", "pause video" or "play video"',
          autoActivated: 'Voice control automatically activated. Say: "go to home", "go to faq", "go to contact", "open settings", "pause video" or "play video"',
          deactivated: 'Voice control deactivated due to user interaction',
          commandNotRecognized: 'Command not recognized. Say: "go to home", "go to faq", "go to contact", "open settings", "pause video" or "play video"',
          networkError: 'Voice control disabled. Check your internet connection and microphone permissions.',
          permissionDenied: 'Microphone permissions denied. Enable them in browser settings.',
          microphoneNotAccessible: 'Could not access microphone. Check that it is connected.',
          networkRetry: 'Network error detected. Retrying... ({attempt}/{max})',
          networkMaxRetries: 'Voice control disabled after {max} failed attempts. Check your internet connection.',
          genericError: 'Voice recognition error: {error}. Try reactivating it.',
          startError: 'Could not start voice recognition. Check microphone permissions.',
          browserNotSupported: 'Voice recognition not available in this browser. Try Chrome or Edge.',
        },
      },
    },
  },
} as const;

export default translations;
