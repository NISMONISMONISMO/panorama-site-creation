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
    name: user.name,
    email: user.email,
    bio: 'VR enthusiast and panorama creator'
  });

  const userPanoramas = [
    { id: '1', title: 'My First 360° Photo', views: 156, likes: 23, status: 'active', expiresIn: user.subscription === 'free' ? '18 hours' : null },
    { id: '2', title: 'Sunset City View', views: 89, likes: 12, status: 'active', expiresIn: user.subscription === 'free' ? '6 hours' : null },
  ];

  const userTours = [
    { id: '1', title: 'Virtual Office Tour', scenes: 4, views: 234, status: 'published' },
    { id: '2', title: 'Home Showcase', scenes: 6, views: 156, status: 'draft' }
  ];

  const subscriptionLimits = {
    free: { uploads: 2, storage: '24h', tours: 0, embedding: false },
    premium: { uploads: 'Unlimited', storage: 'Permanent', tours: 'Unlimited', embedding: true },
    business: { uploads: 'Unlimited', storage: 'Permanent', tours: 'Unlimited', embedding: true }
  };

  const currentLimits = subscriptionLimits[user.subscription as keyof typeof subscriptionLimits];
  const uploadProgress = user.subscription === 'free' ? (user.uploads / user.maxUploads) * 100 : 0;

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  return (
    <div className="pt-24 bg-dark-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="neon-border text-white border-white/30"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-orbitron font-bold text-white">Profile</h1>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-white/20 mb-6">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta p-1">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover bg-dark-300"
                  />
                </div>
                <CardTitle className="text-white">{user.name}</CardTitle>
                <p className="text-gray-400">{user.email}</p>
                <Badge className={`${
                  user.subscription === 'free' ? 'bg-gray-600' :
                  user.subscription === 'premium' ? 'bg-neon-cyan text-black' :
                  'bg-neon-magenta text-white'
                }`}>
                  {user.subscription.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-dark-300 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-dark-300 border-white/20 text-white"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-neon-cyan text-black"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 border-white/30 text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full neon-border text-neon-cyan border-neon-cyan"
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Icon name="Crown" className="text-neon-cyan mr-2" size={20} />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.subscription === 'free' && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Daily Uploads</span>
                        <span className="text-white">{user.uploads}/{user.maxUploads}</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• {currentLimits.storage} storage per panorama</p>
                      <p>• No virtual tour builder</p>
                      <p>• No embedding capabilities</p>
                    </div>
                    <Button
                      onClick={onUpgrade}
                      className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-semibold"
                    >
                      <Icon name="Zap" size={16} className="mr-2" />
                      Upgrade to Premium
                    </Button>
                  </>
                )}

                {user.subscription !== 'free' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Uploads</span>
                      <span className="text-neon-cyan">{currentLimits.uploads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Storage</span>
                      <span className="text-neon-cyan">{currentLimits.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Virtual Tours</span>
                      <span className="text-neon-cyan">{currentLimits.tours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Embedding</span>
                      <Icon name="Check" className="text-neon-green" size={16} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="panoramas">
              <TabsList className="mb-6 bg-dark-300 border-white/20">
                <TabsTrigger value="panoramas" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
                  Panoramas ({userPanoramas.length})
                </TabsTrigger>
                <TabsTrigger value="tours" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
                  Virtual Tours ({userTours.length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="panoramas" className="space-y-4">
                {userPanoramas.map((panorama) => (
                  <Card key={panorama.id} className="glass-effect border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">{panorama.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Icon name="Eye" size={14} className="mr-1" />
                              {panorama.views} views
                            </span>
                            <span className="flex items-center">
                              <Icon name="Heart" size={14} className="mr-1" />
                              {panorama.likes} likes
                            </span>
                            {panorama.expiresIn && (
                              <span className="flex items-center text-yellow-400">
                                <Icon name="Clock" size={14} className="mr-1" />
                                Expires in {panorama.expiresIn}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={panorama.status === 'active' ? 'bg-neon-green text-black' : 'bg-gray-600'}>
                            {panorama.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="border-white/30 text-white">
                            <Icon name="MoreVertical" size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {user.subscription !== 'free' && (
                  <Card className="glass-effect border-white/20 border-dashed">
                    <CardContent className="p-6 text-center">
                      <Icon name="Plus" className="text-neon-cyan mx-auto mb-4" size={48} />
                      <h3 className="text-white font-semibold mb-2">Upload New Panorama</h3>
                      <p className="text-gray-400 mb-4">Share your 360° experiences with the world</p>
                      <Button className="bg-neon-cyan text-black">
                        <Icon name="Upload" size={16} className="mr-2" />
                        Upload Panorama
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tours" className="space-y-4">
                {userTours.map((tour) => (
                  <Card key={tour.id} className="glass-effect border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">{tour.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Icon name="MapPin" size={14} className="mr-1" />
                              {tour.scenes} scenes
                            </span>
                            <span className="flex items-center">
                              <Icon name="Eye" size={14} className="mr-1" />
                              {tour.views} views
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={tour.status === 'published' ? 'bg-neon-green text-black' : 'bg-yellow-600'}>
                            {tour.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="border-white/30 text-white">
                            <Icon name="Edit" size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {user.subscription === 'free' ? (
                  <Card className="glass-effect border-white/20 border-dashed">
                    <CardContent className="p-6 text-center">
                      <Icon name="Lock" className="text-gray-400 mx-auto mb-4" size={48} />
                      <h3 className="text-white font-semibold mb-2">Virtual Tours Locked</h3>
                      <p className="text-gray-400 mb-4">Upgrade to Premium to create virtual tours</p>
                      <Button onClick={onUpgrade} className="bg-neon-cyan text-black">
                        <Icon name="Crown" size={16} className="mr-2" />
                        Upgrade Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-effect border-white/20 border-dashed">
                    <CardContent className="p-6 text-center">
                      <Icon name="Route" className="text-neon-cyan mx-auto mb-4" size={48} />
                      <h3 className="text-white font-semibold mb-2">Create Virtual Tour</h3>
                      <p className="text-gray-400 mb-4">Build immersive experiences with hotspots</p>
                      <Button className="bg-neon-cyan text-black">
                        <Icon name="Plus" size={16} className="mr-2" />
                        New Tour
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start border-white/30 text-white">
                      <Icon name="Key" size={16} className="mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-white/30 text-white">
                      <Icon name="Bell" size={16} className="mr-2" />
                      Notification Preferences
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-white/30 text-white">
                      <Icon name="Shield" size={16} className="mr-2" />
                      Privacy Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-red-400 text-red-400 hover:bg-red-400 hover:text-white">
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}