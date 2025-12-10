import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { MessageCircle, Send, Loader2, Settings2, Sparkles, Copy, RotateCcw, ArrowRight, Save, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CanvasNodeData, CanvasBlock, ConnectedContext } from '@/types/canvas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BaseNode from './BaseNode';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sections?: ParsedSection[];
}

interface ParsedSection {
  id: string;
  type: 'headline' | 'copy' | 'cta' | 'text';
  label: string;
  content: string;
}

const AVAILABLE_MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini Flash', description: 'Fast & balanced' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini Pro', description: 'Most capable' },
  { value: 'openai/gpt-5', label: 'GPT-5', description: 'OpenAI flagship' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', description: 'Fast & affordable' },
];

/**
 * Build context from connected blocks for AI consumption
 */
function buildContextFromBlocks(connectedBlocks: CanvasBlock[]): { textContext: string; imageUrls: string[] } {
  const contextParts: string[] = [];
  const imageUrls: string[] = [];

  for (const block of connectedBlocks) {
    const label = block.title || block.type.toUpperCase();
    const instruction = block.instruction_prompt ? `\n[Use as: ${block.instruction_prompt}]` : '';

    switch (block.type) {
      case 'text':
        if (block.content) {
          contextParts.push(`[TEXT - ${label}]${instruction}\n${block.content}`);
        }
        break;
      case 'document':
        if (block.content) {
          contextParts.push(`[DOCUMENT: ${label}]${instruction}\n${block.content}`);
        }
        break;
      case 'url':
        if (block.content) {
          contextParts.push(`[URL: ${block.url || label}]${instruction}\n${block.content}`);
        }
        break;
      case 'image':
        const imgUrl = block.file_url || block.url;
        if (imgUrl) {
          imageUrls.push(imgUrl);
          contextParts.push(`[IMAGE: ${label}]${instruction}\n(Reference image provided for visual context)`);
        }
        break;
      case 'video':
        if (block.content) {
          contextParts.push(`[VIDEO: ${label}]${instruction}\n${block.content}`);
        }
        break;
      case 'brain':
        if (block.content) {
          contextParts.push(`[CENTRAL BRAIN: ${label}]${instruction}\n${block.content}`);
        }
        break;
      default:
        if (block.content) {
          contextParts.push(`[${block.type.toUpperCase()}: ${label}]${instruction}\n${block.content}`);
        }
    }
  }

  return {
    textContext: contextParts.join('\n\n---\n\n'),
    imageUrls,
  };
}

/**
 * Parse AI response into sections (Headlines, Copy, CTAs, etc.)
 */
function parseResponseSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  
  // Pattern for markdown headers like ## Headlines, ## Primary Text, ## CTA
  const sectionPattern = /##\s*(Headlines?|Primary Text|Body Copy|Copy|CTAs?|Call to Action|Description|Hook|Subheadline?)\s*\n([\s\S]*?)(?=##|$)/gi;
  
  let match;
  let foundSections = false;
  
  while ((match = sectionPattern.exec(content)) !== null) {
    foundSections = true;
    const sectionLabel = match[1].trim();
    const sectionContent = match[2].trim();
    
    if (!sectionContent) continue;

    // Determine section type
    let type: ParsedSection['type'] = 'text';
    const labelLower = sectionLabel.toLowerCase();
    if (labelLower.includes('headline') || labelLower.includes('hook')) {
      type = 'headline';
    } else if (labelLower.includes('cta') || labelLower.includes('call to action')) {
      type = 'cta';
    } else if (labelLower.includes('copy') || labelLower.includes('text') || labelLower.includes('body') || labelLower.includes('description')) {
      type = 'copy';
    }

    sections.push({
      id: crypto.randomUUID(),
      type,
      label: sectionLabel,
      content: sectionContent,
    });
  }

  // If no sections found, return the whole content as a single section
  if (!foundSections && content.trim()) {
    sections.push({
      id: crypto.randomUUID(),
      type: 'text',
      label: 'Response',
      content: content.trim(),
    });
  }

  return sections;
}

const ChatNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CanvasNodeData;
  const [localTitle, setLocalTitle] = useState(nodeData.title || 'AI Chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].value);
  const scrollRef = useRef<HTMLDivElement>(null);

  const connectedBlocks = (nodeData.connectedBlocks || []) as CanvasBlock[];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

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
    setStreamingContent('');

    try {
      // Build context from connected blocks
      const context = buildContextFromBlocks(connectedBlocks);
      
      // Build system prompt with context
      let systemPrompt = 'You are a helpful AI assistant for creative advertising and marketing work.';
      if (context.textContext) {
        systemPrompt += `\n\n=== CONNECTED CONTEXT ===\nThe following content is connected to this chat and should inform your responses:\n\n${context.textContext}\n\n=== END CONTEXT ===`;
      }

      // Prepare messages for AI
      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: userMessage.content }
      ];

      // Stream the response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: aiMessages,
          model: selectedModel,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process SSE lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setStreamingContent(fullContent);
              }
            } catch {
              // Incomplete JSON, will be handled in next iteration
            }
          }
        }
      }

      // Parse sections from the response
      const sections = parseResponseSections(fullContent);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent || 'No response received.',
        timestamp: new Date(),
        sections: sections.length > 1 ? sections : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get AI response');
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, connectedBlocks, selectedModel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const copyContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  }, []);

  const regenerateMessage = useCallback((messageIndex: number) => {
    // Find the user message before this assistant message
    if (messageIndex > 0 && messages[messageIndex - 1]?.role === 'user') {
      const userContent = messages[messageIndex - 1].content;
      // Remove messages from this point
      setMessages(prev => prev.slice(0, messageIndex - 1));
      setInputValue(userContent);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    toast.success('Chat cleared');
  }, []);

  const pushToCreative = useCallback((content: string, sectionType: string) => {
    // This would typically trigger creation of a CreativeNode
    // For now, we'll just show a toast - the actual implementation
    // would use a callback from the parent canvas component
    toast.success(`Ready to push ${sectionType} to Creative node`);
    console.log('Push to creative:', { content, sectionType });
  }, []);

  return (
    <BaseNode
      selected={selected}
      onDelete={nodeData.onDelete}
      color="#22c55e"
      showTargetHandle={true}
      showSourceHandle={true}
      className="min-w-[380px]"
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
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div className="space-y-1.5">
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={clearChat}
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  Clear Chat
                </Button>
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
        <ScrollArea className="h-[220px] pr-2" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && !streamingContent ? (
              <div className="h-[200px] flex items-center justify-center text-center">
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
              <>
                {messages.map((msg, msgIndex) => (
                  <div key={msg.id} className="text-xs">
                    {msg.role === 'user' ? (
                      <div className="text-right">
                        <div className="inline-block max-w-[90%] p-2 rounded-lg bg-primary text-primary-foreground">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-left space-y-2">
                        {/* Render sections if available */}
                        {msg.sections && msg.sections.length > 1 ? (
                          msg.sections.map((section) => (
                            <div key={section.id} className="group bg-muted rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-2 py-1 bg-muted/80 border-b border-border/50">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] h-4 ${
                                    section.type === 'headline' ? 'border-amber-500 text-amber-600' :
                                    section.type === 'cta' ? 'border-green-500 text-green-600' :
                                    section.type === 'copy' ? 'border-blue-500 text-blue-600' :
                                    'border-muted-foreground'
                                  }`}
                                >
                                  {section.label}
                                </Badge>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => copyContent(section.content)}
                                    title="Copy"
                                  >
                                    <Copy className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => pushToCreative(section.content, section.label)}
                                    title="Push to Creative"
                                  >
                                    <ArrowRight className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="whitespace-pre-wrap">{section.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="group">
                            <div className="inline-block max-w-[90%] p-2 rounded-lg bg-muted">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => copyContent(msg.content)}
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => regenerateMessage(msgIndex)}
                              >
                                <RotateCcw className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => pushToCreative(msg.content, 'Response')}
                              >
                                <ArrowRight className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Streaming content indicator */}
                {streamingContent && (
                  <div className="text-left text-xs">
                    <div className="inline-block max-w-[90%] p-2 rounded-lg bg-muted">
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                      <span className="inline-block w-1.5 h-3 bg-foreground/50 animate-pulse ml-0.5" />
                    </div>
                  </div>
                )}
              </>
            )}
            {isLoading && !streamingContent && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Connecting...</span>
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
