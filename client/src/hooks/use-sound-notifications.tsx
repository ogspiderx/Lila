import { useEffect, useRef } from 'react';

interface SoundNotificationOptions {
  enabled: boolean;
  volume?: number;
}

export function useSoundNotifications({ enabled, volume = 0.3 }: SoundNotificationOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled && !audioRef.current) {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createNotificationSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      };

      audioRef.current = { play: createNotificationSound } as any;
    }
  }, [enabled, volume]);

  const playNotification = () => {
    if (enabled && audioRef.current) {
      try {
        if (typeof audioRef.current.play === 'function') {
          audioRef.current.play();
        }
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  };

  return { playNotification };
}