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
  + plus connector tables in `supabase/migrations/20251118093000_connections_tables.sql`

## Environment Variables
Set these in your Supabase Edge environment (Dashboard → Project Settings → Functions → Secrets):

- `GEMINI_API_KEY` or `LOVABLE_API_KEY` (one is sufficient for copy generation)
- `COMPOSIO_AUTH_BASE` (optional) — base URL to initiate managed OAuth for provider connections
- `COMPOSIO_PROXY_URL` (optional) — backend URL that executes provider APIs on your behalf
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — provided by Supabase automatically in functions
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (optional, Sheets export) — service account email to share spreadsheets with

For Mastra dev server:
- `SUPABASE_EDGE_URL` (optional) — base URL to your Edge Functions (e.g., https://<project>.functions.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` (optional) — used by Mastra tools for server-to-server calls (do not expose to client)

## Database
Run the migrations manually to create tables and policies:
1) Review `supabase/migrations/*_ad_creator_core.sql`
2) Review `supabase/migrations/20251118093000_connections_tables.sql` (stores user-scoped Meta Ads and Google Sheets connections)
3) Deploy as appropriate for your environment

PowerShell (example to open file quickly):
```
Get-Content .\supabase\migrations\20251118093000_connections_tables.sql
```

## Edge Functions
Deploy functions manually (per your environments):

PowerShell:
```
npx supabase functions deploy composio-manage-connection ; `
  npx supabase functions deploy metaads-list ; `
  npx supabase functions deploy generate-copy ; `
  npx supabase functions deploy metaads-publish ; `
  npx supabase functions deploy drive-list ; `
  npx supabase functions deploy sheets-export ; `
  npx supabase functions deploy facebook-connect ; `
  npx supabase functions deploy google-sheets-connect
```

Notes:
- No live provider calls occur unless `COMPOSIO_PROXY_URL` is configured
- `metaads-publish` defaults to dry-run behavior; set `dryRun: false` and configure proxy to execute

## Connections (Meta Ads, Google Drive, Google Sheets)
The Settings → Connections panel is vendor-neutral in the UI. Under the hood, it uses:

- `composio-manage-connection` to generate a Connect/Reconnect URL per provider (Meta Ads, Drive, Sheets)
- Optional direct helpers for manual connections:
  - `facebook-connect` (POST a long-lived access token + ad account)
  - `google-sheets-connect` (POST a Spreadsheet URL/ID)

To enable the Connect buttons (instead of “Configure server”), set a managed-auth base URL and any required keys:

PowerShell (project-level secrets):
```
npx supabase secrets set COMPOSIO_AUTH_BASE="https://api.composio.dev/auth/new" ; `
  npx supabase secrets set GEMINI_API_KEY="<your_key>" ; `
  npx supabase secrets set COMPOSIO_PROXY_URL="https://<your-backend-executor>/execute" ; `
  npx supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="svc-<name>@<project>.iam.gserviceaccount.com"
```

Then redeploy the functions from the section above.

### Google Sheets note
- Share any target spreadsheet with the `GOOGLE_SERVICE_ACCOUNT_EMAIL` so the exporter can write.
- You can also call `google-sheets-connect` directly with `{ spreadsheetId: "<id or url>", spreadsheetName?: "Ad Generator" }`.

### Facebook note
- If you already have a long‑lived token, you can call `facebook-connect` with `{ accessToken, accountId, accountName }`. The table `public.facebook_ad_accounts` stores it per‑user (RLS enforced).

### More details
- For deeper configuration and supported providers, consult the vendor-managed auth docs (Composio/Rube). The UI stays neutral; only the backend needs the managed-auth and proxy URLs.

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


