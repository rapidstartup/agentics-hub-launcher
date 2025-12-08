import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, LayoutDashboard } from "lucide-react";
import { useSalesDashboards } from "@/hooks/useSalesDashboards";
import DashboardRenderer from "@/components/dashboard/DashboardRenderer";

const SalesDashboard = () => {
  const { clientId } = useParams();
  const { dashboards, sheets, isLoading, createDashboard, updateDashboard, deleteDashboard, saveState } =
    useSalesDashboards({ clientId });
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDashboard = useMemo(() => {
    if (!dashboards.length) return null;
    const found = dashboards.find((d) => d.id === activeId);
    return found || dashboards[0];
  }, [dashboards, activeId]);

  const handleCreate = () => {
    const id = createDashboard();
    setActiveId(id);
  };

  const handleDelete = () => {
    if (!activeDashboard) return;
    deleteDashboard(activeDashboard.id);
    setActiveId(null);
  };

  const handleRename = (name: string) => {
    if (!activeDashboard) return;
    updateDashboard({ ...activeDashboard, name });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboards...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full" style={{ background: "var(--page-bg)" }}>
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Sales Dashboards
            </div>
            <h1 className="text-3xl font-bold text-foreground leading-tight">Custom Sales Dashboards</h1>
            <p className="text-muted-foreground text-sm">
              Manage widgets and analytics views for your sales team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={!activeDashboard}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Tabs value={activeDashboard?.id || dashboards[0]?.id} onValueChange={setActiveId}>
                  <TabsList className="flex flex-wrap gap-1">
                    {dashboards.map((d) => (
                      <TabsTrigger key={d.id} value={d.id} className="text-sm">
                        {d.name}
                      </TabsTrigger>
                    ))}
                    {dashboards.length === 0 && <span className="text-sm text-muted-foreground px-2">No dashboards yet</span>}
                  </TabsList>
                </Tabs>
              </div>
              <div className="text-xs text-muted-foreground">
                {saveState === "saving" ? "Saving..." : saveState === "error" ? "Save error" : "Saved"}
              </div>
            </div>
            {activeDashboard && (
              <div className="mt-3">
                <input
                  className="w-full bg-transparent text-lg font-semibold focus:outline-none"
                  value={activeDashboard.name}
                  onChange={(e) => handleRename(e.target.value)}
                />
                {activeDashboard.description && (
                  <p className="text-sm text-muted-foreground">{activeDashboard.description}</p>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {activeDashboard ? (
              <DashboardRenderer components={activeDashboard.components} sheets={sheets} />
            ) : (
              <div className="text-center text-muted-foreground py-10">
                Create your first dashboard to start visualizing sales data.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SalesDashboard;
