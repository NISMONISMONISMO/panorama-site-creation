import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface PanoramaCategory {
  id: string;
  title: string;
  image: string;
  description: string;
  count: number;
}

interface PanoramaItem {
  id: string;
  title: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  author: string;
  premium: boolean;
}

const categories: PanoramaCategory[] = [
  {
    id: 'urban',
    title: 'Urban Skylines',
    image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg',
    description: 'Futuristic city landscapes',
    count: 24
  },
  {
    id: 'mountain',
    title: 'Mountain Vistas',
    image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg',
    description: 'Epic mountain panoramas',
    count: 18
  },
  {
    id: 'coastal',
    title: 'Coastal Retreats',
    image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg',
    description: 'Stunning ocean views',
    count: 16
  }
];

const panoramas: PanoramaItem[] = [
  { id: '1', title: 'Neo Tokyo Night', category: 'urban', image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg', views: 1250, likes: 89, author: 'CyberVision', premium: true },
  { id: '2', title: 'Neon Peaks', category: 'mountain', image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg', views: 945, likes: 67, author: 'MountainExplorer', premium: false },
  { id: '3', title: 'Digital Ocean', category: 'coastal', image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg', views: 1100, likes: 78, author: 'WaveRider', premium: true },
  { id: '4', title: 'Cyber Downtown', category: 'urban', image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg', views: 890, likes: 56, author: 'UrbanDreamer', premium: false },
  { id: '5', title: 'Aurora Peaks', category: 'mountain', image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg', views: 760, likes: 45, author: 'NorthernLights', premium: true },
  { id: '6', title: 'Neon Beach', category: 'coastal', image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg', views: 670, likes: 34, author: 'CoastalDrone', premium: false }
];

const subscriptionPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['2 panoramas/day', '24h storage', 'Basic viewing', 'Community access'],
    limitations: ['No virtual tours', 'No embedding', 'Limited storage'],
    buttonText: 'Get Started',
    popular: false,
    color: 'from-gray-600 to-gray-800'
  },
  {
    name: 'Premium',
    price: '$19',
    period: 'month',
    features: ['Unlimited uploads', 'Permanent storage', 'Virtual tour builder', 'Embedding widgets', 'Priority support'],
    limitations: [],
    buttonText: 'Upgrade Now',
    popular: true,
    color: 'from-neon-cyan to-neon-blue'
  },
  {
    name: 'Business',
    price: '$49',
    period: 'month',
    features: ['Everything in Premium', 'Custom domains', 'Advanced analytics', 'SSO integration', 'API access', 'White-label options'],
    limitations: [],
    buttonText: 'Contact Sales',
    popular: false,
    color: 'from-neon-magenta to-purple-600'
  }
];

function Index() {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'pricing'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

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

  const renderNavigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Globe" className="text-neon-cyan" size={32} />
            <h1 className="text-2xl font-orbitron font-bold text-white neon-text">
              PanoramaSite
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentView('home')}
              className={`transition-colors ${currentView === 'home' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('catalog')}
              className={`transition-colors ${currentView === 'catalog' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
            >
              Catalog
            </button>
            <button 
              onClick={() => setCurrentView('pricing')}
              className={`transition-colors ${currentView === 'pricing' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
            >
              Pricing
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black">
              <Icon name="Upload" size={16} className="mr-2" />
              Upload
            </Button>
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-semibold">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderHeroSection = () => (
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
              onClick={() => setCurrentView('catalog')}
            >
              <Icon name="Play" size={20} className="mr-2" />
              Explore Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="neon-border text-neon-magenta border-neon-magenta hover:bg-neon-magenta hover:text-black text-lg px-8 py-4"
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
              onClick={() => setHeroImageIndex(index)}
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

  const renderCategoriesSection = () => (
    <section className="py-20 bg-gradient-to-b from-dark-100 to-dark-200">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6">
            Discover Categories
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our curated collection of immersive 360° experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className="glass-effect border-white/20 hover:border-neon-cyan/50 transition-all duration-300 group cursor-pointer animate-float"
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentView('catalog');
              }}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-neon-cyan text-black font-semibold">
                  {category.count} tours
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-orbitron text-white group-hover:text-neon-cyan transition-colors">
                  {category.title}
                </CardTitle>
                <p className="text-gray-400">{category.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFeaturesSection = () => (
    <section className="py-20 bg-dark-200">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6">
            Key Features
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of virtual exploration
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: 'MousePointer', title: 'Interactive Viewing', desc: 'Immersive 360° navigation' },
            { icon: 'Sparkles', title: 'Hi-Resolution', desc: 'Crystal clear imagery' },
            { icon: 'Route', title: 'Virtual Tours', desc: 'Connected experiences' },
            { icon: 'Share2', title: 'Easy Sharing', desc: 'Embed anywhere' }
          ].map((feature, index) => (
            <Card key={index} className="glass-effect border-white/20 text-center hover:border-neon-cyan/50 transition-all">
              <CardContent className="pt-8">
                <Icon name={feature.icon} className="text-neon-cyan mx-auto mb-4" size={48} />
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  const renderCatalogView = () => (
    <div className="pt-24 bg-dark-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white mb-4">Panorama Catalog</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search panoramas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-300 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-dark-300 border-white/20">
                <TabsTrigger value="all" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">All</TabsTrigger>
                <TabsTrigger value="urban" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">Urban</TabsTrigger>
                <TabsTrigger value="mountain" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">Mountain</TabsTrigger>
                <TabsTrigger value="coastal" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">Coastal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPanoramas.map((panorama) => (
            <Card key={panorama.id} className="glass-effect border-white/20 hover:border-neon-cyan/50 transition-all group">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={panorama.image} 
                  alt={panorama.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                {panorama.premium && (
                  <Badge className="absolute top-4 right-4 bg-neon-magenta text-white">Premium</Badge>
                )}
                <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white text-sm">
                  <span className="flex items-center">
                    <Icon name="Eye" size={16} className="mr-1" />
                    {panorama.views.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Icon name="Heart" size={16} className="mr-1" />
                    {panorama.likes}
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white group-hover:text-neon-cyan transition-colors">
                  {panorama.title}
                </CardTitle>
                <p className="text-gray-400">by {panorama.author}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPricingView = () => (
    <div className="pt-24 bg-dark-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of virtual reality experiences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative glass-effect border-white/20 ${plan.popular ? 'border-neon-cyan/50 scale-105' : ''} transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-neon-cyan text-black font-bold px-4 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-orbitron text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <Icon name="Check" className="text-neon-green mr-2" size={16} />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-center text-gray-500">
                      <Icon name="X" className="text-red-400 mr-2" size={16} />
                      {limitation}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular 
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-black' 
                    : 'bg-gradient-to-r ' + plan.color + ' text-white'
                  } font-semibold`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dark min-h-screen bg-dark-100 text-white font-sans">
      {renderNavigation()}
      
      {currentView === 'home' && (
        <>
          {renderHeroSection()}
          {renderCategoriesSection()}
          {renderFeaturesSection()}
        </>
      )}
      
      {currentView === 'catalog' && renderCatalogView()}
      {currentView === 'pricing' && renderPricingView()}
    </div>
  );
}

export default Index;