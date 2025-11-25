import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { N8nScope, listN8nConnections, listN8nWorkflows } from "@/integrations/n8n/api";
import { RuntimeField, upsertAgentConfig } from "@/integrations/n8n/agents";
import { useToast } from "@/hooks/use-toast";

export function N8nAgentConfigModal({
  open,
  onOpenChange,
  scope,
  clientId,
  area,
  agentKey,
  title = "Configure Agent",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  scope: N8nScope;
  clientId?: string;
  area: string;
  agentKey?: string;
  title?: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [fields, setFields] = useState<RuntimeField[]>([]);
  const [agentName, setAgentName] = useState<string>(agentKey || "");
  const [role, setRole] = useState<string>("Automation Workflow");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const results = [];
        // Agency
        const a = await listN8nConnections({ scope: "agency" });
        results.push(...(a?.connections ?? []));
        // Client (if provided)
        if (clientId) {
          const c = await listN8nConnections({ scope: "client", clientId });
          results.push(...(c?.connections ?? []));
        }
        setConnections(results);
      } catch (e) {
        console.error(e);
        setConnections([]);
      }
    })();
  }, [open, clientId]);

  useEffect(() => {
    (async () => {
      setWorkflows([]);
      setSelectedWorkflowId("");
      if (!selectedConnectionId) return;
      try {
        const { workflows } = await listN8nWorkflows({ connectionId: selectedConnectionId });
        setWorkflows(Array.isArray(workflows) ? workflows : []);
      } catch (e) {
        console.error(e);
        setWorkflows([]);
      }
    })();
  }, [selectedConnectionId]);

  const handleAddField = () => {
    setFields((prev) => [...prev, { key: "", label: "", type: "text", required: false }]);
  };

  const handleRemoveField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const nameToUse = agentKey || agentName;
    if (!nameToUse) {
      toast({ title: "Missing agent name", description: "Please provide an agent name", variant: "destructive" });
      return;
    }
    if (!selectedConnectionId || !selectedWorkflowId) {
      toast({ title: "Missing details", description: "Please select a connection and a workflow", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const slug = (nameToUse || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      await upsertAgentConfig({
        scope,
        clientId,
        area,
        agentKey: slug,
        displayName: agentName || nameToUse,
        displayRole: role || undefined,
        connectionId: selectedConnectionId,
        workflowId: selectedWorkflowId,
        webhookUrl: webhookUrl || undefined,
        requiredFields: fields.filter((f) => f.key && f.label),
      });
      toast({ title: "Saved", description: "Agent configuration saved" });
      onOpenChange(false);
      setFields([]);
      setSelectedWorkflowId("");
      setSelectedConnectionId("");
      setWebhookUrl("");
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to save agent config", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const connectionLabel = useMemo(() => {
    const c = connections.find((x) => x.id === selectedConnectionId);
    return c?.label || c?.base_url || "";
  }, [connections, selectedConnectionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!agentKey && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input placeholder="e.g., Market Research Bot" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role (optional)</Label>
                <Input placeholder="e.g., Automation Workflow" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Connection</Label>
              <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a connection" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.label || c.base_url) + (c.scope === "client" && c.client_id ? ` · client:${c.client_id}` : " · agency")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Workflow</Label>
              <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId} disabled={!selectedConnectionId}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedConnectionId ? "Select a workflow" : "Select a connection first"} />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((w) => (
                    <SelectItem key={String(w.id)} value={String(w.id)}>
                      {w.name || w.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhook URL (Optional, for "Run Now")</Label>
            <Input 
              placeholder="e.g., https://n8n.cloud/webhook/..." 
              value={webhookUrl} 
              onChange={(e) => setWebhookUrl(e.target.value)} 
            />
            <p className="text-xs text-muted-foreground">
              Required for n8n Cloud if you want to trigger this manually via "Run Now".
            </p>
          </div>

          <Card className="border border-border bg-card p-4">
            <div className="mb-2 text-sm font-medium text-foreground">Runtime Inputs (optional)</div>
            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div key={idx} className="grid gap-2 md:grid-cols-5">
                  <Input placeholder="Key (e.g., companyName)" value={f.key} onChange={(e) => {
                    const v = e.target.value;
                    setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, key: v } : x)));
                  }} />
                  <Input placeholder="Label" value={f.label} onChange={(e) => {
                    const v = e.target.value;
                    setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, label: v } : x)));
                  }} />
                  <Select value={f.type} onValueChange={(v: any) => setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, type: v } : x)))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={f.required ? "true" : "false"} onValueChange={(v: any) => setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, required: v === "true" } : x)))}>
                    <SelectTrigger><SelectValue placeholder="Required?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Required</SelectItem>
                      <SelectItem value="false">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Default" value={(f.defaultValue as any) ?? ""} onChange={(e) => {
                    const v = e.target.value;
                    setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, defaultValue: v } : x)));
                  }} />
                  <div className="md:col-span-5">
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveField(idx)}>Remove field</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddField}>Add field</Button>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


