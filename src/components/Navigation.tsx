import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NavigationProps {
  currentView: string;
  isAuthenticated: boolean;
  user: any;
  onViewChange: (view: string) => void;
  onAuthShow: () => void;
}

export default function Navigation({
  currentView,
  isAuthenticated,
  user,
  onViewChange,
  onAuthShow
}: NavigationProps) {
  return (
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
              onClick={() => onViewChange('home')}
              className={`transition-colors ${currentView === 'home' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onViewChange('catalog')}
              className={`transition-colors ${currentView === 'catalog' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
            >
              Catalog
            </button>
            <button 
              onClick={() => onViewChange('pricing')}
              className={`transition-colors ${currentView === 'pricing' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
            >
              Pricing
            </button>
            {isAuthenticated && (
              <button 
                onClick={() => onViewChange('tour-builder')}
                className={`transition-colors ${currentView === 'tour-builder' ? 'text-neon-cyan' : 'text-white hover:text-neon-cyan'}`}
              >
                Create Tour
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  className="neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black"
                  disabled={user?.subscription === 'free' && user?.uploads >= user?.maxUploads}
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload {user?.subscription === 'free' && `(${user?.uploads}/${user?.maxUploads})`}
                </Button>
                <Button 
                  onClick={() => onViewChange('profile')}
                  variant="outline"
                  className="neon-border text-white border-white/30"
                >
                  <img 
                    src={user?.avatar} 
                    alt={user?.name} 
                    className="w-6 h-6 rounded-full mr-2" 
                  />
                  {user?.name}
                </Button>
                {user?.role === 'admin' && (
                  <Button 
                    onClick={() => onViewChange('admin')}
                    variant="outline"
                    className="neon-border text-neon-magenta border-neon-magenta"
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black"
                  onClick={onAuthShow}
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload
                </Button>
                <Button 
                  className="bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-semibold"
                  onClick={onAuthShow}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}