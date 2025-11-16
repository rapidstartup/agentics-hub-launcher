import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderKanban } from "lucide-react";
import { departmentsData } from "@/data/departments";
import { ClientSwitcher } from "@/components/ClientSwitcher";

const ClientProjects = () => {
  const { clientId } = useParams();

  type ProjectStatus = "Not Started" | "In Progress" | "Blocked" | "Complete";
  type Project = {
    id: string;
    title: string;
    departmentId: string;
    owner: string;
    status: ProjectStatus;
    progress: number;
    due: string;
    summary: string;
  };

  // Simple illustrative portfolio based on our department/agent data
  const projects: Project[] = useMemo(
    () => [
      {
        id: "strat-001",
        title: "Market Positioning Plan",
        departmentId: "strategy",
        owner: "Strategy Team",
        status: "In Progress",
        progress: 65,
        due: "2025-12-01",
        summary: "Define ICP, messaging pillars, and differentiation for Q1 campaigns.",
      },
      {
        id: "strat-002",
        title: "Knowledge Base Rollout",
        departmentId: "strategy",
        owner: "Strategy Ops",
        status: "In Progress",
        progress: 40,
        due: "2025-12-15",
        summary: "Centralize FAQs and offer pages; align with company brain indexing.",
      },
      {
        id: "adv-001",
        title: "Ad Creative Strategist",
        departmentId: "advertising",
        owner: "Advertising",
        status: "Not Started",
        progress: 0,
        due: "2025-12-20",
        summary: "Stand up creative strategy workflow for evergreen offers.",
      },
      {
        id: "adv-002",
        title: "Facebook Ads Library Scraper",
        departmentId: "advertising",
        owner: "Advertising",
        status: "In Progress",
        progress: 30,
        due: "2025-11-28",
        summary: "Competitor scans and creative board generation.",
      },
      {
        id: "mkt-001",
        title: "VSL Generator",
        departmentId: "marketing",
        owner: "Content",
        status: "In Progress",
        progress: 55,
        due: "2025-12-05",
        summary: "Produce and iterate long-form VSL variants from briefs.",
      },
      {
        id: "ops-001",
        title: "Automation Rollout",
        departmentId: "operations",
        owner: "Ops",
        status: "In Progress",
        progress: 45,
        due: "2025-12-08",
        summary: "Automate recurring workflows and approvals.",
      },
      {
        id: "fin-001",
        title: "Budget Forecasting Implementation",
        departmentId: "financials",
        owner: "FP&A",
        status: "In Progress",
        progress: 20,
        due: "2025-12-12",
        summary: "Monthly rolling forecast and revenue analytics integration.",
      },
      {
        id: "sales-001",
        title: "CRM Cleanup & Pipeline Hygiene",
        departmentId: "sales",
        owner: "Sales Ops",
        status: "Blocked",
        progress: 15,
        due: "2025-12-03",
        summary: "Normalize stages, dedupe leads, and enforce SLAs.",
      },
    ],
    [],
  );

  const departmentsById = useMemo(
    () =>
      departmentsData.reduce<Record<string, { title: string }>>((acc, d) => {
        acc[d.id] = { title: d.title };
        return acc;
      }, {}),
    [],
  );

  const grouped = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const p of projects) {
      map[p.departmentId] ||= [];
      map[p.departmentId].push(p);
    }
    return map;
  }, [projects]);

  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <span className="text-sm text-muted-foreground">for</span>
              <ClientSwitcher />
            </div>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              New Project
            </Button>
          </div>
        </div>

        <div className="p-10">
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <Card className="border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
            </Card>
            <Card className="border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Departments Involved</p>
              <p className="text-2xl font-bold text-foreground">{Object.keys(grouped).length}</p>
            </Card>
          </div>

          {Object.keys(grouped).map((deptId) => (
            <div key={deptId} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                {departmentsById[deptId]?.title || deptId}
              </h2>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {grouped[deptId].map((p) => (
                  <Card key={p.id} className="border border-border bg-card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.summary}</p>
                      </div>
                      <Badge variant={p.status === "Complete" ? "default" : "secondary"}>{p.status}</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Owner</p>
                        <p className="text-foreground">{p.owner}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due</p>
                        <p className="text-foreground">{p.due}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className="text-foreground">{p.progress}%</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={p.progress} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClientProjects;


