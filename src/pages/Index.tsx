import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturesSection from '@/components/FeaturesSection';
import CatalogView from '@/components/CatalogView';
import PricingView from '@/components/PricingView';
import PanoramaViewer from '@/components/PanoramaViewer';
import TourBuilder from '@/components/TourBuilder';
import AuthModal from '@/components/AuthModal';
import UserProfile from '@/components/UserProfile';
import AdminPanel from '@/components/AdminPanel';
import { categories, panoramas, subscriptionPlans, PanoramaItem } from '@/data/mockData';

function Index() {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'pricing' | 'tour-builder' | 'profile' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [selectedPanorama, setSelectedPanorama] = useState<PanoramaItem | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleAuth = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('home');
  };

  const handlePanoramaClick = (panorama: PanoramaItem) => {
    if (!isAuthenticated && panorama.premium) {
      setShowAuth(true);
      return;
    }
    setSelectedPanorama(panorama);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % categories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredPanoramas = panoramas.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dark min-h-screen bg-dark-100 text-white font-sans">
      <Navigation
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        user={user}
        onViewChange={setCurrentView}
        onAuthShow={() => setShowAuth(true)}
      />
      
      {currentView === 'home' && (
        <>
          <HeroSection
            categories={categories}
            heroImageIndex={heroImageIndex}
            isAuthenticated={isAuthenticated}
            onSetHeroImageIndex={setHeroImageIndex}
            onViewChange={setCurrentView}
            onAuthShow={() => setShowAuth(true)}
          />
          <CategoriesSection
            categories={categories}
            onCategorySelect={setSelectedCategory}
            onViewChange={setCurrentView}
          />
          <FeaturesSection />
        </>
      )}
      
      {currentView === 'catalog' && (
        <CatalogView
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          filteredPanoramas={filteredPanoramas}
          isAuthenticated={isAuthenticated}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onPanoramaClick={handlePanoramaClick}
        />
      )}
      
      {currentView === 'pricing' && (
        <PricingView subscriptionPlans={subscriptionPlans} />
      )}
      
      {currentView === 'tour-builder' && isAuthenticated && (
        <TourBuilder onClose={() => setCurrentView('home')} />
      )}
      
      {currentView === 'profile' && isAuthenticated && (
        <UserProfile 
          user={user}
          onClose={() => setCurrentView('home')}
          onLogout={handleLogout}
          onUpgrade={() => setCurrentView('pricing')}
        />
      )}
      
      {currentView === 'admin' && user?.role === 'admin' && (
        <AdminPanel onClose={() => setCurrentView('home')} />
      )}
      
      {selectedPanorama && (
        <PanoramaViewer
          imageUrl={selectedPanorama.image}
          title={selectedPanorama.title}
          author={selectedPanorama.author}
          views={selectedPanorama.views}
          likes={selectedPanorama.likes}
          premium={selectedPanorama.premium}
          onClose={() => setSelectedPanorama(null)}
          onLike={() => console.log('Like clicked')}
          onShare={() => console.log('Share clicked')}
          onEmbed={isAuthenticated && user?.subscription !== 'free' ? () => console.log('Embed clicked') : undefined}
        />
      )}
      
      <AuthModal 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={handleAuth}
      />
    </div>
  );
}

export default Index;