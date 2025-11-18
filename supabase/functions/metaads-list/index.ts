import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProxyRequest = {
  tool_slug: string;
  arguments: Record<string, unknown>;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const proxyUrl = Deno.env.get('COMPOSIO_PROXY_URL'); // Optional proxy to your Rube/Composio executor
    const accountId = (new URL(req.url)).searchParams.get('account_id') ?? undefined;
    const requestId = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`;
    console.log(JSON.stringify({ event: 'metaads-list:start', requestId, userId: user.id, accountId }));

    // If a proxy URL is available, request accounts/pages via your backend
    if (proxyUrl) {
      const payload: ProxyRequest[] = [
        { tool_slug: "METAADS_GET_INSIGHTS", arguments: { object_id: accountId ?? "act_placeholder", level: "account", fields: ["spend"] } },
      ];
      const proxyResp = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: payload }),
      });
      const proxyData = await proxyResp.json().catch(() => ({}));
      console.log(JSON.stringify({ event: 'metaads-list:proxy:response', requestId, ok: proxyResp.ok }));
      // Return as-is for debugging/visibility
      return new Response(JSON.stringify({ via: 'proxy', requestId, proxyData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fallback placeholder (no live Composio connection from Edge function)
    console.log(JSON.stringify({ event: 'metaads-list:placeholder', requestId }));
    return new Response(
      JSON.stringify({
        adAccounts: [],
        pages: [],
        note: 'Connect Meta Ads via Settings. This endpoint is wired; enable COMPOSIO_PROXY_URL to fetch real data.',
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('metaads-list error', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


