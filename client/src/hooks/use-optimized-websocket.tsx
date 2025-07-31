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
      
      // Authenticate with JWT token
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
      
      if (authToken) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: authToken
        }));
      } else {
        ws.close(4000, 'No auth token');
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth' && data.success) {
          console.log('WebSocket authenticated');
          setIsConnected(true);
          
          // Send queued messages after authentication
          while (messageQueueRef.current.length > 0) {
            const message = messageQueueRef.current.shift();
            if (message) ws.send(message);
          }
        } else if (data.type === 'message' && data.data) {
          // Validate message data
          if (data.data.id && data.data.sender && data.data.content && data.data.timestamp) {
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
    // Sanitize and validate content
    const sanitizedContent = content.trim().substring(0, 1000);
    if (!sanitizedContent) return;
    
    const message = JSON.stringify({
      type: "message",
      content: sanitizedContent
    });

    if (wsRef.current?.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(message);
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
    }
  }, [isConnected]);

  return {
    isConnected,
    messages,
    sendMessage,
    setMessages
  };
}