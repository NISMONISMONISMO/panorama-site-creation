import { useRef, useState, useCallback } from 'react';
import PanoramaControls from './panorama/PanoramaControls';
import PanoramaSidebar from './panorama/PanoramaSidebar';
import SimplePanoramaViewer from './panorama/SimplePanoramaViewer';
import { Hotspot, Panorama, Comment } from './panorama/types';

interface PanoramaViewerProps {
  imageUrl: string;
  title: string;
  author: string;
  views: number;
  likes: number;
  hotspots?: Hotspot[];
  onClose: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onEmbed?: () => void;
  premium?: boolean;
  // Новые пропсы для туров
  isTour?: boolean;
  currentPanoramaId?: string;
  availablePanoramas?: Panorama[];
  isEditMode?: boolean;
  onHotspotAdd?: (hotspot: Omit<Hotspot, 'id'>) => void;
  onHotspotDelete?: (hotspotId: string) => void;
  onPanoramaChange?: (panoramaId: string) => void;
}

export default function PanoramaViewer({
  imageUrl,
  title,
  author,
  views,
  likes,
  hotspots = [],
  onClose,
  onLike,
  onShare,
  onEmbed,
  premium = false,
  isTour = false,
  currentPanoramaId,
  availablePanoramas = [],
  isEditMode = false,
  onHotspotAdd,
  onHotspotDelete,
  onPanoramaChange
}: PanoramaViewerProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', author: 'VR_Explorer', text: 'Amazing view! The detail is incredible.', time: '2 hours ago' },
    { id: '2', author: 'TechVisionary', text: 'Perfect for my virtual office tour project.', time: '5 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');
  
  // Состояние для создания hotspot'ов
  const [isCreatingHotspot, setIsCreatingHotspot] = useState(false);
  const [newHotspotData, setNewHotspotData] = useState<{
    x: number;
    y: number;
    z: number;
    title: string;
    targetPanorama: string;
  } | null>(null);

  const handleHotspotCreate = useCallback((position: { x: number; y: number; z: number }) => {
    console.log('PanoramaViewer: handleHotspotCreate called', { position, isEditMode, hotspotsLength: hotspots.length });
    
    if (!isEditMode) {
      console.log('PanoramaViewer: Not in edit mode');
      return;
    }
    
    if (hotspots.length >= 4) {
      console.log('PanoramaViewer: Too many hotspots');
      return;
    }

    console.log('PanoramaViewer: Creating hotspot data');
    setNewHotspotData({
      ...position,
      title: '',
      targetPanorama: availablePanoramas.length > 0 ? availablePanoramas[0].id : ''
    });
    setIsCreatingHotspot(true);
    console.log('PanoramaViewer: Hotspot creation modal should open');
  }, [isEditMode, hotspots.length, availablePanoramas]);

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    // Этот коллбэк больше не нужен для создания hotspot'ов
    console.log('Canvas clicked');
  }, []);

  const handleHotspotClick = useCallback((event: MouseEvent) => {
    if (isEditMode || !onPanoramaChange) return;

    // Здесь нужно будет реализовать определение клика по hotspot'у
    // Пока что просто заглушка
    console.log('Hotspot clicked');
  }, [isEditMode, onPanoramaChange]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setShowControls(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => setShowControls(true), 1000);
  }, []);

  const resetView = useCallback(() => {
    // Reset будет вызван через ref в PanoramaScene
    if (sceneRef.current) {
      const resetFn = (sceneRef.current as any).resetView;
      if (resetFn) resetFn();
    }
  }, []);

  const saveHotspot = () => {
    if (!newHotspotData || !onHotspotAdd) return;
    
    onHotspotAdd({
      ...newHotspotData,
      description: ''
    });
    
    setNewHotspotData(null);
    setIsCreatingHotspot(false);
  };

  const cancelHotspot = () => {
    setNewHotspotData(null);
    setIsCreatingHotspot(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        text: newComment.trim(),
        time: 'Just now'
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex">
      {/* Main Viewer */}
      <div className="flex-1 relative">
        <SimplePanoramaViewer 
          imageUrl={imageUrl}
          className="w-full h-full"
        />

        {/* Hotspots overlay - только для просмотра, не для редактирования */}
        {!isEditMode && hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
            }}
          >
            <div 
              className="w-6 h-6 bg-neon-cyan rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse hover:scale-110 transition-transform"
              onClick={() => onPanoramaChange && onPanoramaChange(hotspot.targetPanorama)}
              title={hotspot.title}
            />
          </div>
        ))}

        <PanoramaControls
          title={title}
          author={author}
          premium={premium}
          isTour={isTour}
          isEditMode={isEditMode}
          showControls={showControls}
          onClose={onClose}
          onReset={resetView}
          onLike={onLike}
          onShare={onShare}
          onEmbed={onEmbed}
          likes={likes}
          views={views}
        />
      </div>

      {/* Side Panel */}
      <PanoramaSidebar
        views={views}
        likes={likes}
        isTour={isTour}
        isEditMode={isEditMode}
        hotspots={hotspots}
        availablePanoramas={availablePanoramas}
        comments={comments}
        newComment={newComment}
        onCommentChange={setNewComment}
        onCommentSubmit={handleCommentSubmit}
        onHotspotDelete={onHotspotDelete}
        isCreatingHotspot={isCreatingHotspot}
        newHotspotData={newHotspotData}
        onHotspotSave={saveHotspot}
        onHotspotCancel={cancelHotspot}
        onHotspotTitleChange={(title) => setNewHotspotData(prev => prev ? {...prev, title} : null)}
        onHotspotTargetChange={(target) => setNewHotspotData(prev => prev ? {...prev, targetPanorama: target} : null)}
      />
    </div>
  );
}