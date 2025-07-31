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
          <span className={`text-xs font-semibold ${isCurrentUser ? "text-emerald-400" : "text-amber-400"}`}>
            {message.sender}
          </span>
          <span className="text-slate-400 text-xs">
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
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-tr-sm shadow-lg shadow-emerald-500/25" 
              : "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 border border-slate-500/30 rounded-tl-sm shadow-lg shadow-slate-900/25"
            } 
            rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
          `}
        >
          <p className={`text-sm sm:text-base leading-relaxed ${isCurrentUser ? "text-white" : "text-slate-100"} break-words`}>
            {message.content}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
