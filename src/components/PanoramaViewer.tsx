import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import * as THREE from 'three';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  targetPanorama: string;
  title: string;
  description?: string;
}

interface Panorama {
  id: string;
  title: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

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
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [comments, setComments] = useState([
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

  // Mouse interaction
  const mouseRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([]);

  const createHotspotMesh = useCallback((hotspot: Hotspot) => {
    const geometry = new THREE.SphereGeometry(8, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Позиционируем hotspot на поверхности сферы
    const distance = 480; // Чуть ближе к камере чем сфера панорамы (500)
    mesh.position.set(hotspot.x * distance, hotspot.y * distance, hotspot.z * distance);
    mesh.userData = { hotspot };
    
    return mesh;
  }, []);

  const updateHotspots = useCallback(() => {
    if (!sceneRef.current) return;
    
    // Удаляем старые hotspot'ы
    hotspotMeshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    hotspotMeshesRef.current = [];
    
    // Добавляем новые hotspot'ы
    hotspots.forEach(hotspot => {
      const mesh = createHotspotMesh(hotspot);
      sceneRef.current?.add(mesh);
      hotspotMeshesRef.current.push(mesh);
    });
  }, [hotspots, createHotspotMesh]);

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    if (!isEditMode || !cameraRef.current || !sphereRef.current || isDragging) return;
    if (hotspots.length >= 4) {
      alert('Максимум 4 hotspot\'а на панораму');
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const intersects = raycaster.intersectObject(sphereRef.current);
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
    if (isEditMode || !cameraRef.current) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const intersects = raycaster.intersectObjects(hotspotMeshesRef.current);
    if (intersects.length > 0 && onPanoramaChange) {
      const hotspot = intersects[0].object.userData.hotspot as Hotspot;
      onPanoramaChange(hotspot.targetPanorama);
    }
  }, [isEditMode, onPanoramaChange]);

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

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const raycaster = new THREE.Raycaster();
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);

    // Create sphere for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });

    // Load texture
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading panorama:', error);
        setIsLoading(false);
      }
    );

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Set initial camera position
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 0, 0);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    sphereRef.current = sphere;
    raycasterRef.current = raycaster;

    // Mouse controls
    let phi = 0;
    let theta = 0;
    let mouseDownTime = 0;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
      mouseDownTime = Date.now();
      setIsDragging(true);
      setShowControls(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const deltaX = event.clientX - mouseRef.current.x;
      const deltaY = event.clientY - mouseRef.current.y;

      // Инвертируем управление как в Google Street View
      phi -= deltaX * 0.005; // тащишь вправо - крутит влево
      theta += deltaY * 0.005; // тащишь вниз - поднимает наверх
      
      // Limit vertical rotation
      theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

      // Update camera position
      const x = Math.cos(phi) * Math.cos(theta);
      const y = Math.sin(theta);
      const z = Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(x, y, z);

      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const onMouseUp = (event: MouseEvent) => {
      const clickDuration = Date.now() - mouseDownTime;
      
      isMouseDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => setShowControls(true), 1000);
      
      // Если это был клик (короткое время), а не drag
      if (clickDuration < 200) {
        if (isEditMode) {
          handleCanvasClick(event);
        } else if (isTour) {
          handleHotspotClick(event);
        }
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = Math.max(10, Math.min(120, fov));
      camera.updateProjectionMatrix();
    };

    // Touch controls for mobile
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isMouseDownRef.current = true;
        mouseRef.current.x = event.touches[0].clientX;
        mouseRef.current.y = event.touches[0].clientY;
        mouseDownTime = Date.now();
        setIsDragging(true);
        setShowControls(false);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isMouseDownRef.current || event.touches.length !== 1) return;
      event.preventDefault();

      const deltaX = event.touches[0].clientX - mouseRef.current.x;
      const deltaY = event.touches[0].clientY - mouseRef.current.y;

      // Инвертируем управление как в Google Street View для touch
      phi -= deltaX * 0.005; // тащишь вправо - крутит влево
      theta += deltaY * 0.005; // тащишь вниз - поднимает наверх
      
      theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

      const x = Math.cos(phi) * Math.cos(theta);
      const y = Math.sin(theta);
      const z = Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(x, y, z);

      mouseRef.current.x = event.touches[0].clientX;
      mouseRef.current.y = event.touches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const clickDuration = Date.now() - mouseDownTime;
      
      isMouseDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => setShowControls(true), 1000);
      
      // Touch click handling
      if (clickDuration < 200 && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const mockEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: event.target
        } as MouseEvent;
        
        if (isEditMode) {
          handleCanvasClick(mockEvent);
        } else if (isTour) {
          handleHotspotClick(mockEvent);
        }
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [imageUrl, isEditMode, isTour, handleCanvasClick, handleHotspotClick]);

  // Update hotspots when they change
  useEffect(() => {
    updateHotspots();
  }, [hotspots, updateHotspots]);

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
      cameraRef.current.lookAt(1, 0, 0);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
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
        <div ref={mountRef} className="w-full h-full" />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading panorama...</p>
            </div>
          </div>
        )}

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <div className="absolute top-20 left-4 glass-effect px-4 py-2 rounded-lg">
            <p className="text-neon-cyan font-semibold">🔧 Режим редактирования</p>
            <p className="text-sm text-gray-300">Кликните на панораму чтобы добавить hotspot</p>
            <p className="text-xs text-gray-400">Максимум 4 hotspot'а на панораму ({hotspots.length}/4)</p>
          </div>
        )}

        {/* Tour Mode Instructions */}
        {isTour && !isEditMode && (
          <div className="absolute top-20 left-4 glass-effect px-4 py-2 rounded-lg">
            <p className="text-neon-green font-semibold">🎯 Режим тура</p>
            <p className="text-sm text-gray-300">Кликните на светящиеся точки для перехода</p>
          </div>
        )}

        {/* Top Controls */}
        <div className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="neon-border text-white border-white/30 hover:bg-white/10"
              >
                <Icon name="X" size={16} className="mr-2" />
                Close
              </Button>
              <div className="glass-effect px-4 py-2 rounded-lg">
                <h3 className="text-lg font-orbitron font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-300">by {author}</p>
              </div>
              {premium && (
                <Badge className="bg-neon-magenta text-white">Premium</Badge>
              )}
              {isTour && (
                <Badge className="bg-neon-green text-white">Тур</Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLike}
                className="neon-border text-neon-magenta border-neon-magenta hover:bg-neon-magenta hover:text-black"
              >
                <Icon name="Heart" size={16} className="mr-2" />
                {likes}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="neon-border text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-black"
              >
                <Icon name="Share2" size={16} className="mr-2" />
                Share
              </Button>
              {onEmbed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEmbed}
                  className="neon-border text-neon-green border-neon-green hover:bg-neon-green hover:text-black"
                >
                  <Icon name="Code" size={16} className="mr-2" />
                  Embed
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`absolute bottom-4 left-4 glass-effect px-4 py-2 rounded-lg transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm text-gray-300">
            <Icon name="MousePointer" size={16} className="inline mr-2" />
            Drag to look around • Scroll to zoom
          </p>
          <p className="text-xs text-gray-400 mt-1">
            <Icon name="Eye" size={12} className="inline mr-1" />
            {views.toLocaleString()} views
          </p>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-dark-200 border-l border-white/20 flex flex-col">
        {/* Hotspot Creation Modal */}
        {isCreatingHotspot && newHotspotData && (
          <div className="p-4 border-b border-white/20 bg-dark-300">
            <h4 className="text-white font-orbitron font-bold mb-4">Создать Hotspot</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-gray-300 text-sm block mb-1">Название (необязательно)</label>
                <Input
                  value={newHotspotData.title}
                  onChange={(e) => setNewHotspotData(prev => prev ? {...prev, title: e.target.value} : null)}
                  placeholder="Название hotspot'а..."
                  className="bg-dark-200 border-white/20 text-white"
                />
              </div>
              
              <div>
                <label className="text-gray-300 text-sm block mb-1">Переход к панораме</label>
                <Select
                  value={newHotspotData.targetPanorama}
                  onValueChange={(value) => setNewHotspotData(prev => prev ? {...prev, targetPanorama: value} : null)}
                >
                  <SelectTrigger className="bg-dark-200 border-white/20 text-white">
                    <SelectValue placeholder="Выберите панораму" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePanoramas.map(panorama => (
                      <SelectItem key={panorama.id} value={panorama.id}>
                        {panorama.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={saveHotspot}
                  className="flex-1 bg-neon-green text-black hover:bg-neon-green/80"
                  disabled={!newHotspotData.targetPanorama}
                >
                  <Icon name="Check" size={14} className="mr-2" />
                  Создать
                </Button>
                <Button
                  onClick={cancelHotspot}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  <Icon name="X" size={14} className="mr-2" />
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hotspots List */}
        {isTour && hotspots.length > 0 && (
          <div className="p-4 border-b border-white/20">
            <h4 className="text-white font-orbitron font-bold mb-4">
              Hotspots ({hotspots.length}/4)
            </h4>
            <div className="space-y-2">
              {hotspots.map((hotspot, index) => {
                const targetPanorama = availablePanoramas.find(p => p.id === hotspot.targetPanorama);
                return (
                  <div key={hotspot.id} className="glass-effect p-3 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-neon-cyan font-semibold text-sm">
                        {hotspot.title || `Hotspot ${index + 1}`}
                      </p>
                      <p className="text-gray-400 text-xs">
                        → {targetPanorama?.title || 'Неизвестная панорама'}
                      </p>
                    </div>
                    {isEditMode && onHotspotDelete && (
                      <Button
                        onClick={() => onHotspotDelete(hotspot.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Views</span>
            <span className="text-white font-semibold">{views.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Likes</span>
            <span className="text-white font-semibold">{likes}</span>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/20">
            <h4 className="text-white font-orbitron font-bold mb-4">Comments</h4>
            
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full h-20 bg-dark-300 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
              />
              <Button
                type="submit"
                size="sm"
                className="mt-2 bg-neon-cyan text-black hover:bg-neon-cyan/80"
                disabled={!newComment.trim()}
              >
                <Icon name="Send" size={14} className="mr-2" />
                Post
              </Button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="glass-effect border-white/20 p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-neon-cyan font-semibold text-sm">{comment.author}</span>
                  <span className="text-gray-400 text-xs">{comment.time}</span>
                </div>
                <p className="text-gray-300 text-sm">{comment.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}