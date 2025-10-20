import { 
  LayoutDashboard, 
  Target, 
  Megaphone, 
  TrendingUp, 
  Users, 
  Settings, 
  DollarSign, 
  Shield,
  Bot,
  BookOpen,
  BarChart3,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "strategy", title: "Strategy", icon: Target, path: "/strategy" },
  { id: "advertising", title: "Advertising", icon: Megaphone, path: "/advertising" },
  { id: "marketing", title: "Marketing", icon: TrendingUp, path: "/marketing" },
  { id: "sales", title: "Sales", icon: Users, path: "/sales" },
  { id: "operations", title: "Operations", icon: Settings, path: "/operations" },
  { id: "financials", title: "Financials", icon: DollarSign, path: "/financials" },
  { id: "system", title: "System Control", icon: Shield, path: "/system" },
];

const quickAccessItems = [
  { id: "agents", title: "All Agents", icon: Bot, path: "/agents" },
  { id: "knowledge", title: "Knowledge Base", icon: BookOpen, path: "/knowledge" },
  { id: "analytics", title: "Analytics", icon: BarChart3, path: "/analytics" },
];

export const ChatSidebar = () => {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Brand Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Business AI</h2>
            <p className="text-xs text-muted-foreground">Hub</p>
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
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-sidebar-accent"
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
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-sidebar-accent"
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
