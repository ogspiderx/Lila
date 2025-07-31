import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Send } from "lucide-react";
import { MessageBubble } from "@/components/ui/message-bubble";
import { useWebSocket } from "@/hooks/use-websocket";
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
        className="flex-shrink-0 bg-card/50 backdrop-blur-sm border-b border-border/50 px-4 sm:px-6 py-3"
      >
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary glow-text-green animate-glow tracking-wide">
              Lila
            </h1>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${isConnected ? 'bg-primary animate-pulse-green' : 'bg-destructive animate-bounce-subtle'}`} />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {isConnected ? "Connected" : "Reconnecting..."}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-accent font-medium text-sm sm:text-base">{currentUser.username}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-primary smooth-transition"
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
          className="flex-shrink-0 bg-card/50 backdrop-blur-sm border-t border-border/50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="resize-none bg-input/80 backdrop-blur-sm border-border/50 rounded-lg focus:border-primary/50 focus:ring-1 focus:ring-primary/20 smooth-transition min-h-[44px] max-h-[120px] py-3 px-4 text-sm sm:text-base leading-relaxed"
                />
              </div>
              <Button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="bg-primary text-primary-foreground h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] rounded-lg glow-green hover:bg-primary/90 smooth-transition disabled:opacity-50 flex-shrink-0"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
