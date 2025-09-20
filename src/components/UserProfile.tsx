import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface UserProfileProps {
  user: any;
  onClose: () => void;
  onLogout: () => void;
  onUpgrade: () => void;
}

export default function UserProfile({ user, onClose, onLogout, onUpgrade }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Пользователь',
    email: user?.email || '',
    bio: 'Энтузиаст VR и создатель панорам'
  });

  const userPanoramas = [
    { id: '1', title: 'Моя первая 360° фотография', views: 156, likes: 23, status: 'active', expiresIn: userSubscription === 'free' ? '18 часов' : null },
    { id: '2', title: 'Вид на город на закате', views: 89, likes: 12, status: 'active', expiresIn: userSubscription === 'free' ? '6 часов' : null },
  ];

  const userTours = [
    { id: '1', title: 'Виртуальный тур по офису', scenes: 4, views: 234, status: 'published' },
    { id: '2', title: 'Показ дома', scenes: 6, views: 156, status: 'draft' }
  ];

  const subscriptionLimits = {
    free: { uploads: 2, storage: '24ч', tours: 0, embedding: false },
    premium: { uploads: 'Безлимит', storage: 'Постоянно', tours: 'Безлимит', embedding: true },
    business: { uploads: 'Безлимит', storage: 'Постоянно', tours: 'Безлимит', embedding: true }
  };

  const userSubscription = user?.subscription_type || user?.subscription || 'free';
  const currentLimits = subscriptionLimits[userSubscription as keyof typeof subscriptionLimits];
  const uploadProgress = userSubscription === 'free' ? (user?.uploads || 0) / (user?.maxUploads || 2) * 100 : 0;

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  return (
    <div className="pt-24 bg-slate-100 min-h-screen">
      <div className="section-container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">Профиль</h1>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="card-minimal border-slate-200 mb-6">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-400 to-slate-600 p-1">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user?.name || 'User'}
                      className="w-full h-full rounded-full object-cover bg-slate-200"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                      <Icon name="User" size={32} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-slate-900">{user?.name || 'Пользователь'}</CardTitle>
                <p className="text-slate-600">{user?.email || ''}</p>
                <Badge className={`${
                  userSubscription === 'free' ? 'bg-slate-500' :
                  userSubscription === 'premium' || userSubscription === 'pro' ? 'bg-blue-500' :
                  'bg-purple-500'
                } text-white`}>
                  {userSubscription.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">Имя</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="border-slate-300 focus:border-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-700">О себе</Label>
                      <Input
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="border-slate-300 focus:border-slate-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-slate-900 hover:bg-slate-800 text-white flex-1"
                      >
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-slate-300 text-slate-700"
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-600 text-sm">{profileData.bio}</p>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Icon name="Edit" size={16} className="mr-2" />
                      Редактировать профиль
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Info */}
            <Card className="card-minimal border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Подписка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Загрузки</span>
                    <span className="text-slate-900 font-medium">
                      {userSubscription === 'free' ? `${user?.uploads || 0}/${user?.maxUploads || 2}` : currentLimits.uploads}
                    </span>
                  </div>
                  {userSubscription === 'free' && (
                    <Progress value={uploadProgress} className="h-2" />
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Хранение</span>
                    <span className="text-slate-900">{currentLimits.storage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Туры</span>
                    <span className="text-slate-900">{currentLimits.tours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Встраивание</span>
                    <span className="text-slate-900">{currentLimits.embedding ? 'Да' : 'Нет'}</span>
                  </div>
                </div>

                {userSubscription === 'free' && (
                  <Button
                    onClick={onUpgrade}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Icon name="Zap" size={16} className="mr-2" />
                    Улучшить план
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="panoramas" className="space-y-6">
              <TabsList className="bg-slate-200">
                <TabsTrigger 
                  value="panoramas" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Панорамы ({userPanoramas.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="tours" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Туры ({userTours.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Аналитика
                </TabsTrigger>
              </TabsList>

              <TabsContent value="panoramas" className="space-y-4">
                {userPanoramas.map((panorama) => (
                  <Card key={panorama.id} className="card-minimal border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{panorama.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                            <span className="flex items-center">
                              <Icon name="Eye" size={14} className="mr-1" />
                              {panorama.views} просмотров
                            </span>
                            <span className="flex items-center">
                              <Icon name="Heart" size={14} className="mr-1" />
                              {panorama.likes} лайков
                            </span>
                            {panorama.expiresIn && (
                              <span className="text-amber-600 flex items-center">
                                <Icon name="Clock" size={14} className="mr-1" />
                                Истекает через {panorama.expiresIn}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                            <Icon name="Edit" size={14} className="mr-1" />
                            Изменить
                          </Button>
                          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                            <Icon name="Share2" size={14} className="mr-1" />
                            Поделиться
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="tours" className="space-y-4">
                {userTours.map((tour) => (
                  <Card key={tour.id} className="card-minimal border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{tour.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                            <span>{tour.scenes} сцен</span>
                            <span>{tour.views} просмотров</span>
                            <Badge variant={tour.status === 'published' ? 'default' : 'secondary'}>
                              {tour.status === 'published' ? 'Опубликован' : 'Черновик'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                            <Icon name="Edit" size={14} className="mr-1" />
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                            <Icon name="Eye" size={14} className="mr-1" />
                            Просмотр
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-minimal border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-slate-900 text-lg">Общая статистика</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Всего просмотров</span>
                        <span className="font-semibold text-slate-900">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Всего лайков</span>
                        <span className="font-semibold text-slate-900">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Рейтинг</span>
                        <span className="font-semibold text-slate-900">4.8/5</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-minimal border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-slate-900 text-lg">Активность</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Загружено панорам</span>
                        <span className="font-semibold text-slate-900">{userPanoramas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Создано туров</span>
                        <span className="font-semibold text-slate-900">{userTours.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Дата регистрации</span>
                        <span className="font-semibold text-slate-900">15 янв 2024</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}