import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoriesSectionProps {
  categories: any[];
  onCategorySelect: (categoryId: string) => void;
  onViewChange: (view: string) => void;
}

export default function CategoriesSection({
  categories,
  onCategorySelect,
  onViewChange
}: CategoriesSectionProps) {
  return (
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
                onCategorySelect(category.id);
                onViewChange('catalog');
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
}