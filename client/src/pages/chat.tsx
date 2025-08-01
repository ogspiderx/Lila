import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Send, Volume2, VolumeX, Bell, BellOff } from "lucide-react";
import { MessageBubble } from "@/components/ui/message-bubble";

import { useOptimizedWebSocket } from "@/hooks/use-optimized-websocket";
import { useMessageNotifications } from "@/hooks/use-message-notifications";

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
  
  const { isConnected, messages: wsMessages, sendMessage, setMessages } = useOptimizedWebSocket();

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

  // Ultra-optimized message processing with useMemo
  const sortedMessages = useMemo(() => {
    if (!existingMessages && wsMessages.length === 0) return [];
    
    // Use Set for O(1) lookup of existing IDs
    const existingIds = new Set(existingMessages?.map(m => m.id) || []);
    const allMessages = [...(existingMessages || [])];
    
    // Only add WebSocket messages that don't exist
    wsMessages.forEach(message => {
      if (!existingIds.has(message.id)) {
        // Normalize timestamp for consistent sorting
        const normalizedMessage = {
          ...message,
          timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(Number(message.timestamp))
        };
        allMessages.push(normalizedMessage);
      }
    });
    
    // Sort once at the end
    allMessages.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp);
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp);
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
      sendMessage(currentUser.username, content);
      setMessageInput("");
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

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col romantic-gradient overflow-hidden">
      {/* Chat Header - Fixed */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-shrink-0 floating-element border-b border-rose-200/40 px-4 sm:px-6 py-4 relative overflow-hidden"
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/20 via-peach-50/20 to-lavender-100/20 opacity-70" />
        
        <div className="flex items-center justify-between max-w-full relative z-10">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-rose-500 glow-text-rose tracking-wide">
                Rosé
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-rose-400 via-peach-300 to-rose-400 opacity-70 rounded-full" />
            </div>
            
            <div className="flex items-center space-x-3 text-rose-400">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 shadow-lg ${isConnected ? 'bg-rose-400 animate-pulse glow-rose shadow-rose-400/50' : 'bg-destructive animate-bounce shadow-destructive/50'}`} />
              <span className="text-sm sm:text-base font-medium hidden sm:inline">
                {isConnected ? "Connected" : "Reconnecting..."}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="flex items-center space-x-3 bg-rose-50/70 rounded-full px-4 py-2 border border-rose-200/50 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 bg-peach-400 rounded-full animate-pulse glow-peach" />
              <span className="text-rose-600 font-semibold text-sm sm:text-base">{currentUser.username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 hover:text-rose-500 smooth-transition hover:bg-rose-100/30 rounded-full glow-rose"
              title={soundEnabled ? "Disable sound notifications" : "Enable sound notifications"}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationToggle}
              className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 hover:text-rose-500 smooth-transition hover:bg-rose-100/30 rounded-full glow-rose"
              title={
                notificationPermission === 'granted' 
                  ? "Desktop notifications enabled" 
                  : notificationPermission === 'denied'
                  ? "Desktop notifications blocked - check browser settings"
                  : "Enable desktop notifications"
              }
            >
              {notificationPermission === 'granted' ? (
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" />
              ) : (
                <BellOff className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 hover:text-rose-600 smooth-transition hover:bg-rose-100/20 rounded-full"
              title="Leave conversation"
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Messages Area - Flexible */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 scroll-smooth messages-container overflow-x-hidden">
          <div className="max-w-4xl mx-auto w-full min-w-0">
            {sortedMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center h-full min-h-[200px]"
              >
                <div className="glass-card rounded-2xl p-8 text-center border border-rose-200/50">
                  <h3 className="text-rose-500 font-display font-semibold mb-3 text-lg sm:text-xl">Welcome to Rosé!</h3>
                  <p className="text-rose-400 text-sm sm:text-base">Your intimate conversation space awaits</p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {sortedMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender === currentUser.username}
                  />
                ))}
                

              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - Fixed at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-shrink-0 floating-element border-t border-border/30 p-4 sm:p-6 relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-rose-100/20 via-peach-50/10 to-transparent opacity-70" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => {
                      // Limit input to 2000 characters
                      if (e.target.value.length <= 2000) {
                        setMessageInput(e.target.value);
                      }
                      

                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="resize-none input-field rounded-2xl smooth-transition min-h-[48px] max-h-[130px] py-4 px-5 pr-14 text-sm sm:text-base leading-relaxed shadow-lg border-2 border-rose-200/30 focus:border-rose-400/50"
                  />
                  
                  {/* Character counter for longer messages */}
                  {messageInput.length > 100 && (
                    <div className="absolute bottom-3 right-4 text-xs text-rose-400 font-medium">
                      {messageInput.length}/2000
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={!messageInput.trim() || !isConnected || messageInput.length > 2000}
                className="btn-primary h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] rounded-2xl glow-rose smooth-transition disabled:opacity-50 flex-shrink-0 shadow-lg hover:shadow-rose-400/40 relative overflow-hidden group"
              >
                <Send className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] duration-700" />
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
