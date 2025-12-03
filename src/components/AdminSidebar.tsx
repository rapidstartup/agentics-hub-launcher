import { useState, useEffect } from "react";
import {
  Hexagon,
  Gauge,
  Users,
  CheckSquare,
  DollarSign,
  Activity,
  UserCog,
  Layers,
  FileText,
  Calendar,
  Settings,
  Bell,
  ArrowLeftRight,
  ChevronDown,
  Building2,
  Loader2,
  Brain,
  ToggleLeft
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { listClients, type Client } from "@/integrations/clients/api";

const navigationItems = [
  { id: "agency-pulse", title: "Agency Pulse", icon: Gauge, path: "/admin" },
  { id: "client-management", title: "Client Management", icon: Users, path: "/admin/clients" },
  { id: "feature-toggles", title: "Feature Toggles", icon: ToggleLeft, path: "/admin/feature-toggles" },
  { id: "task-orchestration", title: "Task Orchestration", icon: CheckSquare, path: "/admin/tasks" },
  { id: "revenue-analytics", title: "Revenue Analytics", icon: DollarSign, path: "/admin/revenue" },
  { id: "department-health", title: "Department Health", icon: Activity, path: "/admin/departments" },
  { id: "team-management", title: "Team Management", icon: UserCog, path: "/admin/team" },
  { id: "resource-allocation", title: "Resource Allocation", icon: Layers, path: "/admin/resources" },
];

const quickAccessItems = [
  { id: "central-brain", title: "Knowledge Base", icon: Brain, path: "/admin/central-brain" },
  { id: "reports", title: "Reports", icon: FileText, path: "/admin/reports" },
  { id: "calendar", title: "Calendar", icon: Calendar, path: "/admin/calendar" },
  { id: "settings", title: "Settings", icon: Settings, path: "/admin/settings" },
  { id: "notifications", title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { id: "client-view", title: "Switch to Client View", icon: ArrowLeftRight, path: "/" },
];

export const AdminSidebar = () => {
  const [selectedClient, setSelectedClient] = useState("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const navigate = useNavigate();
  const { isOpen } = useSidebarToggle();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await listClients();
      setClients(data);
    } catch (e) {
      console.error("Failed to load clients:", e);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    
    if (clientId === "all") {
      navigate("/admin");
    } else {
      // clientId is the slug
      navigate(`/client/${clientId}`);
    }
  };

  return (
    <aside className={`${isOpen ? "flex" : "hidden"} h-screen w-64 flex-col border-r border-border bg-sidebar`}>
      {/* Brand Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <Hexagon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Agentix</h2>
          </div>
        </div>
      </div>

      {/* Client Switcher */}
      <div className="px-3 py-4 border-b border-border">
        <Select value={selectedClient} onValueChange={handleClientChange} disabled={loadingClients}>
          <SelectTrigger className="w-full bg-sidebar border-border text-sm h-10">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {loadingClients ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <SelectValue placeholder="Select client" />
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">
              <div className="flex flex-col">
                <span className="text-sm font-medium">All Clients</span>
                <span className="text-xs text-muted-foreground">Overview</span>
              </div>
            </SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.slug}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{client.name}</span>
                  {client.type && (
                    <span className="text-xs text-muted-foreground">{client.type}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Access Section */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Access
          </p>
          <nav className="space-y-1">
            {quickAccessItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-semibold text-primary">AU</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Premium Plan</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
};
