import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface TourScene {
  id: string;
  panoramaId: string;
  title: string;
  image: string;
  hotspots: any[];
}

interface SortableSceneCardProps {
  scene: TourScene;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
}

export default function SortableSceneCard({ scene, isSelected, onClick, onRemove }: SortableSceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-neon-cyan/50 bg-neon-cyan/10'
          : 'glass-effect border-white/20 hover:border-white/40'
      } ${isDragging ? 'shadow-2xl scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={scene.image}
          alt={scene.title}
          className="w-full h-16 object-cover rounded-t-lg"
        />
        
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing"
        >
          <Icon name="GripVertical" size={12} className="text-white" />
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-white font-semibold text-sm truncate">{scene.title}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {scene.hotspots.length} hotspots
              </Badge>
            </div>
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 p-1"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}