import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { untypedSupabase as supabase } from "@/integrations/supabase/untyped-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Target,
  Image as ImageIcon,
  Upload,
  Package,
} from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { KnowledgeBaseUploadModal } from "@/components/knowledge-base/KnowledgeBaseUploadModal";
import { FloatingAskAI } from "@/components/knowledge-base/FloatingAskAI";
import type { Database as DB } from "@/integrations/supabase/types";
import { toast } from "sonner";

type KnowledgeBaseItem = DB["public"]["Tables"]["knowledge_base_items"]["Row"];

export default function ClientCentralBrain() {
  const { clientId } = useParams<{ clientId: string }>();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: kbItems = [], isLoading: kbLoading, refetch: refetchKB } = useQuery({
    queryKey: ["client-kb-items", clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("knowledge_base_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("client_id", clientId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as KnowledgeBaseItem[];
    },
  });

  const { data: assetsCount = 0 } = useQuery({
    queryKey: ["assets-count", clientId],
    queryFn: async () => {
      const { count } = await supabase.from("assets").select("*", { count: "exact", head: true }).eq("client_id", clientId);
      return count || 0;
    },
  });

  const { data: swipeFilesCount = 0 } = useQuery({
    queryKey: ["swipe-files-count", clientId],
    queryFn: async () => {
      const { count } = await supabase.from("swipe_files").select("*", { count: "exact", head: true }).eq("client_id", clientId);
      return count || 0;
    },
  });

  const { data: offersCount = 0 } = useQuery({
    queryKey: ["offers-count", clientId],
    queryFn: async () => {
      const { count } = await supabase.from("offers").select("*", { count: "exact", head: true }).eq("client_id", clientId);
      return count || 0;
    },
  });

  const kbStats = {
    total: kbItems.length,
    indexed: kbItems.filter(item => item.indexing_status === "indexed").length,
    processing: kbItems.filter(item => item.indexing_status === "processing").length,
    failed: kbItems.filter(item => item.indexing_status === "failed").length,
  };

  const handleReindexAll = async () => {
    toast.info("Reindexing documents...");
    await refetchKB();
    toast.success("Reindexing complete");
  };

  return (
    <div className="flex min-h-screen w-full" style={{ background: 'var(--page-bg)' }}>
      <ChatSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border" style={{ background: 'var(--page-bg)' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Central Brain</h1>
                  <p className="text-sm text-muted-foreground">Client knowledge, assets, and resources</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReindexAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reindex
                </Button>
                <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-sidebar border-border mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border hover:bg-card/80 cursor-pointer" onClick={() => setActiveTab("knowledge")}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg"><FileText className="w-6 h-6 text-blue-400" /></div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">{kbStats.total}</span>
                      <span className="text-sm text-muted-foreground">items</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="p-3 bg-purple-500/10 rounded-lg mb-4"><ImageIcon className="w-6 h-6 text-purple-400" /></div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Assets</h3>
                    <span className="text-2xl font-bold text-foreground">{assetsCount}</span>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="p-3 bg-amber-500/10 rounded-lg mb-4"><Package className="w-6 h-6 text-amber-400" /></div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Swipe Files</h3>
                    <span className="text-2xl font-bold text-foreground">{swipeFilesCount}</span>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="p-3 bg-emerald-500/10 rounded-lg mb-4"><Target className="w-6 h-6 text-emerald-400" /></div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Offers</h3>
                    <span className="text-2xl font-bold text-foreground">{offersCount}</span>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-lg">Knowledge Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm text-muted-foreground">{kbStats.indexed} indexed</span></div>
                    <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 text-amber-500 animate-spin" /><span className="text-sm text-muted-foreground">{kbStats.processing} processing</span></div>
                    <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-sm text-muted-foreground">{kbStats.failed} failed</span></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
                <Button size="sm" onClick={() => setUploadModalOpen(true)}><Upload className="h-4 w-4 mr-2" />Upload</Button>
              </div>

              {kbLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : kbItems.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No knowledge items yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload documents to build your knowledge base</p>
                    <Button onClick={() => setUploadModalOpen(true)}><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {kbItems.map((item) => (
                    <Card key={item.id} className="bg-card border-border">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg"><FileText className="h-4 w-4 text-primary" /></div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.indexing_status === "indexed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {item.indexing_status === "processing" && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
                          {item.indexing_status === "failed" && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <FloatingAskAI />
      </main>

      <KnowledgeBaseUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={() => { refetchKB(); setUploadModalOpen(false); }}
        clientId={clientId}
      />
    </div>
  );
}