import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Panorama } from './types';

interface HotspotCreationModalProps {
  isVisible: boolean;
  hotspotData: {
    x: number;
    y: number;
    z: number;
    title: string;
    targetPanorama: string;
  } | null;
  availablePanoramas: Panorama[];
  onSave: () => void;
  onCancel: () => void;
  onTitleChange: (title: string) => void;
  onTargetChange: (target: string) => void;
}

export default function HotspotCreationModal({
  isVisible,
  hotspotData,
  availablePanoramas,
  onSave,
  onCancel,
  onTitleChange,
  onTargetChange
}: HotspotCreationModalProps) {
  console.log('HotspotCreationModal render:', { isVisible, hotspotData, availablePanoramas: availablePanoramas.length });
  
  if (!isVisible || !hotspotData) {
    console.log('HotspotCreationModal: not visible or no data');
    return null;
  }

  return (
    <div className="p-4 border-b border-white/20 bg-dark-300">
      <h4 className="text-white font-orbitron font-bold mb-4">Создать Hotspot</h4>
      
      <div className="space-y-3">
        <div>
          <label className="text-gray-300 text-sm block mb-1">Название (необязательно)</label>
          <Input
            value={hotspotData.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Название hotspot'а..."
            className="bg-dark-200 border-white/20 text-white"
          />
        </div>
        
        <div>
          <label className="text-gray-300 text-sm block mb-1">Переход к панораме</label>
          <Select
            value={hotspotData.targetPanorama}
            onValueChange={onTargetChange}
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
            onClick={onSave}
            className="flex-1 bg-neon-green text-black hover:bg-neon-green/80"
            disabled={!hotspotData.targetPanorama}
          >
            <Icon name="Check" size={14} className="mr-2" />
            Создать
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            <Icon name="X" size={14} className="mr-2" />
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}