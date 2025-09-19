import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import PanoramaControls from './panorama/PanoramaControls';
import PanoramaSidebar from './panorama/PanoramaSidebar';
import PanoramaScene from './panorama/PanoramaScene';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    if (!isEditMode || isDragging) return;
    if (hotspots.length >= 4) {
      alert('Максимум 4 hotspot\'а на панораму');
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Используем raycasting для определения точки на сфере
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000));
    
    // Создаем временную сферу для intersection
    const tempGeometry = new THREE.SphereGeometry(500, 60, 40);
    const tempMaterial = new THREE.MeshBasicMaterial();
    const tempSphere = new THREE.Mesh(tempGeometry, tempMaterial);
    
    const intersects = raycaster.intersectObject(tempSphere);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normalizedPoint = point.normalize();
      
      setNewHotspotData({
        x: normalizedPoint.x,
        y: normalizedPoint.y,
        z: normalizedPoint.z,
        title: '',
        targetPanorama: availablePanoramas.length > 0 ? availablePanoramas[0].id : ''
      });
      setIsCreatingHotspot(true);
    }
  }, [isEditMode, isDragging, hotspots.length, availablePanoramas]);

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
        <PanoramaScene
          imageUrl={imageUrl}
          hotspots={hotspots}
          isEditMode={isEditMode}
          isTour={isTour}
          isDragging={isDragging}
          onLoadingChange={setIsLoading}
          onCanvasClick={handleCanvasClick}
          onHotspotClick={handleHotspotClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading panorama...</p>
            </div>
          </div>
        )}

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