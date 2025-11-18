import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Toolkit = 'metaads' | 'googledrive' | 'googlesheets';

async function getConnection(toolkit: Toolkit) {
  const r = await fetch(`/functions/v1/composio-manage-connection?toolkit=${toolkit}`, { headers: { "Content-Type": "application/json" } });
  return await r.json();
}

export function ConnectionsButtons() {
  const [meta, setMeta] = useState<{ status?: string; redirect_url?: string }>({});
  const [drive, setDrive] = useState<{ status?: string; redirect_url?: string }>({});
  const [sheets, setSheets] = useState<{ status?: string; redirect_url?: string }>({});

  useEffect(() => {
    getConnection('metaads').then(setMeta).catch(() => setMeta({ status: 'error' }));
    getConnection('googledrive').then(setDrive).catch(() => setDrive({ status: 'error' }));
    getConnection('googlesheets').then(setSheets).catch(() => setSheets({ status: 'error' }));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections (via Rube/Composio)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <ConnectionItem label="Meta Ads" data={meta} />
        <ConnectionItem label="Google Drive" data={drive} />
        <ConnectionItem label="Google Sheets" data={sheets} />
      </CardContent>
    </Card>
  );
}

function ConnectionItem({ label, data }: { label: string; data: any }) {
  const connected = data?.status === 'connected' || data?.status === 'active';
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="mb-2 font-semibold">{label}</div>
      <div className="mb-3 text-sm text-muted-foreground">{connected ? 'Connected' : 'Not connected'}</div>
      {data?.redirect_url ? (
        <a href={data.redirect_url}>
          <Button variant={connected ? "outline" : "default"}>{connected ? 'Reconnect' : 'Connect'}</Button>
        </a>
      ) : (
        <Button disabled variant="outline">Configure server</Button>
      )}
    </div>
  );
}


