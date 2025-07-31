import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number | Date;
}

export function useMessageNotifications(messages: Message[], currentUser: { username: string } | null, soundEnabled: boolean = false) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const previousMessageCountRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalTitleRef = useRef(document.title);

  // Create smooth notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Check if audio context is suspended (requires user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          createSound(audioContext);
        }).catch(error => {
          console.log('Audio context resume failed:', error);
        });
      } else {
        createSound(audioContext);
      }
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const createSound = (audioContext: AudioContext) => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound (soft chime)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not create notification sound:', error);
    }
  };

  // Track tab focus
  useEffect(() => {
    const handleFocus = () => {
      setIsTabFocused(true);
      setUnreadCount(0);
      document.title = originalTitleRef.current;
    };
    
    const handleBlur = () => {
      setIsTabFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Handle new messages
  useEffect(() => {
    if (!currentUser || !messages.length) return;

    const currentMessageCount = messages.length;
    const hasNewMessage = currentMessageCount > previousMessageCountRef.current;
    
    if (hasNewMessage && previousMessageCountRef.current > 0) {
      const latestMessage = messages[messages.length - 1];
      const isFromOtherUser = latestMessage.sender !== currentUser.username;
      
      if (isFromOtherUser) {
        if (!isTabFocused) {
          setUnreadCount(prev => prev + 1);
          // Only play sound when tab is not focused AND sound is enabled
          if (soundEnabled) {
            playNotificationSound();
          }
        }
      }
    }
    
    previousMessageCountRef.current = currentMessageCount;
  }, [messages, currentUser, isTabFocused]);

  // Update page title with unread count
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitleRef.current}`;
    } else {
      document.title = originalTitleRef.current;
    }
  }, [unreadCount]);

  // Initialize audio context on first user interaction
  const initializeAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (error) {
      console.log('Could not initialize audio:', error);
    }
  };

  return { unreadCount, isTabFocused, initializeAudio };
}