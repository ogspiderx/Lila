import { useEffect, useRef, useState, useCallback } from 'react';
import type { BackgroundSettings } from '@/hooks/use-background';
import { VideoLoader } from '@/components/ui/video-loader';

// Throttle function to limit how often progress updates fire
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

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
  const isLoadingRef = useRef(true);
  const hasCompletedRef = useRef(false);
  const lastProgressRef = useRef(0);

  const handleLoadStart = useCallback(() => {
    if (hasCompletedRef.current) return;
    setIsLoading(true);
    isLoadingRef.current = true;
    hasCompletedRef.current = false;
    setLoadProgress(0);
    setHasError(false);
  }, []);

  const handleProgress = useCallback(throttle(() => {
    if (hasCompletedRef.current) return;
    const video = videoRef.current;
    if (video && video.buffered.length > 0 && video.duration > 0) {
      const buffered = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      const progress = Math.min((buffered / duration) * 100, 95);
      
      // Only update if progress actually changed
      if (Math.abs(progress - lastProgressRef.current) > 1) {
        lastProgressRef.current = progress;
        setLoadProgress(progress);
      }
    }
  }, 500), []);

  const handleCanPlayThrough = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setLoadProgress(100);
    isLoadingRef.current = false;
    // Add a small delay before hiding the loader to show 100%
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    isLoadingRef.current = false;
    hasCompletedRef.current = true;
  }, []);

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    isLoadingRef.current = true;
    hasCompletedRef.current = false;
    lastProgressRef.current = 0;
    setLoadProgress(0);
    setHasError(false);
    
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      
      // Create optimized event handlers
      const handleMetadata = () => {
        if (!hasCompletedRef.current) setLoadProgress(15);
      };
      const handleData = () => {
        if (!hasCompletedRef.current) setLoadProgress(40);
      };
      const handleCanPlay = () => {
        if (!hasCompletedRef.current) setLoadProgress(70);
      };
      
      // Add event listeners for loading progress
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('loadedmetadata', handleMetadata);
      video.addEventListener('loadeddata', handleData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('canplaythrough', handleCanPlayThrough);
      video.addEventListener('error', handleError);
      
      // Add timeout to prevent getting stuck
      const timeout = setTimeout(() => {
        if (isLoadingRef.current && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setLoadProgress(100);
          isLoadingRef.current = false;
          setTimeout(() => setIsLoading(false), 200);
        }
      }, 3000); // 3 second timeout
      
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
        video.removeEventListener('loadedmetadata', handleMetadata);
        video.removeEventListener('loadeddata', handleData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('error', handleError);
        clearTimeout(timeout);
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