import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  onBackToHome: () => void;
}

export default function CatalogView({
  searchQuery,
  selectedCategory,
  filteredPanoramas,
  isAuthenticated,
  onSearchChange,
  onCategoryChange,
  onPanoramaClick,
  onBackToHome
}: CatalogViewProps) {
  return (
    <div className="pt-24 bg-slate-100 min-h-screen">
      <div className="section-container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onBackToHome}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-300 rounded-lg flex items-center justify-center">
                <Icon name="Globe" className="text-slate-700" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Галерея панорам</h1>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск панорам..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
              <TabsList className="bg-slate-200">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Все
                </TabsTrigger>
                <TabsTrigger 
                  value="panoramas" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Панорамы
                </TabsTrigger>
                <TabsTrigger 
                  value="tours" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Туры
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPanoramas.map((panorama) => (
            <Card 
              key={panorama.id} 
              className="card-minimal hover:shadow-lg transition-all group cursor-pointer border-slate-200 hover:border-slate-300"
              onClick={() => onPanoramaClick(panorama)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={panorama.image} 
                  alt={panorama.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {panorama.premium && (
                  <Badge className="absolute top-4 right-4 bg-amber-500 text-white font-medium">Premium</Badge>
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
              <CardHeader className="p-4">
                <CardTitle className="text-slate-900 group-hover:text-primary transition-colors text-lg">
                  {panorama.title}
                </CardTitle>
                <p className="text-slate-600 text-sm">by {panorama.author}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredPanoramas.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Search" className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Ничего не найдено</h3>
            <p className="text-slate-500">Попробуйте изменить поисковый запрос или фильтры</p>
          </div>
        )}
      </div>
    </div>
  );
}