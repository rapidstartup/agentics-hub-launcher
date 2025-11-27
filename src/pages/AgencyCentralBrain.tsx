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
} from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { KnowledgeBaseTable } from "@/components/knowledge-base/KnowledgeBaseTable";
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

export default function AgencyCentralBrain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");

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
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-foreground">Agency Central Brain</h1>
              <p className="text-sm text-muted-foreground">
                Admin-level knowledge base across all clients and agency resources
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-sidebar border-border"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleReindexAll}
                className="gap-2 border-border"
              >
                <RefreshCw className="h-4 w-4" />
                Reindex All
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Global Statistics */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">At a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Agency: {agencyStats.total} | Clients: {clientStats.total}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">
                      {totalStats.total > 0
                        ? Math.round((totalStats.indexed / totalStats.total) * 100)
                        : 0}%
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalStats.indexed}</p>
                  <p className="text-sm text-muted-foreground">Indexed</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Agency: {agencyStats.indexed} | Clients: {clientStats.indexed}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Loader2 className="h-5 w-5 text-amber-500" />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalStats.processing}</p>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Agency: {agencyStats.processing} | Clients: {clientStats.processing}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                    <span className="text-xs text-muted-foreground">{clients.length} clients</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalStats.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Agency: {agencyStats.failed} | Clients: {clientStats.failed}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-sidebar border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agency">Agency Knowledge</TabsTrigger>
              <TabsTrigger value="clients">Client Knowledge</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Client Breakdown */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5" />
                    Client Knowledge Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientBreakdown.map((client) => (
                      <div
                        key={client.client_id}
                        className="flex items-center justify-between p-4 bg-sidebar rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{client.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.indexed_items} of {client.total_items} indexed
                          </p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          {Object.entries(client.categories).map(([category, count]) => (
                            <div key={category} className="text-center">
                              <p className="text-foreground font-medium">{count}</p>
                              <p className="text-muted-foreground text-xs capitalize">{category}</p>
                            </div>
                          ))}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                      </div>
                    ))}
                    {clientBreakdown.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No client data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...agencyItems, ...clientItems]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 10)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-sidebar rounded-lg border border-border hover:bg-sidebar-accent transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-foreground font-medium truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.scope === "agency" ? "Agency" : "Client"} • {item.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge
                              variant={
                                item.indexing_status === "indexed"
                                  ? "default"
                                  : item.indexing_status === "processing"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {item.indexing_status || "pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agency" className="mt-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Agency Knowledge Base</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Agency-level resources, templates, and documentation
                  </p>
                </CardHeader>
                <CardContent>
                  {agencyLoading ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Loading...
                    </div>
                  ) : (
                    <KnowledgeBaseTable items={agencyItems} onUpdate={refetchAgency} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="mt-6">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Client Knowledge Bases</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      All client-specific documents and resources
                    </p>
                  </div>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-64 bg-sidebar border-border">
                      <SelectValue placeholder="Filter by client" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {clientsLoading ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Loading...
                    </div>
                  ) : (
                    <KnowledgeBaseTable items={clientItems} onUpdate={refetchAgency} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className="border-border bg-card">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Coming soon - Usage stats, trends, and insights</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
