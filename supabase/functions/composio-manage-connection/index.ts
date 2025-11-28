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

    // Force correct base URL - Debugging why hermes persists
    const composioBaseEnv = Deno.env.get('COMPOSIO_BASE_URL');
    console.log(`[DEBUG] COMPOSIO_BASE_URL from env: ${composioBaseEnv}`);
    
    // HARDCODED OVERRIDE to ensure hermes is impossible if this code runs
    const composioBase = 'https://backend.composio.dev';

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
    const state = encodeURIComponent(JSON.stringify({
      uid: user?.id ?? null,
      toolkit,
      clientId,
      timestamp: Date.now()
    }));

    const redirectUri = encodeURIComponent(`${composioBase}/api/v1/auth-apps/add`);
    const redirect_url = `${composioBase}/api/v1/auth-apps/add?authConfigId=${authConfigId}&state=${state}`;

    console.log(`[DEBUG] Generated redirect_url: ${redirect_url}`);

    const status = user ? 'disconnected' : 'anonymous';
    const requestId = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`;

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
