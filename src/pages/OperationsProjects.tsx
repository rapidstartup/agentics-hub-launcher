import { useParams, useNavigate } from "react-router-dom";
import { OperationsSidebar } from "@/components/OperationsSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const OperationsProjects = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full bg-background">
      <OperationsSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/client/${clientId}`)}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Client Dashboard
        </Button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Operations Projects</h1>
          <p className="text-sm text-muted-foreground">Track automation rollouts, optimization initiatives, and QA efforts.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {["Automation Rollout", "Resource Optimization", "Quality Audits"].map((title) => (
            <Card key={title} className="border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">Status: In Progress</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OperationsProjects;


