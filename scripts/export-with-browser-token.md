# Export Data Using Browser Session

Since you login via GitHub OAuth, we need to get your auth token from the browser and use it to export data.

## Step 1: Deploy Edge Function to NEW Supabase

```bash
npx supabase functions deploy export-old-data
```

## Step 2: Get Your Auth Token from Browser

1. Go to your Lovable Cloud app in browser (where you're logged in via GitHub)
2. Open browser DevTools (F12 or Right Click → Inspect)
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
// Get Supabase auth token
const supabase = window.supabase || JSON.parse(localStorage.getItem('supabase.auth.token'));
if (supabase?.currentSession?.access_token) {
  console.log('TOKEN:', supabase.currentSession.access_token);
} else {
  // Try alternative method
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
  keys.forEach(k => {
    const val = localStorage.getItem(k);
    if (val && val.includes('access_token')) {
      const parsed = JSON.parse(val);
      console.log('TOKEN:', parsed.access_token || parsed.currentSession?.access_token);
    }
  });
}
```

5. Copy the token that appears (long string starting with `eyJ...`)

## Step 3: Update Export Script

Edit `scripts/export-via-api.ts` and update line 18:

```typescript
const EXPORT_API_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co/functions/v1/export-old-data';
const USER_AUTH_TOKEN = 'PASTE_YOUR_TOKEN_HERE'; // Token from browser
```

Then update the fetch call to include the token:

```typescript
const response = await fetch(`${EXPORT_API_URL}?table=${tableName}&token=${USER_AUTH_TOKEN}`, {
```

## Step 4: Run Export

```bash
npx tsx scripts/export-via-api.ts
```

This will use your logged-in session to bypass RLS and export all data!

---

## Alternative: Quick Browser Export

If the above doesn't work, you can export directly from the browser console:

1. Go to your Lovable app (logged in)
2. Open DevTools Console
3. Paste and run:

```javascript
// Export all tables to console
const tables = ['agent_configs', 'agent_messages', 'clients', 'knowledge_base_items',
               'market_research_reports', 'n8n_connections', 'project_agents',
               'project_asset_statuses', 'project_tasks', 'projects'];

const exports = {};

for (const table of tables) {
  const { data, error } = await window.supabaseClient.from(table).select('*');
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
a.download = 'lovable-data-export.json';
a.click();
```

This will download a single JSON file with all your data!
