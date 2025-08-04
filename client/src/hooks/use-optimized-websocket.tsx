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
    const wsUrl = `${protocol}//${host}/ws`;
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

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
        } else if (data.type === 'message') {
          const message = data.data;

          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;

            const newMessages = [...prev, message].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            return newMessages;
          });

          
        } else if (data.type === 'typing') {
          const username = document.cookie
            .split('; ')
            .find(row => row.startsWith('username='))
            ?.split('=')[1];
          if (username && data.sender !== username) {
            setTypingUsers(prev => {
              const updated = new Set(prev);
              if (data.isTyping) {
                updated.add(data.sender);
              } else {
                updated.delete(data.sender);
              }
              return updated;
            });
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

  const sendMessage = useCallback((sender: string, content: string, fileData?: { fileUrl: string; fileName: string; fileSize: number; fileType: string } | null) => {
    // Validate that either content or file is provided
    const sanitizedContent = content.trim().substring(0, 1000);
    if (!sanitizedContent && !fileData) return;

    const message = JSON.stringify({
      type: "message",
      content: sanitizedContent,
      fileUrl: fileData?.fileUrl,
      fileName: fileData?.fileName,
      fileSize: fileData?.fileSize,
      fileType: fileData?.fileType,
      timestamp: new Date().toISOString(),
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