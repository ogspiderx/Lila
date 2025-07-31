import { motion } from "framer-motion";
import { useState, memo } from "react";
import { MoreVertical, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Message, WebSocketMessage } from "@shared/schema";

interface MessageBubbleProps {
  message: Message | WebSocketMessage;
  isCurrentUser: boolean;
}

export const MessageBubble = memo(function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);

  const formatTime = (timestamp: Date | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
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
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2 group/message`}
    >
      <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2 ${isCurrentUser ? "space-x-reverse" : ""} max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] min-w-0`}>
        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} min-w-0 flex-1`}>
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
          <p className={`
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
          

        </motion.div>
        </div>

        {/* Copy button with 3 dots */}
        <div className="opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="min-w-[120px]">
              <DropdownMenuItem onClick={handleCopyMessage} className="cursor-pointer">
                {isCopied ? (
                  <>
                    <Check className="mr-2 h-3 w-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    Copy message
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
});
