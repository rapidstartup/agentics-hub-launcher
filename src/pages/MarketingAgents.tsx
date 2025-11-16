import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MarketingSidebar } from "@/components/MarketingSidebar";
import { DepartmentKPIs } from "@/components/departments/DepartmentKPIs";
import type { DepartmentKpi } from "@/components/departments/types";
import {
  Input
} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Filter, Search, Megaphone } from "lucide-react";
import {
  MarketingAgentsTable,
  type MarketingAgentRow,
} from "@/components/departments/marketing/MarketingAgentsTable";

const kpis: DepartmentKpi[] = [
  { label: "Total Agents", value: "12", trend: { direction: "up", value: "+2 this month" } },
  { label: "Active Campaigns", value: "8", trend: { direction: "up", value: "+5% from last week" } },
  { label: "Department Health", value: "92%", trend: { direction: "down", value: "-1% from last week" } },
];

const initialRows: MarketingAgentRow[] = [
  {
    id: "jane-doe",
    name: "Jane Doe",
    role: "Content Manager",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAxZ39Ef-rzCumYSJwudf6rs8Guq47P9Zk_Kv5U8UC24kIuLFRC69HDQp6ezKm20wrODkPm8CDM3W5l9pP16wIuEQOjIrnUBznZZ0GwE-6tQJSVfsAInYhayk8rQJCmtuFgCPDp44-w_SyUiTwHKG-1CrauDTIEqKzJ-oUoTVhxHt8Oyfg785n0IC_pw_V1nWxap0VxZ_7Jluz32Qsn9iLp8gjF7ZOpbqn7vyq9kC8UYKE8vcw4TSlRzxoOuEQLirDiaD7klPl49PJ8",
    status: "active",
    contentProgressPercent: 75,
    contentText: "15/20 Projects",
    campaignsProgressPercent: 60,
    campaignsText: "6/10 Campaigns",
    healthPercent: 95,
  },
  {
    id: "john-smith",
    name: "John Smith",
    role: "Campaign Specialist",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBKklUpnKwU1xAZiZB5CKRPmjDY_wfV8qaCJW-D0VfpSyxyBDvvKii3WzzpKfDDZrsDKTYZ8lnxoQFd6TrX0ORBeyRIJdk7uNTc4-5OWM2qX9pURNi02_rxBFOnKqFJa3nXuQiqocA7ADHm9xMdfCH4nMCRAL7VUFh-yVJVdh_ZJq9sC1ritCVSv3r3Jx53sZ6NRFXNCk3hqCLjeg3xXdsdy80P4K3-y4ySJO_ovCoyFnjMaCGstm_Ys1xmr8eN0UGuJkdTto_ZNLy",
    status: "active",
    contentProgressPercent: 40,
    contentText: "8/20 Projects",
    campaignsProgressPercent: 90,
    campaignsText: "9/10 Campaigns",
    healthPercent: 82,
  },
  {
    id: "emily-white",
    name: "Emily White",
    role: "SEO Specialist",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCURxNMKdyIwYl5i9Dio-zlf3Lt5OCd9HREIY9BYR7AEvOqCtQlDomwpkwv4RaXF_GI1winbGsEuz0FvGoPXL6AX2pu_XYxZHfft742xd2LxCStM4XabSldmCsj5-ipPyC7GjMA9JYqM9XqE91aZXDEKSkylwZuSLAwiVcwcCz49nGrVj0iSVJUIMFpXsR58-QQixtEWro_Q3aVGz9k4lIKydhmKyvKOehzHS7FC3UJVpuxAZAweXWrfKSoPLEFLfqDRsyim5R_tVkk",
    status: "on-leave",
    contentProgressPercent: 10,
    contentText: "2/20 Projects",
    campaignsProgressPercent: 0,
    campaignsText: "0/10 Campaigns",
    healthPercent: 45,
  },
];

export default function MarketingAgents() {
  const { clientId } = useParams();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "on-leave">("all");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialRows.filter((r) => {
      const statusOk = status === "all" ? true : r.status === status;
      const text = `${r.name} ${r.role}`.toLowerCase();
      return statusOk && (q ? text.includes(q) : true);
    });
  }, [query, status]);

  function handleExport() {
    const rows = filteredRows.map((r) => ({
      name: r.name,
      role: r.role,
      status: r.status,
      content: r.contentText,
      campaigns: r.campaignsText,
      health: `${r.healthPercent}%`,
    }));
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-agents-${clientId || "client"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <MarketingSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-background">
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Link className="hover:text-foreground" to={`/client/${clientId}`}>
                    Dashboard
                  </Link>
                  <span>/</span>
                  <Link className="hover:text-foreground" to={`/client/${clientId}`}>
                    Departments
                  </Link>
                  <span>/</span>
                  <span className="text-foreground">Marketing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Megaphone className="h-8 w-8 text-foreground" />
                  <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
                    Marketing Department
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-10">
          {/* KPI Cards */}
          <section>
            <DepartmentKPIs kpis={kpis} />
          </section>

          {/* Controls */}
          <Card className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-4">
            <div className="relative min-w-[250px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 pl-9"
                placeholder="Search for an agent..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="h-10 w-40">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status: All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={handleExport} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </Card>

          {/* Table */}
          <section>
            <MarketingAgentsTable rows={filteredRows} />
          </section>
        </div>
      </main>
    </div>
  );
}


