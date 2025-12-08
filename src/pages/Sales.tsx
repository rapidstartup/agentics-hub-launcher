import { useNavigate, useParams } from "react-router-dom";
import { SalesSidebar } from "@/components/SalesSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DepartmentKPIs } from "@/components/departments/DepartmentKPIs";
import { getDepartmentConfig } from "@/components/departments/config";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sales = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { kpis, projects, healthPulse } = getDepartmentConfig("sales");

  return (
    <div className="flex min-h-screen w-full" style={{ background: 'var(--page-bg)' }}>
      <SalesSidebar />

      <main className="flex-1 p-6 lg:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/client/${clientId}`)}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Client Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Sales Overview</h1>
          <p className="text-muted-foreground">
            Track revenue, leads and team performance across your sales organization
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: KPIs */}
          <div className="space-y-8 lg:col-span-2">
            <DepartmentKPIs kpis={kpis} />
          </div>

          {/* Right: Health & Projects */}
          <aside className="space-y-6 lg:col-span-1">
            <Card className="border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-base font-medium text-foreground">Department Health Pulse</p>
                <p className="text-lg font-bold text-primary">{(healthPulse ?? 0).toString()}%</p>
              </div>
              <Progress value={healthPulse ?? 0} className="h-2" />
              <p className="mt-3 text-sm text-muted-foreground">
                Team morale and performance metrics are strong.
              </p>
            </Card>

            <Card className="border border-border bg-card p-6">
              <h2 className="mb-4 text-[22px] font-bold leading-tight tracking-tight text-foreground">
                Optimization Projects
              </h2>
              <div className="flex flex-col gap-5">
                {(projects || []).map((p, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {p.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full">
                        <Progress value={p.progress} className="h-1.5" />
                      </div>
                      <Avatar className="-ml-2 h-6 w-6">
                        {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt="project owner" /> : null}
                        <AvatarFallback>PO</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Sales;


