import { motion } from "framer-motion";
import { memo } from "react";

interface TypingIndicatorProps {
  typingUsers: Set<string>;
}

export const TypingIndicator = memo(function TypingIndicator({ 
  typingUsers 
}: TypingIndicatorProps) {
  if (typingUsers.size === 0) return null;

  const userList = Array.from(typingUsers);
  const displayText = userList.length === 1 
    ? `${userList[0]} is typing...`
    : userList.length === 2
    ? `${userList[0]} and ${userList[1]} are typing...`
    : `${userList[0]} and ${userList.length - 1} others are typing...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-start mb-2"
      data-testid="typing-indicator"
    >
      <div className="flex items-end space-x-2 max-w-[80%]">
        <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg backdrop-blur-sm border border-slate-500/30 message-glow-slate">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{displayText}</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{
                    y: [0, -6, 0],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: dot * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});