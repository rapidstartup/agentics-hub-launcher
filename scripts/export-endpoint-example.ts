/**
 * EXAMPLE: Edge Function or API Route for Data Export
 *
 * Deploy this to your production app (the one connected to Lovable Cloud Supabase)
 * This allows you to export data programmatically without direct service role access
 *
 * DEPLOYMENT OPTIONS:
 *
 * A) Supabase Edge Function:
 *    - Save to: supabase/functions/export-data/index.ts
 *    - Deploy: supabase functions deploy export-data
 *
 * B) Vercel API Route (Next.js):
 *    - Save to: pages/api/export-data.ts (or app/api/export-data/route.ts)
 *    - Deploy: vercel --prod
 *
 * SECURITY: Add authentication! This example is NOT production-ready.
 */

// ============================================================================
// OPTION A: Supabase Edge Function
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // IMPORTANT: Add authentication here!
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== 'Bearer YOUR_SECRET_TOKEN') {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const url = new URL(req.url);
    const tableName = url.searchParams.get('table');

    if (!tableName) {
      return new Response(
        JSON.stringify({ error: 'Missing table parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role (server-side)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch all data from the table
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(10000); // Adjust as needed

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data || []),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// OPTION B: Next.js API Route (Vercel)
// ============================================================================

/*
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // IMPORTANT: Add authentication here!
    // const authToken = req.headers.authorization;
    // if (authToken !== 'Bearer YOUR_SECRET_TOKEN') {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    const { table } = req.query;

    if (!table || typeof table !== 'string') {
      return res.status(400).json({ error: 'Missing table parameter' });
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only!
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch all data from the table
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(10000);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Export error:', error);
    return res.status(500).json({ error: error.message });
  }
}
*/
