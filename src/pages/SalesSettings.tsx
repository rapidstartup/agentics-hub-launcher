import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SalesSidebar } from "@/components/SalesSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, ArrowLeft, CheckCircle2 } from "lucide-react";
import GlossaryCustomization from "@/components/sales/GlossaryCustomization";

interface SalesSettingsState {
  industry: string;
  formPresets: Record<string, boolean>;
  salesProcesses: Record<string, boolean>;
}

const INDUSTRIES = [
  { id: "dentistry", name: "Dentistry", description: "Dental practices and clinics" },
  { id: "high-ticket", name: "High Ticket Sales", description: "High-value B2B/B2C consultative sales" },
  { id: "insurance", name: "Insurance", description: "Insurance agencies and brokers" },
  { id: "legal", name: "Legal Services", description: "Law firms and legal practices" },
  { id: "real-estate", name: "Real Estate", description: "Real estate agencies and brokerages" },
  { id: "saas", name: "SaaS Sales", description: "Software as a Service sales teams" },
];

const FORM_PRESETS = [
  { id: "lead-intake", name: "Lead Intake", description: "Short form for rapid lead capture" },
  { id: "discovery-call", name: "Discovery Call", description: "Standard discovery questions and notes" },
  { id: "proposal", name: "Proposal Builder", description: "Fields to draft quick proposals" },
  { id: "deal-review", name: "Deal Review", description: "Key fields for stage progression" },
];

const SALES_PROCESSES = [
  { id: "one-call", name: "1 Call Close", description: "3 stages" },
  { id: "two-call", name: "2 Call Close", description: "4 stages" },
  { id: "vsl", name: "VSL Funnel", description: "4 stages" },
  { id: "inbound", name: "Inbound Lead Flow", description: "Awareness → Demo → Close" },
  { id: "outbound", name: "Outbound SDR/AE", description: "Prospect → Qualify → Demo → Close" },
];

const SalesSettings = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const storageKey = useMemo(() => `sales_settings_${clientId || "global"}`, [clientId]);

  const [state, setState] = useState<SalesSettingsState>({
    industry: "high-ticket",
    formPresets: {},
    salesProcesses: {},
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch (e) {
      console.error("Failed to load sales settings", e);
    }
  }, [storageKey]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save sales settings", e);
    }
  }, [state, storageKey]);

  const toggleFormPreset = (id: string) => {
    setState((prev) => ({
      ...prev,
      formPresets: { ...prev.formPresets, [id]: !prev.formPresets[id] },
    }));
  };

  const toggleSalesProcess = (id: string) => {
    setState((prev) => ({
      ...prev,
      salesProcesses: { ...prev.salesProcesses, [id]: !prev.salesProcesses[id] },
    }));
  };

  return (
    <div className="flex min-h-screen w-full" style={{ background: "var(--page-bg)" }}>
      <SalesSidebar />

      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              Sales Settings
            </div>
            <h1 className="text-3xl font-bold text-foreground leading-tight">Configure Sales Experience</h1>
            <p className="text-sm text-muted-foreground">
              Customize terminology, forms, and sales process templates used by Sales dashboards and widgets.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/client/${clientId}/sales`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Sales
          </Button>
        </div>

        {/* Industry selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Industry &amp; Niche Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose the sales niche to load the right terminology and defaults.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((opt) => {
              const isActive = state.industry === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setState((prev) => ({ ...prev, industry: opt.id }))}
                  className={`rounded-lg border p-4 text-left transition ${
                    isActive ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{opt.name}</p>
                    {isActive && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{opt.description}</p>
                  {isActive && (
                    <Badge className="mt-3" variant="secondary">
                      Active
                    </Badge>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Form template presets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Form Template Presets</CardTitle>
            <p className="text-sm text-muted-foreground">
              Toggle the form templates you want available to sales users. These feed form widgets and data entry flows.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {FORM_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{preset.name}</p>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                </div>
                <Switch checked={!!state.formPresets[preset.id]} onCheckedChange={() => toggleFormPreset(preset.id)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sales process models */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sales Process Models</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enable multiple sales process templates. Widgets can reference these models for funnel metrics.
            </p>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            {SALES_PROCESSES.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{process.name}</p>
                  <p className="text-sm text-muted-foreground">{process.description}</p>
                </div>
                <Switch
                  checked={!!state.salesProcesses[process.id]}
                  onCheckedChange={() => toggleSalesProcess(process.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SalesSettings;
