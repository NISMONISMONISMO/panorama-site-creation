import { useState, useRef, useEffect } from 'react';

interface SimplePanoramaViewerProps {
  imageUrl: string;
  className?: string;
}

export default function SimplePanoramaViewer({ imageUrl, className = "" }: SimplePanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)), // Ограничиваем вертикальное вращение
      y: prev.y + deltaX * 0.5
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Масштабирование можно добавить позже если нужно
  };

  // Добавляем глобальные обработчики для отслеживания мыши вне контейнера
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setRotation(prev => ({
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5
      }));

      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, lastMousePos]);

  // CSS Transform для имитации 360° просмотра
  const transformStyle = {
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transformStyle: 'preserve-3d' as const,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden bg-black cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ perspective: '1000px' }}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="360° Panorama"
        className="w-full h-full object-cover select-none"
        style={transformStyle}
        draggable={false}
        onLoad={() => console.log('Panorama image loaded')}
        onError={(e) => console.error('Panorama image error:', e)}
      />
      
      {/* Индикатор загрузки */}
      {!imageRef.current && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Загрузка панорамы...</p>
          </div>
        </div>
      )}

      {/* Инструкция по управлению */}
      {!isDragging && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
          Перетаскивайте для просмотра 360°
        </div>
      )}
    </div>
  );
}