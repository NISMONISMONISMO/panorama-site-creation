import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { apiService, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Валидация
      if (activeTab === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Пароли не совпадают');
        }
        if (formData.password.length < 6) {
          throw new Error('Пароль должен быть не менее 6 символов');
        }
        if (!formData.name.trim()) {
          throw new Error('Имя обязательно');
        }
      }

      if (!formData.email.trim() || !formData.password.trim()) {
        throw new Error('Email и пароль обязательны');
      }

      // Выполняем запрос
      let result;
      if (activeTab === 'signup') {
        result = await apiService.register(formData.email, formData.password, formData.name);
        toast({
          title: 'Регистрация успешна!',
          description: 'Добро пожаловать в Panorama 360 App',
        });
      } else {
        result = await apiService.login(formData.email, formData.password);
        toast({
          title: 'Вход выполнен!',
          description: `Добро пожаловать, ${result.user.name}`,
        });
      }

      onAuth(result.user);
      onClose();
      
      // Очищаем форму
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        acceptTerms: false
      });
      
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      switch (provider.toLowerCase()) {
        case 'google':
          apiService.googleLogin();
          break;
        case 'yandex':
          apiService.yandexLogin();
          break;
        case 'vk':
          apiService.vkLogin();
          break;
        default:
          throw new Error(`Провайдер ${provider} не поддерживается`);
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Ошибка OAuth',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-xl">
        <CardHeader className="text-center border-b border-slate-100">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3">
              <Icon name="Globe" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Panorama 360 App</h1>
          </div>
          <CardTitle className="text-slate-900 text-lg">
            {activeTab === 'signin' ? 'Добро пожаловать' : 'Создать аккаунт'}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 mb-6">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
              >
                Вход
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
              >
                Регистрация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите ваш пароль"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                      Вход...
                    </>
                  ) : (
                    'Войти'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Имя</Label>
                  <Input
                    id="name"
                    placeholder="Введите ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-700 font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-700 font-medium">Пароль</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Создайте пароль"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-slate-700 font-medium">Подтвердите пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Подтвердите ваш пароль"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                      Создание аккаунта...
                    </>
                  ) : (
                    'Создать аккаунт'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Или войти через</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('Google')}
                  disabled={isLoading}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="Chrome" size={16} className="mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('Yandex')}
                  disabled={isLoading}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <span className="mr-2 text-red-500 font-bold">Я</span>
                  Яндекс
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => handleSocialAuth('VK')}
                disabled={isLoading}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <span className="mr-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">VK</span>
                ВКонтакте
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            >
              Продолжить как гость
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}