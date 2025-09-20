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
    const loadTour = async () => {
      try {
        if (!tourId) {
          console.error('No tour ID provided');
          setLoading(false);
          return;
        }
        
        console.log('Loading tour:', tourId);
        
        // Пытаемся загрузить тур из localStorage
        const tourData = localStorage.getItem(`tour_${tourId}`);
        
        if (tourData) {
          const parsedTour: Tour = JSON.parse(tourData);
          console.log('Loaded tour from localStorage:', parsedTour);
          console.log('Starting scene should be:', parsedTour.startingScene);
          console.log('All scenes:', parsedTour.scenes.map(s => ({ id: s.id, title: s.title })));
          console.log('Hotspots in loaded tour:', parsedTour.scenes.map(s => ({
            scene: s.title,
            hotspotsCount: s.hotspots.length,
            hotspots: s.hotspots.map(h => ({ title: h.title, target: h.targetPanorama }))
          })));
          
          setTour(parsedTour);
          // Убеждаемся что стартовая сцена правильная
          const startingSceneId = parsedTour.startingScene || parsedTour.scenes[0]?.id;
          setCurrentSceneId(startingSceneId);
          
          console.log('Current scene set to:', startingSceneId);
        } else {
          console.warn('Tour not found in localStorage, loading demo tour');
          
          // Если тур не найден, показываем демо тур
          const demoTour: Tour = {
            id: tourId,
            title: 'Демо Тур',
            description: 'Этот тур не найден. Показываем демонстрационный тур.',
            scenes: [
              {
                id: 'demo-scene-1',
                panoramaId: 'demo-panorama-1',
                title: 'Демо Сцена 1',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&h=1024&fit=crop',
                hotspots: []
              },
              {
                id: 'demo-scene-2',
                panoramaId: 'demo-panorama-2',
                title: 'Демо Сцена 2',
                image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=2048&h=1024&fit=crop',
                hotspots: []
              }
            ],
            startingScene: 'demo-scene-1'
          };
          
          setTour(demoTour);
          setCurrentSceneId(demoTour.startingScene);
        }
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
  
  console.log('TourViewer: Current scene:', currentScene.title);
  console.log('TourViewer: Current scene hotspots:', currentScene.hotspots);
  console.log('TourViewer: Hotspots count:', currentScene.hotspots.length);

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