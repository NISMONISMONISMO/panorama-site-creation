import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  targetPanorama: string;
  title: string;
  description: string;
  icon: string;
}

interface TourScene {
  id: string;
  title: string;
  image: string;
  hotspots: Hotspot[];
}

interface Tour {
  id: string;
  title: string;
  description: string;
  scenes: TourScene[];
  startingScene: string;
}

const samplePanoramas = [
  { id: '1', title: 'Neo Tokyo Night', image: '/img/b6175d7f-3820-410f-89f7-d4fe91bf69de.jpg' },
  { id: '2', title: 'Neon Peaks', image: '/img/542cbe70-12c6-4b52-aad4-c60f92d854a0.jpg' },
  { id: '3', title: 'Digital Ocean', image: '/img/a0134b33-244e-4ca5-8bd5-41b083ed220e.jpg' }
];

export default function TourBuilder({ onClose }: { onClose: () => void }) {
  const [currentTour, setCurrentTour] = useState<Tour>({
    id: 'new-tour',
    title: 'My Virtual Tour',
    description: 'An amazing virtual reality experience',
    scenes: [],
    startingScene: ''
  });
  
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [hotspotForm, setHotspotForm] = useState({
    title: '',
    description: '',
    targetPanorama: '',
    icon: 'Navigation'
  });
  const [previewMode, setPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addScene = (panoramaId: string) => {
    const panorama = samplePanoramas.find(p => p.id === panoramaId);
    if (!panorama) return;

    const newScene: TourScene = {
      id: `scene-${Date.now()}`,
      title: panorama.title,
      image: panorama.image,
      hotspots: []
    };

    setCurrentTour(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
      startingScene: prev.startingScene || newScene.id
    }));
  };

  const removeScene = (sceneId: string) => {
    setCurrentTour(prev => ({
      ...prev,
      scenes: prev.scenes.filter(s => s.id !== sceneId),
      startingScene: prev.startingScene === sceneId ? prev.scenes[0]?.id || '' : prev.startingScene
    }));
    if (selectedScene === sceneId) {
      setSelectedScene(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingHotspot || !selectedScene) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (hotspotForm.title && hotspotForm.targetPanorama) {
      const newHotspot: Hotspot = {
        id: `hotspot-${Date.now()}`,
        x,
        y,
        targetPanorama: hotspotForm.targetPanorama,
        title: hotspotForm.title,
        description: hotspotForm.description,
        icon: hotspotForm.icon
      };

      setCurrentTour(prev => ({
        ...prev,
        scenes: prev.scenes.map(scene =>
          scene.id === selectedScene
            ? { ...scene, hotspots: [...scene.hotspots, newHotspot] }
            : scene
        )
      }));

      setHotspotForm({ title: '', description: '', targetPanorama: '', icon: 'Navigation' });
      setIsAddingHotspot(false);
    }
  };

  const removeHotspot = (sceneId: string, hotspotId: string) => {
    setCurrentTour(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === sceneId
          ? { ...scene, hotspots: scene.hotspots.filter(h => h.id !== hotspotId) }
          : scene
      )
    }));
  };

  const exportTour = () => {
    const tourData = {
      ...currentTour,
      exportedAt: new Date().toISOString(),
      embedCode: `<iframe src="/tour-embed/${currentTour.id}" width="800" height="600" frameborder="0"></iframe>`
    };

    const blob = new Blob([JSON.stringify(tourData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTour.title.replace(/\s+/g, '-').toLowerCase()}-tour.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentScene = currentTour.scenes.find(s => s.id === selectedScene);

  return (
    <div className="fixed inset-0 z-50 bg-dark-100 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-dark-200 border-r border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-orbitron font-bold text-white">Tour Builder</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="neon-border text-white border-white/30"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            <Input
              value={currentTour.title}
              onChange={(e) => setCurrentTour(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tour Title"
              className="bg-dark-300 border-white/20 text-white"
            />
            <Textarea
              value={currentTour.description}
              onChange={(e) => setCurrentTour(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tour Description"
              className="bg-dark-300 border-white/20 text-white h-20"
            />
          </div>
        </div>

        <Tabs defaultValue="scenes" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 bg-dark-300 border-white/20">
            <TabsTrigger value="scenes" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">Scenes</TabsTrigger>
            <TabsTrigger value="panoramas" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">Add</TabsTrigger>
          </TabsList>

          <TabsContent value="scenes" className="flex-1 overflow-hidden">
            <div className="p-4 space-y-3 h-full overflow-y-auto">
              {currentTour.scenes.map((scene) => (
                <Card
                  key={scene.id}
                  className={`cursor-pointer transition-all ${
                    selectedScene === scene.id
                      ? 'border-neon-cyan/50 bg-neon-cyan/10'
                      : 'glass-effect border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedScene(scene.id)}
                >
                  <div className="relative">
                    <img
                      src={scene.image}
                      alt={scene.title}
                      className="w-full h-24 object-cover rounded-t-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScene(scene.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-500/80 border-red-500 hover:bg-red-500"
                    >
                      <Icon name="X" size={12} />
                    </Button>
                    {currentTour.startingScene === scene.id && (
                      <Badge className="absolute bottom-2 right-2 bg-neon-cyan text-black text-xs">Start</Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="text-white font-semibold text-sm">{scene.title}</h4>
                    <p className="text-gray-400 text-xs">{scene.hotspots.length} hotspots</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="panoramas" className="flex-1 overflow-hidden">
            <div className="p-4 space-y-3 h-full overflow-y-auto">
              {samplePanoramas.map((panorama) => (
                <Card
                  key={panorama.id}
                  className="glass-effect border-white/20 hover:border-neon-cyan/50 transition-all cursor-pointer"
                  onClick={() => addScene(panorama.id)}
                >
                  <img
                    src={panorama.image}
                    alt={panorama.title}
                    className="w-full h-20 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-3">
                    <h4 className="text-white font-semibold text-sm">{panorama.title}</h4>
                    <div className="flex items-center justify-center mt-2">
                      <Icon name="Plus" className="text-neon-cyan" size={16} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="p-4 border-b border-white/20 bg-dark-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant={previewMode ? 'default' : 'outline'}
                onClick={() => setPreviewMode(!previewMode)}
                className={previewMode 
                  ? 'bg-neon-cyan text-black' 
                  : 'neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black'
                }
              >
                <Icon name={previewMode ? 'Edit' : 'Play'} size={16} className="mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>

              {selectedScene && !previewMode && (
                <Button
                  variant={isAddingHotspot ? 'default' : 'outline'}
                  onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                  className={isAddingHotspot 
                    ? 'bg-neon-magenta text-white' 
                    : 'neon-border text-neon-magenta border-neon-magenta hover:bg-neon-magenta hover:text-black'
                  }
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Hotspot
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={exportTour}
                disabled={currentTour.scenes.length === 0}
                className="bg-neon-green text-black hover:bg-neon-green/80"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Export Tour
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-black">
          {selectedScene && currentScene ? (
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover ${isAddingHotspot ? 'cursor-crosshair' : 'cursor-default'}`}
                onClick={handleCanvasClick}
                style={{
                  backgroundImage: `url(${currentScene.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Hotspots */}
              {currentScene.hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="absolute group"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-8 h-8 bg-neon-cyan rounded-full animate-pulse cursor-pointer flex items-center justify-center relative">
                    <Icon name={hotspot.icon} size={16} className="text-black" />
                    
                    {!previewMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHotspot(selectedScene, hotspot.id)}
                        className="absolute -top-2 -right-2 w-4 h-4 p-0 bg-red-500 border-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon name="X" size={8} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 glass-effect p-2 rounded-lg min-w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-semibold">{hotspot.title}</p>
                    {hotspot.description && (
                      <p className="text-gray-300 text-xs">{hotspot.description}</p>
                    )}
                  </div>
                </div>
              ))}

              {isAddingHotspot && (
                <div className="absolute bottom-4 left-4 glass-effect p-4 rounded-lg">
                  <p className="text-white text-sm mb-2">Click to place hotspot</p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Hotspot title"
                      value={hotspotForm.title}
                      onChange={(e) => setHotspotForm(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-dark-300 border-white/20 text-white text-sm"
                    />
                    <select
                      value={hotspotForm.targetPanorama}
                      onChange={(e) => setHotspotForm(prev => ({ ...prev, targetPanorama: e.target.value }))}
                      className="w-full bg-dark-300 border border-white/20 rounded-md p-2 text-white text-sm"
                    >
                      <option value="">Select target scene</option>
                      {currentTour.scenes
                        .filter(s => s.id !== selectedScene)
                        .map(scene => (
                        <option key={scene.id} value={scene.id}>{scene.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icon name="Image" className="text-gray-400 mx-auto mb-4" size={64} />
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">No Scene Selected</h3>
                <p className="text-gray-400">Select a scene from the sidebar to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}