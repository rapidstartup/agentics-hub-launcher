import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { OperationsSidebar } from "@/components/OperationsSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, BarChart3, ArrowLeft, Bot, Play, Settings } from "lucide-react";
import { AgentConfig, listAgentConfigs, listPredefinedAgents } from "@/integrations/n8n/agents";
import { UniversalAgentRunner } from "@/components/agents/UniversalAgentRunner";
import { N8nAgentConfigModal } from "@/components/agents/N8nAgentConfigModal";
import { useToast } from "@/hooks/use-toast";

type Presence = "online" | "busy" | "offline";

interface OpsAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  presence: Presence;
  isSelected?: boolean;
  isAI?: boolean;
  config?: AgentConfig;
}

const HUMAN_AGENTS: OpsAgent[] = [
  {
    id: "olivia-rhye",
    name: "Olivia Rhye",
    role: "Automation Specialist",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCp7I3X34xs2nAgaD4_ap28gmAfZb1KERd-LeW_aVqc-HE4Pfi44c-8x8QHEneiS6X9UU5bLeelULEu-QKL0vShKQunykPTefHSagWMHFgCCywD05msibM2tJww99b30caVvc5s_kFc31K3HdXwIYkwrHml6k5y_eWVdjvheFgxKmSJWn-Tvxatu-T-eqDgEfiwCrEx9hUPk5nbSlNhIUvml6dSmkIhquDM7VeVKiNCCxLGc-7-qI3OavPhynQf1k17mHJj4bdjb52w",
    presence: "online",
  },
  {
    id: "phoenix-baker",
    name: "Phoenix Baker",
    role: "Process Analyst",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjRA1FwwN92_D7D0lDu7xyHP8H--xZaBevmd8Pxf6B0fzqNvetNl49vLs68CjOdbxGIJ7uFxAptN6XIhYnuIGqt1fD5x817ArrPdi2LMNvmUpaScxDeLF2T4MwkxXcw0rWvvF6t05jV22NgEP4v5kzunvsFxGxQ3OeniIMV7ZdKWHZycdUjMK7KeRlUhOq8bN69YfW40tdID-usb3aKXJQcFSSOEzIgbT1QYqaoA7OwaDMMXhGsmTu4E5N8BOK5_61l_Dfgq8iak2F",
    presence: "online",
  },
  {
    id: "lana-steiner",
    name: "Lana Steiner",
    role: "Team Lead",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdVTQbJxrd5r3RleaZtHIYlbjC-y72x4bUu0ZIKYPsczSyOV7do4mAjeO7l2KtYuxmxWBz6r7wojabKzcDrcVuZTGY0ylG_jxwW8uHRk0uoHkchUE9i_OL7EAHBnbNJMRnvjKekoDu5PdOL1f7SP27UApIS8qfzZzI_hqm-AORgdxjHbEEz79XO2vL9Tz1JIlYdSJMCxoRfThi_mAUf8ewUJREA3LeYFu4_xGq5dTPlMuC5u_BXt_CPMd-dDpctJYMssneu86IF4YI",
    presence: "busy",
  },
  {
    id: "demi-wilkinson",
    name: "Demi Wilkinson",
    role: "Data Entry Clerk",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgmSdWWL1o7JFIv6fe8PxLQdDixLy_LGOmzn5aWynRsOx3jhAMMrs94NOylWBE9-CH_j4uG_8Q-BYpQy4-dNGsw9ssMSSikOKun7d-ECUPJLPiiH1n6aDpKPgFth6cWlBtaXw_CWZqM7DuT7-4ftk1kOKJ6Uv4cJNC9Ra-_6N_AEH1OhoOWjRXw5oDKFFeaUcBYc8RnApFCd-2A_E9wwvhO2-8kADdpAK-VfzhAOX6pBBebqOS4EJpx-Y04QCKOSNq65hX_ZsU-QE5",
    presence: "offline",
  },
];

function presenceDotColor(p: Presence) {
  if (p === "online") return "bg-emerald-500";
  if (p === "busy") return "bg-amber-400";
  return "bg-muted-foreground/50";
}

