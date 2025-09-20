import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Hotspot } from './types';

interface Panorama {
  id: string;
  title: string;
  image: string;
}

interface PanoramaEditor2DProps {
  imageUrl: string;
  hotspots: Hotspot[];
  availablePanoramas: Panorama[];
  onHotspotCreate: (hotspot: Omit<Hotspot, 'id'>) => void;
  onHotspotDelete: (id: string) => void;
  onClose: () => void;
}

export default function PanoramaEditor2D({
  imageUrl,
  hotspots,
  availablePanoramas,
  onHotspotCreate,
  onHotspotDelete,
  onClose
}: PanoramaEditor2DProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createPosition, setCreatePosition] = useState({ x: 0, y: 0 });
  const [hotspotTitle, setHotspotTitle] = useState('');
  const [targetPanorama, setTargetPanorama] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (hotspots.length >= 4) {
      alert('Максимум 4 hotspot\'а на панораму');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCreatePosition({ x, y });
    setShowCreateMenu(true);
    setHotspotTitle('');
    setTargetPanorama(availablePanoramas.length > 0 ? availablePanoramas[0].id : '');
  };

  // Конвертация 2D координат (проценты) в 3D координаты (сферические)
  const convert2DTo3D = (xPercent: number, yPercent: number) => {
    // Преобразуем проценты в углы
    // Горизонтальный угол (phi): 0% = -π, 100% = π
    const phi = (xPercent / 100) * 2 * Math.PI - Math.PI;
    
    // Вертикальный угол (theta): 0% = π/2, 100% = -π/2
    const theta = Math.PI / 2 - (yPercent / 100) * Math.PI;
    
    // Преобразуем сферические координаты в декартовы
    const x = Math.cos(theta) * Math.cos(phi);
    const y = Math.sin(theta);
    const z = Math.cos(theta) * Math.sin(phi);
    
    return { x, y, z };
  };
  
  // Конвертация 3D координат обратно в 2D проценты
  const convert3DTo2D = (x: number, y: number, z: number) => {
    // Преобразуем декартовы координаты в сферические
    const phi = Math.atan2(z, x);
    const theta = Math.asin(y);
    
    // Преобразуем углы в проценты
    const xPercent = ((phi + Math.PI) / (2 * Math.PI)) * 100;
    const yPercent = ((Math.PI / 2 - theta) / Math.PI) * 100;
    
    return { x: xPercent, y: yPercent };
  };

  const handleCreateHotspot = () => {
    if (!targetPanorama) return;

    // Конвертируем 2D координаты в 3D
    const position3D = convert2DTo3D(createPosition.x, createPosition.y);
    
    console.log('Creating hotspot:');
    console.log('2D position:', createPosition);
    console.log('3D position:', position3D);

    onHotspotCreate({
      x: position3D.x,
      y: position3D.y,
      z: position3D.z,
      title: hotspotTitle || `Hotspot ${hotspots.length + 1}`,
      targetPanorama,
    });

    setShowCreateMenu(false);
    setHotspotTitle('');
  };

  const handleCancelCreate = () => {
    setShowCreateMenu(false);
    setHotspotTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Верхняя панель */}
      <div className="bg-dark-200 border-b border-white/20 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-orbitron font-bold text-lg">
            Редактирование Hotspot'ов
          </h2>
          <div className="bg-neon-cyan/20 text-neon-cyan px-3 py-1 rounded-full text-sm">
            {hotspots.length}/4 hotspot'ов
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="neon-border text-white border-white/30"
        >
          <Icon name="X" size={16} className="mr-2" />
          Готово
        </Button>
      </div>

      {/* Основная область редактирования */}
      <div className="flex-1 relative overflow-hidden">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Panorama"
          className="w-full h-full object-cover cursor-crosshair"
          onClick={handleImageClick}
        />

        {/* Существующие hotspot'ы */}
        {hotspots.map((hotspot) => {
          // Конвертируем 3D координаты в 2D для отображения
          const position2D = typeof hotspot.x === 'number' && hotspot.x > 1 
            ? { x: hotspot.x, y: hotspot.y } // Уже в процентах
            : convert3DTo2D(hotspot.x, hotspot.y, hotspot.z); // Конвертируем из 3D
            
          return (
            <div
              key={hotspot.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${position2D.x}%`,
                top: `${position2D.y}%`,
              }}
          >
            {/* Hotspot marker */}
            <div className="w-8 h-8 bg-neon-cyan rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse">
              <div className="w-full h-full bg-neon-cyan/30 rounded-full flex items-center justify-center">
                <Icon name="ArrowRight" size={16} className="text-black" />
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-dark-300 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 min-w-max">
              <p className="font-semibold text-sm">{hotspot.title}</p>
              <p className="text-xs text-gray-400">
                → {availablePanoramas.find(p => p.id === hotspot.targetPanorama)?.title || 'Неизвестная панорама'}
              </p>
              <Button
                onClick={() => onHotspotDelete(hotspot.id)}
                size="sm"
                variant="ghost"
                className="mt-1 text-red-400 hover:text-red-300 p-1 h-auto"
              >
                <Icon name="Trash2" size={12} />
              </Button>
            </div>
          </div>
        );
        })}

        {/* Меню создания hotspot'а */}
        {showCreateMenu && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${createPosition.x}%`,
              top: `${createPosition.y}%`,
            }}
          >
            {/* Временный маркер */}
            <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse mb-2" />

            {/* Форма создания */}
            <div className="bg-dark-300 border border-white/20 rounded-lg p-4 min-w-[300px] shadow-xl">
              <h3 className="text-white font-semibold mb-3">Создать Hotspot</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Название (опционально)
                  </label>
                  <Input
                    value={hotspotTitle}
                    onChange={(e) => setHotspotTitle(e.target.value)}
                    placeholder="Название hotspot'а"
                    className="bg-dark-200 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Переход к сцене *
                  </label>
                  <Select value={targetPanorama} onValueChange={setTargetPanorama}>
                    <SelectTrigger className="bg-dark-200 border-white/20 text-white">
                      <SelectValue placeholder="Выберите сцену" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-300 border-white/20">
                      {availablePanoramas.map((panorama) => (
                        <SelectItem 
                          key={panorama.id} 
                          value={panorama.id}
                          className="text-white hover:bg-dark-200"
                        >
                          {panorama.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={handleCreateHotspot}
                    disabled={!targetPanorama}
                    className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/80"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать
                  </Button>
                  <Button
                    onClick={handleCancelCreate}
                    variant="outline"
                    className="border-white/30 text-white"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Инструкция */}
        {hotspots.length === 0 && !showCreateMenu && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-dark-300/90 text-white px-6 py-4 rounded-lg text-center">
              <Icon name="MousePointer" size={32} className="mx-auto mb-2 text-neon-cyan" />
              <p className="font-semibold">Кликните на изображение</p>
              <p className="text-sm text-gray-400">чтобы создать hotspot</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}