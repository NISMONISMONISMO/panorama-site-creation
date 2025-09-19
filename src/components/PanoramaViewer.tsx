import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import * as THREE from 'three';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  targetPanorama: string;
  title: string;
  description?: string;
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
  premium = false
}: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [comments, setComments] = useState([
    { id: '1', author: 'VR_Explorer', text: 'Amazing view! The detail is incredible.', time: '2 hours ago' },
    { id: '2', author: 'TechVisionary', text: 'Perfect for my virtual office tour project.', time: '5 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Mouse interaction
  const mouseRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
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

    // Mouse controls
    let phi = 0;
    let theta = 0;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
      setIsDragging(true);
      setShowControls(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const deltaX = event.clientX - mouseRef.current.x;
      const deltaY = event.clientY - mouseRef.current.y;

      phi += deltaX * 0.005;
      theta -= deltaY * 0.005;
      
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

    const onMouseUp = () => {
      isMouseDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => setShowControls(true), 1000);
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
        setIsDragging(true);
        setShowControls(false);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isMouseDownRef.current || event.touches.length !== 1) return;
      event.preventDefault();

      const deltaX = event.touches[0].clientX - mouseRef.current.x;
      const deltaY = event.touches[0].clientY - mouseRef.current.y;

      phi += deltaX * 0.005;
      theta -= deltaY * 0.005;
      
      theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

      const x = Math.cos(phi) * Math.cos(theta);
      const y = Math.sin(theta);
      const z = Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(x, y, z);

      mouseRef.current.x = event.touches[0].clientX;
      mouseRef.current.y = event.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isMouseDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => setShowControls(true), 1000);
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
  }, [imageUrl]);

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