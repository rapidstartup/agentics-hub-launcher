import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Loader2,
  FileText,
  X,
  Plus,
  Check,
  Sparkles,
  ExternalLink,
  Calendar,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBaseItem = Database["public"]["Tables"]["knowledge_base_items"]["Row"];

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: KnowledgeBaseItem[];
  timestamp: Date;
}

interface AskAIWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedItems?: KnowledgeBaseItem[];
}

export function AskAIWidget({ open, onOpenChange, preselectedItems = [] }: AskAIWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<KnowledgeBaseItem[]>(preselectedItems);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all knowledge base items for selection
  const { data: allItems = [] } = useQuery({
    queryKey: ["kb-items-for-chat"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("knowledge_base_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .eq("indexing_status", "indexed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KnowledgeBaseItem[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (preselectedItems.length > 0) {
      setSelectedItems(preselectedItems);
    }
  }, [preselectedItems]);

  const toggleItemSelection = (item: KnowledgeBaseItem) => {
    setSelectedItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get current user and client context
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prepare the context
      const itemIds = selectedItems.map(item => item.id);
      const itemContext = selectedItems.length > 0
        ? selectedItems.map(item => ({
            title: item.title,
            content: item.description || "",
            metadata: item.metadata,
          }))
        : undefined;

      // Call the gemini-chat edge function with RAG context
      const { data, error } = await supabase.functions.invoke("gemini-chat", {
        body: {
          prompt: input,
          userId: user.id,
          kbItemIds: itemIds.length > 0 ? itemIds : undefined,
          itemContext,
          temperature: 0.7,
          enableRag: true,
        },
      });

      if (error) throw error;

      // Find sources from the response
      const sources = data.sources
        ? allItems.filter(item => data.sources.includes(item.id))
        : selectedItems;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || data.text || "I apologize, but I couldn't generate a response.",
        sources: sources.length > 0 ? sources : undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response", {
        description: error.message,
      });

      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-white">Ask AI</DialogTitle>
                <DialogDescription>
                  Query your knowledge base with agentic RAG
                </DialogDescription>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-slate-400 hover:text-white"
              >
                Clear Chat
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="flex-shrink-0 border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                Querying {selectedItems.length} document{selectedItems.length !== 1 ? "s" : ""}:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedItems.map(item => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-600"
                >
                  {item.title}
                  <button
                    onClick={() => toggleItemSelection(item)}
                    className="ml-2 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Documents Button */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowItemSelector(!showItemSelector)}
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {showItemSelector ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Hide Documents
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Documents to Context
              </>
            )}
          </Button>
        </div>

        {/* Item Selector */}
        {showItemSelector && (
          <Card className="flex-shrink-0 bg-slate-800 border-slate-700 p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {allItems.map(item => {
                const isSelected = selectedItems.find(i => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? "bg-emerald-600 border-emerald-600" : "border-slate-600"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate">{item.category}</p>
                    </div>
                  </div>
                );
              })}
              {allItems.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No indexed documents available
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
                <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Ask me anything</h3>
                <p className="text-sm text-slate-400 mb-4">
                  I can help you find information, summarize documents, and answer questions about your knowledge base.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                  <button
                    onClick={() => setInput("What are the key points in these documents?")}
                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300"
                  >
                    Summarize selected documents
                  </button>
                  <button
                    onClick={() => setInput("What is our brand voice?")}
                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300"
                  >
                    Ask about brand voice
                  </button>
                  <button
                    onClick={() => setInput("Find all mentions of our target audience")}
                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300"
                  >
                    Search for specific information
                  </button>
                  <button
                    onClick={() => setInput("Compare these documents and highlight differences")}
                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300"
                  >
                    Compare documents
                  </button>
                </div>
              </Card>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "flex justify-end" : ""}`}>
                  <Card className={`p-4 ${
                    message.role === "user"
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-slate-800 border-slate-700"
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      {message.role === "assistant" ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        <p className="text-white">{message.content}</p>
                      )}
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          Sources used:
                        </p>
                        <div className="space-y-2">
                          {message.sources.map((source) => (
                            <div
                              key={source.id}
                              className="flex items-start gap-2 p-2 bg-slate-900/50 rounded text-xs"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-300 font-medium truncate">{source.title}</p>
                                <div className="flex items-center gap-2 mt-1 text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(source.created_at), "MMM d, yyyy")}</span>
                                  <Tag className="w-3 h-3 ml-2" />
                                  <span>{source.category}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-2">
                      {format(message.timestamp, "h:mm a")}
                    </p>
                  </Card>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex-shrink-0 flex gap-2 pt-4 border-t border-slate-700">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedItems.length > 0
              ? "Ask about the selected documents..."
              : "Ask anything about your knowledge base..."
            }
            disabled={isLoading}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
