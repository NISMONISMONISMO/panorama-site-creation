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
import { categories, subscriptionPlans, PanoramaItem } from '@/data/mockData';
import { apiService, User, Panorama } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

function Index() {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'pricing' | 'tour-builder' | 'profile' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [selectedPanorama, setSelectedPanorama] = useState<PanoramaItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleAuth = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuth(false);
    loadUserPanoramas();
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setCurrentView('home');
      setPanoramas([]);
      toast({
        title: 'Выход выполнен',
        description: 'До свидания!',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePanoramaClick = (panorama: PanoramaItem) => {
    if (!isAuthenticated && panorama.premium) {
      setShowAuth(true);
      return;
    }
    setSelectedPanorama(panorama);
  };

  // Проверяем сохраненную сессию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const { user: userData } = await apiService.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
          await loadUserPanoramas();
        } catch (error) {
          console.error('Auth check failed:', error);
          // Токен недействительный, очищаем
          await apiService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Анимация смены изображений
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % categories.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUserPanoramas = async () => {
    if (!isAuthenticated) return;
    
    try {
      const { panoramas: userPanoramas } = await apiService.getMyPanoramas();
      setPanoramas(userPanoramas);
    } catch (error) {
      console.error('Failed to load panoramas:', error);
    }
  };

  // Конвертируем панорамы из API в ожидаемый формат
  const convertedPanoramas: PanoramaItem[] = panoramas.map(p => ({
    id: p.id.toString(),
    title: p.title,
    image: p.image_url,
    author: user?.name || 'Неизвестный автор',
    views: p.views_count,
    likes: p.likes_count,
    category: p.category_name || 'Общее',
    premium: p.is_premium,
    tags: p.tags
  }));

  const filteredPanoramas = convertedPanoramas.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-dark-100 text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-xl font-orbitron">Загрузка...</p>
        </div>
      </div>
    );
  }

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