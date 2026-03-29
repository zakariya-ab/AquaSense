import { Languages } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useState } from 'react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string; shortLabel: string }[] = [
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'fr', label: 'Français', shortLabel: 'FR' },
    { code: 'ar', label: 'العربية', shortLabel: 'ع' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {languages.find(l => l.code === language)?.label}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {languages.find(l => l.code === language)?.shortLabel}
        </span>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px] z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}