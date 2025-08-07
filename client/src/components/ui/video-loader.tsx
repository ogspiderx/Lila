import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Download } from 'lucide-react';

interface VideoLoaderProps {
  progress: number;
  videoName: string;
  className?: string;
}

export function VideoLoader({ progress, videoName, className = "" }: VideoLoaderProps) {
  return (
    <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 ${className}`}>
      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-lg p-6 w-80 max-w-[90vw]">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-medium text-white">Loading Video</h3>
            <p className="text-xs text-slate-400">{videoName}</p>
          </div>
        </div>
        
        <Progress 
          value={progress} 
          showText={true}
          className="mb-2" 
        />
        
        <div className="text-xs text-slate-500 text-center">
          Please wait while the video loads...
        </div>
      </div>
    </div>
  );
}