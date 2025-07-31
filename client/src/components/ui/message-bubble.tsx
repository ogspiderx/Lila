import { motion } from "framer-motion";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          ${isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-card text-card-foreground glow-green rounded-bl-sm"
          } 
          rounded-2xl px-4 py-3 max-w-md smooth-transition
        `}
      >
        <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? "justify-end" : ""}`}>
          {!isCurrentUser && (
            <span className="text-accent text-sm font-medium">
              {message.sender}
            </span>
          )}
          <span className={`${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"} text-xs`}>
            {formatTime(message.timestamp)}
          </span>
          {isCurrentUser && (
            <span className="text-primary-foreground text-sm font-medium">
              {message.sender}
            </span>
          )}
        </div>
        <p className={isCurrentUser ? "text-primary-foreground" : "text-card-foreground"}>
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}