export default function OperationsAgents() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [aiAgents, setAiAgents] = useState<OpsAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<OpsAgent | null>(null);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Load AI agents from database
  useEffect(() => {
    loadAiAgents();
  }, [clientId]);

  async function loadAiAgents() {
    try {
      // Get both predefined and user-configured agents for operations
      const configs = await listAgentConfigs({ area: "operations", clientId, includePredefined: true });
      
      const mapped: OpsAgent[] = configs.map((cfg) => ({
        id: `ai-${cfg.agent_key}`,
        name: cfg.display_name || cfg.agent_key,
        role: cfg.display_role || "AI Agent",
        avatar: cfg.avatar_url || "/placeholder.svg",
        presence: "online" as Presence,
        isAI: true,
        config: cfg,
      }));

      setAiAgents(mapped);
    } catch (e) {
      console.error("Failed to load AI agents:", e);
    }
  }

  const allAgents = [...aiAgents, ...HUMAN_AGENTS];

  function handleAgentClick(agent: OpsAgent) {
    setSelectedAgent(agent);
    if (agent.isAI && agent.config) {
      setRunnerOpen(true);
    }
  }

  function handleConfigureAgent(agent: OpsAgent) {
    if (agent.isAI) {
      setSelectedAgent(agent);
      setConfigOpen(true);
    }
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <OperationsSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/client/${clientId}`)}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Client Dashboard
        </Button>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              Operations Agents
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage operational agents, AI assistants, and team performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="gap-2" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Agent
            </Button>
            <Button className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Run Report
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Agents list */}
          <aside className="lg:col-span-4">
            <Card className="flex h-full flex-col gap-6 border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Agents ({allAgents.length})
                </h2>
                <span className="text-muted-foreground">•••</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-stretch overflow-hidden rounded-lg border border-border">
                  <div className="flex items-center justify-center px-3 text-muted-foreground">
                    <span className="sr-only">Search</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-70">
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5m-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
                      />
                    </svg>
                  </div>
                  <input
                    className="w-full border-0 bg-muted/40 px-3 py-2 text-sm outline-none"
                    placeholder="Find an agent..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-8 text-xs">
                    Status: All
                  </Button>
                  <Button variant="outline" className="h-8 text-xs">
                    Type: All
                  </Button>
                </div>
              </div>

              {/* AI Agents Section */}
              {aiAgents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Agents
                  </h3>
                  <div className="-mx-2 flex flex-col gap-2">
                    {aiAgents.map((a) => (
                      <div
                        key={a.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-lg p-2 ${
                          selectedAgent?.id === a.id ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => handleAgentClick(a)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={a.avatar} alt={a.name} />
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-card ${presenceDotColor(
                              a.presence,
                            )}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{a.role}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAgentClick(a);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfigureAgent(a);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Team Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
                <div className="-mx-2 flex flex-col gap-2 overflow-y-auto pr-2">
                  {HUMAN_AGENTS.map((a) => (
                    <div
                      key={a.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-lg p-2 ${
                        selectedAgent?.id === a.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedAgent(a)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={a.avatar} alt={a.name} />
                          <AvatarFallback>{a.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-card ${presenceDotColor(
                            a.presence,
                          )}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.role}</p>
                      </div>
                      <span className="text-primary">›</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </aside>

          {/* Right: Metrics and charts */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border border-border bg-card p-5">
                <div className="text-sm text-muted-foreground">Active Agents</div>
                <div className="mt-1 text-3xl font-bold text-foreground">
                  {allAgents.filter(a => a.presence === "online").length} <span className="text-base font-medium text-muted-foreground">/ {allAgents.length}</span>
                </div>
              </Card>
              <Card className="border border-border bg-card p-5">
                <div className="text-sm text-muted-foreground">AI Agents</div>
                <div className="mt-1 text-3xl font-bold text-foreground">{aiAgents.length}</div>
              </Card>
              <Card className="border border-border bg-card p-5">
                <div className="text-sm text-muted-foreground">Team Efficiency</div>
                <div className="mt-1 text-3xl font-bold text-foreground">88%</div>
              </Card>
            </div>

            {/* Tabs (static display) */}
            <div className="border-b border-border">
              <nav className="-mb-px flex gap-6">
                <button className="border-b-2 border-primary px-1 pb-3 text-xs font-semibold text-primary">
                  Overview
                </button>
                <button className="border-b-2 border-transparent px-1 pb-3 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Projects
                </button>
                <button className="border-b-2 border-transparent px-1 pb-3 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Analytics
                </button>
              </nav>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {/* Workflow Efficiency (simple bars) */}
              <Card className="border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground">Workflow Efficiency</h3>
                <div className="mt-4 flex h-60 items-end gap-2 rounded-md bg-muted p-4">
                  {[
                    "60%",
                    "80%",
                    "95%",
                    "85%",
                    "75%",
                    "88%",
                  ].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-md bg-primary ${i !== 2 ? "opacity-30" : ""}`}
                      style={{ height: h }}
                    />
                  ))}
                </div>
              </Card>

              {/* Team Health Pulse (donut) */}
              <Card className="border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground">Team Health Pulse</h3>
                <div className="mt-4 flex items-center justify-center">
                  <div className="relative h-48 w-48">
                    <svg viewBox="0 0 36 36" className="h-full w-full">
                      <path
                        className="text-red-500/30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-yellow-400/30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="90,100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary/30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="70,100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-red-500"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="10,100"
                        strokeDashoffset="-90"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-yellow-400"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="20,100"
                        strokeDashoffset="-70"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="70,100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">Good</span>
                      <span className="text-xs text-muted-foreground">Overall</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" /> Excellent
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-yellow-400" /> Good
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" /> Needs Attention
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>

        {/* Universal Agent Runner Modal */}
        {selectedAgent?.isAI && selectedAgent.config && (
          <UniversalAgentRunner
            agent={selectedAgent.config}
            open={runnerOpen}
            onOpenChange={setRunnerOpen}
          />
        )}

        {/* Agent Configuration Modal */}
        <N8nAgentConfigModal
          open={configOpen}
          onOpenChange={setConfigOpen}
          scope="client"
          clientId={clientId}
          area="operations"
          agentKey={selectedAgent?.config?.agent_key}
          title={`Configure ${selectedAgent?.name || "Agent"}`}
          onSaved={loadAiAgents}
        />

        {/* Add New Agent Modal */}
        <N8nAgentConfigModal
          open={addOpen}
          onOpenChange={setAddOpen}
          scope="client"
          clientId={clientId}
          area="operations"
          title="Add Operations Agent"
          onSaved={loadAiAgents}
        />
      </main>
    </div>
  );
}
