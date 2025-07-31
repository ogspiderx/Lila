import { motion } from "framer-motion";

interface TypingIndicatorProps {
  sender: string;
}

export function TypingIndicator({ sender }: TypingIndicatorProps) {
  console.log('TypingIndicator rendering for:', sender);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-4 relative z-10"
    >
      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {sender}
          </span>
          <span className="text-slate-300 text-xs italic">is typing...</span>
        </div>
        
        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-emerald-500/30 rounded-tl-sm rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm min-w-[60px]">
          <div className="flex space-x-1.5 items-center justify-center">
            <motion.div
              className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.6 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}