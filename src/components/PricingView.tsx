import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PricingViewProps {
  subscriptionPlans: any[];
}

export default function PricingView({ subscriptionPlans }: PricingViewProps) {
  return (
    <div className="pt-24 bg-slate-100 min-h-screen">
      <div className="section-container py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your virtual tour needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative card-minimal ${
                plan.popular 
                  ? 'border-primary shadow-lg ring-1 ring-primary/10 scale-105' 
                  : 'border-slate-200'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-medium px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-semibold text-slate-900 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-lg">/{plan.period}</span>
                </div>
                <p className="text-slate-600 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-slate-700">
                      <Icon name="Check" className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation: string, idx: number) => (
                    <li key={idx} className="flex items-start text-slate-400">
                      <Icon name="X" className="text-slate-400 mr-3 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'button-primary' 
                      : 'button-secondary'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-500 text-sm">
            All plans include our core features. Need something custom?{' '}
            <a href="mailto:contact@panorama360.app" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}