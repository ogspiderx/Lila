import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MessageReactionsProps {
  messageId: string;
  onReact: (messageId: string, emoji: string) => void;
  reactions?: Record<string, number>;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function MessageReactions({ messageId, onReact, reactions = {} }: MessageReactionsProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="relative">
      {/* Reaction trigger button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
        onClick={() => setShowReactions(!showReactions)}
      >
        😊
      </Button>

      {/* Reaction picker */}
      {showReactions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute bottom-full mb-1 bg-slate-800 border border-slate-600 rounded-lg p-2 flex space-x-1 shadow-lg z-50"
        >
          {QUICK_REACTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-base hover:bg-slate-700 hover:scale-110 transition-transform"
              onClick={() => {
                onReact(messageId, emoji);
                setShowReactions(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </motion.div>
      )}

      {/* Display existing reactions */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex space-x-1 mt-1">
          {Object.entries(reactions).map(([emoji, count]) => (
            <motion.div
              key={emoji}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-slate-700/50 border border-slate-600 rounded-full px-2 py-0.5 text-xs flex items-center space-x-1"
            >
              <span>{emoji}</span>
              <span className="text-slate-400">{count}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}