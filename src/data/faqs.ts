import type { LucideIcon } from 'lucide-react';
import { MessageCircleQuestion, UserCog, Layers } from 'lucide-react';

export type FAQEntry = {
  question: string;
  answer: string;
};

export type FAQSection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  entries: FAQEntry[];
};

export const sections: FAQSection[] = [
  {
    id: 'generales',
    title: 'Preguntas generales',
    description: 'Resuelve las dudas más comunes antes de generar tu primer formulario.',
    icon: MessageCircleQuestion,
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
    icon: UserCog,
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
  },
  {
    id: 'colaboracion',
    title: 'Colaboración y resultados',
    description: 'Comparte quizzes, obtén retroalimentación y analiza métricas en conjunto.',
    icon: Layers,
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
];
