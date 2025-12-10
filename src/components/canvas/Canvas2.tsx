import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { CanvasToolbar } from './toolbar/CanvasToolbar';
import CentralBrainPanel from './CentralBrainPanel';
import { useCanvasBlocks } from '@/hooks/useCanvasBlocks';
import { useCanvasEdges } from '@/hooks/useCanvasEdges';
import { useCanvasHistory } from '@/hooks/useCanvasHistory';
import { CanvasBlock, CanvasBlockType, blockToNode, edgeToReactFlowEdge } from '@/types/canvas';
import { toast } from 'sonner';

interface Canvas2Props {
  projectId: string;
}

type CanvasNode = Node<any>;

const Canvas2Inner: React.FC<Canvas2Props> = ({ projectId }) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [brainPanelOpen, setBrainPanelOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  // Database hooks
  const {
    blocks,
    isLoading: blocksLoading,
    createBlock,
    updateBlock,
    deleteBlock,
    updatePositions,
  } = useCanvasBlocks(projectId);

  const {
    edges: dbEdges,
    isLoading: edgesLoading,
    createEdge,
    deleteEdge,
  } = useCanvasEdges(projectId);

  // Get blocks connected to a target node (for ChatNode context)
  const getConnectedBlocks = useCallback((targetId: string): CanvasBlock[] => {
    const incomingEdgeIds = dbEdges
      .filter(e => e.target_block_id === targetId)
      .map(e => e.source_block_id);
    return blocks.filter(b => incomingEdgeIds.includes(b.id));
  }, [blocks, dbEdges]);

  // Handle node deletion
  const handleDeleteNode = useCallback(async (nodeId: string) => {
    try {
      await deleteBlock.mutateAsync(nodeId);
    } catch (err) {
      toast.error('Failed to delete node');
    }
  }, [deleteBlock]);

  // Convert DB data to ReactFlow format
  const initialNodes = useMemo((): CanvasNode[] => {
    return blocks.map(block => {
      const node = blockToNode(block);
      return {
        ...node,
        data: {
          ...node.data,
          connectedBlocks: getConnectedBlocks(block.id),
          onContentChange: (content: string) => updateBlock.mutate({ id: block.id, content }),
          onTitleChange: (title: string) => updateBlock.mutate({ id: block.id, title }),
          onDelete: () => handleDeleteNode(block.id),
          onResize: (width: number, height: number) => updateBlock.mutate({ id: block.id, width, height }),
        },
      };
    });
  }, [blocks, dbEdges, getConnectedBlocks, updateBlock, handleDeleteNode]);

  const initialEdges = useMemo(() => {
    return dbEdges.map(edgeToReactFlowEdge);
  }, [dbEdges]);

  // ReactFlow state
  const [nodes, setNodes] = useNodesState<CanvasNode>(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Sync nodes/edges when DB data changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Track selected count
  useEffect(() => {
    const selected = nodes.filter(n => n.selected);
    setSelectedCount(selected.length);
  }, [nodes]);

  // History for undo/redo
  const { 
    pushState, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useCanvasHistory();

  // Handle undo
  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes as CanvasNode[]);
      setEdges(state.edges);
    }
  }, [undo, setNodes, setEdges]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes as CanvasNode[]);
      setEdges(state.edges);
    }
  }, [redo, setNodes, setEdges]);

  // Handle node changes (position, selection, etc.)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds) as CanvasNode[]);
    
    // Save position changes to database (debounced)
    const positionChanges = changes.filter(c => c.type === 'position' && (c as any).position && (c as any).dragging === false);
    if (positionChanges.length > 0) {
      const updates = positionChanges.map(c => ({
        id: (c as any).id,
        position_x: (c as any).position?.x || 0,
        position_y: (c as any).position?.y || 0,
      }));
      updatePositions.mutate(updates);
    }
  }, [setNodes, updatePositions]);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  // Handle new connections
  const onConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target) return;

    try {
      await createEdge.mutateAsync({
        agent_board_id: projectId,
        source_block_id: connection.source,
        target_block_id: connection.target,
      });
      
      pushState(nodes, edges);
    } catch (err) {
      toast.error('Failed to create connection');
    }
  }, [createEdge, projectId, nodes, edges, pushState]);

  // Handle edge deletion
  const onEdgesDelete = useCallback(async (deletedEdges: Edge[]) => {
    for (const edge of deletedEdges) {
      try {
        await deleteEdge.mutateAsync(edge.id);
      } catch (err) {
        console.error('Failed to delete edge:', err);
      }
    }
  }, [deleteEdge]);

  // Add new node
  const addNode = useCallback(async (type: string, position?: { x: number; y: number }) => {
    const pos = position || {
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    };

    try {
      await createBlock.mutateAsync({
        agent_board_id: projectId,
        type: type as CanvasBlockType,
        position_x: pos.x,
        position_y: pos.y,
        title: getDefaultTitle(type as CanvasBlockType),
      });
      pushState(nodes, edges);
    } catch (err) {
      toast.error('Failed to add node');
    }
  }, [createBlock, projectId, nodes, edges, pushState]);

  // Get default title for node type
  const getDefaultTitle = (type: CanvasBlockType): string => {
    const titles: Record<CanvasBlockType, string> = {
      text: 'Text Block',
      image: 'Image',
      url: 'URL',
      document: 'Document',
      video: 'Video',
      group: 'Group',
      chat: 'AI Chat',
      brain: 'Central Brain',
      creative: 'Creative',
    };
    return titles[type] || 'New Block';
  };

  // Handle drop from Central Brain panel
  const onDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    
    // Check for block type drag from toolbar
    const blockType = event.dataTransfer.getData('application/block-type');
    if (blockType) {
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (bounds) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        addNode(blockType, position);
      }
      return;
    }
    
    // Check for brain drop
    const brainDrop = event.dataTransfer.getData('application/brain-drop');
    if (brainDrop) {
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (bounds) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        addNode('brain', position);
      }
      return;
    }
    
    // Check for JSON data from Central Brain panel
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const { type, item } = JSON.parse(data);
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      // Determine node type and content based on dropped item
      let nodeType: CanvasBlockType = 'brain';
      let title = item.title || 'Untitled';
      let content = '';
      let fileUrl = '';

      switch (type) {
        case 'knowledge':
          nodeType = 'brain';
          content = item.description || '';
          break;
        case 'swipe':
          nodeType = item.image_url ? 'image' : 'brain';
          fileUrl = item.image_url || '';
          content = item.content || item.description || '';
          break;
        case 'asset':
          nodeType = item.asset_type === 'image' ? 'image' : 'brain';
          fileUrl = item.file_url || item.thumbnail_url || '';
          break;
        case 'template':
          nodeType = 'text';
          content = item.prompt_text || '';
          break;
        case 'offer':
          nodeType = 'brain';
          content = `${item.description || ''}\n\nPrice: ${item.price || 'N/A'}${item.discount ? `\nDiscount: ${item.discount}` : ''}`;
          break;
      }

      await createBlock.mutateAsync({
        agent_board_id: projectId,
        type: nodeType,
        position_x: position.x,
        position_y: position.y,
        title,
        content,
        file_url: fileUrl || undefined,
      });

      toast.success(`Added ${title} to canvas`);
    } catch (err) {
      console.error('Drop error:', err);
      toast.error('Failed to add item to canvas');
    }
  }, [createBlock, projectId, addNode, reactFlowInstance]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Delete selected nodes
  const handleDeleteSelected = useCallback(() => {
    const selected = nodes.filter(n => n.selected);
    selected.forEach(n => handleDeleteNode(n.id));
  }, [nodes, handleDeleteNode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Cmd/Ctrl + Shift + Z
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      }
      // Fit view
      if (e.key === 'f' || e.key === 'F') reactFlowInstance.fitView();
      // Zoom
      if (e.key === '+' || e.key === '=') reactFlowInstance.zoomIn();
      if (e.key === '-') reactFlowInstance.zoomOut();
      // Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, reactFlowInstance, handleDeleteSelected]);

  // Handle Brain panel drag start
  const handleBrainDragStart = useCallback((type: string, item: any) => {
    // This is tracked for visual feedback if needed
  }, []);

  if (blocksLoading || edgesLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'default',
          style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background color="hsl(var(--border))" gap={24} size={1} />
        <Controls className="bg-background border border-border rounded-lg" />
        <MiniMap 
          className="bg-background border border-border rounded-lg"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>

      {/* Toolbar */}
      <CanvasToolbar
        onAddBlock={addNode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedCount={selectedCount}
        onDelete={handleDeleteSelected}
        onOpenBrain={() => setBrainPanelOpen(true)}
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onFitView={() => reactFlowInstance.fitView()}
      />

      {/* Central Brain Panel */}
      <CentralBrainPanel
        isOpen={brainPanelOpen}
        onToggle={() => setBrainPanelOpen(!brainPanelOpen)}
        onDragStart={handleBrainDragStart}
      />
    </div>
  );
};

// Wrap with ReactFlowProvider
const Canvas2: React.FC<Canvas2Props> = (props) => (
  <ReactFlowProvider>
    <Canvas2Inner {...props} />
  </ReactFlowProvider>
);

export default Canvas2;
