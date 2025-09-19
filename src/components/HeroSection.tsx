import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

  return (
    <section 
      ref={heroRef}
      className="relative h-screen bg-cover bg-center bg-no-repeat transition-all duration-1000"
      style={{ 
        backgroundImage: `url(${categories[heroImageIndex].image})`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex items-center justify-center h-full text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-orbitron font-black text-white mb-6 animate-neon-pulse">
            EXPLORE
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-magenta">
              360° WORLDS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Immerse yourself in breathtaking virtual reality experiences. 
            Create, share, and explore panoramic worlds like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold text-lg px-8 py-4 animate-glow"
              onClick={() => onViewChange('catalog')}
            >
              <Icon name="Play" size={20} className="mr-2" />
              Explore Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="neon-border text-neon-magenta border-neon-magenta hover:bg-neon-magenta hover:text-black text-lg px-8 py-4"
              onClick={() => {
                if (isAuthenticated) {
                  onViewChange('tour-builder');
                } else {
                  onAuthShow();
                }
              }}
            >
              <Icon name="Zap" size={20} className="mr-2" />
              Create Tour
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => onSetHeroImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === heroImageIndex 
                  ? 'bg-neon-cyan shadow-lg shadow-neon-cyan/50' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}