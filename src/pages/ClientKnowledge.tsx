import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, RefreshCcw } from "lucide-react";
import { ClientSwitcher } from "@/components/ClientSwitcher";

const ClientKnowledge = () => {
  const { clientId } = useParams();

  type Doc = { id: string; title: string; type: "FAQ" | "Offer" | "Playbook" | "Doc"; updated: string; };

  const pinnedDocs: Doc[] = useMemo(
    () => [
      { id: "kb-001", title: "TechStart ICP & Messaging Pillars", type: "Playbook", updated: "2025-11-10" },
      { id: "kb-002", title: "Core Offer: Managed Ads + Creative", type: "Offer", updated: "2025-11-08" },
      { id: "kb-003", title: "FAQ: Billing & Reporting Cadence", type: "FAQ", updated: "2025-11-05" },
      { id: "kb-004", title: "Onboarding Checklist", type: "Doc", updated: "2025-11-01" },
    ],
    [],
  );

  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
              <span className="text-sm text-muted-foreground">for</span>
              <ClientSwitcher />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reindex Company Brain
              </Button>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Pinned</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pinnedDocs.map((doc) => (
                <Card key={doc.id} className="border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Last updated {doc.updated}</p>
                    </div>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground">Suggested Sources</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Help Center / FAQs</li>
                <li>Offer pages and sales collateral</li>
                <li>Product docs and internal notes</li>
                <li>Meeting notes and customer interviews</li>
              </ul>
            </Card>

            <Card className="border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground">Company Brain Status</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Indexed sources: product docs, knowledge base entries, support articles, and sales collateral.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tip: Reindex after large updates to FAQs or offers to keep search fresh.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientKnowledge;


