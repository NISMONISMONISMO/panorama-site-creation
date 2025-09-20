import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroSectionProps {
  categories: any[];
  heroImageIndex: number;
  isAuthenticated: boolean;
  onSetHeroImageIndex: (index: number) => void;
  onViewChange: (view: string) => void;
  onAuthShow: () => void;
}

export default function HeroSection({
  categories,
  heroImageIndex,
  isAuthenticated,
  onSetHeroImageIndex,
  onViewChange,
  onAuthShow
}: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-1000"
      style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%), url(${categories[heroImageIndex]?.image || '/img/d56a683b-faf8-461a-82bb-562979018bd8.jpg'})`
      }}
    >
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="section-container">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {t('hero.title1')}
              <span className="block text-4xl md:text-6xl font-normal mt-2 opacity-90">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-gray-100 font-semibold text-lg px-8 py-4 shadow-xl"
                onClick={() => onViewChange('catalog')}
              >
                <Icon name="Play" size={20} className="mr-2" />
                {t('hero.exploreGallery')}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 bg-transparent backdrop-blur-sm text-lg px-8 py-4 font-medium transition-all duration-300"
                onClick={() => {
                  if (isAuthenticated) {
                    onViewChange('tour-builder');
                  } else {
                    onAuthShow();
                  }
                }}
              >
                <Icon name="Upload" size={20} className="mr-2" />
                {t('hero.startCreating')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {categories.slice(0, 3).map((_, index) => (
            <button
              key={index}
              onClick={() => onSetHeroImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === heroImageIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}