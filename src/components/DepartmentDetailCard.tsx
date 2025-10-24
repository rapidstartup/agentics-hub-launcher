import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Agent {
  name: string;
  status: "Active" | "Inactive";
}

interface DepartmentDetailCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  agentCount: number;
  agents: Agent[];
}

export const DepartmentDetailCard = ({
  title,
  description,
  icon: Icon,
  agentCount,
  agents,
}: DepartmentDetailCardProps) => {
  return (
    <Card className="border border-border bg-card p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
            {agentCount} Agents
          </Badge>
        </div>

        {/* Agent List */}
        <div className="space-y-2">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-foreground">{agent.name}</span>
              <span className="text-xs text-muted-foreground">{agent.status}</span>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <Button
          variant="outline"
          className="w-full border-primary/20 text-primary hover:bg-primary/10"
          asChild
        >
          <Link to={title === "Advertising" ? "/advertising" : "#"}>
            Access {title} Tools
          </Link>
        </Button>
      </div>
    </Card>
  );
};
