import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Hotspot, Panorama, Comment } from './types';
import HotspotCreationModal from './HotspotCreationModal';

interface PanoramaSidebarProps {
  views: number;
  likes: number;
  isTour?: boolean;
  isEditMode?: boolean;
  hotspots: Hotspot[];
  availablePanoramas: Panorama[];
  comments: Comment[];
  newComment: string;
  onCommentChange: (comment: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  onHotspotDelete?: (hotspotId: string) => void;
  // Hotspot creation props
  isCreatingHotspot: boolean;
  newHotspotData: {
    x: number;
    y: number;
    z: number;
    title: string;
    targetPanorama: string;
  } | null;
  onHotspotSave: () => void;
  onHotspotCancel: () => void;
  onHotspotTitleChange: (title: string) => void;
  onHotspotTargetChange: (target: string) => void;
}

export default function PanoramaSidebar({
  views,
  likes,
  isTour = false,
  isEditMode = false,
  hotspots,
  availablePanoramas,
  comments,
  newComment,
  onCommentChange,
  onCommentSubmit,
  onHotspotDelete,
  isCreatingHotspot,
  newHotspotData,
  onHotspotSave,
  onHotspotCancel,
  onHotspotTitleChange,
  onHotspotTargetChange
}: PanoramaSidebarProps) {
  return (
    <div className="w-80 bg-dark-200 border-l border-white/20 flex flex-col">
      {/* Hotspot Creation Modal */}
      <HotspotCreationModal
        isVisible={isCreatingHotspot}
        hotspotData={newHotspotData}
        availablePanoramas={availablePanoramas}
        onSave={onHotspotSave}
        onCancel={onHotspotCancel}
        onTitleChange={onHotspotTitleChange}
        onTargetChange={onHotspotTargetChange}
      />

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
          
          <form onSubmit={onCommentSubmit} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
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
  );
}