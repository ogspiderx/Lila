import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketMessage, TypingMessage } from "@shared/schema";

interface WebSocketEventMessage {
  type: string;
  data?: WebSocketMessage | TypingMessage;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const ws = useRef<WebSocket | null>(null);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketEventMessage = JSON.parse(event.data);
          if (message.type === "message" && message.data) {
            setMessages(prev => {
              // Check for duplicates before adding
              const newMessage = message.data as WebSocketMessage;
              const exists = prev.some(m => m.id === newMessage.id);
              return exists ? prev : [...prev, newMessage];
            });
          } else if (message.type === "typing" && message.data) {
            const typingData = message.data as TypingMessage;
            setTypingUsers(prev => {
              const updated = new Map(prev);
              if (typingData.isTyping) {
                updated.set(typingData.sender, true);
                // Clear existing timeout for this user
                const existingTimeout = typingTimeouts.current.get(typingData.sender);
                if (existingTimeout) {
                  clearTimeout(existingTimeout);
                }
                // Set new timeout to auto-clear typing status
                const timeout = setTimeout(() => {
                  setTypingUsers(prev => {
                    const updated = new Map(prev);
                    updated.delete(typingData.sender);
                    return updated;
                  });
                  typingTimeouts.current.delete(typingData.sender);
                }, 2000);
                typingTimeouts.current.set(typingData.sender, timeout);
              } else {
                updated.delete(typingData.sender);
                // Clear timeout
                const existingTimeout = typingTimeouts.current.get(typingData.sender);
                if (existingTimeout) {
                  clearTimeout(existingTimeout);
                  typingTimeouts.current.delete(typingData.sender);
                }
              }
              return updated;
            });
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        setIsConnected(false);
        
        // Reconnect after 3 seconds if not a manual close
        if (event.code !== 1000) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close(1000, "Component unmounting");
      }
    };
  }, []);

  const sendMessage = (sender: string, content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "message",
        sender,
        content
      }));
    }
  };

  const sendTyping = useCallback((sender: string, isTyping: boolean) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "typing",
        sender,
        isTyping
      }));
    }
  }, []);

  return {
    isConnected,
    messages,
    sendMessage,
    sendTyping,
    typingUsers,
    setMessages
  };
}
