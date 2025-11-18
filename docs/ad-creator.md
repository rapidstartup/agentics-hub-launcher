# Ad Creator Agent (Mastra + Supabase + Composio)

This guide describes local setup and deployment tasks for the Ad Creator agent and its supporting Edge functions. It does not deploy anything automatically.

## Overview
- Mastra agent/workflow: `agentix/src/mastra/agents/ad-creator-agent.ts`, `agentix/src/mastra/workflows/ad-creator-workflow.ts`
- Edge functions (proxy + AI):
  - `composio-manage-connection`: returns connect/reconnect URL for toolkits
  - `metaads-list`: lists Meta Ads accounts/pages (via COMPOSIO_PROXY_URL if configured)
  - `generate-copy`: uses Gemini (Lovable or Google API) to generate copy variants
  - `metaads-publish`: creates campaign → ad set → creative → ad (proxied)
  - `drive-list`: lists Google Drive assets (proxied)
  - `sheets-export`: optional export of variants to Google Sheets (proxied)
- UI: `src/pages/advertising/AdCreatorDashboard.tsx`; Connections on `ClientSettings` via `ConnectionsButtons`
- DB tables + RLS: migration `supabase/migrations/*_ad_creator_core.sql`

## Environment Variables
Set these in your Supabase Edge environment (Dashboard → Project Settings → Functions → Secrets):

- `GEMINI_API_KEY` or `LOVABLE_API_KEY` (one is sufficient for copy generation)
- `COMPOSIO_AUTH_BASE` (optional) — base URL to initiate Rube/Composio OAuth
- `COMPOSIO_PROXY_URL` (optional) — backend URL that executes Composio tools on your behalf
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — provided by Supabase automatically in functions

For Mastra dev server:
- `SUPABASE_EDGE_URL` (optional) — base URL to your Edge Functions (e.g., https://<project>.functions.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` (optional) — used by Mastra tools for server-to-server calls (do not expose to client)

## Database
Run the migration manually to create tables and policies:
1) Review `supabase/migrations/*_ad_creator_core.sql`
2) Deploy as appropriate for your environment

## Edge Functions
Deploy functions manually (per your environments):

PowerShell:
```
npx supabase functions deploy composio-manage-connection ; `
  npx supabase functions deploy metaads-list ; `
  npx supabase functions deploy generate-copy ; `
  npx supabase functions deploy metaads-publish ; `
  npx supabase functions deploy drive-list ; `
  npx supabase functions deploy sheets-export
```

Notes:
- No live Composio calls occur unless `COMPOSIO_PROXY_URL` is configured
- `metaads-publish` defaults to dry-run behavior; set `dryRun: false` and configure proxy to execute

## Mastra
Local dev:
```
cd agentix
npm run dev
```

The new workflow id is `ad-creator-workflow`. Use the agent `Ad Creator Agent`.

## UI
- Route: `/client/:clientId/advertising/ad-creator`
- Settings → Connections uses the `composio-manage-connection` function for connect/reconnect links

## Safety
- Never deploy functions or reset DB automatically from the assistant
- RLS restricts access to project-owned rows using `auth.uid()`


