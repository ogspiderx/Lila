import { useCallback, useRef } from "react";

interface UseTypingIndicatorProps {
  sendTyping: (isTyping: boolean) => void;
  debounceMs?: number;
  stopTypingDelayMs?: number;
}

export function useTypingIndicator({
  sendTyping,
  debounceMs = 300,
  stopTypingDelayMs = 3000,
}: UseTypingIndicatorProps) {
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  const handleTypingStart = useCallback(() => {
    // Clear any existing debounce timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If not already typing, send typing indicator after debounce
    if (!isTypingRef.current) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = true;
        sendTyping(true);
      }, debounceMs);
    }

    // Clear and reset stop typing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    stopTypingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTyping(false);
      }
    }, stopTypingDelayMs);
  }, [sendTyping, debounceMs, stopTypingDelayMs]);

  const handleTypingStop = useCallback(() => {
    // Clear debounce timeout to prevent starting typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Clear stop typing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    // Immediately send stop typing if currently typing
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping(false);
    }
  }, [sendTyping]);

  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }
    
    // Send stop typing on cleanup
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping(false);
    }
  }, [sendTyping]);

  return {
    handleTypingStart,
    handleTypingStop,
    cleanup,
  };
}