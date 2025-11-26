import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { listClients, createClient, deleteClient, type Client } from "@/integrations/clients/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listProjects } from "@/integrations/projects";

export default function AdminClients() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

  // Form state
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newWebsite, setNewWebsite] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    // Load project counts for each client
    loadProjectCounts();
  }, [clients]);

  async function loadClients() {
    setLoading(true);
    try {
      const data = await listClients();
      setClients(data);
    } catch (e) {
      console.error("Failed to load clients:", e);
      toast({ title: "Error", description: "Failed to load clients", variant: "destructive" });
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjectCounts() {
    const counts: Record<string, number> = {};
    for (const client of clients) {
      try {
        const projects = await listProjects(client.slug);
        counts[client.slug] = projects.length;
      } catch (e) {
        counts[client.slug] = 0;
      }
    }
    setProjectCounts(counts);
  }

  async function handleCreateClient() {
    if (!newSlug || !newName) {
      toast({ title: "Missing fields", description: "Slug and name are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await createClient({
        slug: newSlug,
        name: newName,
        type: newType || undefined,
        description: newDescription || undefined,
        contact_email: newEmail || undefined,
        contact_phone: newPhone || undefined,
        website_url: newWebsite || undefined,
      });
      toast({ title: "Client Created", description: `${newName} has been added.` });
      setCreateOpen(false);
      resetForm();
      loadClients();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: e?.message || "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteClient(client: Client) {
    if (!confirm(`Are you sure you want to delete ${client.name}? This cannot be undone.`)) return;
    try {
      await deleteClient(client.id);
      toast({ title: "Client Deleted", description: `${client.name} has been removed.` });
      loadClients();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to delete client", variant: "destructive" });
    }
  }

  function resetForm() {
    setNewSlug("");
    setNewName("");
    setNewType("");
    setNewDescription("");
    setNewEmail("");
    setNewPhone("");
    setNewWebsite("");
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.type && c.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-background">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage all agency clients, their details, and access
                </p>
              </div>
              <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                New Client
              </Button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-10 bg-sidebar border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "No clients found" : "No Clients Yet"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first client to get started."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Client
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="border border-border bg-card p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{client.name}</h3>
                      {client.type && (
                        <Badge variant="secondary" className="text-xs">
                          {client.type}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/client/${client.slug}`)}>
                          <Globe className="h-4 w-4 mr-2" />
                          View Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {client.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {client.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground">
                    {client.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{client.contact_email}</span>
                      </div>
                    )}
                    {client.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{client.contact_phone}</span>
                      </div>
                    )}
                    {client.website_url && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        <a
                          href={client.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {client.website_url}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {projectCounts[client.slug] || 0} Projects
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/client/${client.slug}`)}
                    >
                      View →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Client Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  placeholder="techstart-solutions"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                />
                <p className="text-xs text-muted-foreground">URL-friendly identifier</p>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="TechStart Solutions"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type/Industry</Label>
              <Input
                placeholder="B2B SaaS"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the client"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient} disabled={!newSlug || !newName || creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

