import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PanoramaViewer from './PanoramaViewer';
import PanoramaEditor2D from './panorama/PanoramaEditor2D';
import SortableSceneCard from './SortableSceneCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  targetPanorama: string;
  title: string;
  description?: string;
}

interface TourScene {
  id: string;
  panoramaId: string; // ID исходной панорамы для отслеживания
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
  { id: '1', title: 'Winter Mountain Vista', image: 'https://cdn.poehali.dev/files/cef47976-87e8-4184-856f-14af054679bb.png' },
  { id: '2', title: 'Forest Path', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2048&h=1024&fit=crop' },
  { id: '3', title: 'Lake View', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&h=1024&fit=crop' }
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [show2DEditor, setShow2DEditor] = useState(false);
  const [tourUrl, setTourUrl] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Drag & Drop сенсоры
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addScene = (panoramaId: string) => {
    const panorama = samplePanoramas.find(p => p.id === panoramaId);
    if (!panorama) return;

    const newScene: TourScene = {
      id: `scene-${Date.now()}`,
      panoramaId: panoramaId, // Добавляем panoramaId для отслеживания
      title: panorama.title,
      image: panorama.image,
      hotspots: []
    };

    setCurrentTour(prev => {
      const newScenes = [...prev.scenes, newScene];
      return {
        ...prev,
        scenes: newScenes,
        // Если это первая сцена ИЛИ нет стартовой сцены - делаем её стартовой
        startingScene: prev.startingScene || newScene.id
      };
    });
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
        z: 0,
        targetPanorama: hotspotForm.targetPanorama,
        title: hotspotForm.title,
        description: hotspotForm.description
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

  const addHotspot = (hotspot: Omit<Hotspot, 'id'>) => {
    if (!selectedScene) return;
    
    const newHotspot: Hotspot = {
      ...hotspot,
      id: `hotspot-${Date.now()}`
    };
    
    setCurrentTour(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === selectedScene
          ? { ...scene, hotspots: [...scene.hotspots, newHotspot] }
          : scene
      )
    }));
  };

