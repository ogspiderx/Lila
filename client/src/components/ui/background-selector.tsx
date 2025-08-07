import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Image, X } from 'lucide-react';
import { useBackground } from '@/hooks/use-background';

export function BackgroundSelector() {
  const { currentBackground, setBackground, backgrounds } = useBackground();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0 transition-all"
          title="Change background"
        >
          <Image className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
        <DropdownMenuItem 
          onClick={() => setBackground(null)}
          className={`cursor-pointer hover:bg-slate-700 ${!currentBackground ? 'bg-slate-700' : ''}`}
        >
          <X className="w-4 h-4 mr-2" />
          Default Background
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700" />
        {backgrounds.map((bg) => (
          <DropdownMenuItem
            key={bg.url}
            onClick={() => setBackground(bg.url)}
            className={`cursor-pointer hover:bg-slate-700 ${currentBackground === bg.url ? 'bg-slate-700' : ''}`}
          >
            <div className="w-4 h-4 mr-2 bg-emerald-500/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
            {bg.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}