import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Image, X, Check } from 'lucide-react';
import { useBackground } from '@/hooks/use-background';

interface BackgroundPreviewProps {
  url: string;
  name: string;
  description: string;
  isSelected: boolean;
  isLoading: boolean;
  onClick: () => void;
}

function BackgroundPreview({ url, name, description, isSelected, isLoading, onClick }: BackgroundPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      
      if (isHovered) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented
          });
        }
      } else {
        video.pause();
      }
    }
  }, [isHovered, url]);

  return (
    <div 
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 border-2 ${
        isSelected 
          ? 'border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105' 
          : 'border-slate-600 hover:border-slate-500'
      } ${isLoading ? 'opacity-70' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`background-preview-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-video relative bg-slate-800">
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-80'
        }`}>
          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
            <p className="text-slate-300 text-xs truncate">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BackgroundPreviewGrid() {
  const { currentBackground, setBackground, backgrounds } = useBackground();
  const [showGrid, setShowGrid] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);

  const handleSelectBackground = (url: string) => {
    setLoadingVideo(url);
    setBackground(url);
    setTimeout(() => {
      setLoadingVideo(null);
      setShowGrid(false);
    }, 1000);
  };

  const handleClearBackground = () => {
    setBackground(null);
    setShowGrid(false);
  };

  return (
    <>
      <Dialog open={showGrid} onOpenChange={setShowGrid}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0 transition-all"
            title="Change background"
            data-testid="button-background-selector"
          >
            <Image className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl w-[90vw] max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span>Choose Background Theme</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearBackground}
                className="text-slate-400 hover:text-white"
                title="Remove background"
                data-testid="button-clear-background"
              >
                <X className="w-4 h-4 mr-1" />
                Default
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {backgrounds.map((bg) => (
                <BackgroundPreview
                  key={bg.url}
                  url={bg.url}
                  name={bg.name}
                  description={bg.description}
                  isSelected={currentBackground === bg.url}
                  isLoading={loadingVideo === bg.url}
                  onClick={() => handleSelectBackground(bg.url)}
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Hover over videos to preview • Selected theme will affect chat colors
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}