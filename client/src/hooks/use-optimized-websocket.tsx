import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketMessage } from "@shared/schema";

export function useOptimizedWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<string[]>([]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Send queued messages
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) ws.send(message);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.data) {
          const newMessage = {
            ...data.data,
            timestamp: new Date(data.data.timestamp).getTime()
          };
          
          setMessages(prev => {
            // Use Map for O(1) deduplication
            const messageMap = new Map(prev.map(m => [m.id, m]));
            if (!messageMap.has(newMessage.id)) {
              return [...prev, newMessage];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Exponential backoff reconnection
      const delay = Math.min(1000 * Math.pow(2, 0), 30000);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback((sender: string, content: string) => {
    const message = JSON.stringify({
      type: "message",
      sender,
      content
    });

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
    }
  }, []);

  return {
    isConnected,
    messages,
    sendMessage,
    setMessages
  };
}