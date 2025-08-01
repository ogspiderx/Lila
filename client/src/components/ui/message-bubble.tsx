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
        <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
          <span className={`text-xs font-semibold ${isCurrentUser ? "text-rose-400" : "text-peach-400"}`}>
            {message.sender}
          </span>
          <span className="text-rose-300/70 text-xs">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        {/* Message bubble */}
        <motion.div
          whileHover={{ 
            scale: 1.02,
            y: -2,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative overflow-hidden group min-w-0 w-full message-slide-in
            ${isCurrentUser 
              ? "message-bubble-own rounded-tr-md" 
              : "message-bubble-other rounded-tl-md"
            } 
            rounded-2xl px-4 py-3 sm:px-5 sm:py-4 
            transition-all duration-400 ease-out message-hover-effect
            backdrop-blur-sm
          `}
        >
          {/* Content */}
          <p className={`
            relative z-10 text-sm sm:text-base leading-relaxed 
            break-words whitespace-pre-wrap
            ${isCurrentUser ? "text-white" : "text-rose-800"} 
            drop-shadow-sm font-medium
          `}
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}>
            {message.content}
          </p>
        </motion.div>
        </div>

        {/* Copy button with 3 dots */}
        <div className="opacity-0 group-hover/message:opacity-100 transition-opacity duration-300 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full hover:bg-rose-100/20 text-rose-400 hover:text-rose-500 glow-rose"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="glass-card border-rose-200/50 min-w-[140px]">
              <DropdownMenuItem onClick={handleCopyMessage} className="cursor-pointer text-rose-600 hover:bg-rose-100/30 focus:bg-rose-100/30 rounded-lg">
                {isCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-peach-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
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