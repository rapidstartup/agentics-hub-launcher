import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}

export const StatsCard = ({ label, value, subtitle, icon: Icon }: StatsCardProps) => {
  return (
    <Card className="border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
