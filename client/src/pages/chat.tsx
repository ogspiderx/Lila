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
    <div className="chat-gradient min-h-screen flex flex-col">
      {/* Chat Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-border p-4 smooth-transition"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary glow-green animate-glow">
              Lila
            </h1>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
              <span className="text-sm">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-accent font-medium">{currentUser.username}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-primary smooth-transition"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            style={{ height: "calc(100vh - 140px)" }}
          >
            {sortedMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="bg-card rounded-2xl p-6 inline-block glow-green">
                  <h3 className="text-primary font-semibold mb-2">Welcome to Lila!</h3>
                  <p className="text-muted-foreground text-sm">Your private chat space is ready</p>
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

          {/* Message Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 bg-card border-t border-border"
          >
            <form onSubmit={handleSubmit} className="flex items-end space-x-4">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="resize-none bg-input border-border rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition max-h-32"
                />
              </div>
              <Button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="bg-primary text-primary-foreground p-3 rounded-2xl glow-green hover:bg-primary/90 smooth-transition transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
