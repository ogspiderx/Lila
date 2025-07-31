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
            y: -1,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          className={`
            ${isCurrentUser 
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm shadow-lg" 
              : "floating-element text-card-foreground rounded-tl-sm message-hover-effect"
            } 
            rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 smooth-transition relative overflow-hidden
          `}
        >
          {/* Subtle gradient overlay for current user messages */}
          {isCurrentUser && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />
          )}
          
          <p className={`text-sm sm:text-base leading-relaxed ${isCurrentUser ? "text-primary-foreground" : "text-card-foreground"} break-words relative z-10`}>
            {message.content}
          </p>
          
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-full hover:translate-x-[-200%] duration-700" />
        </motion.div>
      </div>
    </motion.div>
  );
}
