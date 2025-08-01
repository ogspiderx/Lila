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
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const { 
    isConnected, 
    messages: wsMessages, 
    typingUsers, 
    sendMessage, 
    sendTyping,
    sendMessageStatus,
    setMessages: setWsMessages 
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

      // Add WebSocket messages with proper timestamp handling
      wsMessages.forEach(message => {
        const normalizedMessage = {
          ...message,
          timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
        };
        messageMap.set(message.id, normalizedMessage);
      });

      // Messages are already sorted by backend, just keep the last 100 for performance
      return Array.from(messageMap.values()).slice(-100);
    });
  }, [wsMessages]);

  // Memoize sorted messages for performance
  const displayMessages = useMemo(() => {
    return allMessages
      .filter(msg => msg.content.trim() || msg.fileUrl)
      .slice(-50); // Display only last 50 messages
  }, [allMessages]);

  // Find the index of the last seen message to show divider
  const lastSeenIndex = useMemo(() => {
    if (!lastSeenMessageId) return -1;
    return displayMessages.findIndex(msg => msg.id === lastSeenMessageId);
  }, [displayMessages, lastSeenMessageId]);

  // Mark messages as seen when they come into view
  const markMessagesAsSeen = useCallback(() => {
    if (displayMessages.length > 0 && currentUser) {
      const latestMessage = displayMessages[displayMessages.length - 1];
      if (latestMessage.sender !== currentUser.username && latestMessage.id !== lastSeenMessageId) {
        setLastSeenMessageId(latestMessage.id);
        // Here you would typically send a WebSocket message to mark as seen
        // sendMessageSeen(latestMessage.id, currentUser.username);
      }
    }
  }, [displayMessages, currentUser, lastSeenMessageId]);

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

  const compressImage = useCallback(async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }, []);



  // Auto-scroll with performance optimization
  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  }, []);

  const uploadFileWithProgress = useCallback(async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string } | null> => {
    let fileToUpload = file;

    // Compress images
    if (file.type.startsWith('image/') && file.size > 500 * 1024) { // 500KB threshold
      try {
        setUploadProgress(10);
        fileToUpload = await compressImage(file);
        setUploadProgress(20);
      } catch (error) {
        console.error('Image compression failed:', error);
      }
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      setUploadProgress(30);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 70) + 30; // 30-100%
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              setUploadProgress(100);
              resolve(result);
            } catch (error) {
              reject(new Error('Invalid response'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/upload');
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  }, [compressImage]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const content = messageInput.trim();
    if ((!content && !selectedFile) || !currentUser) return;

    if (content && content.length > 1000) return;

    setIsUploading(true);
    setUploadProgress(0);
    handleTypingStop();

    try {
      let fileData = null;

      // Upload file if selected
      if (selectedFile) {
        fileData = await uploadFileWithProgress(selectedFile);
        if (!fileData) {
          alert("File upload failed. Please try again.");
          return;
        }
      }

      // Send message
      sendMessage(currentUser.username, content || "", fileData);

      setMessageInput("");
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(true), 100);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [messageInput, selectedFile, currentUser, handleTypingStop, sendMessage, uploadFileWithProgress, scrollToBottom]);

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

  // Auto-scroll on new messages
  useEffect(() => {
    if (displayMessages.length > 0) {
      scrollToBottom(true);
    }
  }, [displayMessages, scrollToBottom]);

  // Auto-scroll on page load/refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [scrollToBottom]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Fetch messages with error handling and caching
  const { data: initialMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await fetch('/api/messages', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();

      // Ensure delivery status is included
      return messages.map((msg: any) => ({
        ...msg,
        deliveryStatus: msg.deliveryStatus || 'sent'
      }));
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 3,
  });

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
          {displayMessages.map((message, index) => (
            <div key={message.id}>
              {/* Show unseen message divider */}
              {lastSeenIndex >= 0 && index === lastSeenIndex + 1 && index < displayMessages.length && (
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-red-500/30"></div>
                  <span className="px-3 text-xs text-red-400 bg-slate-900">New messages</span>
                  <div className="flex-1 h-px bg-red-500/30"></div>
                </div>
              )}

              <MessageBubble
                message={message}
                isCurrentUser={message.sender === currentUser.username}
              />
            </div>
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Upload progress bar */}
              {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {isUploading && (
                <div className="text-xs text-slate-400 text-center">
                  {uploadProgress < 20 ? 'Compressing...' : 
                   uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Finalizing...'}
                </div>
              )}
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