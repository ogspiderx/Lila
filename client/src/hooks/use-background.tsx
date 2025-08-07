import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BackgroundSettings {
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  autoPickColors: boolean;
}

interface BackgroundContextType {
  currentBackground: string | null;
  setBackground: (background: string | null) => void;
  backgrounds: { name: string; url: string; description: string; colors: { primary: string; secondary: string; accent: string; text: string } }[];
  settings: BackgroundSettings;
  updateSettings: (settings: Partial<BackgroundSettings>) => void;
  resetSettings: () => void;
  getCurrentColors: () => { primary: string; secondary: string; accent: string; text: string } | null;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const backgrounds = [
  {
    name: "Starry Night",
    url: "/attached_assets/totoro-watching-starry-night-sky_1754553785079.mp4",
    description: "Peaceful night sky with stars",
    colors: {
      primary: "hsl(220, 70%, 50%)",
      secondary: "hsl(240, 60%, 40%)",
      accent: "hsl(260, 80%, 60%)",
      text: "hsl(220, 30%, 85%)"
    }
  },
  {
    name: "Flower Field", 
    url: "/attached_assets/totoro-in-the-flower-field_1754553832693.mp4",
    description: "Vibrant meadow filled with flowers",
    colors: {
      primary: "hsl(120, 60%, 45%)",
      secondary: "hsl(140, 50%, 35%)",
      accent: "hsl(80, 70%, 55%)",
      text: "hsl(120, 25%, 80%)"
    }
  },
  {
    name: "Sunlight",
    url: "/attached_assets/totoro-chilling-in-the-sunlight-my-neighbor_1754553849996.mp4",
    description: "Warm golden sunlight filtering through trees",
    colors: {
      primary: "hsl(45, 85%, 55%)",
      secondary: "hsl(35, 75%, 45%)",
      accent: "hsl(25, 90%, 65%)",
      text: "hsl(45, 20%, 85%)"
    }
  },
  {
    name: "Japanese House",
    url: "/attached_assets/japanese-house.3840x2160_1754558549551.mp4",
    description: "Traditional Japanese architecture",
    colors: {
      primary: "hsl(15, 60%, 50%)",
      secondary: "hsl(30, 40%, 45%)",
      accent: "hsl(0, 70%, 55%)",
      text: "hsl(15, 25%, 85%)"
    }
  },
  {
    name: "Purple Sunset",
    url: "/attached_assets/purple-sunset2.1920x1080_1754558549554.mp4",
    description: "Magical purple evening sky",
    colors: {
      primary: "hsl(280, 70%, 60%)",
      secondary: "hsl(300, 60%, 50%)",
      accent: "hsl(260, 80%, 70%)",
      text: "hsl(280, 30%, 90%)"
    }
  },
  {
    name: "Samurai Moonlight",
    url: "/attached_assets/samurai-spirit-under-the-moon.3840x2160_1754558549560.mp4",
    description: "Warrior spirit under moonlight",
    colors: {
      primary: "hsl(200, 60%, 40%)",
      secondary: "hsl(220, 50%, 35%)",
      accent: "hsl(180, 70%, 50%)",
      text: "hsl(200, 25%, 85%)"
    }
  },
  {
    name: "Train Sunset",
    url: "/attached_assets/train_sunset_1754558549564.mp4",
    description: "Journey through golden sunset",
    colors: {
      primary: "hsl(35, 80%, 55%)",
      secondary: "hsl(25, 70%, 45%)",
      accent: "hsl(15, 90%, 65%)",
      text: "hsl(35, 20%, 85%)"
    }
  },
  {
    name: "Cherry Blossoms",
    url: "/attached_assets/Cherry Blossoms Branches Live Wallpaper_1754559194614.mp4",
    description: "Delicate pink cherry blossoms",
    colors: {
      primary: "hsl(330, 60%, 65%)",
      secondary: "hsl(340, 50%, 55%)",
      accent: "hsl(320, 70%, 75%)",
      text: "hsl(330, 25%, 85%)"
    }
  },
  {
    name: "Chihiro's Garden",
    url: "/attached_assets/Chihiro In The Garden Of Flowers Spirited Away Live Wallpaper_1754559194617.mp4",
    description: "Spirited Away flower garden",
    colors: {
      primary: "hsl(110, 60%, 50%)",
      secondary: "hsl(130, 50%, 40%)",
      accent: "hsl(90, 70%, 60%)",
      text: "hsl(110, 25%, 80%)"
    }
  },
  {
    name: "Street Sunset",
    url: "/attached_assets/Colorful Sunset on Street Live Wallpaper_1754559194620.mp4",
    description: "Colorful urban sunset scene",
    colors: {
      primary: "hsl(25, 75%, 60%)",
      secondary: "hsl(15, 65%, 50%)",
      accent: "hsl(35, 85%, 70%)",
      text: "hsl(25, 20%, 85%)"
    }
  },
  {
    name: "Howl's Flower Field",
    url: "/attached_assets/Howl And Sophie In The Flower Field Howl's Moving Castle Live Wallpaper_1754559194622.mp4",
    description: "Moving Castle flower meadow",
    colors: {
      primary: "hsl(60, 65%, 55%)",
      secondary: "hsl(80, 55%, 45%)",
      accent: "hsl(40, 75%, 65%)",
      text: "hsl(60, 25%, 80%)"
    }
  },
  {
    name: "Shou's Garden",
    url: "/attached_assets/Shou Relaxing Flower Field The Secret World Of Arrietty Live Wallpaper_1754559194623.mp4",
    description: "Secret World of Arrietty garden",
    colors: {
      primary: "hsl(100, 60%, 45%)",
      secondary: "hsl(120, 50%, 35%)",
      accent: "hsl(80, 70%, 55%)",
      text: "hsl(100, 25%, 80%)"
    }
  },
  {
    name: "Forest Rain",
    url: "/attached_assets/Totoro Forest Rain Live Wallpaper_1754559194625.mp4",
    description: "Peaceful forest rain with Totoro",
    colors: {
      primary: "hsl(140, 55%, 40%)",
      secondary: "hsl(160, 45%, 30%)",
      accent: "hsl(120, 65%, 50%)",
      text: "hsl(140, 25%, 85%)"
    }
  },
  {
    name: "Totoro Sunrise",
    url: "/attached_assets/Totoro Sunrise My Neighbor Totoro Live Wallpaper_1754559194626.mp4",
    description: "My Neighbor Totoro at sunrise",
    colors: {
      primary: "hsl(50, 80%, 60%)",
      secondary: "hsl(40, 70%, 50%)",
      accent: "hsl(30, 90%, 70%)",
      text: "hsl(50, 20%, 85%)"
    }
  }
];

const defaultSettings: BackgroundSettings = {
  opacity: 30,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  autoPickColors: false
};

interface BackgroundProviderProps {
  children: ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [settings, setSettings] = useState<BackgroundSettings>(defaultSettings);

