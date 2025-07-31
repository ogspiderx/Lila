import { motion } from "framer-motion";
import type { Message, WebSocketMessage } from "@shared/schema";

interface MessageBubbleProps {
  message: Message | WebSocketMessage;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formatTime = (timestamp: Date | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.23, 1, 0.32, 1]
      }}
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%] md:max-w-[60%]`}>
        {/* Sender and timestamp */}
        <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
          <span className="text-accent text-xs font-medium">
            {message.sender}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        {/* Message bubble */}
        <motion.div
          whileHover={{ 
            scale: 1.01,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          className={`
            ${isCurrentUser 
              ? "bg-primary text-primary-foreground rounded-tr-sm" 
              : "bg-card text-card-foreground border border-border/50 rounded-tl-sm"
            } 
            rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 shadow-sm hover:shadow-md
          `}
        >
          <p className={`text-sm sm:text-base leading-relaxed ${isCurrentUser ? "text-primary-foreground" : "text-card-foreground"} break-words`}>
            {message.content}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
