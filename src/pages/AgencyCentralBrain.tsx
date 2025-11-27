import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  FileText,
  Search,
  RefreshCw,
  MessageSquare,
  Users,
  Database,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AskAIWidget } from "@/components/knowledge-base/AskAIWidget";
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

type KnowledgeBaseItem = DB["public"]["Tables"]["knowledge_base_items"]["Row"];

interface ClientStats {
  client_id: string;
  client_name: string;
  total_items: number;
  indexed_items: number;
  categories: Record<string, number>;
}

export default function AgencyCentralBrain() {
  const [askAIOpen, setAskAIOpen] = useState(false);
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
      // Trigger reindexing for agency scope
      await supabase.functions.invoke("google-search-indexing", {
        body: { action: "reindex", scope: "agency" },
      });

      // Trigger reindexing for client scope
      await supabase.functions.invoke("google-search-indexing", {
        body: { action: "reindex", scope: "client" },
      });

      refetchAgency();
    } catch (error) {
      console.error("Reindex error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Building2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Agency Central Brain</h1>
              <p className="text-slate-400">
                Admin-level knowledge base across all clients and agency resources
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReindexAll}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reindex All
            </Button>
            <Button
              onClick={() => setAskAIOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-slate-400" />
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalStats.total}</p>
            <p className="text-sm text-slate-400">Total Documents</p>
            <div className="mt-2 text-xs text-slate-500">
              Agency: {agencyStats.total} | Clients: {clientStats.total}
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">
                {totalStats.total > 0
                  ? Math.round((totalStats.indexed / totalStats.total) * 100)
                  : 0}%
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{totalStats.indexed}</p>
            <p className="text-sm text-slate-400">Indexed</p>
            <div className="mt-2 text-xs text-slate-500">
              Agency: {agencyStats.indexed} | Clients: {clientStats.indexed}
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Loader2 className="w-5 h-5 text-amber-400" />
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">{totalStats.processing}</p>
            <p className="text-sm text-slate-400">Processing</p>
            <div className="mt-2 text-xs text-slate-500">
              Agency: {agencyStats.processing} | Clients: {clientStats.processing}
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span className="text-xs text-slate-400">{clients.length} clients</span>
            </div>
            <p className="text-3xl font-bold text-rose-400">{totalStats.failed}</p>
            <p className="text-sm text-slate-400">Failed</p>
            <div className="mt-2 text-xs text-slate-500">
              Agency: {agencyStats.failed} | Clients: {clientStats.failed}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agency">Agency Knowledge</TabsTrigger>
            <TabsTrigger value="clients">Client Knowledge</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Client Breakdown */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Client Knowledge Breakdown
              </h2>
              <div className="space-y-3">
                {clientBreakdown.map((client) => (
                  <div
                    key={client.client_id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{client.client_name}</p>
                      <p className="text-sm text-slate-400">
                        {client.indexed_items} of {client.total_items} indexed
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      {Object.entries(client.categories).map(([category, count]) => (
                        <div key={category} className="text-center">
                          <p className="text-white font-medium">{count}</p>
                          <p className="text-slate-500 text-xs capitalize">{category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {clientBreakdown.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No client data available</p>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h2>
              <div className="space-y-2">
                {[...agencyItems, ...clientItems]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{item.title}</p>
                          <p className="text-xs text-slate-500">
                            {item.scope === "agency" ? "Agency" : "Client"} • {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.indexing_status === "indexed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : item.indexing_status === "processing"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {item.indexing_status || "pending"}
                        </div>
                        <span className="text-xs text-slate-500">
                          {format(new Date(item.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="agency">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2">Agency Knowledge Base</h2>
                <p className="text-sm text-slate-400">
                  Agency-level resources, templates, and documentation
                </p>
              </div>
              {agencyLoading ? (
                <div className="text-center text-slate-400 py-12">Loading...</div>
              ) : (
                <KnowledgeBaseTable items={agencyItems} onUpdate={refetchAgency} />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Client Knowledge Bases</h2>
                  <p className="text-sm text-slate-400">
                    All client-specific documents and resources
                  </p>
                </div>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Filter by client" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {clientsLoading ? (
                <div className="text-center text-slate-400 py-12">Loading...</div>
              ) : (
                <KnowledgeBaseTable items={clientItems} onUpdate={refetchAgency} />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-slate-400">Coming soon - Usage stats, trends, and insights</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ask AI Widget */}
      <AskAIWidget open={askAIOpen} onOpenChange={setAskAIOpen} />
    </div>
  );
}
