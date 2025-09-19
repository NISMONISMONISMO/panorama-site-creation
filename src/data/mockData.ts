export interface PanoramaCategory {
  id: string;
  title: string;
  image: string;
  description: string;
  count: number;
}

export interface PanoramaItem {
  id: string;
  title: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  author: string;
  premium: boolean;
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  limitations: string[];
  buttonText: string;
  popular: boolean;
  color: string;
}

export const categories: PanoramaCategory[] = [
  {
    id: 'urban',
    title: 'Urban Skylines',
    image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg',
    description: 'Futuristic city landscapes',
    count: 24
  },
  {
    id: 'mountain',
    title: 'Mountain Vistas',
    image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg',
    description: 'Epic mountain panoramas',
    count: 18
  },
  {
    id: 'coastal',
    title: 'Coastal Retreats',
    image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg',
    description: 'Stunning ocean views',
    count: 16
  }
];

export const panoramas: PanoramaItem[] = [
  { id: '1', title: 'Winter Mountain Vista', category: 'mountain', image: 'https://cdn.poehali.dev/files/35520009-5e5d-400f-bfcb-5360a1887a0d.jpg', views: 2150, likes: 156, author: 'AlpineExplorer', premium: false },
  { id: '2', title: 'Neo Tokyo Night', category: 'urban', image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg', views: 1250, likes: 89, author: 'CyberVision', premium: true },
  { id: '3', title: 'Neon Peaks', category: 'mountain', image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg', views: 945, likes: 67, author: 'MountainExplorer', premium: false },
  { id: '4', title: 'Digital Ocean', category: 'coastal', image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg', views: 1100, likes: 78, author: 'WaveRider', premium: true },
  { id: '5', title: 'Cyber Downtown', category: 'urban', image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg', views: 890, likes: 56, author: 'UrbanDreamer', premium: false },
  { id: '6', title: 'Aurora Peaks', category: 'mountain', image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg', views: 760, likes: 45, author: 'NorthernLights', premium: true },
  { id: '7', title: 'Neon Beach', category: 'coastal', image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg', views: 670, likes: 34, author: 'CoastalDrone', premium: false }
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['2 panoramas/day', '24h storage', 'Basic viewing', 'Community access'],
    limitations: ['No virtual tours', 'No embedding', 'Limited storage'],
    buttonText: 'Get Started',
    popular: false,
    color: 'from-gray-600 to-gray-800'
  },
  {
    name: 'Premium',
    price: '$19',
    period: 'month',
    features: ['Unlimited uploads', 'Permanent storage', 'Virtual tour builder', 'Embedding widgets', 'Priority support'],
    limitations: [],
    buttonText: 'Upgrade Now',
    popular: true,
    color: 'from-neon-cyan to-neon-blue'
  },
  {
    name: 'Business',
    price: '$49',
    period: 'month',
    features: ['Everything in Premium', 'Custom domains', 'Advanced analytics', 'SSO integration', 'API access', 'White-label options'],
    limitations: [],
    buttonText: 'Contact Sales',
    popular: false,
    color: 'from-neon-magenta to-purple-600'
  }
];