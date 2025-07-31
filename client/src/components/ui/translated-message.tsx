import { useState, useEffect } from 'react';
import { Button } from './button';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface TranslatedMessageProps {
  originalText: string;
  targetLanguage: string | null;
  className?: string;
}

export function TranslatedMessage({ originalText, targetLanguage, className = '' }: TranslatedMessageProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const { translateText, isTranslating } = useTranslation();

  useEffect(() => {
    if (targetLanguage && originalText) {
      translateText(originalText, targetLanguage).then(setTranslatedText);
    } else {
      setTranslatedText(null);
    }
  }, [originalText, targetLanguage, translateText]);

  // If no target language or translation failed, show original
  if (!targetLanguage || !translatedText) {
    return <span className={className}>{originalText}</span>;
  }

  // If translation is same as original, just show original
  if (translatedText === originalText) {
    return <span className={className}>{originalText}</span>;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <AnimatePresence mode="wait">
        {showOriginal ? (
          <motion.div
            key="original"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-sm opacity-80"
          >
            {originalText}
          </motion.div>
        ) : (
          <motion.div
            key="translated"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {isTranslating ? (
              <div className="flex items-center space-x-2 text-sm opacity-70">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                <span>Translating...</span>
              </div>
            ) : (
              <span>{translatedText}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowOriginal(!showOriginal)}
        className="h-5 px-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
      >
        {showOriginal ? (
          <>
            <Languages className="h-3 w-3 mr-1" />
            Show Translation
          </>
        ) : (
          <>
            <RotateCcw className="h-3 w-3 mr-1" />
            Show Original
          </>
        )}
      </Button>
    </div>
  );
}