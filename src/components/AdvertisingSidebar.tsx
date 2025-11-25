import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  LayoutDashboard,
  LineChart,
  FolderKanban,
  Wand2,
  Brain,
  Target,
  Eye,
  TrendingUp,
  Award,
  FileText,
  BookOpen,
  Image,
  Palette,
  BarChart3,
  ArrowLeft,
  Users,
} from "lucide-react";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

export const AdvertisingSidebar = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { isOpen } = useSidebarToggle();

  const navigationSections = [
    {
      label: "MAIN DASHBOARD",
      items: [
        { title: "Overview", path: `/client/${clientId}/advertising`, icon: LayoutDashboard },
        { title: "Analytics", path: `/client/${clientId}/advertising/analytics`, icon: LineChart },
        { title: "Projects", path: `/client/${clientId}/advertising/projects`, icon: FolderKanban },
        { title: "Advertising Agents", path: `/client/${clientId}/advertising/agents`, icon: Users },
      ],
    },
    {
      label: "AD LAUNCHER",
      items: [
        { title: "Ad Creator", path: `/client/${clientId}/advertising/ad-creator`, icon: Wand2 },
        { title: "AI CMO", path: `/client/${clientId}/advertising/ai-cmo`, icon: Brain },
        { title: "Campaign Manager", path: `/client/${clientId}/advertising/campaign-manager`, icon: Target },
      ],
    },
    {
      label: "AD RESEARCH",
      items: [
        { title: "Ad Spy", path: `/client/${clientId}/advertising/ad-spy`, icon: Eye },
        { title: "Ad Optimizer", path: `/client/${clientId}/advertising/ad-optimizer`, icon: BarChart3 },
        { title: "Market Research", path: `/client/${clientId}/advertising/market-research`, icon: TrendingUp },
      ],
    },
    {
      label: "CENTRAL BRAIN",
      items: [
        { title: "Knowledge Base", path: `/client/${clientId}/knowledge`, icon: BookOpen },
        { title: "Proven Assets", path: `/client/${clientId}/advertising/proven-assets`, icon: Award },
        { title: "Offer Details", path: `/client/${clientId}/advertising/offer-details`, icon: FileText },
        { title: "Creative Library", path: `/client/${clientId}/advertising/creative-library`, icon: Image },
      ],
    },
    {
      label: "PROJECT SETTINGS",
      items: [
        { title: "Brand Details", path: `/client/${clientId}/advertising/brand-details`, icon: Palette },
      ],
    },
  ];

  return (
    <aside className={`${isOpen ? "flex" : "hidden"} h-screen min-w-64 w-64 flex-col border-r border-border bg-background shrink-0`}>
      {/* Header with Logo */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground whitespace-nowrap">AdLaunch Pro</h1>
        </div>
      </div>

      {/* Back to Client Dashboard */}
      <div className="px-4 pt-4 relative z-0">
        <Button
          variant="outline"
          onClick={() => navigate(`/client/${clientId}`)}
          className="w-full justify-start gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">Client Dashboard</span>
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide relative z-10">
        <div className="space-y-4">
          {navigationSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/client/${clientId}/advertising`}
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
