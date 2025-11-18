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

    // Optional: Your backend can store per-user connection state in a table.
    // For now, we surface a generic status and a redirect_url constructed from env.
    const base = Deno.env.get('COMPOSIO_AUTH_BASE'); // e.g. https://api.composio.dev/auth/new or with query params
    const state = encodeURIComponent(JSON.stringify({ uid: user?.id ?? null, toolkit, clientId }));

    // Optional per-provider or global managed auth config ids
    const globalAuthCfg = Deno.env.get('COMPOSIO_AUTH_CONFIG_ID') ?? undefined;
    const perToolkitAuthCfg = Deno.env.get(`COMPOSIO_AUTH_CONFIG_ID_${toolkit.toUpperCase()}`) ?? undefined;
    const authCfg = perToolkitAuthCfg ?? globalAuthCfg;

    // Assemble URL with correct delimiter whether base already contains `?` or not
    const params: string[] = [
      `toolkit=${encodeURIComponent(toolkit)}`,
      `state=${state}`
    ];
    if (authCfg) params.push(`auth_config_id=${encodeURIComponent(authCfg)}`);

    const redirect_url = base
      ? `${base}${base.includes('?') ? '&' : '?'}${params.join('&')}`
      : null;

    // Placeholder connection status. You can wire this to a persistent store later.
    const status = user ? 'disconnected' : 'anonymous';

    const requestId = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`;
    console.log(JSON.stringify({ event: 'composio-manage-connection', requestId, userId: user?.id ?? null, toolkit, clientId, hasRedirect: !!redirect_url }));
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


