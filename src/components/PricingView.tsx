import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PricingViewProps {
  subscriptionPlans: any[];
}

export default function PricingView({ subscriptionPlans }: PricingViewProps) {
  return (
    <div className="pt-24 bg-dark-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of virtual reality experiences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative glass-effect border-white/20 ${plan.popular ? 'border-neon-cyan/50 scale-105' : ''} transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-neon-cyan text-black font-bold px-4 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-orbitron text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <Icon name="Check" className="text-neon-green mr-2" size={16} />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-500">
                      <Icon name="X" className="text-red-400 mr-2" size={16} />
                      {limitation}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular 
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-black' 
                    : 'bg-gradient-to-r ' + plan.color + ' text-white'
                  } font-semibold`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}