  // Load saved background and settings from localStorage
  useEffect(() => {
    const savedBackground = localStorage.getItem('chat-background');
    const savedSettings = localStorage.getItem('chat-background-settings');
    
    if (savedBackground && backgrounds.some(bg => bg.url === savedBackground)) {
      setCurrentBackground(savedBackground);
    }
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse background settings:', error);
      }
    }
  }, []);

  const setBackground = (background: string | null) => {
    setCurrentBackground(background);
    if (background) {
      localStorage.setItem('chat-background', background);
    } else {
      localStorage.removeItem('chat-background');
    }
  };

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('chat-background-settings', JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('chat-background-settings', JSON.stringify(defaultSettings));
  };

  const getCurrentColors = () => {
    if (!settings.autoPickColors || !currentBackground) return null;
    const background = backgrounds.find(bg => bg.url === currentBackground);
    return background?.colors || null;
  };

  // Apply colors to CSS variables when autoPickColors is enabled
  useEffect(() => {
    const colors = getCurrentColors();
    const root = document.documentElement;
    
    if (colors) {
      root.style.setProperty('--theme-primary', colors.primary);
      root.style.setProperty('--theme-secondary', colors.secondary);
      root.style.setProperty('--theme-accent', colors.accent);
      root.style.setProperty('--theme-text', colors.text);
      root.classList.add('auto-theme');
    } else {
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-accent');
      root.style.removeProperty('--theme-text');
      root.classList.remove('auto-theme');
    }
  }, [currentBackground, settings.autoPickColors]);


  return (
    <BackgroundContext.Provider value={{ 
      currentBackground, 
      setBackground, 
      backgrounds,
      settings,
      updateSettings,
      resetSettings,
      getCurrentColors
    }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}