  const deleteHotspot = (hotspotId: string) => {
    if (!selectedScene) return;
    
    setCurrentTour(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === selectedScene
          ? { ...scene, hotspots: scene.hotspots.filter(h => h.id !== hotspotId) }
          : scene
      )
    }));
  };

  const handlePanoramaChange = (sceneId: string) => {
    setSelectedScene(sceneId);
  };

  const openViewer = (editMode = false) => {
    if (editMode) {
      // Для редактирования нужна выбранная сцена
      if (!selectedScene) return;
      setShow2DEditor(true);
    } else {
      // Для просмотра начинаем с первой сцены в порядке (startingScene)
      const startScene = currentTour.startingScene || currentTour.scenes[0]?.id;
      if (!startScene) return;
      
      setSelectedScene(startScene); // Устанавливаем первую сцену как текущую
      setIsEditMode(false);
      setShowViewer(true);
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

  // Функции для 2D редактора
  const handle2DHotspotCreate = (hotspotData: Omit<Hotspot, 'id'>) => {
    if (!selectedScene) return;

    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      ...hotspotData
    };

    setCurrentTour(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === selectedScene
          ? { ...scene, hotspots: [...scene.hotspots, newHotspot] }
          : scene
      )
    }));
  };

  const handle2DHotspotDelete = (hotspotId: string) => {
    if (!selectedScene) return;
    removeHotspot(selectedScene, hotspotId);
  };

  const saveTour = () => {
    // Сохраняем тур в localStorage с правильным порядком сцен
    const tourId = `tour-${Date.now()}`;
    
    // Убеждаемся что стартовая сцена - первая в списке
    const finalTour = {
      ...currentTour,
      id: tourId,
      startingScene: currentTour.scenes[0]?.id || '',
      savedAt: new Date().toISOString()
    };
    
    console.log('Saving tour:', finalTour);
    console.log('Starting scene:', finalTour.startingScene);
    console.log('Scenes order:', finalTour.scenes.map(s => ({ id: s.id, title: s.title })));
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem(`tour_${tourId}`, JSON.stringify(finalTour));
      
      // Сохраняем в список всех туров
      const allTours = JSON.parse(localStorage.getItem('all_tours') || '[]');
      allTours.push({
        id: tourId,
        title: finalTour.title,
        description: finalTour.description,
        scenes: finalTour.scenes.length,
        savedAt: finalTour.savedAt
      });
      localStorage.setItem('all_tours', JSON.stringify(allTours));
      
      const baseUrl = window.location.origin;
      const tourLink = `${baseUrl}/tour/${tourId}`;
      
      setTourUrl(tourLink);
      setShowPublishModal(true);
      
      console.log('Tour saved successfully to localStorage');
      alert('Тур успешно сохранен!');
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Ошибка сохранения тура');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCurrentTour(prev => {
        const oldIndex = prev.scenes.findIndex(scene => scene.id === active.id);
        const newIndex = prev.scenes.findIndex(scene => scene.id === over?.id);

        const newScenes = arrayMove(prev.scenes, oldIndex, newIndex);
        
        // Стартовая сцена всегда первая в списке
        const newStartingScene = newScenes[0]?.id || '';
        
        return {
          ...prev,
          scenes: newScenes,
          startingScene: newStartingScene
        };
      });
    }
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
            <div className="p-4 h-full overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentTour.scenes.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {currentTour.scenes.map((scene) => (
                      <SortableSceneCard
                        key={scene.id}
                        scene={scene}
                        isSelected={selectedScene === scene.id}
                        onClick={() => setSelectedScene(scene.id)}
                        onRemove={() => removeScene(scene.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {currentTour.scenes.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Icon name="Images" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет сцен в туре</p>
                  <p className="text-sm">Добавьте панорамы из вкладки "Add"</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="panoramas" className="flex-1 overflow-hidden">
            <div className="p-4 space-y-3 h-full overflow-y-auto">
              {samplePanoramas.map((panorama) => {
                const isAdded = currentTour.scenes.some(scene => scene.panoramaId === panorama.id);
                
                return (
                  <Card
                    key={panorama.id}
                    className={`glass-effect transition-all cursor-pointer ${
                      isAdded 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-white/20 hover:border-neon-cyan/50'
                    }`}
                    onClick={() => !isAdded && addScene(panorama.id)}
                  >
                    <img
                      src={panorama.image}
                      alt={panorama.title}
                      className="w-full h-20 object-cover rounded-t-lg"
                    />
                    <CardContent className="p-3">
                      <h4 className="text-white font-semibold text-sm">{panorama.title}</h4>
                      <div className="flex items-center justify-center mt-2">
                        {isAdded ? (
                          <Icon name="Check" className="text-green-400" size={16} />
                        ) : (
                          <Icon name="Plus" className="text-neon-cyan" size={16} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
              {/* Просмотр 360° доступен если есть сцены */}
              {currentTour.scenes.length > 0 && (
                <Button
                  onClick={() => openViewer(false)}
                  variant="outline"
                  className="neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black"
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Просмотр 360°
                </Button>
              )}
              
              {/* Редактирование hotspots доступно только для выбранной сцены */}
              {selectedScene && (
                <Button
                  onClick={() => openViewer(true)}
                  className="bg-neon-magenta text-white hover:bg-neon-magenta/80"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Редактировать Hotspots
                </Button>
              )}
              
              <Button
                variant={previewMode ? 'default' : 'outline'}
                onClick={() => setPreviewMode(!previewMode)}
                className={previewMode 
                  ? 'bg-neon-cyan text-black' 
                  : 'neon-border text-white border-white/30 hover:bg-white/10'
                }
              >
                <Icon name={previewMode ? 'Edit' : 'Eye'} size={16} className="mr-2" />
                {previewMode ? 'Старый редактор' : 'Старый просмотр'}
              </Button>

              <Button
                onClick={saveTour}
                disabled={currentTour.scenes.length === 0}
                className="bg-green-600 text-white hover:bg-green-500"
              >
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
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

      {/* 360° Panorama Viewer */}
      {showViewer && selectedScene && currentScene && (
        <PanoramaViewer
          imageUrl={currentScene.image}
          title={currentScene.title}
          author="Конструктор туров"
          views={0}
          likes={0}
          hotspots={currentScene.hotspots}
          onClose={() => {
            setShowViewer(false);
            setIsEditMode(false);
          }}
          isTour={true}
          currentPanoramaId={selectedScene}
          availablePanoramas={currentTour.scenes.map(scene => ({
            id: scene.id,
            title: scene.title,
            imageUrl: scene.image,
            hotspots: scene.hotspots
          }))}
          isEditMode={isEditMode}
          onHotspotAdd={addHotspot}
          onHotspotDelete={deleteHotspot}
          onPanoramaChange={handlePanoramaChange}
        />
      )}

      {/* 2D редактор hotspot'ов */}
      {show2DEditor && selectedScene && (
        <PanoramaEditor2D
          imageUrl={currentTour.scenes.find(s => s.id === selectedScene)?.image || ''}
          hotspots={currentTour.scenes.find(s => s.id === selectedScene)?.hotspots || []}
          availablePanoramas={currentTour.scenes.map(scene => ({
            id: scene.id,
            title: scene.title,
            image: scene.image
          }))}
          onHotspotCreate={handle2DHotspotCreate}
          onHotspotDelete={handle2DHotspotDelete}
          onClose={() => setShow2DEditor(false)}
        />
      )}

      {/* Модальное окно публикации тура */}
      {showPublishModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
          <div className="bg-dark-200 border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-orbitron font-bold text-lg">
                Тур опубликован!
              </h3>
              <Button
                onClick={() => setShowPublishModal(false)}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">
                  Ссылка на тур для посетителей:
                </label>
                <div className="flex">
                  <Input
                    value={tourUrl}
                    readOnly
                    className="bg-dark-300 border-white/20 text-white"
                  />
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tourUrl);
                        alert('Ссылка скопирована!');
                      } catch (err) {
                        console.error('Ошибка копирования:', err);
                        // Fallback для старых браузеров
                        const textArea = document.createElement('textarea');
                        textArea.value = tourUrl;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Ссылка скопирована!');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-2 border-white/30 text-white"
                  >
                    <Icon name="Copy" size={14} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">
                  Код для интеграции на сайт:
                </label>
                <div className="flex">
                  <Input
                    value={`<iframe src="${tourUrl}" width="800" height="600" frameborder="0"></iframe>`}
                    readOnly
                    className="bg-dark-300 border-white/20 text-white text-xs"
                  />
                  <Button
                    onClick={async () => {
                      const embedCode = `<iframe src="${tourUrl}" width="800" height="600" frameborder="0"></iframe>`;
                      try {
                        await navigator.clipboard.writeText(embedCode);
                        alert('Код интеграции скопирован!');
                      } catch (err) {
                        console.error('Ошибка копирования:', err);
                        // Fallback для старых браузеров
                        const textArea = document.createElement('textarea');
                        textArea.value = embedCode;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Код интеграции скопирован!');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-2 border-white/30 text-white"
                  >
                    <Icon name="Copy" size={14} />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => window.open(tourUrl, '_blank')}
                  className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/80"
                >
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  Открыть тур
                </Button>
                <Button
                  onClick={exportTour}
                  variant="outline"
                  className="border-white/30 text-white"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}