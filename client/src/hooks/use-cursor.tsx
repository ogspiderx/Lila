import { useEffect, useRef } from "react";

interface CursorTrail {
  x: number;
  y: number;
  timestamp: number;
}

export function useCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<CursorTrail[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const updateCursor = (e: MouseEvent) => {
      cursor.style.left = e.clientX - 10 + "px";
      cursor.style.top = e.clientY - 10 + "px";

      // Add trail point
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });

      // Keep only recent trail points
      trailRef.current = trailRef.current.filter(
        (point) => Date.now() - point.timestamp < 500
      );
    };

    const handleClick = () => {
      cursor.classList.add("clicking");
      setTimeout(() => cursor.classList.remove("clicking"), 150);
    };

    const animateTrail = () => {
      // Remove old trail elements
      document.querySelectorAll(".cursor-trail").forEach((el) => el.remove());

      // Create new trail elements
      trailRef.current.forEach((point, index) => {
        const trail = document.createElement("div");
        trail.className = "cursor-trail";
        trail.style.left = point.x - 2 + "px";
        trail.style.top = point.y - 2 + "px";
        
        const age = Date.now() - point.timestamp;
        const opacity = Math.max(0, (500 - age) / 500);
        trail.style.opacity = (opacity * 0.6).toString();
        trail.style.transform = `scale(${opacity})`;
        
        document.body.appendChild(trail);
      });

      animationRef.current = requestAnimationFrame(animateTrail);
    };

    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("click", handleClick);
    animationRef.current = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("click", handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.querySelectorAll(".cursor-trail").forEach((el) => el.remove());
    };
  }, []);

  return cursorRef;
}