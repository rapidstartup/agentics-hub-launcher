import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { MessageCircle, Send, Loader2, Settings2, Sparkles, Copy, RotateCcw } from 'lucide-react';
import { useContextBuilder } from '@/hooks/useContextBuilder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CanvasNodeData } from '@/types/canvas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BaseNode from './BaseNode';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AVAILABLE_MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini Flash', description: 'Fast & balanced' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini Pro', description: 'Most capable' },
  { value: 'openai/gpt-5', label: 'GPT-5', description: 'OpenAI flagship' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', description: 'Fast & affordable' },
];

const ChatNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CanvasNodeData;
  const [localTitle, setLocalTitle] = useState(nodeData.title || 'AI Chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].value);
  const scrollRef = useRef<HTMLDivElement>(null);

  const connectedBlocks = nodeData.connectedBlocks || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    nodeData.onTitleChange?.(e.target.value);
  }, [nodeData]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build context from connected blocks
      const context = buildContext(connectedBlocks);
      
      // Prepare messages for AI
      const aiMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage.content }
      ];

      // Call the chat edge function
      const { data: response, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: aiMessages,
          context: context.textContext,
          imageUrls: context.imageUrls,
          model: selectedModel,
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response?.content || response?.message || 'No response received.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get AI response');
      
      // Add error message
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, connectedBlocks, selectedModel, buildContext]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  }, []);

  return (
    <BaseNode
      selected={selected}
      onDelete={nodeData.onDelete}
      color="#22c55e"
      showTargetHandle={true}
      showSourceHandle={true}
      className="min-w-[350px]"
      headerContent={
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <MessageCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          <Input
            value={localTitle}
            onChange={handleTitleChange}
            className="h-5 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 font-medium truncate"
            placeholder="Chat title..."
          />
          {connectedBlocks.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {connectedBlocks.length} sources
            </Badge>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 flex-shrink-0">
                <Settings2 className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-2">
                <label className="text-xs font-medium">AI Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value} className="text-xs">
                        <div>
                          <div className="font-medium">{model.label}</div>
                          <div className="text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      }
    >
      <div className="space-y-2">
        {/* Connected context indicator */}
        {connectedBlocks.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Context from {connectedBlocks.length} connected block(s)</span>
          </div>
        )}

        {/* Messages area */}
        <ScrollArea className="h-[200px] pr-2" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-center">
                <div>
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    Connect content blocks and ask questions.
                    <br />
                    AI will use connected context.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`text-xs group ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[90%] p-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyMessage(msg.content)}
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          // Re-send the previous user message
                          const userMsgIndex = messages.findIndex(m => m.id === msg.id) - 1;
                          if (userMsgIndex >= 0) {
                            setInputValue(messages[userMsgIndex].content);
                          }
                        }}
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex gap-1.5">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about connected content..."
            className="text-xs h-8 flex-1"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="h-8 px-2"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </BaseNode>
  );
};

export default ChatNode;
