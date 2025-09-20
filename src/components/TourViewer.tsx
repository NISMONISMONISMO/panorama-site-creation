import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PanoramaViewer from './PanoramaViewer';

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
  panoramaId: string;
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

export default function TourViewer() {
  const { tourId } = useParams<{ tourId: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // В реальном приложении здесь был бы API вызов для загрузки тура
    // Пока симулируем загрузку демо тура
    const loadTour = async () => {
      try {
        // Симулируем загрузку
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Демо тур
        const demoTour: Tour = {
          id: tourId || 'demo',
          title: 'Демо Тур',
          description: 'Это демонстрационный 360° тур',
          scenes: [
            {
              id: 'scene-1',
              panoramaId: 'panorama-1',
              title: 'Сцена 1',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&h=1024&fit=crop',
              hotspots: []
            },
            {
              id: 'scene-2',
              panoramaId: 'panorama-2',
              title: 'Сцена 2',
              image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=2048&h=1024&fit=crop',
              hotspots: []
            }
          ],
          startingScene: 'scene-1'
        };
        
        setTour(demoTour);
        setCurrentSceneId(demoTour.startingScene);
        console.log('Tour set:', demoTour);
        console.log('Starting scene ID set:', demoTour.startingScene);
      } catch (error) {
        console.error('Ошибка загрузки тура:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [tourId]);

  const handleSceneChange = (sceneId: string) => {
    setCurrentSceneId(sceneId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Загрузка тура...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Тур не найден</p>
          <p className="text-gray-400">Проверьте правильность ссылки</p>
        </div>
      </div>
    );
  }

  const currentScene = tour.scenes.find(s => s.id === currentSceneId);
  if (!currentScene) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Ошибка загрузки сцены</p>
        </div>
      </div>
    );
  }

  return (
    <PanoramaViewer
      imageUrl={currentScene.image}
      title={currentScene.title}
      author="Создатель тура"
      views={Math.floor(Math.random() * 1000)}
      likes={Math.floor(Math.random() * 100)}
      hotspots={currentScene.hotspots}
      onClose={() => window.history.back()}
      isTour={true}
      currentPanoramaId={currentSceneId}
      availablePanoramas={tour.scenes.map(scene => ({
        id: scene.id,
        title: scene.title,
        imageUrl: scene.image,
        hotspots: scene.hotspots
      }))}
      isEditMode={false}
      onPanoramaChange={handleSceneChange}
    />
  );
}