import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  FileText,
  Search,
  RefreshCw,
  Users,
  Database,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Target,
  Image as ImageIcon,
  Video,
  Settings as SettingsIcon,
  Upload,
} from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { KnowledgeBaseTable } from "@/components/knowledge-base/KnowledgeBaseTable";
import { KnowledgeBaseUploadModal } from "@/components/knowledge-base/KnowledgeBaseUploadModal";
import { FloatingAskAI } from "@/components/knowledge-base/FloatingAskAI";
import type { Database as DB } from "@/integrations/supabase/types";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type KnowledgeBaseItem = DB["public"]["Tables"]["knowledge_base_items"]["Row"];
type KBCategory = DB["public"]["Enums"]["kb_category"];

const categoryIcons: Record<string, any> = {
  document: FileText,
  image: ImageIcon,
  video: Video,
  audio: Video,
  template: FileText,
  script: FileText,
  brand_asset: ImageIcon,
  winning_ad: Target,
  research: Search,
  playbook: Target,
  faq: FileText,
  offer: Target,
};

export default function AgencyCentralBrain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch all agency-level knowledge base items
  const { data: agencyItems = [], isLoading: agencyLoading, refetch: refetchAgency } = useQuery({
    queryKey: ["agency-kb-items"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("knowledge_base_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("scope", "agency")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KnowledgeBaseItem[];
    },
  });

  // Fetch all clients
  const { data: clients = [] } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch client-level items
  const { data: clientItems = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["all-client-kb-items", selectedClient],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("knowledge_base_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("scope", "client")
        .eq("is_archived", false);

      if (selectedClient !== "all") {
        query = query.eq("client_id", selectedClient);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as KnowledgeBaseItem[];
    },
  });

  // Calculate statistics
  const agencyStats = {
    total: agencyItems.length,
    indexed: agencyItems.filter(item => item.indexing_status === "indexed").length,
    processing: agencyItems.filter(item => item.indexing_status === "processing").length,
    failed: agencyItems.filter(item => item.indexing_status === "failed").length,
  };

  const clientStats = {
    total: clientItems.length,
    indexed: clientItems.filter(item => item.indexing_status === "indexed").length,
    processing: clientItems.filter(item => item.indexing_status === "processing").length,
    failed: clientItems.filter(item => item.indexing_status === "failed").length,
  };

  const totalStats = {
    total: agencyStats.total + clientStats.total,
    indexed: agencyStats.indexed + clientStats.indexed,
    processing: agencyStats.processing + clientStats.processing,
    failed: agencyStats.failed + clientStats.failed,
  };

  // Get category statistics
  const allItems = [...agencyItems, ...clientItems];
  const categoryStats = allItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get client-specific statistics
  const clientBreakdown = clients.map(client => {
    const items = clientItems.filter(item => item.client_id === client.id);
    return {
      client_id: client.id,
      client_name: client.name,
      total_items: items.length,
      indexed_items: items.filter(item => item.indexing_status === "indexed").length,
      categories: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  });

  const handleReindexAll = async () => {
    try {
      toast.info("Reindexing all documents...");

      // Trigger reindexing for agency scope
      await supabase.functions.invoke("google-search-indexing", {
        body: { action: "reindex", scope: "agency" },
      });

      // Trigger reindexing for client scope
      await supabase.functions.invoke("google-search-indexing", {
        body: { action: "reindex", scope: "client" },
      });

      setTimeout(() => {
        refetchAgency();
        toast.success("Reindexing complete");
      }, 2000);
    } catch (error) {
      console.error("Reindex error:", error);
      toast.error("Failed to reindex");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-background">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Central Brain</h1>
                <p className="text-sm text-muted-foreground">Your AI's memory and learning space</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-sidebar border-border mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="asset-library">Asset Library</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="swipe-files">Swipe Files</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Access Section */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick access to all Central Brain sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Knowledge Bases Card */}
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Bases</h3>
                      <p className="text-sm text-muted-foreground mb-4">Information library</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {categoryStats.document || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategy Card */}
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                          <Target className="w-6 h-6 text-emerald-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Strategy</h3>
                      <p className="text-sm text-muted-foreground mb-4">Brand, research, funnels & offers</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {(categoryStats.playbook || 0) + (categoryStats.research || 0) + (categoryStats.offer || 0)}
                        </span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asset Library Card */}
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                          <ImageIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Asset Library</h3>
                      <p className="text-sm text-muted-foreground mb-4">Media & files</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {(categoryStats.image || 0) + (categoryStats.video || 0) + (categoryStats.audio || 0)}
                        </span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tools Card */}
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg">
                          <SettingsIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Tools</h3>
                      <p className="text-sm text-muted-foreground mb-4">Internal, external & prompts</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {(categoryStats.template || 0) + (categoryStats.script || 0)}
                        </span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Swipe Files Card */}
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-lg">
                          <Target className="w-6 h-6 text-amber-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Swipe Files</h3>
                      <p className="text-sm text-muted-foreground mb-4">Saved ad inspirations</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {categoryStats.winning_ad || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integrations Card */}
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-lg">
                          <SettingsIcon className="w-6 h-6 text-rose-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Integrations</h3>
                      <p className="text-sm text-muted-foreground mb-4">Connected platforms</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">0</span>
                        <span className="text-sm text-muted-foreground">connected</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="knowledge-bases" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-sidebar border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReindexAll}
                    className="gap-2 border-border"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reindex
                  </Button>
                  <Button
                    onClick={() => setUploadModalOpen(true)}
                    className="gap-2 bg-primary"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">All Knowledge Base Items</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {totalStats.indexed} of {totalStats.total} indexed
                      </p>
                    </div>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="w-64 bg-sidebar border-border">
                        <SelectValue placeholder="Filter by scope" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="agency">Agency Only</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {clientsLoading || agencyLoading ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Loading...
                    </div>
                  ) : (
                    <KnowledgeBaseTable
                      items={selectedClient === "agency" ? agencyItems : selectedClient === "all" ? allItems : clientItems}
                      onUpdate={refetchAgency}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategy">
              <Card className="border-border bg-card p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Strategy</h3>
                <p className="text-muted-foreground">Brand, research, funnels & offers</p>
              </Card>
            </TabsContent>

            <TabsContent value="asset-library">
              <Card className="border-border bg-card p-8 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Asset Library</h3>
                <p className="text-muted-foreground">Media & files</p>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <Card className="border-border bg-card p-8 text-center">
                <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Tools</h3>
                <p className="text-muted-foreground">Internal, external & prompts</p>
              </Card>
            </TabsContent>

            <TabsContent value="swipe-files">
              <Card className="border-border bg-card p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Swipe Files</h3>
                <p className="text-muted-foreground">Saved ad inspirations</p>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card className="border-border bg-card p-8 text-center">
                <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Integrations</h3>
                <p className="text-muted-foreground">Connected platforms - Coming soon</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upload Modal */}
      <KnowledgeBaseUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={refetchAgency}
      />

      {/* Floating Ask AI */}
      <FloatingAskAI />
    </div>
  );
}
