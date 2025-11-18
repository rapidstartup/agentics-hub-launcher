import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AdvertisingSidebar } from "@/components/AdvertisingSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Variant = {
  headline?: string;
  primaryText: string;
  cta?: string;
  websiteUrl?: string;
  rationale?: string;
  status?: "review" | "needs_edits" | "approved" | "archived";
};

const API_BASE = "/functions/v1";

export default function AdCreatorDashboard() {
  const { clientId } = useParams();
  const [productContext, setProductContext] = useState({ brand: "", offer: "", audience: "", websiteUrl: "" });
  const [winningExamples, setWinningExamples] = useState<string>("");
  const [numVariants, setNumVariants] = useState(5);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);

  const approved = useMemo(() => variants.filter(v => v.status === "approved"), [variants]);
  const review = useMemo(() => variants.filter(v => !v.status || v.status === "review"), [variants]);
  const needsEdits = useMemo(() => variants.filter(v => v.status === "needs_edits"), [variants]);
  const archived = useMemo(() => variants.filter(v => v.status === "archived"), [variants]);

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
    } catch (e) {
      console.error(e);
      toast.error("Generation failed");
    } finally {
      setLoading(false);
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
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assets (Google Drive)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {assets?.slice(0, 6).map((f: any) => (
                  <div key={f.id ?? f?.files?.[0]?.id} className="text-sm text-muted-foreground truncate">{f?.name ?? JSON.stringify(f)}</div>
                ))}
              </div>
              <Button variant="outline" onClick={fetchDriveImages}>Refresh</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="review">
            <TabsList>
              <TabsTrigger value="review">Review ({review.length})</TabsTrigger>
              <TabsTrigger value="needs_edits">Needs Edits ({needsEdits.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="archived">Archived ({archived.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="review">
              <VariantList items={review} onMove={setVariants} variants={variants} />
            </TabsContent>
            <TabsContent value="needs_edits">
              <VariantList items={needsEdits} onMove={setVariants} variants={variants} />
            </TabsContent>
            <TabsContent value="approved">
              <div className="mb-3">
                <Button onClick={onPublish}>Publish approved (dry run)</Button>
              </div>
              <VariantList items={approved} onMove={setVariants} variants={variants} />
            </TabsContent>
            <TabsContent value="archived">
              <VariantList items={archived} onMove={setVariants} variants={variants} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function VariantList({ items, variants, onMove }: { items: Variant[]; variants: Variant[]; onMove: (v: Variant[]) => void }) {
  function setStatus(v: Variant, status: Variant["status"]) {
    const idx = variants.indexOf(v);
    if (idx >= 0) {
      const clone = variants.slice();
      clone[idx] = { ...clone[idx], status };
      onMove(clone);
    }
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((v, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-base">{v.headline || "Ad Variant"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm whitespace-pre-wrap">{v.primaryText}</div>
            <div className="text-xs text-muted-foreground">CTA: {v.cta || "LEARN_MORE"} · {v.websiteUrl || ""}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus(v, "needs_edits")}>Needs Edits</Button>
              <Button size="sm" onClick={() => setStatus(v, "approved")}>Approve</Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus(v, "archived")}>Archive</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


