# Export Data via Edge Function (Service Role Access)

This is the **simplest and most reliable method** because the edge function deployed on Lovable Cloud automatically has access to the service role key.

## How It Works

When you deploy an edge function to Supabase (including Lovable Cloud), these environment variables are automatically available:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ← This bypasses ALL RLS policies!

So we can deploy a simple export function to the OLD Lovable Cloud Supabase, and it will have full read access to all your data.

## Steps

### 1. Deploy the Export Function to OLD Lovable Cloud

```bash
npx supabase functions deploy export-all-data --project-ref pooeaxqkysmngpnpnswn
```

This deploys the function to your OLD Lovable Cloud Supabase instance (project ID: `pooeaxqkysmngpnpnswn`).

### 2. Run the Export Script

```bash
npx tsx scripts/export-from-edge-function.ts
```

This will:
- Call the edge function deployed on Lovable Cloud
- The function uses its service role key to read all data (bypasses RLS)
- Downloads all data and saves to `migration-backup/*.json`

### 3. Import to New Supabase

```bash
npx tsx scripts/import-from-backup.ts
```

This imports all the JSON backup files into your new Supabase instance.

---

## API Endpoints

The deployed edge function provides two endpoints:

### Export Single Table
```bash
curl "https://pooeaxqkysmngpnpnswn.supabase.co/functions/v1/export-all-data?table=clients"
```

### Export All Tables
```bash
curl "https://pooeaxqkysmngpnpnswn.supabase.co/functions/v1/export-all-data"
```

Returns JSON with:
```json
{
  "data": {
    "clients": [...],
    "projects": [...],
    ...
  },
  "stats": {
    "clients": { "rows": 6 },
    "projects": { "rows": 8 },
    ...
  },
  "totalRows": 50
}
```

---

## Why This Works

Edge functions on Supabase run in a trusted environment with access to the service role key. This is the same key that:
- Your other edge functions (like `knowledge-base`, `n8n-connect`, etc.) already use
- Has full database access, bypassing RLS
- Is never exposed to the client

So we're just leveraging the same access your existing functions already have!

---

## Troubleshooting

If the function isn't found:
```bash
# List deployed functions
npx supabase functions list --project-ref pooeaxqkysmngpnpnswn

# Check function logs
npx supabase functions logs export-all-data --project-ref pooeaxqkysmngpnpnswn
```

If deployment fails, make sure you're authenticated:
```bash
npx supabase login
```
