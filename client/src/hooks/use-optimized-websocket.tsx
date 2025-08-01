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
              setTypingUsers(prev => new Set([...prev, data.sender]));
              
              // Clear existing timeout for this user
              const existingTimeout = typingTimeoutsRef.current.get(data.sender);
              if (existingTimeout) {
                clearTimeout(existingTimeout);
              }
              
              // Set timeout to remove typing indicator after 3 seconds
              const timeout = setTimeout(() => {
                setTypingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(data.sender);
                  return newSet;
                });
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
        } else if (data.type === 'message_edited' && data.data) {
          // Handle message edits
          setMessages(prev => prev.map(msg => 
            msg.id === data.data.id 
              ? { 
                  ...data.data, 
                  timestamp: new Date(data.data.timestamp).getTime(),
                  edited: data.data.edited 
                }
              : msg
          ));
        } else if (data.type === 'message_deleted') {
          // Handle message deletions
          if (data.data) {
            setMessages(prev => prev.map(msg => 
              msg.id === data.messageId 
                ? { 
                    ...msg, 
                    content: data.data.content,
                    edited: data.data.edited,
                    timestamp: new Date(data.data.timestamp).getTime()
                  }
                : msg
            ));
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
      
      // Only reconnect for specific error codes, avoid infinite loops
      if (event.code !== 1000 && event.code !== 4000 && event.code !== 4003 && event.code !== 4004) {
        reconnectTimeoutRef.current = setTimeout(() => {
          // Only reconnect if we still have a valid auth token
          const authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('authToken='))
            ?.split('=')[1];
          if (authToken) {
            connectWebSocket();
          }
        }, 5000); // Increased delay to prevent rapid reconnections
      }
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
      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      
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

  const sendTyping = useCallback((isTyping: boolean) => {
    const message = JSON.stringify({
      type: "typing",
      isTyping
    });

    if (wsRef.current?.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(message);
    }
  }, [isConnected]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    const message = JSON.stringify({
      type: "edit_message",
      messageId,
      newContent
    });

    if (wsRef.current?.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(message);
    }
  }, [isConnected]);

  const deleteMessage = useCallback((messageId: string) => {
    const message = JSON.stringify({
      type: "delete_message",
      messageId
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
    editMessage,
    deleteMessage,
    setMessages
  };
}