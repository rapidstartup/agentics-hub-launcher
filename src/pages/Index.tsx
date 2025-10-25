import { useParams } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";
import { StatsCard } from "@/components/StatsCard";
import { DepartmentDetailCard } from "@/components/DepartmentDetailCard";
import { Button } from "@/components/ui/button";
import { 
  Bot,
  Building2,
  TrendingUp as TrendingUpIcon,
  Trophy,
  Plus,
  Bell,
  Settings
} from "lucide-react";
import { departmentsData } from "@/data/departments";

const stats = [
  {
    label: "Total",
    value: "24",
    subtitle: "+3 new this month",
    superscript: "Agents",
    icon: Bot,
  },
  {
    label: "Active",
    value: "7",
    subtitle: "All operational",
    superscript: "Departments",
    icon: Building2,
  },
  {
    label: "Monthly",
    value: "89%",
    subtitle: "+12% from last month",
    superscript: "",
    icon: TrendingUpIcon,
  },
  {
    label: "Efficiency",
    value: "94%",
    subtitle: "Excellent performance",
    superscript: "",
    icon: Trophy,
  },
];

const Index = () => {
  const { clientId } = useParams();
  
  // Map client IDs to display names
  const clientNames: Record<string, string> = {
    "techstart-solutions": "TechStart Solutions",
    "healthhub-medical": "HealthHub Medical",
    "global-consulting": "Global All-In-Consulting",
  };
  
  const clientName = clientNames[clientId || ""] || "Client";
  
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Sidebar */}
      <ChatSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {clientName}
              </h1>
              <span className="text-2xl font-bold text-foreground">|</span>
              <h2 className="text-2xl font-bold text-foreground">
                Business Intelligence
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10">
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                label={stat.label}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Department Overview */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Department Overview
              </h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {departmentsData.map((dept) => (
                <DepartmentDetailCard
                  key={dept.id}
                  title={dept.title}
                  description={dept.description}
                  icon={dept.icon}
                  agentCount={dept.agentCount}
                  agents={dept.agents}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Activity
              </h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
