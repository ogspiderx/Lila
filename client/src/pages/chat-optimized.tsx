import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LogOut, Send, Paperclip, X } from "lucide-react";
import { MessageBubble } from "@/components/ui/message-bubble";
import { TypingIndicator } from "@/components/ui/typing-indicator";

import { useOptimizedWebSocket } from "@/hooks/use-optimized-websocket";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";

import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

export default function ChatOptimized() {
  const [messageInput, setMessageInput] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const {
    isConnected,
    messages: wsMessages,
    typingUsers,
    sendMessage,
    sendTyping
  } = useOptimizedWebSocket();

  const { handleTypingStart, handleTypingStop, cleanup } = useTypingIndicator({
    sendTyping,
    debounceMs: 200,
    stopTypingDelayMs: 2000,
  });

  // Load current user with minimal caching
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (userData && typeof userData === 'object' && 'user' in userData) {
      setCurrentUser((userData as any).user);
    } else if (userData === null || (!userLoading && !userData)) {
      setLocation("/");
    }
  }, [userData, userLoading, setLocation]);

  // Fetch existing messages with minimal caching
  const { data: existingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
    staleTime: 15 * 1000,
    gcTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Unified message state optimized for performance
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  
  // Initialize messages from REST API
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0) {
      setAllMessages(existingMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      })));
    }
  }, [existingMessages]);
  
  // Sync WebSocket messages with optimized performance
  useEffect(() => {
    if (wsMessages.length === 0) return;
    
    setAllMessages(prev => {
      const messageMap = new Map<string, Message>();
      
      // Add existing messages
      prev.forEach(msg => messageMap.set(msg.id, msg));
      
      // Add WebSocket messages
      wsMessages.forEach(message => {
        const normalizedMessage = {
          ...message,
          timestamp: new Date(message.timestamp)
        };
        messageMap.set(message.id, normalizedMessage);
      });

      return Array.from(messageMap.values())
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-100); // Keep only last 100 messages for performance
    });
  }, [wsMessages]);

  // Memoize sorted messages for performance
  const displayMessages = useMemo(() => {
    return allMessages
      .filter(msg => msg.content.trim() || msg.fileUrl)
      .slice(-50); // Display only last 50 messages
  }, [allMessages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (300MB limit)
      if (file.size > 300 * 1024 * 1024) {
        alert("File size must be less than 300MB");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string } | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = messageInput.trim();
    if ((!content && !selectedFile) || !currentUser) return;

    if (content && content.length > 1000) return;

    setIsUploading(true);
    handleTypingStop();

    try {
      let fileData = null;
      
      // Upload file if selected
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
        if (!fileData) {
          alert("File upload failed. Please try again.");
          return;
        }
      }

      // Send message (sendMessage needs to be updated to handle file data)
      sendMessage(currentUser.username, content || "", fileData);

      setMessageInput("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  }, [messageInput, selectedFile, currentUser, handleTypingStop, sendMessage, uploadFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setMessageInput(value);
      
      if (value.trim()) {
        handleTypingStart();
      } else {
        handleTypingStop();
      }
    }
  }, [handleTypingStart, handleTypingStop]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });
    } catch (error) {
      // Ignore logout errors
    }
    setLocation("/");
  }, [setLocation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Auto-scroll with performance optimization
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "auto",
        block: "end"
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, scrollToBottom]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
      {/* Minimal header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-white">Chat</h1>
          {isConnected && (
            <div className="flex items-center space-x-1 text-emerald-400 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Online</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-slate-300 text-sm">{currentUser.username}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages area with minimal styling */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
          {displayMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender === currentUser.username}
            />
          ))}
          
          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <TypingIndicator typingUsers={new Set(Array.from(typingUsers).filter(user => user !== currentUser.username))} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input form with file upload */}
        <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
          {/* File preview */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-slate-800 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <div className="flex items-end space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected || isUploading}
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-2"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            
            <Textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
              disabled={!isConnected || isUploading}
            />
            <Button
              type="submit"
              disabled={(!messageInput.trim() && !selectedFile) || !isConnected || isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>{messageInput.length}/1000 characters</span>
            {selectedFile && (
              <span>File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}