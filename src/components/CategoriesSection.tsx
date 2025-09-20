import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoriesSectionProps {
  categories: any[];
  isAuthenticated: boolean;
  onCategorySelect: (categoryId: string) => void;
  onViewChange: (view: string) => void;
  onAuthShow: () => void;
}

export default function CategoriesSection({
  categories,
  isAuthenticated,
  onCategorySelect,
  onViewChange,
  onAuthShow
}: CategoriesSectionProps) {
  const handleCategoryClick = (category: any) => {
    if (category.id === 'create') {
      if (isAuthenticated) {
        onViewChange('profile');
      } else {
        onAuthShow();
      }
    } else if (category.id === 'panoramas' || category.id === 'tours') {
      onCategorySelect(category.id);
      onViewChange('catalog');
    }
  };
  return (
    <section className="py-20 bg-slate-100">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Что вы хотите сделать?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Выберите, как вы хотите использовать нашу платформу для создания виртуальных впечатлений
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className="card-minimal hover:shadow-lg transition-all duration-300 group cursor-pointer border-slate-200 hover:border-slate-300"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {category.count > 0 && (
                  <Badge className="absolute top-4 right-4 bg-white text-slate-900 font-medium">
                    {category.count}+ работ
                  </Badge>
                )}
              </div>
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-primary transition-colors mb-3">
                  {category.title}
                </CardTitle>
                <p className="text-slate-600 text-sm leading-relaxed">{category.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}