import { useEffect, useRef, useState } from "react";
import type { WebSocketMessage } from "@shared/schema";

interface WebSocketEventMessage {
  type: string;
  data?: WebSocketMessage;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const ws = useRef<WebSocket | null>(null);

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
            setMessages(prev => [...prev, message.data!]);
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

  return {
    isConnected,
    messages,
    sendMessage,
    setMessages
  };
}
