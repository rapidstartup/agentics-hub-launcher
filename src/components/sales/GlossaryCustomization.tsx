import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

type GlossaryTerm = {
  key: string;
  label: string;
  category: string;
  description?: string;
  defaultEnabled?: boolean;
};

const DEFAULT_TERMS: GlossaryTerm[] = [
  { key: "activity.call", label: "Call", category: "General", description: "A phone or video call with a prospect", defaultEnabled: true },
  { key: "activity.email", label: "Email", category: "General", description: "Any outbound or inbound email touchpoint", defaultEnabled: true },
  { key: "activity.meeting", label: "Meeting", category: "General", description: "Scheduled in-person or virtual meeting", defaultEnabled: true },
  { key: "crm.account", label: "Account", category: "General", description: "A company or household you sell to", defaultEnabled: true },
  { key: "lead.contact", label: "Contact", category: "General", description: "An individual associated with an account", defaultEnabled: true },
  { key: "lead.lead", label: "Lead", category: "Funnel", description: "Shows interest; early stage", defaultEnabled: true },
  { key: "lead.qualified", label: "Qualified Lead", category: "Funnel", description: "Meets your qualification criteria", defaultEnabled: true },
  { key: "lead.prospect", label: "Prospect", category: "Funnel", description: "Actively engaged; moving through pipeline", defaultEnabled: true },
  { key: "customer.customer", label: "Customer", category: "Funnel", description: "Purchase made; transactional", defaultEnabled: true },
  { key: "customer.client", label: "Client", category: "Funnel", description: "Ongoing relationship with repeat business", defaultEnabled: true },
  { key: "metric.pipeline", label: "Pipeline", category: "Metrics", description: "Active opportunities and value", defaultEnabled: true },
  { key: "metric.win-rate", label: "Win Rate", category: "Metrics", description: "Closed-won / total opportunities", defaultEnabled: true },
  { key: "metric.acv", label: "ACV", category: "Metrics", description: "Annual contract value", defaultEnabled: true },
  { key: "metric.ltv", label: "LTV", category: "Metrics", description: "Lifetime value", defaultEnabled: true },
  { key: "metric.cac", label: "CAC", category: "Metrics", description: "Customer acquisition cost", defaultEnabled: true },
];

export const GlossaryCustomization = ({ storageNamespace }: { storageNamespace: string }) => {
  const storageKey = useMemo(() => `${storageNamespace}_glossary_terms`, [storageNamespace]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setEnabled(JSON.parse(raw));
      } else {
        const defaults: Record<string, boolean> = {};
        DEFAULT_TERMS.forEach((t) => {
          defaults[t.key] = t.defaultEnabled !== false;
        });
        setEnabled(defaults);
      }
    } catch (e) {
      console.error("Failed to load glossary settings", e);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(enabled));
    } catch (e) {
      console.error("Failed to persist glossary settings", e);
    }
  }, [enabled, storageKey]);

  const filtered = DEFAULT_TERMS.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return t.label.toLowerCase().includes(s) || t.category.toLowerCase().includes(s) || t.key.toLowerCase().includes(s);
  });

  const byCategory = filtered.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
    acc[term.category] = acc[term.category] || [];
    acc[term.category].push(term);
    return acc;
  }, {});

  const toggleTerm = (key: string) => {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    DEFAULT_TERMS.forEach((t) => {
      if (!search || filtered.includes(t)) {
        next[t.key] = value;
      } else {
        next[t.key] = enabled[t.key] ?? t.defaultEnabled !== false;
      }
    });
    setEnabled(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Glossary &amp; Terminology</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enable or disable terms, adjust labels, and guide AI / forms / widgets with consistent sales language.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-muted/40">
          <CardContent className="p-4 grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Your Glossary Terms</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Lead vs Contact — leads show interest; contacts can exist without interest.</li>
                <li>Lead vs Prospect — prospects are qualified/active; leads are earlier stage.</li>
                <li>Customer vs Client — customer is transactional; client is ongoing/relationship.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Typical Contact Journey</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Contact → Lead (shows interest)</li>
                <li>Lead → Qualified Lead (meets criteria)</li>
                <li>Qualified Lead → Prospect (active engagement)</li>
                <li>Prospect → Customer (purchase made)</li>
                <li>Customer → Client (ongoing relationship)</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAll(true)}>
              Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAll(false)}>
              Disable All
            </Button>
          </div>
          <Input
            placeholder="Search terms by key, label, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
        </div>

        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, terms]) => (
            <Card key={category} className="border-border">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{category}</Badge>
                  <span className="text-xs text-muted-foreground">{terms.length} terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [category]: !prev[category] }))
                    }
                    className="text-xs"
                  >
                    {expanded[category] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Expand
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {terms.map((term) => (
                  <div
                    key={term.key}
                    className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{term.label}</p>
                        <Badge variant="outline" className="text-xs">
                          {term.key}
                        </Badge>
                      </div>
                      {(expanded[category] || search) && (
                        <p className="text-sm text-muted-foreground mt-1">{term.description}</p>
                      )}
                    </div>
                    <Switch checked={enabled[term.key] !== false} onCheckedChange={() => toggleTerm(term.key)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlossaryCustomization;
