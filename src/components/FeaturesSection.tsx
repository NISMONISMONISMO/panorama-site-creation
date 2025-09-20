import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function FeaturesSection() {
  const features = [
    { 
      icon: 'MousePointer', 
      title: 'Interactive Experience', 
      desc: 'Navigate seamlessly through 360° environments with intuitive controls'
    },
    { 
      icon: 'Sparkles', 
      title: 'Premium Quality', 
      desc: 'High-resolution imagery delivers exceptional clarity and detail'
    },
    { 
      icon: 'Route', 
      title: 'Virtual Tours', 
      desc: 'Create connected experiences that guide viewers through multiple scenes'
    },
    { 
      icon: 'Share2', 
      title: 'Easy Integration', 
      desc: 'Embed tours anywhere or share with custom links and social media'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Professional Features
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to create and share immersive virtual experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-minimal text-center border-slate-200 hover:border-slate-300 transition-all">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Icon name={feature.icon} className="text-slate-700" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}