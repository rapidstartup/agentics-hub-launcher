# Data Export from Lovable Cloud - All Options

We've hit a key challenge: **Lovable Cloud uses RLS policies that block unauthenticated data access**, so we can only export data you own using your authenticated session.

## The Problem

- Direct API access with anon key: ❌ Only gets 5/50 rows (RLS blocks the rest)
- Service role key access: ❌ Not available (Lovable doesn't share it)
- Edge function deployment: ❌ Need Lovable admin access to deploy

## ✅ Recommended Solution: Browser Export Tool

I've created `export-tool.html` - a simple web page that uses your browser's authenticated session to export all data.

### How to Use

1. **Open the export tool**
   ```bash
   # Option A: Open the file directly in your browser
   start export-tool.html

   # Option B: Serve it locally
   npx http-server -p 8080
   # Then open: http://localhost:8080/export-tool.html
   ```

2. **Make sure you're logged into Lovable Cloud**
   - Open your Lovable app in another tab: https://lovable.app (or wherever your app is hosted)
   - Make sure you're logged in via GitHub OAuth

3. **Get your auth token** (automatically detected in most cases)
   - The tool will try to auto-detect it from localStorage
   - If not, open DevTools (F12) on your Lovable app tab
   - Go to Console tab
   - Paste this code:
   ```javascript
   const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
   keys.forEach(k => {
     const val = localStorage.getItem(k);
     if (val && val.includes('access_token')) {
       const parsed = JSON.parse(val);
       console.log('TOKEN:', parsed.access_token || parsed.currentSession?.access_token);
     }
   });
   ```
   - Copy the token that appears

4. **Use the export tool**
   - Paste the token into the "Auth Token" field
   - Click "Test Connection"
   - If successful, click "Export All Tables"
   - A JSON file will download with all your data

5. **Import to new Supabase**
   ```bash
   # Save the downloaded file as migration-backup/export.json
   # Or extract individual tables to migration-backup/*.json
   npx tsx scripts/import-from-backup.ts
   ```

---

## Alternative: Deploy Export Edge Function

If you can deploy code to Lovable Cloud (via Git push or their deployment system):

### How It Works

Edge functions on Supabase automatically have access to `SUPABASE_SERVICE_ROLE_KEY` environment variable, which bypasses all RLS policies.

### Steps

1. **Commit the export function to your repo**
   ```bash
   git add supabase/functions/export-all-data/
   git commit -m "Add data export function"
   ```

2. **Deploy to Lovable Cloud**
   - If Lovable auto-deploys: Just push to your Git remote
   - If manual: Use Lovable's deployment interface
   - Or ask Lovable support to deploy it for you

3. **Run the export script**
   ```bash
   npx tsx scripts/export-from-edge-function.ts
   ```

4. **Import to new Supabase**
   ```bash
   npx tsx scripts/import-from-backup.ts
   ```

---

## Alternative: Browser Console Script

Quickest method if the HTML tool doesn't work:

1. Open your Lovable app (logged in)
2. Open DevTools Console (F12)
3. Paste this script:

```javascript
// Export all tables to console
const SUPABASE_URL = 'https://pooeaxqkysmngpnpnswn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2VheHFreXNtbmdwbnBuc3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTk3ODgsImV4cCI6MjA3NjgzNTc4OH0.Tx38u656P8LUvpQCH5rp6d5flDtV_f9_vsMEn8cr4FI';

const tables = ['agent_configs', 'agent_messages', 'clients', 'knowledge_base_items',
               'market_research_reports', 'n8n_connections', 'project_agents',
               'project_asset_statuses', 'project_tasks', 'projects'];

// Get auth token from localStorage
let authToken = null;
const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
keys.forEach(k => {
  const val = localStorage.getItem(k);
  if (val && val.includes('access_token')) {
    const parsed = JSON.parse(val);
    authToken = parsed.access_token || parsed.currentSession?.access_token;
  }
});

if (!authToken) {
  console.error('No auth token found. Make sure you are logged in.');
} else {
  console.log('Using auth token:', authToken.substring(0, 20) + '...');

  // Create Supabase client
  const { createClient } = supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authToken}` } }
  });

  const exports = {};

  for (const table of tables) {
    const { data, error } = await client.from(table).select('*');
    if (data) {
      exports[table] = data;
      console.log(`✓ Exported ${table}: ${data.length} rows`);
    } else {
      console.log(`✗ Failed ${table}:`, error?.message);
    }
  }

  // Download as JSON
  const blob = new Blob([JSON.stringify(exports, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lovable-data-export-${Date.now()}.json`;
  a.click();

  console.log('✓ Download started!');
}
```

4. File will download automatically

---

## Comparison

| Method | Pros | Cons | Recommended |
|--------|------|------|-------------|
| **Browser Export Tool** | Simple HTML page, auto-detects token, nice UI | Requires browser access | ✅ Yes |
| **Edge Function** | Server-side, reliable, can automate | Requires deployment access | If you can deploy |
| **Browser Console** | Fastest, no files needed | No UI, must paste code | If tool fails |
| **Direct API** | Simple script | ❌ RLS blocks data | ❌ No |

---

## Next Steps

1. **Choose a method above** (recommend Browser Export Tool)
2. **Export your data** from Lovable Cloud
3. **Run import script**:
   ```bash
   npx tsx scripts/import-from-backup.ts
   ```
4. **Update environment variables** for production:
   - Update `.env.production` with new Supabase credentials
   - Deploy to Vercel with new env vars
5. **Verify production** works with new Supabase

---

## Troubleshooting

### "No auth token found"
- Make sure you're logged into your Lovable app
- Try refreshing the page and logging in again
- Check that your session hasn't expired

### "RLS policies blocking access"
- You must use your authenticated browser session
- Direct API access won't work without service role key

### "Export edge function not found (404)"
- Function hasn't been deployed to Lovable Cloud yet
- Use Browser Export Tool instead

### "Only got partial data"
- RLS is blocking some tables
- Use the Browser Export Tool with your auth token
- Or try the browser console script
