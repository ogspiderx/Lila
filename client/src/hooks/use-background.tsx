import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BackgroundContextType {
  currentBackground: string | null;
  setBackground: (background: string | null) => void;
  backgrounds: { name: string; url: string }[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const backgrounds = [
  {
    name: "Starry Night",
    url: "/attached_assets/totoro-watching-starry-night-sky_1754553785079.mp4"
  },
  {
    name: "Flower Field", 
    url: "/attached_assets/totoro-in-the-flower-field_1754553832693.mp4"
  },
  {
    name: "Sunlight",
    url: "/attached_assets/totoro-chilling-in-the-sunlight-my-neighbor_1754553849996.mp4"
  }
];

interface BackgroundProviderProps {
  children: ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);

  // Load saved background from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-background');
    if (saved && backgrounds.some(bg => bg.url === saved)) {
      setCurrentBackground(saved);
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

  return (
    <BackgroundContext.Provider value={{ 
      currentBackground, 
      setBackground, 
      backgrounds 
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