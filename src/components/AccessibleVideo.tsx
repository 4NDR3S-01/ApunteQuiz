'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import useTranslation from '@/hooks/useTranslation';

interface AccessibleVideoProps {
  readonly videoSrc: string;
  readonly subtitleSrcEs?: string;
  readonly subtitleSrcEn?: string;
  readonly captionSrcEs?: string;
  readonly title?: string;
  readonly description?: string;
  readonly transcript?: string;
  readonly className?: string;
  readonly maxHeight?: string;
}

export default function AccessibleVideo({
  videoSrc,
  subtitleSrcEs,
  subtitleSrcEn,
  captionSrcEs,
  title,
  description,
  transcript,
  className = '',
  maxHeight = '400px',
}: AccessibleVideoProps) {
  const { dictionary } = useTranslation();
  const videoTutorial = dictionary.accessibility?.videoTutorial;
  const { 
    subtitlesEnabled, 
    autoTranscripts, 
    blockAutoplay 
  } = useAccessibility();
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mostrar transcripción automáticamente si está habilitado
  useEffect(() => {
    if (autoTranscripts && transcript) {
      setShowTranscript(true);
    } else if (!autoTranscripts) {
      setShowTranscript(false);
    }
  }, [autoTranscripts, transcript]);

  // Sincronizar subtítulos del video con la configuración de accesibilidad
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const tracks = video.textTracks;
      
      for (const track of tracks) {
        if (subtitlesEnabled) {
          track.mode = 'showing';
        } else {
          track.mode = 'hidden';
        }
      }
    }
  }, [subtitlesEnabled]);

  // Configurar tracks cuando el video carga los metadatos
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const tracks = video.textTracks;
      for (const track of tracks) {
        if (subtitlesEnabled) {
          track.mode = 'showing';
        } else {
          track.mode = 'hidden';
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [subtitlesEnabled]);

  // Prevenir autoplay si está bloqueado
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !blockAutoplay) return;

    const handlePlay = (e: Event) => {
      // Si el usuario no inició la reproducción explícitamente, prevenir autoplay
      if (!(e.target as HTMLVideoElement).hasAttribute('data-user-initiated')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    video.addEventListener('play', handlePlay);
    return () => {
      video.removeEventListener('play', handlePlay);
    };
  }, [blockAutoplay]);

  return (
    <div className={`space-y-3 ${className}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="font-semibold text-[color:var(--foreground)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-[color:var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative w-full rounded-lg overflow-hidden bg-black/5 dark:bg-black/20">
        <video
          ref={videoRef}
          className="w-full"
          controls
          controlsList="nodownload"
          aria-label={title || videoTutorial?.ariaLabel || 'Video tutorial'}
          preload="metadata"
          playsInline
          style={{
            display: 'block',
            maxHeight,
          }}
          onError={(e) => {
            const video = e.currentTarget;
            const error = video.error;
            if (error) {
              let errorMsg = 'Error al cargar el video';
              switch (error.code) {
                case error.MEDIA_ERR_ABORTED:
                  errorMsg = 'La carga del video fue cancelada';
                  break;
                case error.MEDIA_ERR_NETWORK:
                  errorMsg = 'Error de red al cargar el video';
                  break;
                case error.MEDIA_ERR_DECODE:
                  errorMsg = 'Error al decodificar el video';
                  break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMsg = 'El formato del video no es compatible';
                  break;
              }
              setVideoError(errorMsg);
            }
          }}
          onLoadedData={() => setVideoError(null)}
          onPlay={(e) => {
            // Marcar que el usuario inició la reproducción
            e.currentTarget.setAttribute('data-user-initiated', 'true');
          }}
        >
          <source 
            src={videoSrc} 
            type={videoSrc.endsWith('.mkv') ? 'video/x-matroska' : videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'} 
          />
          {subtitleSrcEs && (
            <track
              kind="subtitles"
              srcLang="es"
              src={subtitleSrcEs}
              label="Español"
              default={subtitlesEnabled}
            />
          )}
          {subtitleSrcEn && (
            <track
              kind="subtitles"
              srcLang="en"
              src={subtitleSrcEn}
              label="English"
            />
          )}
          {(captionSrcEs || (subtitleSrcEs && !subtitleSrcEn)) && (
            <track
              kind="captions"
              srcLang={captionSrcEs ? "es" : "en"}
              src={captionSrcEs || subtitleSrcEs || ""}
              label={captionSrcEs ? "Español (CC)" : (subtitleSrcEs ? "Español" : "English")}
              default={subtitlesEnabled && Boolean(captionSrcEs || subtitleSrcEs)}
            />
          )}
          Tu navegador no soporta el elemento de video.
        </video>
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {videoError}
            </p>
          </div>
        )}
      </div>

      {transcript && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="a11y-control px-3 py-1 rounded text-xs text-left w-fit"
            aria-expanded={showTranscript}
            aria-controls="video-transcript"
          >
            {showTranscript 
              ? (videoTutorial?.hideTranscript || 'Ocultar transcripción')
              : (videoTutorial?.transcriptButton || 'Ver transcripción')
            }
          </button>

          {showTranscript && (
            <div 
              id="video-transcript"
              className="a11y-muted text-xs p-3 rounded-lg max-h-48 overflow-y-auto"
              role="region"
              aria-label="Transcripción del video"
            >
              <p className="font-semibold mb-2">
                {videoTutorial?.transcriptTitle || 'Transcripción del video'}
              </p>
              <p className="leading-relaxed whitespace-pre-line">
                {transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
