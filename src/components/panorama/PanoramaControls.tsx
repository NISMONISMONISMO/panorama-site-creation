import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface PanoramaControlsProps {
  title: string;
  author: string;
  premium?: boolean;
  isTour?: boolean;
  isEditMode?: boolean;
  showControls: boolean;
  onClose: () => void;
  onReset: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onEmbed?: () => void;
  likes: number;
  views: number;
}

export default function PanoramaControls({
  title,
  author,
  premium = false,
  isTour = false,
  isEditMode = false,
  showControls,
  onClose,
  onReset,
  onLike,
  onShare,
  onEmbed,
  likes,
  views
}: PanoramaControlsProps) {
  return (
    <>
      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className="absolute top-20 left-4 glass-effect px-4 py-2 rounded-lg">
          <p className="text-neon-cyan font-semibold">🔧 Режим редактирования</p>
          <p className="text-sm text-gray-300">Кликните на панораму чтобы добавить hotspot</p>
          <p className="text-xs text-gray-400">Максимум 4 hotspot'а на панораму</p>
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
              onClick={onReset}
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
    </>
  );
}