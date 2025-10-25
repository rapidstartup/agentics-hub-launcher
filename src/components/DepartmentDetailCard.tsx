import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCw } from "lucide-react";
import { ScheduleManagementModal } from "./ScheduleManagementModal";
import { RunNowModal } from "./RunNowModal";
import { StatusChangeModal } from "./StatusChangeModal";
import { useParams } from "react-router-dom";

interface Agent {
  name: string;
  status: "Active" | "Inactive" | "Paused";
  schedule?: "daily" | "weekly" | "monthly";
  canRunNow?: boolean;
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
  const { clientId } = useParams();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [runNowModalOpen, setRunNowModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const clientNames: Record<string, string> = {
    "techstart-solutions": "TechStart Solutions",
    "healthhub-medical": "HealthHub Medical",
    "global-consulting": "Global All-In-Consulting",
  };

  const clientName = clientNames[clientId || ""] || "Client";

  const handleScheduleClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setScheduleModalOpen(true);
  };

  const handleRunNowClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setRunNowModalOpen(true);
  };

  const handleStatusClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setStatusModalOpen(true);
  };

  const handleSaveSchedule = (newSchedule: "daily" | "weekly" | "monthly") => {
    console.log(`Updated ${selectedAgent?.name} schedule to ${newSchedule}`);
    // Here you would update the backend
  };

  const handleSaveStatus = (newStatus: "Active" | "Inactive" | "Paused") => {
    console.log(`Updated ${selectedAgent?.name} status to ${newStatus}`);
    // Here you would update the backend
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "Active":
        return "text-green-500";
      case "Paused":
        return "text-yellow-500";
      case "Inactive":
        return "text-muted-foreground";
    }
  };

  const agentListContent = agents.map((agent, index) => (
    <div
      key={index}
      className="flex items-center justify-between gap-3 py-2 text-sm group hover:bg-muted/50 px-2 rounded-md transition-colors"
    >
      <span className="text-foreground flex-1">{agent.name}</span>
      <div className="flex items-center gap-2 ml-auto">
        {agent.schedule && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 text-xs capitalize"
            onClick={() => handleScheduleClick(agent)}
          >
            {agent.schedule}
          </Badge>
        )}
        {agent.canRunNow && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRunNowClick(agent)}
            title="Run now"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Badge
          variant="outline"
          className={`cursor-pointer hover:bg-muted text-xs w-16 justify-center ${getStatusColor(agent.status)}`}
          onClick={() => handleStatusClick(agent)}
        >
          {agent.status}
        </Badge>
      </div>
    </div>
  ));

  return (
    <>
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

          {/* Agent List - Scrollable if more than 3 */}
          {agents.length > 3 ? (
            <ScrollArea className="h-[180px] pr-4">
              <div className="space-y-1">
                {agentListContent}
              </div>
            </ScrollArea>
          ) : (
            <div className="space-y-1">
              {agentListContent}
            </div>
          )}

          {/* Footer Button */}
          <Button
            variant="outline"
            className="w-full border-primary/20 text-primary hover:bg-primary/10"
            asChild
          >
            <Link to={title === "Advertising" ? `/client/${clientId}/advertising` : "#"}>
              Access {title} Tools
            </Link>
          </Button>
        </div>
      </Card>

      {/* Modals */}
      {selectedAgent?.schedule && (
        <ScheduleManagementModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          agentName={selectedAgent.name}
          currentSchedule={selectedAgent.schedule}
          onSave={handleSaveSchedule}
        />
      )}

      {selectedAgent?.canRunNow && (
        <RunNowModal
          open={runNowModalOpen}
          onOpenChange={setRunNowModalOpen}
          agentName={selectedAgent.name}
          clientName={clientName}
        />
      )}

      {selectedAgent && (
        <StatusChangeModal
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          agentName={selectedAgent.name}
          currentStatus={selectedAgent.status}
          onSave={handleSaveStatus}
        />
      )}
    </>
  );
};
