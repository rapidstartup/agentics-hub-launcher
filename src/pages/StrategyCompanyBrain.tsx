import { StrategySidebar } from "@/components/StrategySidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCcw } from "lucide-react";

const StrategyCompanyBrain = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <StrategySidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
                Company Brain (RAG)
              </h1>
              <p className="text-sm text-muted-foreground">
                Retrieve-augmented generation over unified knowledge sources.
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reindex Sources
          </Button>
        </div>

        <Card className="border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">Indexed Sources</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Product documentation</li>
            <li>Support articles</li>
            <li>Knowledge base entries</li>
            <li>Sales collateral</li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default StrategyCompanyBrain;


