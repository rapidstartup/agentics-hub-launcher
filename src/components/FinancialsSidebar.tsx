import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PiggyBank,
  LayoutDashboard,
  LineChart,
  FolderKanban,
  FileText,
  ArrowLeft,
  Users,
} from "lucide-react";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

export const FinancialsSidebar = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { isOpen } = useSidebarToggle();

  const sections = [
    {
      label: "MAIN DASHBOARD",
      items: [
        { title: "Overview", path: `/client/${clientId}/financials`, icon: LayoutDashboard },
        { title: "Analytics", path: `/client/${clientId}/financials/analytics`, icon: LineChart },
        { title: "Projects", path: `/client/${clientId}/financials/projects`, icon: FolderKanban },
        { title: "Financial Agents", path: `/client/${clientId}/financials/agents`, icon: Users },
      ],
    },
    {
      label: "REPORTING",
      items: [{ title: "Reports", path: `/client/${clientId}/financials/reports`, icon: FileText }],
    },
  ];

  return (
    <aside className={`${isOpen ? "flex" : "hidden"} h-screen min-w-64 w-64 flex-col border-r border-border bg-background shrink-0`}>
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
            <PiggyBank className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground whitespace-nowrap">FinOps Suite</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/client/${clientId}`)}
          className="w-full justify-start gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="truncate">Client Dashboard</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">{section.label}</div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/client/${clientId}/financials`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
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


