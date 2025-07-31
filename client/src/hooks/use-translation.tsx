import { useState, useCallback } from 'react';

interface TranslationCache {
  [key: string]: string;
}

export function useTranslation() {
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (text: string, targetLang: string): Promise<string> => {
    // Create cache key
    const cacheKey = `${text}_${targetLang}`;
    
    // Return cached translation if available
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    setIsTranslating(true);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text,
          targetLang
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translatedText = data.translatedText;

      // Cache the translation
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache]);

  const clearCache = useCallback(() => {
    setTranslationCache({});
  }, []);

  return {
    translateText,
    isTranslating,
    clearCache
  };
}