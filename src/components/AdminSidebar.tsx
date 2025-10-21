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
  ChevronDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { id: "agency-pulse", title: "Agency Pulse", icon: Gauge, path: "/admin" },
  { id: "client-management", title: "Client Management", icon: Users, path: "/admin/clients" },
  { id: "task-orchestration", title: "Task Orchestration", icon: CheckSquare, path: "/admin/tasks" },
  { id: "revenue-analytics", title: "Revenue Analytics", icon: DollarSign, path: "/admin/revenue" },
  { id: "department-health", title: "Department Health", icon: Activity, path: "/admin/departments" },
  { id: "team-management", title: "Team Management", icon: UserCog, path: "/admin/team" },
  { id: "resource-allocation", title: "Resource Allocation", icon: Layers, path: "/admin/resources" },
];

const quickAccessItems = [
  { id: "reports", title: "Reports", icon: FileText, path: "/admin/reports" },
  { id: "calendar", title: "Calendar", icon: Calendar, path: "/admin/calendar" },
  { id: "settings", title: "Settings", icon: Settings, path: "/admin/settings" },
  { id: "notifications", title: "Notifications", icon: Bell, path: "/admin/notifications" },
];

export const AdminSidebar = () => {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Brand Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <Hexagon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Agentics Hub</h2>
          </div>
        </div>
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

        {/* View Switcher Section */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            View Switcher
          </p>
          <nav className="space-y-1">
            <NavLink
              to="/"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Switch to Client View</span>
            </NavLink>
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
