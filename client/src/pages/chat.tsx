import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Send, Volume2, VolumeX, Bell, BellOff, Heart, Sparkles, MessageCircle } from "lucide-react";
import { MessageBubble } from "@/components/ui/message-bubble";
import { TypingIndicator } from "@/components/ui/typing-indicator";

import { useOptimizedWebSocket } from "@/hooks/use-optimized-websocket";
import { useMessageNotifications } from "@/hooks/use-message-notifications";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";

import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Message, WebSocketMessage } from "@shared/schema";
import { useMemo } from "react";

export default function Chat() {
  const [messageInput, setMessageInput] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setLocation] = useLocation();
  
  const { 
    isConnected, 
    messages: wsMessages, 
    typingUsers, 
    sendMessage, 
    sendTyping, 
    editMessage, 
    deleteMessage, 
    setMessages 
  } = useOptimizedWebSocket();
  
  const { handleTypingStart, handleTypingStop, cleanup } = useTypingIndicator({
    sendTyping,
    debounceMs: 300,
    stopTypingDelayMs: 3000,
  });

  // Load current user from cookie-based auth with aggressive caching
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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

  // Fetch existing messages with aggressive caching
  const { data: existingMessages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
    staleTime: 15 * 60 * 1000, // 15 minutes - very long stale time
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  // Message processing with proper handling of edits and deletes
  const sortedMessages = useMemo(() => {
    if (!existingMessages && wsMessages.length === 0) return [];
    
    // Create a Map for efficient lookups and updates
    const messageMap = new Map<string, Message>();
    
    // First, add all existing messages
    (existingMessages || []).forEach(msg => {
      messageMap.set(msg.id, {
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      });
    });
    
    // Then process WebSocket messages - both new and updates
    wsMessages.forEach(message => {
      const normalizedMessage = {
        ...message,
        timestamp: new Date(message.timestamp)
      };
      
      // This will either add new messages or update existing ones
      messageMap.set(message.id, normalizedMessage);
    });
    
    // Convert back to array and sort
    const allMessages = Array.from(messageMap.values());
    allMessages.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp;
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp;
      return aTime - bTime;
    });
    
    return allMessages;
  }, [existingMessages, wsMessages]);

  // Initialize message notifications with all sorted messages
  const { unreadCount, initializeAudio, notificationPermission, requestNotificationPermission } = useMessageNotifications(sortedMessages, currentUser, soundEnabled);

  // Initialize audio when sound is first enabled
  useEffect(() => {
    if (soundEnabled) {
      initializeAudio();
    }
  }, [soundEnabled, initializeAudio]);

  // Handle notification permission request
  const handleNotificationToggle = async () => {
    console.log('Notification button clicked, current permission:', notificationPermission);
    if (notificationPermission === 'default' || notificationPermission === 'denied') {
      const newPermission = await requestNotificationPermission();
      console.log('New permission after request:', newPermission);
    }
  };

  // Auto-scroll to bottom when new messages arrive - debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50); // Small delay to batch updates
    
    return () => clearTimeout(timeoutId);
  }, [sortedMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px";
    }
  }, [messageInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = messageInput.trim();
    if (content && content.length <= 2000 && currentUser) {
      handleTypingStop(); // Stop typing indicator when sending
      sendMessage(currentUser.username, content);
      setMessageInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setMessageInput(value);
      
      // Handle typing indicators
      if (value.trim()) {
        handleTypingStart();
      } else {
        handleTypingStop();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });
    } catch (error) {
      // Ignore logout errors, just redirect
    }
    setLocation("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup typing indicator when component unmounts or user changes
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Stop typing when input is cleared
  useEffect(() => {
    if (!messageInput.trim()) {
      handleTypingStop();
    }
  }, [messageInput, handleTypingStop]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Animated background with romantic particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--emerald-500)_0%,_transparent_45%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--emerald-600)_0%,_transparent_50%)] opacity-8"></div>
      </div>
      
      {/* Floating hearts animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              rotate: [0, Math.random() * 10 - 5, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Heart className="w-3 h-3 text-emerald-400/20" />
          </motion.div>
        ))}
      </div>
      {/* Romantic Chat Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="flex-shrink-0 glass-card border-b border-emerald-500/20 px-4 sm:px-6 py-4 relative overflow-hidden z-20"
      >
        {/* Romantic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-400/10" />
        
        <div className="flex items-center justify-between max-w-full relative z-10">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </motion.div>
                <h1 className="app-title text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent tracking-wide">
                  Lila
                </h1>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-5 h-5 text-emerald-400 fill-current" />
                </motion.div>
              </div>
              <motion.div 
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-full"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3 glass-card px-3 py-2 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}
                animate={isConnected ? { 
                  boxShadow: ['0 0 0 0 rgba(52, 211, 153, 0.7)', '0 0 0 10px rgba(52, 211, 153, 0)'] 
                } : { 
                  scale: [1, 1.2, 1] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-emerald-300 hidden sm:inline">
                {isConnected ? "Connected" : "Reconnecting..."}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.div 
              className="glass-card rounded-full px-4 py-2 border border-emerald-500/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
            >
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-emerald-300 font-medium text-sm">{currentUser.username}</span>
              </div>
            </motion.div>
            <motion.div className="flex items-center space-x-1">
              <motion.button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full glass-card text-emerald-300 hover:text-emerald-200 transition-all duration-300"
                whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(52, 211, 153, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                title={soundEnabled ? "Disable sound notifications" : "Enable sound notifications"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </motion.button>

              <motion.button
                onClick={handleNotificationToggle}
                className="p-2 rounded-full glass-card text-emerald-300 hover:text-emerald-200 transition-all duration-300"
                whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(52, 211, 153, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                title={
                  notificationPermission === 'granted' 
                    ? "Desktop notifications enabled" 
                    : notificationPermission === 'denied'
                    ? "Desktop notifications blocked - check browser settings"
                    : "Enable desktop notifications"
                }
              >
                {notificationPermission === 'granted' ? (
                  <Bell className="h-4 w-4 text-emerald-400" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </motion.button>

              <motion.button
                onClick={handleLogout}
                className="p-2 rounded-full glass-card text-red-400 hover:text-red-300 transition-all duration-300"
                whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(248, 113, 113, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Romantic Messages Area */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth messages-container overflow-x-hidden">
          <div className="max-w-4xl mx-auto w-full min-w-0">
            {sortedMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
                className="flex items-center justify-center h-full min-h-[300px]"
              >
                <div className="glass-card rounded-2xl p-8 text-center border border-emerald-500/30 relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-4 right-4"
                  >
                    <Sparkles className="w-6 h-6 text-emerald-400/50" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <MessageCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-emerald-300 font-semibold mb-3 text-lg"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Welcome to Lila! ✨
                  </motion.h3>
                  <p className="text-emerald-200/70 text-sm">Your enchanted chat space awaits your first message</p>
                  
                  <motion.div
                    className="mt-4 flex justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {sortedMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender === currentUser.username}
                    onEditMessage={(messageId, newContent) => {
                      console.log('Chat page: Editing message', messageId, newContent);
                      editMessage(messageId, newContent);
                    }}
                    onDeleteMessage={(messageId) => {
                      console.log('Chat page: Deleting message', messageId);
                      deleteMessage(messageId);
                    }}
                  />
                ))}
                
                {/* Typing Indicator */}
                <TypingIndicator typingUsers={typingUsers} />
                

              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Romantic Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
          className="flex-shrink-0 glass-card border-t border-emerald-500/20 p-4 sm:p-6 relative overflow-hidden z-20"
        >
          {/* Romantic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            <form onSubmit={handleSubmit} className="flex items-end gap-4">
              <div className="flex-1 relative">
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts... ✨"
                    rows={1}
                    className="resize-none glass-card rounded-2xl min-h-[50px] max-h-[120px] py-4 px-5 pr-16 text-sm sm:text-base leading-relaxed border border-emerald-500/30 bg-slate-800/50 text-white placeholder-emerald-200/50 focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/20 transition-all duration-300"
                  />
                  
                  {/* Character counter */}
                  <AnimatePresence>
                    {messageInput.length > 100 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-3 right-4 text-xs text-emerald-300/70 bg-slate-800/80 px-2 py-1 rounded-full"
                      >
                        {messageInput.length}/2000
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Magic sparkle when typing */}
                  <AnimatePresence>
                    {messageInput.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-3 right-4"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              
              <motion.button
                type="submit"
                disabled={!messageInput.trim() || !isConnected || messageInput.length > 2000}
                className="btn-romantic h-[50px] w-[50px] rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={!messageInput.trim() ? {} : { boxShadow: ["0 0 0 0 rgba(52, 211, 153, 0.7)", "0 0 0 20px rgba(52, 211, 153, 0)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  animate={messageInput.trim() ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Send className="h-5 w-5 text-white relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.div>
                
                {/* Romantic shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
