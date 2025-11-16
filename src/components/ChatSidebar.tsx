import { 
  Hexagon,
  LayoutDashboard,
  Shield,
  FolderKanban,
  BookOpen,
  BarChart3,
  ChevronDown,
  Gauge,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { NavLink, useParams } from "react-router-dom";
import { departmentsData } from "@/data/departments";

export const ChatSidebar = () => {
  const { clientId } = useParams();
  
  const navigationItems = [
    { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, path: `/client/${clientId}`, agents: [] },
    ...departmentsData.map(dept => ({
      id: dept.id,
      title: dept.title,
      icon: dept.icon,
      path: `/client/${clientId}/${dept.id}`,
      agents: dept.agents,
    })),
  ];

  const quickAccessItems = [
    { id: "settings", title: "Settings", icon: Settings, path: `/client/${clientId}/settings` },
    { id: "projects", title: "Projects", icon: FolderKanban, path: `/client/${clientId}/projects` },
    { id: "knowledge", title: "Knowledge Base", icon: BookOpen, path: `/client/${clientId}/knowledge` },
    { id: "analytics", title: "Analytics", icon: BarChart3, path: `/client/${clientId}/analytics` },
    { id: "system", title: "System Control", icon: Shield, path: `/client/${clientId}/system` },
  ];

  const adminItems = [
    { id: "admin", title: "Admin Panel", icon: Gauge, path: "/admin" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
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

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const hasDepartmentAgents = item.agents && item.agents.length > 0;
            
            const navLinkContent = (isActive: boolean) => (
              <div
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </div>
            );

            // No nested submenu for Financials; handled inside Financials area

            return hasDepartmentAgents ? (
              <HoverCard key={item.id} openDelay={2000}>
                <HoverCardTrigger asChild>
                  <NavLink to={item.path}>
                    {({ isActive }) => navLinkContent(isActive)}
                  </NavLink>
                </HoverCardTrigger>
                <HoverCardContent side="right" className="w-64">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">{item.title} Agents</h4>
                    <div className="space-y-1">
                      {item.agents.map((agent, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground">
                          • {agent.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <NavLink key={item.id} to={item.path} end={item.id === "dashboard"}>
                {({ isActive }) => navLinkContent(isActive)}
              </NavLink>
            );
          })}
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
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Section */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Super Admin
          </p>
          <nav className="space-y-1">
            {adminItems.map((item) => (
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
