import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MarketingSidebar } from "@/components/MarketingSidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  FileText,
  Plus,
  ArrowLeft,
} from "lucide-react";

const Marketing = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [timeRange, setTimeRange] = useState("7d");

  const cards = [
    { icon: Users, label: "Total Agents", value: "12", trend: "+2 this month", trendColor: "text-emerald-500" },
    { icon: TrendingUp, label: "Active Campaigns", value: "8", trend: "+5% vs last week", trendColor: "text-emerald-500" },
    { icon: FileText, label: "Content Output", value: "64", trend: "-3% vs last week", trendColor: "text-amber-500" },
    { icon: TrendingUp, label: "Department Health", value: "92%", trend: "-1% vs last week", trendColor: "text-red-500" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <MarketingSidebar />

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Marketing Overview</h1>
              <p className="text-muted-foreground">Monitor your marketing performance and manage agents</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, idx) => (
              <Card key={idx} className="border border-border bg-card p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-base font-medium text-muted-foreground">{c.label}</p>
                  <c.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold leading-tight tracking-tight text-foreground">{c.value}</p>
                  <span className={`text-sm font-medium ${c.trendColor}`}>{c.trend}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Marketing;





