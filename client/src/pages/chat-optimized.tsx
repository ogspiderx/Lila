import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LogOut, Send, Paperclip, X, Reply } from "lucide-react";
import { MessageBubble } from "@/components/ui/message-bubble";
import { TypingIndicator } from "@/components/ui/typing-indicator";

import { useOptimizedWebSocket } from "@/hooks/use-optimized-websocket";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";

import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

export default function ChatOptimized() {
  const [messageInput, setMessageInput] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(
    null,
  );
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [, setLocation] = useLocation();

  const {
    isConnected,
    messages: wsMessages,
    typingUsers,
    sendMessage,
    sendTyping,
    sendMessageStatus,
    deleteMessage,
    setMessages: setWsMessages,
  } = useOptimizedWebSocket();

  const { handleTypingStart, handleTypingStop, cleanup } = useTypingIndicator({
    sendTyping,
    debounceMs: 100,
    stopTypingDelayMs: 10000,
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
    if (userData && typeof userData === "object" && "user" in userData) {
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
      setAllMessages(
        existingMessages.map((msg) => ({
          ...msg,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp
              : new Date(msg.timestamp),
        })),
      );
    }
  }, [existingMessages]);

  // Sync WebSocket messages with optimized performance
  useEffect(() => {
    if (wsMessages.length === 0) return;

    setAllMessages((prev) => {
      const messageMap = new Map<string, Message>();

      // Add existing messages
      prev.forEach((msg) => messageMap.set(msg.id, msg));

      // Add WebSocket messages with proper timestamp handling
      wsMessages.forEach((message) => {
        const normalizedMessage: Message = {
          ...message,
          timestamp:
            typeof message.timestamp === "number"
              ? new Date(message.timestamp)
              : message.timestamp,
          edited: message.edited || false,
          deliveryStatus: message.deliveryStatus || ("sent" as const),
          seenBy: message.seenBy || [],
          fileUrl: message.fileUrl || null,
          fileName: message.fileName || null,
          fileSize: message.fileSize || null,
          fileType: message.fileType || null,
          replyToId: message.replyToId || null,
          replyToMessage: message.replyToMessage || null,
          replyToSender: message.replyToSender || null,
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
      .filter((msg) => msg.content.trim() || msg.fileUrl)
      .slice(-50); // Display only last 50 messages
  }, [allMessages]);

  // Find the index of the last seen message to show divider
  const lastSeenIndex = useMemo(() => {
    if (!lastSeenMessageId) return -1;
    return displayMessages.findIndex((msg) => msg.id === lastSeenMessageId);
  }, [displayMessages, lastSeenMessageId]);

  // Mark messages as seen when they come into view
  const markMessagesAsSeen = useCallback(() => {
    if (displayMessages.length > 0 && currentUser) {
      const latestMessage = displayMessages[displayMessages.length - 1];
      if (
        latestMessage.sender !== currentUser.username &&
        latestMessage.id !== lastSeenMessageId
      ) {
        setLastSeenMessageId(latestMessage.id);
        // Here you would typically send a WebSocket message to mark as seen
        // sendMessageSeen(latestMessage.id, currentUser.username);
      }
    }
  }, [displayMessages, currentUser, lastSeenMessageId]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Check file size (300MB limit)
        if (file.size > 300 * 1024 * 1024) {
          alert("File size must be less than 300MB");
          return;
        }
        setSelectedFile(file);
      }
    },
    [],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const compressImage = useCallback(
    async (file: File, quality: number = 0.8): Promise<File> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
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
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality,
          );
        };

        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
      });
    },
    [],
  );

  // Auto-scroll with performance optimization
  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  const uploadFileWithProgress = useCallback(
    async (
      file: File,
    ): Promise<{
      fileUrl: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    } | null> => {
      let fileToUpload = file;

      // Compress images
      if (file.type.startsWith("image/") && file.size > 500 * 1024) {
        // 500KB threshold
        try {
          setUploadProgress(10);
          fileToUpload = await compressImage(file);
          setUploadProgress(20);
        } catch (error) {
          console.error("Image compression failed:", error);
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      try {
        setUploadProgress(30);

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 70) + 30; // 30-100%
              setUploadProgress(progress);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              try {
                const result = JSON.parse(xhr.responseText);
                setUploadProgress(100);
                resolve(result);
              } catch (error) {
                reject(new Error("Invalid response"));
              }
            } else {
              reject(new Error("Upload failed"));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("POST", "/api/upload");
          xhr.withCredentials = true;
          xhr.send(formData);
        });
      } catch (error) {
        console.error("File upload error:", error);
        return null;
      }
    },
    [compressImage],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    deleteMessage(messageId);
  }, [deleteMessage]);

  const scrollToMessage = useCallback((messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add a highlight effect
      messageElement.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
      messageElement.style.borderRadius = "8px";
      messageElement.style.transition = "background-color 0.3s ease";

      setTimeout(() => {
        messageElement.style.backgroundColor = "";
      }, 2000);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

        // Send message with reply data if replying
        sendMessage(
          currentUser.username,
          content || "",
          fileData,
          replyingTo
            ? {
                replyToId: replyingTo.id,
                replyToMessage: (
                  replyingTo.content ||
                  replyingTo.fileName ||
                  "File"
                ).substring(0, 500),
                replyToSender: replyingTo.sender,
              }
            : undefined,
        );

        setMessageInput("");
        setSelectedFile(null);
        setReplyingTo(null);
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
    },
    [
      messageInput,
      selectedFile,
      currentUser,
      handleTypingStop,
      sendMessage,
      uploadFileWithProgress,
      scrollToBottom,
      replyingTo,
    ],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= 1000) {
        setMessageInput(value);

        if (value.trim()) {
          console.log('Starting typing indicator'); // Debug log
          handleTypingStart();
        } else {
          console.log('Stopping typing indicator'); // Debug log
          handleTypingStop();
        }
      }
    },
    [handleTypingStart, handleTypingStop],
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore logout errors
    }
    setLocation("/");
  }, [setLocation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

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

  // Mark messages as seen when they come into view
  useEffect(() => {
    if (!currentUser || displayMessages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            (entry.target as HTMLElement).dataset.messageId
          ) {
            const messageId = (entry.target as HTMLElement).dataset.messageId;
            const message = displayMessages.find((m) => m.id === messageId);

            // Only mark as seen if it's not our own message and hasn't been seen yet
            if (
              message &&
              messageId &&
              message.sender !== currentUser.username &&
              (!("deliveryStatus" in message) ||
                message.deliveryStatus !== "seen")
            ) {
              sendMessageStatus(messageId, "seen");
            }
          }
        });
      },
      { threshold: 0.5 }, // Mark as seen when 50% visible
    );

    // Observe all message elements
    displayMessages.forEach((message) => {
      const element = messageRefs.current.get(message.id);
      if (element) {
        element.dataset.messageId = message.id;
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [displayMessages, currentUser, sendMessageStatus]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced header with glass effect */}
      <header className="glass-card border-b border-slate-700/50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">💬</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-poppins">Chat</h1>
            {isConnected && (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Connected</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-white font-medium text-sm">{currentUser.username}</div>
            <div className="text-slate-400 text-xs">Active now</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-500">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Enhanced messages area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth messages-container relative z-10">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              ref={(el) => {
                if (el) {
                  messageRefs.current.set(message.id, el);
                } else {
                  messageRefs.current.delete(message.id);
                }
              }}
            >
              <MessageBubble
                message={message}
                isCurrentUser={message.sender === currentUser.username}
                onReply={handleReply}
                onScrollToMessage={scrollToMessage}
                onDelete={handleDeleteMessage}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <TypingIndicator
              typingUsers={
                new Set(
                  Array.from(typingUsers).filter(
                    (user) => user !== currentUser.username,
                  ),
                )
              }
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced input form */}
        <form onSubmit={handleSubmit} className="border-t border-slate-700/30 p-6 bg-slate-800/50 backdrop-blur-sm">
          {/* Reply preview */}
          {replyingTo && (
            <div className="mb-3 p-3 bg-slate-800 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">
                    Replying to {replyingTo.sender}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-slate-300 truncate">
                {(replyingTo.content || replyingTo.fileName || "File").length >
                100
                  ? `${(replyingTo.content || replyingTo.fileName || "File").substring(0, 100)}...`
                  : replyingTo.content || replyingTo.fileName || "File"}
              </div>
            </div>
          )}
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
                  {uploadProgress < 20
                    ? "Compressing..."
                    : uploadProgress < 100
                      ? `Uploading... ${uploadProgress}%`
                      : "Finalizing..."}
                </div>
              )}
            </div>
          )}

          {/* Enhanced input container with modern design */}
          <div className="flex items-end gap-3 bg-gradient-to-r from-slate-800/90 to-slate-700/90 rounded-2xl p-4 border border-slate-600/50 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl hover:border-emerald-500/30">
            {/* File attachment button */}
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
              className="text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 h-10 w-10 p-0 rounded-full transition-colors flex-shrink-0"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Message input */}
            <Textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder=" Type a message..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-transparent border-0 text-white placeholder-slate-400 focus:ring-0 focus:outline-none p-0"
              disabled={!isConnected || isUploading}
            />

            {/* Send button */}
            <Button
              type="submit"
              disabled={
                (!messageInput.trim() && !selectedFile) ||
                !isConnected ||
                isUploading
              }
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:text-slate-400 h-10 w-10 p-0 rounded-full transition-all flex-shrink-0"
              title="Send message"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Character count and file info */}
          {(messageInput.length > 0 || selectedFile) && (
            <div className="mt-2 px-1 text-xs text-slate-500 flex justify-between">
              {messageInput.length > 0 && (
                <span
                  className={
                    messageInput.length > 900
                      ? "text-yellow-400"
                      : messageInput.length > 950
                        ? "text-red-400"
                        : ""
                  }
                >
                  {messageInput.length}/1000
                </span>
              )}
              {selectedFile && (
                <span className="text-slate-400">
                  {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
