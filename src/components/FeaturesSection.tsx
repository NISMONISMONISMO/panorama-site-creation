import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function FeaturesSection() {
  const features = [
    { icon: 'MousePointer', title: 'Interactive Viewing', desc: 'Immersive 360° navigation' },
    { icon: 'Sparkles', title: 'Hi-Resolution', desc: 'Crystal clear imagery' },
    { icon: 'Route', title: 'Virtual Tours', desc: 'Connected experiences' },
    { icon: 'Share2', title: 'Easy Sharing', desc: 'Embed anywhere' }
  ];

  return (
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
          {features.map((feature, index) => (
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
}