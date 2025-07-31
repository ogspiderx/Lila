import { motion } from "framer-motion";
import { useState } from "react";
import type { Message, WebSocketMessage } from "@shared/schema";
import { TranslatedMessage } from "./translated-message";

interface MessageBubbleProps {
  message: Message | WebSocketMessage;
  isCurrentUser: boolean;
  targetLanguage?: string | null;
}

export function MessageBubble({ message, isCurrentUser, targetLanguage }: MessageBubbleProps) {
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
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] min-w-0`}>
        {/* Sender and timestamp */}
        <div className={`flex items-center space-x-1.5 mb-0.5 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
          <span className={`text-[10px] font-medium ${isCurrentUser ? "text-emerald-400" : "text-amber-400"}`}>
            {message.sender}
          </span>
          <span className="text-slate-400 text-[10px]">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        {/* Message bubble */}
        <motion.div
          whileHover={{ 
            scale: 1.01,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative overflow-hidden group min-w-0 w-full
            ${isCurrentUser 
              ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-tr-sm" 
              : "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-slate-50 border border-slate-500/40 rounded-tl-sm"
            } 
            rounded-lg px-3 py-2 sm:px-3 sm:py-2 
            transition-all duration-300 ease-out
            shadow-sm hover:shadow-lg
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
          <div className={`
            relative z-10 text-xs sm:text-sm leading-snug 
            break-words whitespace-pre-wrap
            ${isCurrentUser ? "text-white" : "text-slate-50"} 
            drop-shadow-sm
          `}
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}>
            {targetLanguage ? (
              <TranslatedMessage 
                originalText={message.content}
                targetLanguage={targetLanguage}
              />
            ) : (
              message.content
            )}
          </div>
          
          {/* Subtle bottom border glow */}
          <div className={`
            absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px
            ${isCurrentUser 
              ? "bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" 
              : "bg-gradient-to-r from-transparent via-slate-400/40 to-transparent"
            }
            opacity-0 group-hover:opacity-100 transition-opacity duration-300
          `} />
          

        </motion.div>
      </div>
    </motion.div>
  );
}
