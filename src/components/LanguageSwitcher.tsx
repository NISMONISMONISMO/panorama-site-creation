import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import Icon from '@/components/ui/icon';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm min-w-[100px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">{currentLanguage?.flag}</span>
        {currentLanguage?.code.toUpperCase()}
        <Icon name="ChevronDown" size={14} className="ml-2" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  language === lang.code ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'
                }`}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                <span className="mr-3">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}