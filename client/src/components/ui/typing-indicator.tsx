import { motion } from "framer-motion";

interface TypingIndicatorProps {
  sender: string;
}

export function TypingIndicator({ sender }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-2"
    >
      <div className="flex flex-col items-start max-w-[75%] sm:max-w-[60%] md:max-w-[50%]">
        <div className="flex items-center space-x-1.5 mb-0.5">
          <span className="text-[10px] font-medium text-amber-400">
            {sender}
          </span>
          <span className="text-slate-400 text-[10px]">typing...</span>
        </div>
        
        <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 border border-slate-500/40 rounded-tl-sm rounded-lg px-3 py-2 shadow-sm backdrop-blur-sm">
          <div className="flex space-x-1 items-center">
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-slate-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-slate-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-slate-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}