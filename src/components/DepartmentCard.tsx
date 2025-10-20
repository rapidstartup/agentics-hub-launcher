import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DepartmentCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  agentCount: number;
}

export const DepartmentCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  agentCount,
}: DepartmentCardProps) => {
  return (
    <Card className="group cursor-pointer border border-card-border bg-card p-6 transition-all hover:border-primary">
      <div className="flex flex-col gap-4">
        {/* Icon */}
        <div 
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconColor }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-accent-foreground">
            {agentCount} {agentCount === 1 ? 'agent' : 'agents'} available
          </p>
        </div>
      </div>
    </Card>
  );
};
