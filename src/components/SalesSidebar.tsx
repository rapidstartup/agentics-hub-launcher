import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  LayoutDashboard,
  ArrowLeft,
  LineChart,
  FolderKanban,
  Workflow,
  Phone,
  Plug,
} from "lucide-react";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

export const SalesSidebar = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { isOpen } = useSidebarToggle();

  const sections = [
    {
      label: "MAIN DASHBOARD",
      items: [
        { title: "Overview", path: `/client/${clientId}/sales`, icon: LayoutDashboard },
        { title: "Analytics", path: `/client/${clientId}/sales/analytics`, icon: LineChart },
        { title: "Projects", path: `/client/${clientId}/sales/projects`, icon: FolderKanban },
        { title: "Sales Agents", path: `/client/${clientId}/sales/agents`, icon: Users },
      ],
    },
    {
      label: "SALES ENABLEMENT",
      items: [
        { title: "Pipeline Manager", path: `/client/${clientId}/sales/pipeline`, icon: Workflow },
        { title: "Call Scripts", path: `/client/${clientId}/sales/call-scripts`, icon: Phone },
        { title: "CRM Integration", path: `/client/${clientId}/sales/crm-integration`, icon: Plug },
      ],
    },
  ];

  return (
    <aside className={`${isOpen ? "flex" : "hidden"} h-screen min-w-64 w-64 shrink-0 flex-col border-r border-border bg-background`}>
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="whitespace-nowrap text-xl font-bold text-foreground">Sales HQ</h1>
        </div>
      </div>

      {/* Back to Client Dashboard */}
      <div className="relative z-0 px-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/client/${clientId}`)}
          className="w-full justify-start gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">Client Dashboard</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/client/${clientId}/sales`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};


