import { ChatSidebar } from "@/components/ChatSidebar";
import { DepartmentCard } from "@/components/DepartmentCard";
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  Target, 
  Settings, 
  DollarSign 
} from "lucide-react";

const departments = [
  {
    id: "advertising",
    title: "Advertising",
    description: "AI-powered advertising campaigns and media planning tools",
    icon: Megaphone,
    agentCount: 0,
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Marketing automation and content generation agents",
    icon: TrendingUp,
    agentCount: 0,
  },
  {
    id: "sales",
    title: "Sales",
    description: "Sales enablement and customer engagement tools",
    icon: Users,
    agentCount: 0,
  },
  {
    id: "strategy",
    title: "Strategy",
    description: "Strategic planning and business intelligence agents",
    icon: Target,
    agentCount: 0,
  },
  {
    id: "operations",
    title: "Operations",
    description: "Operational efficiency and workflow automation tools",
    icon: Settings,
    agentCount: 0,
  },
  {
    id: "financials",
    title: "Financials",
    description: "Financial analysis and reporting automation agents",
    icon: DollarSign,
    agentCount: 0,
  },
];

const Index = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Sidebar */}
      <ChatSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Select a Department
            </h1>
            <p className="text-muted-foreground">
              Choose a department to explore its AI agents and capabilities
            </p>
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                title={dept.title}
                description={dept.description}
                icon={dept.icon}
                agentCount={dept.agentCount}
              />
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-12 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Connected to n8n Backend
            </h3>
            <p className="text-sm text-muted-foreground">
              All agents are powered by n8n workflows. Add new agents to any department to expand your capabilities.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
