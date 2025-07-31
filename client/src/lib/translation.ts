// Free translation utility using MyMemory API
export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface TranslationError {
  message: string;
  code?: string;
}

// Language detection using simple heuristics
export function detectLanguage(text: string): string {
  // Simple language detection based on common patterns
  const chinesePattern = /[\u4e00-\u9fff]/;
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  const koreanPattern = /[\uac00-\ud7af]/;
  const arabicPattern = /[\u0600-\u06ff]/;
  const cyrillicPattern = /[\u0400-\u04ff]/;
  const thaiPattern = /[\u0e00-\u0e7f]/;
  
  if (chinesePattern.test(text)) return 'zh';
  if (japanesePattern.test(text)) return 'ja';
  if (koreanPattern.test(text)) return 'ko';
  if (arabicPattern.test(text)) return 'ar';
  if (cyrillicPattern.test(text)) return 'ru';
  if (thaiPattern.test(text)) return 'th';
  
  // Default to English for Latin script
  return 'en';
}

// Get target language based on detected language
export function getTargetLanguage(detectedLanguage: string): string {
  // If detected language is English, translate to common languages
  // Otherwise translate to English
  return detectedLanguage === 'en' ? 'zh' : 'en';
}

// Translate text using MyMemory free API
export async function translateText(text: string, targetLang?: string): Promise<TranslationResult> {
  try {
    const detectedLang = detectLanguage(text);
    const targetLanguage = targetLang || getTargetLanguage(detectedLang);
    
    // Skip translation if source and target are the same
    if (detectedLang === targetLanguage) {
      return {
        translatedText: text,
        detectedLanguage: detectedLang,
        confidence: 1
      };
    }

    const langPair = `${detectedLang}|${targetLanguage}`;
    const encodedText = encodeURIComponent(text);
    
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Translation failed');
    }

    return {
      translatedText: data.responseData.translatedText,
      detectedLanguage: detectedLang,
      confidence: data.responseData.match || 0
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw {
      message: error instanceof Error ? error.message : 'Translation failed',
      code: 'TRANSLATION_ERROR'
    } as TranslationError;
  }
}

// Language names for display
export const languageNames: Record<string, string> = {
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ru: 'Russian',
  ar: 'Arabic',
  th: 'Thai',
  pt: 'Portuguese',
  it: 'Italian',
  nl: 'Dutch',
  sv: 'Swedish',
  da: 'Danish',
  no: 'Norwegian',
  fi: 'Finnish',
  pl: 'Polish',
  cs: 'Czech',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sk: 'Slovak',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  mt: 'Maltese',
  tr: 'Turkish',
  el: 'Greek',
  he: 'Hebrew',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  gu: 'Gujarati',
  pa: 'Punjabi',
  mr: 'Marathi',
  ne: 'Nepali',
  si: 'Sinhala',
  my: 'Burmese',
  km: 'Khmer',
  lo: 'Lao',
  ka: 'Georgian',
  am: 'Amharic',
  sw: 'Swahili',
  zu: 'Zulu',
  af: 'Afrikaans',
  sq: 'Albanian',
  eu: 'Basque',
  be: 'Belarusian',
  bs: 'Bosnian',
  ca: 'Catalan',
  cy: 'Welsh',
  eo: 'Esperanto',
  fo: 'Faroese',
  ga: 'Irish',
  gd: 'Scottish Gaelic',
  gl: 'Galician',
  is: 'Icelandic',
  mk: 'Macedonian',
  ms: 'Malay',
  tl: 'Filipino',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
  id: 'Indonesian'
};