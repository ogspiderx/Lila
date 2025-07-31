import { useState } from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Languages, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranslationToggleProps {
  onLanguageChange: (language: string | null) => void;
  currentLanguage: string | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
];

export function TranslationToggle({ onLanguageChange, currentLanguage }: TranslationToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const handleDisable = () => {
    onLanguageChange(null);
    setIsOpen(false);
  };

  const getCurrentLanguageName = () => {
    if (!currentLanguage) return null;
    return LANGUAGES.find(lang => lang.code === currentLanguage)?.name;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          transition-all duration-200 border-slate-600 hover:border-slate-500
          ${currentLanguage 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30' 
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }
        `}
      >
        <Languages className="h-4 w-4 mr-2" />
        {currentLanguage ? getCurrentLanguageName() : 'Translate'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-50 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl backdrop-blur-sm"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-200">Translate messages to:</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {currentLanguage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisable}
                  className="w-full mb-3 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                >
                  Disable Translation
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {LANGUAGES.map((language) => (
                  <Button
                    key={language.code}
                    variant={currentLanguage === language.code ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`
                      justify-start text-xs py-2 h-auto
                      ${currentLanguage === language.code 
                        ? 'bg-emerald-500 text-white' 
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                      }
                    `}
                  >
                    {language.name}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}