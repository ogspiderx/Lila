import { motion } from "framer-motion";
import { useState, memo, useCallback } from "react";
import { MoreVertical, Copy, Check, Download, File, Image, Video, Music, FileText, X, CheckCheck, Hash } from "lucide-react";
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

export const MessageBubble = memo(function MessageBubble({ 
  message, 
  isCurrentUser
}: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [copiedId, setCopiedId] = useState(false);
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
      const textToCopy = message.content || (message.fileName ? `File: ${message.fileName}` : "");
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleCopyImage = useCallback(async () => {
    if (!message.fileUrl || !message.fileType?.startsWith('image/')) return;
    
    try {
      const response = await fetch(message.fileUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Fallback: copy image URL
        await navigator.clipboard.writeText(message.fileUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy image:', error);
      // Fallback: copy image URL
      try {
        await navigator.clipboard.writeText(message.fileUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Failed to copy image URL:', fallbackError);
      }
    }
  }, [message.fileUrl, message.fileType]);

  const handleCopyMessageId = async () => {
    try {
      await navigator.clipboard.writeText(message.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Failed to copy message ID:', error);
    }
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  const handleDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return <File className="w-4 h-4" />;

    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderDeliveryStatus = () => {
    if (!isCurrentUser) return null;

    const status = message.deliveryStatus || 'sent';

    if (status === 'seen') {
      return <CheckCheck className="w-3 h-3 text-blue-400" />;
    } else if (status === 'delivered') {
      return <CheckCheck className="w-3 h-3 text-slate-400" />;
    } else {
      return <Check className="w-3 h-3 text-slate-400" />;
    }
  };

  const isPreviewable = (fileType?: string | null) => {
    if (!fileType) return false;
    return fileType.startsWith('image/') || fileType.startsWith('video/') || fileType.startsWith('audio/');
  };

  const renderFilePreview = () => {
    if (!message.fileUrl || !message.fileType) return null;

    if (message.fileType.startsWith('image/')) {
      return (
        <div className="mb-2 relative max-w-xs">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-lg">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <img
            src={message.fileUrl}
            alt={message.fileName || 'Image'}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            onClick={() => setShowImageModal(true)}
          />
        </div>
      );
    }

    if (message.fileType.startsWith('video/')) {
      return (
        <div className="mb-2 max-w-xs">
          <video
            controls
            className="rounded-lg max-w-full h-auto"
            preload="metadata"
          >
            <source src={message.fileUrl} type={message.fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (message.fileType.startsWith('audio/')) {
      return (
        <div className="mb-2">
          <audio
            controls
            className="w-full max-w-xs"
            preload="metadata"
          >
            <source src={message.fileUrl} type={message.fileType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    return null;
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
          onContextMenu={handleContextMenu}
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
          {/* File preview for previewable content */}
          {message.fileUrl && isPreviewable(message.fileType) && renderFilePreview()}

          {/* File attachment for non-previewable files */}
          {message.fileUrl && !isPreviewable(message.fileType) && (
            <div className="mb-2">
              <div className={`
                flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer
                ${isCurrentUser 
                  ? "bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-100" 
                  : "bg-slate-600/40 hover:bg-slate-600/60 text-slate-200"
                }
              `}>
                {getFileIcon(message.fileType)}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {message.fileName}
                  </div>
                  {message.fileSize && (
                    <div className="text-xs opacity-75">
                      {formatFileSize(message.fileSize)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <div className="flex items-end justify-between gap-2">
              <p className={`
                relative z-10 text-xs sm:text-sm leading-snug 
                break-words whitespace-pre-wrap flex-1
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
              <div className="flex-shrink-0">
                {renderDeliveryStatus()}
              </div>
            </div>
          )}

          {/* If only file, show delivery status */}
          {!message.content && message.fileUrl && (
            <div className="flex justify-end mt-1">
              {renderDeliveryStatus()}
            </div>
          )}
        </motion.div>
        </div>

        {/* Actions button with dropdown */}
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
              
              {message.fileUrl && message.fileType?.startsWith('image/') && (
                <DropdownMenuItem onClick={handleCopyImage} className="cursor-pointer">
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-3 w-3 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-3 w-3" />
                      Copy image
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              {message.fileUrl && (
                <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                  <Download className="mr-2 h-3 w-3" />
                  Download file
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleCopyMessageId} className="cursor-pointer">
                {copiedId ? (
                  <>
                    <Check className="mr-2 h-3 w-3 text-green-500" />
                    ID Copied!
                  </>
                ) : (
                  <>
                    <Hash className="mr-2 h-3 w-3" />
                    Copy message ID
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Custom Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleCloseContextMenu}
        >
          <div
            className="absolute bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[140px] z-50"
            style={{
              left: `${Math.min(contextMenuPosition.x, window.innerWidth - 160)}px`,
              top: `${Math.min(contextMenuPosition.y, window.innerHeight - 200)}px`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyMessage();
                handleCloseContextMenu();
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center text-sm text-slate-200"
            >
              <Copy className="mr-2 h-3 w-3" />
              Copy message
            </button>
            
            {message.fileUrl && message.fileType?.startsWith('image/') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyImage();
                  handleCloseContextMenu();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center text-sm text-slate-200"
              >
                <Image className="mr-2 h-3 w-3" />
                Copy image
              </button>
            )}
            
            {message.fileUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                  handleCloseContextMenu();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center text-sm text-slate-200"
              >
                <Download className="mr-2 h-3 w-3" />
                Download file
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyMessageId();
                handleCloseContextMenu();
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center text-sm text-slate-200"
            >
              <Hash className="mr-2 h-3 w-3" />
              Copy message ID
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && message.fileUrl && message.fileType?.startsWith('image/') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Image'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
});