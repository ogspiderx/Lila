import { useEffect, useRef, useState, useCallback } from 'react';
import type { BackgroundSettings } from '@/hooks/use-background';
import { VideoLoader } from '@/components/ui/video-loader';

interface BackgroundVideoProps {
  src: string;
  settings: BackgroundSettings;
  className?: string;
  videoName?: string;
}

export function BackgroundVideo({ src, settings, className = "", videoName = "Video" }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setLoadProgress(0);
    setHasError(false);
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const buffered = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      if (duration > 0) {
        const progress = (buffered / duration) * 100;
        setLoadProgress(progress);
      }
    }
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    setIsLoading(false);
    setLoadProgress(100);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    console.error('Error loading video:', src);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      
      // Add event listeners for loading progress
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('canplaythrough', handleCanPlayThrough);
      video.addEventListener('error', handleError);
      
      // Start loading
      video.load();
      
      // Start playing once loaded
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, but that's okay
        });
      }

      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('error', handleError);
      };
    }
  }, [src, handleLoadStart, handleProgress, handleCanPlayThrough, handleError]);

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
    <>
      <video
        ref={videoRef}
        src={src}
        style={videoStyle}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
      />
      
      {(isLoading && !hasError) && (
        <VideoLoader 
          progress={loadProgress}
          videoName={videoName}
          className="transition-opacity duration-300"
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="text-sm">Failed to load video</p>
            <p className="text-xs mt-1">{videoName}</p>
          </div>
        </div>
      )}
    </>
  );
}