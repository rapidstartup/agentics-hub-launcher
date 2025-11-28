import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getUserFromAuthHeader(req: Request): Promise<{ id: string } | null> {
  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (!authHeader || !supabaseUrl || !anonKey) return null;
  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: anonKey }
  });
  if (!resp.ok) return null;
  try {
    const user = await resp.json();
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let toolkit = url.searchParams.get('toolkit') ?? '';
    let clientId = url.searchParams.get('clientId') ?? undefined;

    // Also accept toolkit/clientId via JSON body (when invoked through supabase-js)
    if (!toolkit && req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.json();
        if (typeof body?.toolkit === 'string') toolkit = body.toolkit;
        if (typeof body?.clientId === 'string') clientId = body.clientId;
      } catch {
        // ignore
      }
    }

    const user = await getUserFromAuthHeader(req);

    if (!toolkit) {
      return new Response(JSON.stringify({ error: 'Missing `toolkit` query param' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get Composio base URL (should be https://backend.composio.dev)
    // Fix: Use backend.composio.dev instead of potentially deprecated hermes.composio.dev
    const composioBase = Deno.env.get('COMPOSIO_BASE_URL') || 'https://backend.composio.dev';

    // Get auth config ID for this toolkit
    const globalAuthCfg = Deno.env.get('COMPOSIO_AUTH_CONFIG_ID') ?? undefined;
    const perToolkitAuthCfg = Deno.env.get(`COMPOSIO_AUTH_CONFIG_ID_${toolkit.toUpperCase()}`) ?? undefined;
    const authConfigId = perToolkitAuthCfg ?? globalAuthCfg;

    if (!authConfigId) {
      console.warn(`No auth config ID found for toolkit: ${toolkit}`);
      return new Response(
        JSON.stringify({
          status: 'not_configured',
          error: `No COMPOSIO_AUTH_CONFIG_ID_${toolkit.toUpperCase()} environment variable set`,
          redirect_url: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the redirect URL using Composio v3 API format
    // The user will be redirected to: https://backend.composio.dev/api/v1/auth-apps/add
    // with query params for the auth config
    const state = encodeURIComponent(JSON.stringify({
      uid: user?.id ?? null,
      toolkit,
      clientId,
      timestamp: Date.now()
    }));

    // Construct the OAuth initiation URL
    // Format: https://backend.composio.dev/api/v1/auth-apps/add?authConfigId=ac_xxx&redirectUri=your_callback&state=...
    // Note: If composioBase is accidentally set to hermes.composio.dev in .env, this will still fail.
    // We should check if the env var is set to the faulty domain and override it if necessary,
    // or just strictly use backend.composio.dev if the env var looks wrong.
    
    let baseUrlToUse = composioBase;
    if (baseUrlToUse.includes("hermes.composio.dev") || baseUrlToUse.includes("api.composio.dev")) {
        console.warn(`Detected deprecated domain '${baseUrlToUse}' in COMPOSIO_BASE_URL. Switching to 'https://backend.composio.dev'`);
        baseUrlToUse = "https://backend.composio.dev";
    }

    const redirectUri = encodeURIComponent(`${baseUrlToUse}/api/v1/auth-apps/add`);
    const redirect_url = `${baseUrlToUse}/api/v1/auth-apps/add?authConfigId=${authConfigId}&state=${state}`;

    // Optional: Check connection status from Composio API
    // For now, return a generic status
    const status = user ? 'disconnected' : 'anonymous';

    const requestId = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`;
    console.log(JSON.stringify({
      event: 'composio-manage-connection',
      requestId,
      userId: user?.id ?? null,
      toolkit,
      clientId,
      authConfigId,
      hasRedirect: !!redirect_url,
      redirectUrl: redirect_url
    }));

    return new Response(
      JSON.stringify({ status, redirect_url, requestId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('composio-manage-connection error', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
