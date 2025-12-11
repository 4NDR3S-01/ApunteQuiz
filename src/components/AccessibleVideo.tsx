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
  const { subtitlesEnabled, autoTranscripts } = useAccessibility();
  const [showTranscript, setShowTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
          style={{
            display: 'block',
            maxHeight,
          }}
        >
          <source src={videoSrc} type="video/mp4" />
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
          <track
            kind="captions"
            srcLang={captionSrcEs ? "es" : "en"}
            src={captionSrcEs || subtitleSrcEs || subtitleSrcEn || ""}
            label={captionSrcEs ? "Español (CC)" : (subtitleSrcEs ? "Español" : "English")}
            default={subtitlesEnabled && (captionSrcEs || subtitleSrcEs)}
          />
          Tu navegador no soporta el elemento de video.
        </video>
      </div>

      {transcript && (
        <div className="flex flex-col gap-2">
          {autoTranscripts && (
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="a11y-control px-3 py-1 rounded text-xs text-left w-fit"
            >
              {showTranscript 
                ? (videoTutorial?.hideTranscript || 'Ocultar transcripción')
                : (videoTutorial?.transcriptButton || 'Ver transcripción')
              }
            </button>
          )}

          {showTranscript && (
            <div className="a11y-muted text-xs p-3 rounded-lg max-h-48 overflow-y-auto">
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
