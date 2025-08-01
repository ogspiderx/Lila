import { motion } from "framer-motion";
import { useState, memo } from "react";
import { MoreVertical, Copy, Check, Edit, Trash2, Save, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message, WebSocketMessage } from "@shared/schema";

interface MessageBubbleProps {
  message: Message | WebSocketMessage;
  isCurrentUser: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageBubble = memo(function MessageBubble({ 
  message, 
  isCurrentUser, 
  onEditMessage, 
  onDeleteMessage 
}: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isDeleted = message.content === "[This message was deleted]";

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    // Focus the contentEditable div after a small delay
    setTimeout(() => {
      const editDiv = document.querySelector('[data-testid="div-edit-message"]') as HTMLDivElement;
      if (editDiv) {
        editDiv.focus();
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(editDiv);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 50);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content && onEditMessage) {
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
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
          {/* Content */}
          {isEditing ? (
            <div className="space-y-2 w-full">
              <div 
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => setEditContent((e.target as HTMLDivElement).textContent || '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                className={`
                  relative z-10 text-xs sm:text-sm leading-snug 
                  break-words whitespace-pre-wrap outline-none
                  ${isCurrentUser ? "text-white" : "text-slate-50"} 
                  bg-slate-700/50 rounded px-2 py-1 border border-emerald-500/50
                  focus:border-emerald-400 transition-colors
                  drop-shadow-sm
                `}
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}
                data-testid="div-edit-message"
              >
                {editContent}
              </div>
              <div className="flex gap-1 justify-end text-xs text-slate-400">
                <span>Press Enter to save, Esc to cancel</span>
              </div>
            </div>
          ) : (
            <>
              <p className={`
                relative z-10 text-xs sm:text-sm leading-snug 
                break-words whitespace-pre-wrap
                ${isCurrentUser ? "text-white" : "text-slate-50"} 
                ${isDeleted ? "italic text-slate-400" : ""}
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
              
              {/* Show "edited" indicator */}
              {message.edited && !isDeleted && (
                <span className="text-xs text-slate-400/70 italic mt-1 block">
                  edited
                </span>
              )}
            </>
          )}
        </motion.div>
        </div>

        {/* Actions button with dropdown */}
        {!isEditing && (
          <div className="opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                  data-testid="button-message-options"
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
                
                {/* Edit and Delete options only for current user's messages */}
                {isCurrentUser && !isDeleted && (
                  <>
                    <DropdownMenuItem onClick={handleEdit} className="cursor-pointer" data-testid="button-edit-message">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit message
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete} 
                      className="cursor-pointer text-red-400 hover:text-red-300"
                      data-testid="button-delete-message"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete message
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </motion.div>
  );
});