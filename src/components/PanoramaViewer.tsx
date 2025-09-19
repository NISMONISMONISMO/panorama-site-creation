import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [comments, setComments] = useState([
    { id: '1', author: 'VR_Explorer', text: 'Amazing view! The detail is incredible.', time: '2 hours ago' },
    { id: '2', author: 'TechVisionary', text: 'Perfect for my virtual office tour project.', time: '5 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      drawPanorama();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (image) {
      drawPanorama();
    }
  }, [rotation, zoom, image]);

  const drawPanorama = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation.y * Math.PI) / 180);
    
    const imageWidth = image.width * 0.5;
    const imageHeight = image.height * 0.5;
    
    ctx.drawImage(
      image,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    );
    
    ctx.restore();
  }, [image, rotation, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
    setShowControls(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));

    setLastMouse({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMouse]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setShowControls(true);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * zoomDelta)));
  }, []);

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawPanorama();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawPanorama]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex">
      {/* Main Viewer */}
      <div className="flex-1 relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Hotspots */}
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="absolute w-8 h-8 bg-neon-cyan rounded-full animate-pulse cursor-pointer flex items-center justify-center"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            title={hotspot.title}
          >
            <Icon name="Navigation" size={16} className="text-black" />
          </div>
        ))}

        {/* Top Controls */}
        <div className={`absolute top-4 left-4 right-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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

        {/* Zoom Controls */}
        <div className={`absolute bottom-4 right-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="glass-effect rounded-lg p-2 flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
              className="neon-border text-white border-white/30 hover:bg-white/10"
            >
              <Icon name="Plus" size={16} />
            </Button>
            <div className="text-center text-white text-sm font-mono">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
              className="neon-border text-white border-white/30 hover:bg-white/10"
            >
              <Icon name="Minus" size={16} />
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className={`absolute bottom-4 left-4 glass-effect px-4 py-2 rounded-lg transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm text-gray-300">
            <Icon name="Mouse" size={16} className="inline mr-2" />
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