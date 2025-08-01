import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketMessage, TypingMessage } from "@shared/schema";

export function useOptimizedWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<string[]>([]);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mountedRef = useRef(true);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws`);
    
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
        } else if (data.type === 'typing') {
          // Handle typing indicators
          if (data.sender) {
            if (data.isTyping) {
              setTypingUsers(prev => new Set(Array.from(prev).concat([data.sender])));
              
              // Clear existing timeout for this user
              const existingTimeout = typingTimeoutsRef.current.get(data.sender);
              if (existingTimeout) {
                clearTimeout(existingTimeout);
              }
              
              // Set timeout to remove typing indicator after 3 seconds
              const timeout = setTimeout(() => {
                if (mountedRef.current) {
                  setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.sender);
                    return newSet;
                  });
                }
                typingTimeoutsRef.current.delete(data.sender);
              }, 3000);
              
              typingTimeoutsRef.current.set(data.sender, timeout);
            } else {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.sender);
                return newSet;
              });
              
              // Clear timeout
              const existingTimeout = typingTimeoutsRef.current.get(data.sender);
              if (existingTimeout) {
                clearTimeout(existingTimeout);
                typingTimeoutsRef.current.delete(data.sender);
              }
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected, code:', event.code);
      setIsConnected(false);
      wsRef.current = null;
      
      // Only reconnect if component is still mounted and for specific error codes
      if (mountedRef.current && event.code !== 1000 && event.code !== 4000 && event.code !== 4003 && event.code !== 4004) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            const authToken = document.cookie
              .split('; ')
              .find(row => row.startsWith('authToken='))
              ?.split('=')[1];
            if (authToken) {
              connectWebSocket();
            }
          }
        }, 3000); // Reduced delay for faster reconnection
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connectWebSocket();
    
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Clear all typing timeouts for memory cleanup
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, []);

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

  const sendTyping = useCallback((isTyping: boolean) => {
    const message = JSON.stringify({
      type: "typing",
      isTyping
    });

    if (wsRef.current?.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(message);
    }
  }, [isConnected]);



  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    sendTyping,
    setMessages
  };
}