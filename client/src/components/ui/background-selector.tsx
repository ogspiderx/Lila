import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Image, X, Settings, RotateCcw, Palette } from 'lucide-react';
import { useBackground } from '@/hooks/use-background';

export function BackgroundSelector() {
  const { 
    currentBackground, 
    setBackground, 
    backgrounds, 
    settings, 
    updateSettings, 
    resetSettings,
    getCurrentColors
  } = useBackground();
  const [showCustomization, setShowCustomization] = useState(false);

  const currentBackgroundInfo = backgrounds.find(bg => bg.url === currentBackground);
  const currentColors = getCurrentColors();

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
          <DropdownMenuLabel className="text-slate-300">Background Theme</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          
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
              className={`cursor-pointer hover:bg-slate-700 ${currentBackground === bg.url ? 'bg-slate-700' : ''} flex-col items-start p-3`}
            >
              <div className="flex items-center w-full">
                <div className="w-4 h-4 mr-2 bg-emerald-500/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <span className="font-medium">{bg.name}</span>
              </div>
              <span className="text-xs text-slate-400 ml-6">{bg.description}</span>
            </DropdownMenuItem>
          ))}

          {currentBackground && (
            <>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={() => setShowCustomization(true)}
                className="cursor-pointer hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize Background
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Customize {currentBackgroundInfo?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="text-slate-400 hover:text-white"
                title="Reset to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Opacity</label>
                <span className="text-xs text-slate-400">{settings.opacity}%</span>
              </div>
              <Slider
                value={[settings.opacity]}
                onValueChange={([value]) => updateSettings({ opacity: value })}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Blur</label>
                <span className="text-xs text-slate-400">{settings.blur}px</span>
              </div>
              <Slider
                value={[settings.blur]}
                onValueChange={([value]) => updateSettings({ blur: value })}
                max={10}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Brightness</label>
                <span className="text-xs text-slate-400">{settings.brightness}%</span>
              </div>
              <Slider
                value={[settings.brightness]}
                onValueChange={([value]) => updateSettings({ brightness: value })}
                max={150}
                min={50}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Contrast</label>
                <span className="text-xs text-slate-400">{settings.contrast}%</span>
              </div>
              <Slider
                value={[settings.contrast]}
                onValueChange={([value]) => updateSettings({ contrast: value })}
                max={150}
                min={50}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Saturation</label>
                <span className="text-xs text-slate-400">{settings.saturation}%</span>
              </div>
              <Slider
                value={[settings.saturation]}
                onValueChange={([value]) => updateSettings({ saturation: value })}
                max={150}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoPickColors"
                    checked={settings.autoPickColors}
                    onChange={(e) => updateSettings({ autoPickColors: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="autoPickColors" className="text-sm font-medium text-slate-300 flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    Auto-pick colors from video
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                When enabled, the chat interface colors will automatically match the selected video theme instead of using the default green colors.
              </p>
              
              {currentColors && settings.autoPickColors && (
                <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs font-medium text-slate-300 mb-2">Current theme colors:</p>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-slate-600" 
                        style={{ backgroundColor: currentColors.primary }}
                      ></div>
                      <span className="text-xs text-slate-400">Primary</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-slate-600" 
                        style={{ backgroundColor: currentColors.secondary }}
                      ></div>
                      <span className="text-xs text-slate-400">Secondary</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-slate-600" 
                        style={{ backgroundColor: currentColors.accent }}
                      ></div>
                      <span className="text-xs text-slate-400">Accent</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}