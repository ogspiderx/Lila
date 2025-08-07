import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  src: string;
  className?: string;
}

export function BackgroundVideo({ src, className = "" }: BackgroundVideoProps) {
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

  return (
    <video
      ref={videoRef}
      src={src}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
    />
  );
}