import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AdvertisingSidebar } from "@/components/AdvertisingSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AdKanbanBoard, Variant } from "@/components/advertising/AdKanbanBoard";



const API_BASE = "/functions/v1";

export default function AdCreatorDashboard() {
  const { clientId } = useParams();
  const [productContext, setProductContext] = useState({ brand: "", offer: "", audience: "", websiteUrl: "" });
  const [winningExamples, setWinningExamples] = useState<string>("");
  const [numVariants, setNumVariants] = useState(5);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [step1Done, setStep1Done] = useState(false);

  const approved = useMemo(() => variants.filter(v => v.status === "approved"), [variants]);
  const review = useMemo(() => variants.filter(v => !v.status || v.status === "review"), [variants]);
  const needsEdits = useMemo(() => variants.filter(v => v.status === "needs_edits"), [variants]);
  const archived = useMemo(() => variants.filter(v => v.status === "archived"), [variants]);
  const step2Enabled = step1Done;
  const step3Enabled = approved.length > 0;

  async function fetchDriveImages() {
    try {
      const r = await fetch(`${API_BASE}/drive-list?q=${encodeURIComponent("mimeType contains 'image/'")}`, {
        headers: { "Content-Type": "application/json" }
      });
      const data = await r.json();
      const files = data?.via === "proxy" ? data?.proxyData : data?.files;
      setAssets(files ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to list Drive assets");
    }
  }

  async function onGenerate() {
    setLoading(true);
    try {
      const body = {
        productContext,
        winningExamples: winningExamples.split("\n").filter(Boolean),
        numVariants
      };
      const r = await fetch(`${API_BASE}/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      const v = (data?.variants ?? []).map((x: Variant) => ({ ...x, status: "review" as const }));
      setVariants(v);
      toast.success(`Generated ${v.length} variants`);
      setStep1Done(true);
    } catch (e) {
      console.error(e);
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function askAIUpdate(target: Variant, instruction: string): Promise<Variant | null> {
    try {
      const body = {
        productContext: { ...productContext, instruction, current: target },
        winningExamples: winningExamples.split("\n").filter(Boolean),
        numVariants: 1
      };
      const r = await fetch(`${API_BASE}/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      const v = (data?.variants ?? [])[0];
      if (!v) return null;
      return {
        headline: v.headline ?? target.headline,
        primaryText: v.primaryText ?? target.primaryText,
        cta: v.cta ?? target.cta,
        websiteUrl: v.websiteUrl ?? target.websiteUrl,
        rationale: v.rationale ?? target.rationale,
        status: target.status
      } as Variant;
    } catch (e) {
      console.error(e);
      toast.error("AI update failed");
      return null;
    }
  }

  async function onPublish() {
    if (approved.length === 0) {
      toast.info("Approve at least one variant before publishing");
      return;
    }
    try {
      const payload = {
        accountId: "ACT_ID_HERE",
        pageId: "PAGE_ID_HERE",
        campaign: { name: "AdCreator Campaign", objective: "CONVERSIONS" },
        adset: { name: "AdCreator Set", optimization_goal: "LINK_CLICKS", billing_event: "IMPRESSIONS", bid_amount: 50 },
        creatives: approved.map(a => ({
          headline: a.headline,
          primaryText: a.primaryText,
          cta: a.cta ?? "LEARN_MORE",
          websiteUrl: a.websiteUrl ?? productContext.websiteUrl,
          assetRefs: [] // assets selected UI would map here
        })),
        dryRun: true
      };
      const r = await fetch(`${API_BASE}/metaads-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (data?.error) throw new Error(data.error);
      toast.success("Publish request prepared (dry run). Configure COMPOSIO_PROXY_URL to execute.");
    } catch (e) {
      console.error(e);
      toast.error("Publish failed");
    }
  }

  useEffect(() => {
    fetchDriveImages();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdvertisingSidebar />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Ad Creator</h1>
          <p className="text-muted-foreground">Generate, review, and publish Meta Ads for client: {clientId}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-primary">①</span>
                <CardTitle>Step 1 · Add creatives & inputs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 text-sm text-muted-foreground">Creatives</div>
                <div className="space-y-2 max-h-52 overflow-auto pr-1">
                  {assets?.slice(0, 50).map((f: any) => {
                    const id = f.id ?? f?.files?.[0]?.id ?? String(Math.random());
                    const checked = selectedAssetIds.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-3 text-sm">
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          setSelectedAssetIds(prev => e.target.checked ? [...prev, id] : prev.filter(x => x !== id));
                        }} />
                        <span className="truncate">{f?.name ?? JSON.stringify(f)}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <Button variant="outline" onClick={fetchDriveImages}>Upload/Refresh</Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Brand</label>
                  <Input value={productContext.brand} onChange={(e) => setProductContext({ ...productContext, brand: e.target.value })} placeholder="Brand name" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Offer</label>
                  <Input value={productContext.offer} onChange={(e) => setProductContext({ ...productContext, offer: e.target.value })} placeholder="Offer" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Audience</label>
                  <Input value={productContext.audience} onChange={(e) => setProductContext({ ...productContext, audience: e.target.value })} placeholder="Audience" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Website URL</label>
                  <Input value={productContext.websiteUrl} onChange={(e) => setProductContext({ ...productContext, websiteUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Winning ad URLs or notes (one per line)</label>
                <Textarea value={winningExamples} onChange={(e) => setWinningExamples(e.target.value)} rows={4} placeholder="https://www.facebook.com/ads/library/?id=..." />
              </div>
              <div className="flex items-center gap-3">
                <Input className="w-28" type="number" min={1} max={10} value={numVariants} onChange={(e) => setNumVariants(parseInt(e.target.value || "5", 10))} />
                <Button onClick={onGenerate} disabled={loading}>{loading ? "Generating..." : "Generate variants"}</Button>
                <Button variant={step1Done ? "default" : "secondary"} onClick={() => setStep1Done(true)}>Mark Step 1 complete</Button>
              </div>
            </CardContent>
          </Card>

          <Card className={step2Enabled ? "" : "opacity-50 pointer-events-none"}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-primary">②</span>
                <CardTitle>Step 2 · Set ad copy & tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.length === 0 ? (
                <div className="text-sm text-muted-foreground">Generate variants in Step 1 to populate the board.</div>
              ) : (
                <AdKanbanBoard variants={variants} onChange={setVariants} onAskAIUpdate={askAIUpdate} />
              )}
            </CardContent>
          </Card>

          <Card className={approved.length > 0 ? "" : "opacity-50 pointer-events-none"}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-primary">③</span>
                <CardTitle>Step 3 · Publish into ad account</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Approved: {approved.length}</div>
              <Button onClick={onPublish}>Save & Publish (dry run)</Button>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}



