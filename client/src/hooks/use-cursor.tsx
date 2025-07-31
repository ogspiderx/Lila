import { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorTrail extends CursorPosition {
  id: number;
  opacity: number;
  scale: number;
}

interface ClickRipple extends CursorPosition {
  id: number;
  scale: number;
  opacity: number;
}

export function useCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<CursorTrail[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [clickRipples, setClickRipples] = useState<ClickRipple[]>([]);

  useEffect(() => {
    let trailId = 0;
    let rippleId = 0;

    const updateCursor = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setPosition(newPosition);

      // Add new trail point with random slight offset for organic feel
      const newTrail: CursorTrail = {
        x: newPosition.x + (Math.random() - 0.5) * 2,
        y: newPosition.y + (Math.random() - 0.5) * 2,
        id: trailId++,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.4,
      };

      setTrail(prev => [...prev.slice(-12), newTrail]);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      
      // Create click ripple effect
      const newRipple: ClickRipple = {
        x: e.clientX,
        y: e.clientY,
        id: rippleId++,
        scale: 0,
        opacity: 1,
      };
      
      setClickRipples(prev => [...prev, newRipple]);
    };

    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Animate trail fade and ripples
    const animationInterval = setInterval(() => {
      setTrail(prev => 
        prev.map(point => ({ 
          ...point, 
          opacity: point.opacity * 0.88,
          scale: point.scale * 0.98
        })).filter(point => point.opacity > 0.05)
      );

      setClickRipples(prev =>
        prev.map(ripple => ({
          ...ripple,
          scale: ripple.scale + 0.8,
          opacity: ripple.opacity * 0.92
        })).filter(ripple => ripple.opacity > 0.01 && ripple.scale < 50)
      );
    }, 16);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      clearInterval(animationInterval);
    };
  }, []);

  return { position, trail, isClicking, clickRipples };
}