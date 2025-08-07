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
  backgrounds: { name: string; url: string | null; description: string; colors: { primary: string; secondary: string; accent: string; text: string } }[];
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