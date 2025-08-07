import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Image, X, Check, Play } from 'lucide-react';
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
  const [thumbnailError, setThumbnailError] = useState(false);

  return (
    <div 
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 border-2 hover:scale-105 ${
        isSelected 
          ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' 
          : 'border-slate-600 hover:border-slate-400'
      } ${isLoading ? 'opacity-70' : ''}`}
      onClick={onClick}
      data-testid={`background-preview-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-video relative bg-slate-800">
        {!thumbnailError ? (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
            onError={() => setThumbnailError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <Play className="w-8 h-8 text-slate-500" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
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
          
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          
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
              Click to select video background • Selected theme will affect chat colors
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}