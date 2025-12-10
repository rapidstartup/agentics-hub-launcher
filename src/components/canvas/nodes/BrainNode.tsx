import React, { useState, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { Brain, Search, FolderOpen, FileText, Image, Lightbulb, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasNodeData } from '@/types/canvas';
import BaseNode from './BaseNode';

interface BrainItem {
  id: string;
  title: string;
  type: 'knowledge' | 'swipe' | 'asset' | 'template' | 'offer';
  preview?: string;
}

const typeIcons = {
  knowledge: FileText,
  swipe: Lightbulb,
  asset: Image,
  template: FolderOpen,
  offer: Package,
};

const typeColors = {
  knowledge: 'text-blue-500',
  swipe: 'text-amber-500',
  asset: 'text-green-500',
  template: 'text-purple-500',
  offer: 'text-pink-500',
};

const BrainNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CanvasNodeData;
  const [localTitle, setLocalTitle] = useState(nodeData.title || 'Central Brain');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<BrainItem[]>(
    nodeData.metadata?.linkedItems || []
  );
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    nodeData.onTitleChange?.(e.target.value);
  }, [nodeData]);

  const handleRemoveItem = useCallback((itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // In a real implementation, this would fetch from the database
  const mockItems: BrainItem[] = [
    { id: '1', title: 'Brand Guidelines', type: 'knowledge', preview: 'Brand voice and visual identity...' },
    { id: '2', title: 'Competitor Ad - Nike', type: 'swipe', preview: 'Just Do It campaign analysis...' },
    { id: '3', title: 'Product Hero Image', type: 'asset' },
    { id: '4', title: 'Sales Email Template', type: 'template', preview: 'Follow-up email structure...' },
    { id: '5', title: 'Holiday Sale Offer', type: 'offer', preview: '25% off all items...' },
  ];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <BaseNode
      selected={selected}
      onDelete={nodeData.onDelete}
      color="#8b5cf6"
      className="min-w-[320px]"
      headerContent={
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Brain className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
          <Input
            value={localTitle}
            onChange={handleTitleChange}
            className="h-5 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 font-medium truncate"
            placeholder="Brain reference..."
          />
          {selectedItems.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {selectedItems.length} linked
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brain content..."
            className="pl-7 text-xs h-8"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-7 w-full">
            <TabsTrigger value="all" className="text-[10px] flex-1 h-5">All</TabsTrigger>
            <TabsTrigger value="knowledge" className="text-[10px] flex-1 h-5">KB</TabsTrigger>
            <TabsTrigger value="swipe" className="text-[10px] flex-1 h-5">Swipes</TabsTrigger>
            <TabsTrigger value="asset" className="text-[10px] flex-1 h-5">Assets</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-2">
            <ScrollArea className="h-[140px]">
              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = typeIcons[item.type];
                  const isSelected = selectedItems.some(s => s.id === item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveItem(item.id);
                        } else {
                          setSelectedItems(prev => [...prev, item]);
                        }
                      }}
                      className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                        isSelected 
                          ? 'bg-primary/20 border border-primary/50' 
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${typeColors[item.type]}`} />
                        <span className="font-medium truncate">{item.title}</span>
                      </div>
                      {item.preview && (
                        <p className="text-muted-foreground truncate mt-0.5 pl-5">
                          {item.preview}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Selected items summary */}
        {selectedItems.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground mb-1">Linked content:</p>
            <div className="flex flex-wrap gap-1">
              {selectedItems.map((item) => {
                const Icon = typeIcons[item.type];
                return (
                  <Badge 
                    key={item.id} 
                    variant="secondary" 
                    className="text-[10px] h-5 gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Icon className={`h-2.5 w-2.5 ${typeColors[item.type]}`} />
                    {item.title}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default BrainNode;
