import React, { useState, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CanvasNodeData } from '@/types/canvas';
import BaseNode from './BaseNode';

const GROUP_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

const GroupNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CanvasNodeData;
  const [localTitle, setLocalTitle] = useState(nodeData.title || 'Group');
  const [isExpanded, setIsExpanded] = useState(true);
  const [color, setColor] = useState(nodeData.color || GROUP_COLORS[0].value);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    nodeData.onTitleChange?.(e.target.value);
  }, [nodeData]);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    nodeData.onContentChange?.(newColor);
  }, [nodeData]);

  return (
    <BaseNode
      selected={selected}
      onDelete={nodeData.onDelete}
      color={color}
      showSourceHandle={true}
      showTargetHandle={true}
      className="min-w-[300px]"
      headerContent={
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </Button>
          <Folder className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
          <Input
            value={localTitle}
            onChange={handleTitleChange}
            className="h-5 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 font-medium truncate"
            placeholder="Group name..."
          />
        </div>
      }
    >
      {isExpanded && (
        <div className="space-y-3">
          {/* Color selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Color:</span>
            <div className="flex gap-1">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleColorChange(c.value)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    color === c.value ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Drop zone for child nodes */}
          <div
            className="min-h-[100px] rounded-md border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: color + '40', backgroundColor: color + '10' }}
          >
            <p className="text-xs text-muted-foreground text-center px-4">
              Drag nodes here to group them together.
              <br />
              Connected as a unit to other nodes.
            </p>
          </div>

          {/* Child count indicator */}
          <div className="text-xs text-muted-foreground text-center">
            {nodeData.metadata?.childCount || 0} items in group
          </div>
        </div>
      )}
    </BaseNode>
  );
};

export default GroupNode;
