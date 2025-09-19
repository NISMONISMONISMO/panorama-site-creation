import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface CatalogViewProps {
  searchQuery: string;
  selectedCategory: string;
  filteredPanoramas: any[];
  isAuthenticated: boolean;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onPanoramaClick: (panorama: any) => void;
}

export default function CatalogView({
  searchQuery,
  selectedCategory,
  filteredPanoramas,
  isAuthenticated,
  onSearchChange,
  onCategoryChange,
  onPanoramaClick
}: CatalogViewProps) {
  return (
    <div className="pt-24 bg-dark-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white mb-4">Panorama Catalog</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search panoramas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-dark-300 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
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
            <Card 
              key={panorama.id} 
              className="glass-effect border-white/20 hover:border-neon-cyan/50 transition-all group cursor-pointer"
              onClick={() => onPanoramaClick(panorama)}
            >
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
                {!isAuthenticated && panorama.premium && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Icon name="Lock" className="text-white" size={32} />
                  </div>
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
}