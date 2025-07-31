import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Send } from "lucide-react";
import { MessageBubble } from "@/components/ui/message-bubble";
import { useWebSocket } from "@/hooks/use-websocket";
import { useMessageNotifications } from "@/hooks/use-message-notifications";
import { useQuery } from "@tanstack/react-query";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [messageInput, setMessageInput] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setLocation] = useLocation();
  
  const { isConnected, messages: wsMessages, sendMessage, setMessages } = useWebSocket();

  // Load current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  // Fetch existing messages
  const { data: existingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
  });

  // Combine existing messages with WebSocket messages
  const allMessages = [...(existingMessages || []), ...wsMessages];

  // Remove duplicates based on message ID
  const uniqueMessages = allMessages.reduce((acc, message) => {
    if (!acc.find(m => m.id === message.id)) {
      acc.push(message);
    }
    return acc;
  }, [] as Message[]);

  // Sort messages by timestamp
  const sortedMessages = uniqueMessages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Initialize message notifications with all sorted messages
  const { unreadCount } = useMessageNotifications(sortedMessages, currentUser);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (content && currentUser) {
      sendMessage(currentUser.username, content);
      setMessageInput("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Chat Header - Fixed */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 floating-element border-b border-border/30 px-4 sm:px-6 py-3 relative overflow-hidden"
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50" />
        
        <div className="flex items-center justify-between max-w-full relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary glow-text-green animate-glow tracking-wide">
                Lila
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-60 rounded-full" />
            </div>
            
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 shadow-lg ${isConnected ? 'bg-primary animate-pulse-green shadow-primary/50' : 'bg-destructive animate-bounce-subtle shadow-destructive/50'}`} />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {isConnected ? "Connected" : "Reconnecting..."}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-card/50 rounded-full px-3 py-1.5 border border-border/30">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-accent font-medium text-sm sm:text-base">{currentUser.username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-primary smooth-transition hover:bg-primary/10 rounded-full"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Messages Area - Flexible */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 scroll-smooth">
          <div className="max-w-4xl mx-auto w-full">
            {sortedMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center h-full min-h-[200px]"
              >
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 text-center border border-border/50">
                  <h3 className="text-primary font-semibold mb-2 text-sm sm:text-base">Welcome to Lila!</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">Your private chat space is ready</p>
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
          <div className="absolute inset-0 bg-gradient-to-t from-primary/3 via-transparent to-transparent opacity-50" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="resize-none input-field rounded-xl smooth-transition min-h-[44px] max-h-[120px] py-3 px-4 pr-12 text-sm sm:text-base leading-relaxed shadow-lg border-2 border-transparent focus:border-primary/30"
                  />
                  
                  {/* Character counter for longer messages */}
                  {messageInput.length > 100 && (
                    <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                      {messageInput.length}/500
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] rounded-xl glow-green hover:from-primary/90 hover:to-primary smooth-transition disabled:opacity-50 flex-shrink-0 shadow-lg hover:shadow-primary/30 relative overflow-hidden group"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                
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
