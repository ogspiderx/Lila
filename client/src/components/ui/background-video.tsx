import { useEffect, useRef } from 'react';
import type { BackgroundSettings } from '@/hooks/use-background';

interface BackgroundVideoProps {
  src: string;
  settings: BackgroundSettings;
  className?: string;
}

export function BackgroundVideo({ src, settings, className = "" }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      
      // Start playing
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, but that's okay
        });
      }
    }
  }, [src]);

  const videoStyle = {
    opacity: settings.opacity / 100,
    filter: `
      blur(${settings.blur}px) 
      brightness(${settings.brightness}%) 
      contrast(${settings.contrast}%) 
      saturate(${settings.saturation}%)
    `.trim()
  };

  return (
    <video
      ref={videoRef}
      src={src}
      style={videoStyle}
      className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${className}`}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
    />
  );
}