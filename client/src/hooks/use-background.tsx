import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BackgroundSettings {
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

interface BackgroundContextType {
  currentBackground: string | null;
  setBackground: (background: string | null) => void;
  backgrounds: { name: string; url: string; description: string }[];
  settings: BackgroundSettings;
  updateSettings: (settings: Partial<BackgroundSettings>) => void;
  resetSettings: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const backgrounds = [
  {
    name: "Starry Night",
    url: "/attached_assets/totoro-watching-starry-night-sky_1754553785079.mp4",
    description: "Peaceful night sky with stars"
  },
  {
    name: "Flower Field", 
    url: "/attached_assets/totoro-in-the-flower-field_1754553832693.mp4",
    description: "Vibrant meadow filled with flowers"
  },
  {
    name: "Sunlight",
    url: "/attached_assets/totoro-chilling-in-the-sunlight-my-neighbor_1754553849996.mp4",
    description: "Warm golden sunlight filtering through trees"
  }
];

const defaultSettings: BackgroundSettings = {
  opacity: 30,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100
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

  return (
    <BackgroundContext.Provider value={{ 
      currentBackground, 
      setBackground, 
      backgrounds,
      settings,
      updateSettings,
      resetSettings
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