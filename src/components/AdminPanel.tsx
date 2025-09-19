import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Mock data for admin panel
  const stats = {
    totalUsers: 12847,
    activeUsers: 3456,
    totalPanoramas: 8923,
    totalTours: 1234,
    premiumUsers: 892,
    businessUsers: 156,
    revenue: 45670,
    storageUsed: 2.3,
    storageLimit: 10
  };

  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', subscription: 'premium', status: 'active', joinDate: '2024-01-15', uploads: 45 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', subscription: 'free', status: 'active', joinDate: '2024-02-10', uploads: 2 },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', subscription: 'business', status: 'blocked', joinDate: '2024-01-05', uploads: 123 },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', subscription: 'premium', status: 'active', joinDate: '2024-03-01', uploads: 78 }
  ];

  const panoramas = [
    { id: '1', title: 'Sunset City View', author: 'John Doe', views: 1234, status: 'published', reports: 0, uploaded: '2024-03-15' },
    { id: '2', title: 'Mountain Peak', author: 'Jane Smith', views: 567, status: 'published', reports: 2, uploaded: '2024-03-14' },
    { id: '3', title: 'Ocean Waves', author: 'Bob Wilson', views: 890, status: 'hidden', reports: 5, uploaded: '2024-03-13' },
    { id: '4', title: 'Forest Trail', author: 'Alice Brown', views: 345, status: 'pending', reports: 0, uploaded: '2024-03-16' }
  ];

  const reports = [
    { id: '1', contentId: '2', contentTitle: 'Mountain Peak', reason: 'Inappropriate content', reporter: 'user123', status: 'pending', date: '2024-03-16' },
    { id: '2', contentId: '3', contentTitle: 'Ocean Waves', reason: 'Copyright violation', reporter: 'user456', status: 'pending', date: '2024-03-15' },
    { id: '3', contentId: '1', contentTitle: 'Sunset City View', reason: 'Spam', reporter: 'user789', status: 'resolved', date: '2024-03-14' }
  ];

  const handleUserAction = (userId: string, action: 'block' | 'unblock' | 'upgrade' | 'downgrade') => {
    console.log(`Action ${action} for user ${userId}`);
    // Here you would make API call to perform the action
  };

  const handleContentAction = (contentId: string, action: 'hide' | 'show' | 'delete') => {
    console.log(`Action ${action} for content ${contentId}`);
    // Here you would make API call to perform the action
  };

  const handleReportAction = (reportId: string, action: 'approve' | 'reject') => {
    console.log(`Action ${action} for report ${reportId}`);
    // Here you would make API call to perform the action
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPanoramas = panoramas.filter(panorama => 
    panorama.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panorama.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-3xl font-orbitron font-bold text-white">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-red-500 text-white animate-pulse">
              <Icon name="AlertTriangle" size={14} className="mr-1" />
              {reports.filter(r => r.status === 'pending').length} Reports
            </Badge>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
          <Card className="glass-effect border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="Users" className="text-neon-cyan mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Users</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="UserCheck" className="text-neon-green mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Active Users</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="Image" className="text-neon-magenta mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.totalPanoramas.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Panoramas</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="Route" className="text-neon-blue mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{stats.totalTours.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Virtual Tours</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="DollarSign" className="text-neon-green mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage */}
        <Card className="glass-effect border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Icon name="HardDrive" className="text-neon-cyan mr-2" size={20} />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Used: {stats.storageUsed} TB</span>
              <span className="text-gray-400">Limit: {stats.storageLimit} TB</span>
            </div>
            <Progress value={(stats.storageUsed / stats.storageLimit) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-dark-300 border-white/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Content ({panoramas.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Reports ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">User Management</CardTitle>
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-dark-300 border-white/20 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-dark-300/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`text-xs ${
                              user.subscription === 'free' ? 'bg-gray-600' :
                              user.subscription === 'premium' ? 'bg-neon-cyan text-black' :
                              'bg-neon-magenta text-white'
                            }`}>
                              {user.subscription}
                            </Badge>
                            <Badge className={`text-xs ${
                              user.status === 'active' ? 'bg-neon-green text-black' : 'bg-red-500 text-white'
                            }`}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <p className="text-gray-400">Uploads: {user.uploads}</p>
                          <p className="text-gray-400">Joined: {user.joinDate}</p>
                        </div>
                        <div className="flex space-x-1">
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'block')}
                              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                            >
                              <Icon name="Ban" size={14} />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'unblock')}
                              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                            >
                              <Icon name="CheckCircle" size={14} />
                            </Button>
                          )}
                          {user.subscription === 'free' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'upgrade')}
                              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                            >
                              <Icon name="Crown" size={14} />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'downgrade')}
                              className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
                            >
                              <Icon name="ArrowDown" size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Content Moderation</CardTitle>
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-dark-300 border-white/20 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPanoramas.map((panorama) => (
                    <div key={panorama.id} className="flex items-center justify-between p-4 bg-dark-300/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{panorama.title}</h3>
                        <p className="text-gray-400 text-sm">by {panorama.author}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-gray-400 text-sm flex items-center">
                            <Icon name="Eye" size={12} className="mr-1" />
                            {panorama.views} views
                          </span>
                          <span className="text-gray-400 text-sm">Uploaded: {panorama.uploaded}</span>
                          {panorama.reports > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {panorama.reports} reports
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${
                          panorama.status === 'published' ? 'bg-neon-green text-black' :
                          panorama.status === 'hidden' ? 'bg-red-500 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {panorama.status}
                        </Badge>
                        <div className="flex space-x-1">
                          {panorama.status !== 'hidden' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContentAction(panorama.id, 'hide')}
                              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                            >
                              <Icon name="EyeOff" size={14} />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContentAction(panorama.id, 'show')}
                              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                            >
                              <Icon name="Eye" size={14} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContentAction(panorama.id, 'delete')}
                            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Management */}
          <TabsContent value="reports">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Content Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 bg-dark-300/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{report.contentTitle}</h3>
                          <p className="text-gray-400 text-sm">Reason: {report.reason}</p>
                          <p className="text-gray-400 text-xs">Reported by: {report.reporter} on {report.date}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${
                            report.status === 'pending' ? 'bg-yellow-600 text-white' :
                            report.status === 'resolved' ? 'bg-neon-green text-black' :
                            'bg-red-500 text-white'
                          }`}>
                            {report.status}
                          </Badge>
                          {report.status === 'pending' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'approve')}
                                className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                              >
                                <Icon name="Check" size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'reject')}
                                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                              >
                                <Icon name="X" size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Free Users</span>
                      <span className="text-white">{stats.totalUsers - stats.premiumUsers - stats.businessUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Premium Users</span>
                      <span className="text-neon-cyan">{stats.premiumUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Business Users</span>
                      <span className="text-neon-magenta">{stats.businessUsers}</span>
                    </div>
                    <Progress value={(stats.premiumUsers + stats.businessUsers) / stats.totalUsers * 100} className="h-3" />
                    <p className="text-xs text-gray-400">
                      {Math.round((stats.premiumUsers + stats.businessUsers) / stats.totalUsers * 100)}% conversion rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">System Status</span>
                      <Badge className="bg-neon-green text-black">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Uptime</span>
                      <span className="text-neon-green">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Active Sessions</span>
                      <span className="text-white">{stats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Response Time</span>
                      <span className="text-neon-cyan">245ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}