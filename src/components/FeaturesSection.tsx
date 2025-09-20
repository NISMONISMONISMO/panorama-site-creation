import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeaturesSection() {
  const { t } = useLanguage();
  
  const features = [
    { 
      icon: 'MousePointer', 
      title: t('features.interactive.title'), 
      desc: t('features.interactive.desc')
    },
    { 
      icon: 'Sparkles', 
      title: t('features.quality.title'), 
      desc: t('features.quality.desc')
    },
    { 
      icon: 'Route', 
      title: t('features.virtualTours.title'), 
      desc: t('features.virtualTours.desc')
    },
    { 
      icon: 'Share2', 
      title: t('features.integration.title'), 
      desc: t('features.integration.desc')
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {t('features.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('features.subtitle')}
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