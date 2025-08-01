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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="px-4 py-2 text-sm text-slate-400 italic flex items-center gap-2"
      data-testid="typing-indicator"
    >
      <span>{displayText}</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-1 h-1 bg-slate-400 rounded-full"
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: dot * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
});