import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Rocket,
  LayoutDashboard,
  LineChart,
  FolderKanban,
  Wand2,
  Brain,
  Target,
  Eye,
  Heart,
  TrendingUp,
  Award,
  FileText,
  BookOpen,
  Image,
  Palette,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navigationSections = [
  {
    label: "MAIN DASHBOARD",
    items: [
      { title: "Overview", path: "/advertising", icon: LayoutDashboard },
      { title: "Analytics", path: "/advertising/analytics", icon: LineChart },
      { title: "Projects", path: "/advertising/projects", icon: FolderKanban },
    ],
  },
  {
    label: "AD LAUNCHER",
    items: [
      { title: "Ad Creator", path: "/advertising/ad-creator", icon: Wand2 },
      { title: "AI CMO", path: "/advertising/ai-cmo", icon: Brain },
      { title: "Campaign Manager", path: "/advertising/campaign-manager", icon: Target },
    ],
  },
  {
    label: "AD SPY",
    items: [
      { title: "Ad Spy", path: "/advertising/ad-spy", icon: Eye },
      { title: "Sentiment Analyzer", path: "/advertising/sentiment-analyzer", icon: Heart },
      { title: "Market Research", path: "/advertising/market-research", icon: TrendingUp },
    ],
  },
  {
    label: "CENTRAL BRAIN",
    items: [
      { title: "Proven Assets", path: "/advertising/proven-assets", icon: Award },
      { title: "Offer Details", path: "/advertising/offer-details", icon: FileText },
      { title: "Knowledge Base", path: "/advertising/knowledge-base", icon: BookOpen },
      { title: "Creative Library", path: "/advertising/creative-library", icon: Image },
    ],
  },
  {
    label: "PROJECT SETTINGS",
    items: [
      { title: "Brand Details", path: "/advertising/brand-details", icon: Palette },
    ],
  },
];

export const AdvertisingSidebar = () => {
  const [selectedProject, setSelectedProject] = useState("ecommerce");
  const [selectedAccount, setSelectedAccount] = useState("main");

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-background">
      {/* Header with Logo */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">AdLaunch Pro</h1>
        </div>
      </div>

      {/* Project and Ad Account Selectors */}
      <div className="space-y-3 border-b border-border p-6">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            PROJECT
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">E-commerce Store</SelectItem>
              <SelectItem value="saas">SaaS Platform</SelectItem>
              <SelectItem value="fitness">Fitness App</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            AD ACCOUNT
          </label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Store Account</SelectItem>
              <SelectItem value="secondary">Secondary Account</SelectItem>
              <SelectItem value="testing">Testing Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {navigationSections.map((section, index) => (
            <Collapsible key={section.label} defaultOpen={index === 0}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent transition-colors">
                {section.label}
                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/advertising"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </nav>
    </aside>
  );
};
