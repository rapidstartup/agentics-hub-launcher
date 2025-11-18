import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const toolkit = url.searchParams.get('toolkit') ?? '';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!toolkit) {
      return new Response(JSON.stringify({ error: 'Missing `toolkit` query param' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Optional: Your backend can store per-user connection state in a table.
    // For now, we surface a generic status and a redirect_url constructed from env.
    const base = Deno.env.get('COMPOSIO_AUTH_BASE'); // e.g. https://api.composio.dev/auth/new
    const state = encodeURIComponent(JSON.stringify({ uid: user.id, toolkit }));
    const redirect_url = base ? `${base}?toolkit=${encodeURIComponent(toolkit)}&state=${state}` : null;

    // Placeholder connection status. You can wire this to a persistent store later.
    const status = 'disconnected';

    const requestId = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`;
    console.log(JSON.stringify({ event: 'composio-manage-connection', requestId, userId: user.id, toolkit, hasRedirect: !!redirect_url }));
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


