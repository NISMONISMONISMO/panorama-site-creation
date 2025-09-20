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
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'catalog', label: 'Gallery' },
    { id: 'pricing', label: 'Pricing' },
  ];

  if (isAuthenticated) {
    navItems.push({ id: 'tour-builder', label: 'Create' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Icon name="Globe" className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Panorama 360 App
            </h1>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentView === item.id 
                    ? 'text-white' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/80 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm font-medium"
                  disabled={user?.subscription === 'free' && user?.uploads >= user?.maxUploads}
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload
                  {user?.subscription === 'free' && (
                    <span className="ml-1 text-xs text-white/70">
                      ({user?.uploads}/{user?.maxUploads})
                    </span>
                  )}
                </Button>
                
                <Button 
                  onClick={() => onViewChange('profile')}
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user?.name || 'User'} 
                      className="w-5 h-5 rounded-full mr-2" 
                    />
                  ) : (
                    <Icon name="User" size={16} className="mr-2" />
                  )}
                  {user?.name || user?.email || 'Profile'}
                </Button>
                
                {user?.role === 'admin' && (
                  <Button 
                    onClick={() => onViewChange('admin')}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
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
                  size="sm"
                  className="border-white/80 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm font-medium"
                  onClick={onAuthShow}
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload
                </Button>
                <Button 
                  size="sm"
                  className="bg-white text-slate-900 hover:bg-white/90 font-medium shadow-sm"
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