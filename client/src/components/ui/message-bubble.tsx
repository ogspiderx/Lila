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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[90%] sm:max-w-[75%] md:max-w-[65%]`}>
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
            scale: 1.02,
            y: -2,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative overflow-hidden group
            ${isCurrentUser 
              ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-tr-sm" 
              : "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-slate-50 border border-slate-500/40 rounded-tl-sm"
            } 
            rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 
            transition-all duration-300 ease-out
            shadow-lg hover:shadow-2xl
            ${isCurrentUser ? "shadow-emerald-500/30 hover:shadow-emerald-500/40" : "shadow-slate-900/40 hover:shadow-slate-900/60"}
            backdrop-blur-sm
          `}
        >
          {/* Subtle gradient overlay for depth */}
          <div className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${isCurrentUser 
              ? "bg-gradient-to-br from-white/10 via-transparent to-black/10" 
              : "bg-gradient-to-br from-white/5 via-transparent to-black/20"
            }
          `} />
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className={`
              absolute inset-0 
              ${isCurrentUser 
                ? "bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                : "bg-gradient-to-r from-transparent via-slate-300/20 to-transparent"
              }
              transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
              transition-transform duration-700 ease-out
            `} />
          </div>
          
          {/* Content */}
          <p className={`
            relative z-10 text-sm sm:text-base leading-relaxed break-words
            ${isCurrentUser ? "text-white" : "text-slate-50"} 
            drop-shadow-sm
          `}>
            {message.content}
          </p>
          
          {/* Subtle bottom border glow */}
          <div className={`
            absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px
            ${isCurrentUser 
              ? "bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" 
              : "bg-gradient-to-r from-transparent via-slate-400/40 to-transparent"
            }
            opacity-0 group-hover:opacity-100 transition-opacity duration-300
          `} />
          
          {/* Typing indicator dots effect (subtle animation) */}
          <div className={`
            absolute -bottom-2 ${isCurrentUser ? "right-2" : "left-2"} 
            opacity-0 group-hover:opacity-50 transition-all duration-300
            flex space-x-1
          `}>
            <div className={`w-1 h-1 rounded-full ${isCurrentUser ? "bg-emerald-300" : "bg-slate-400"} animate-pulse`} style={{ animationDelay: '0ms' }} />
            <div className={`w-1 h-1 rounded-full ${isCurrentUser ? "bg-emerald-300" : "bg-slate-400"} animate-pulse`} style={{ animationDelay: '150ms' }} />
            <div className={`w-1 h-1 rounded-full ${isCurrentUser ? "bg-emerald-300" : "bg-slate-400"} animate-pulse`} style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
