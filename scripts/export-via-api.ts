/**
 * Alternative Data Export Strategy
 *
 * If you don't have the service role key for Lovable Cloud,
 * you can deploy a temporary API endpoint to your production app
 * that exports the data using the server-side Supabase client.
 *
 * Steps:
 * 1. Deploy the endpoint below as an edge function or API route
 * 2. Run this script to fetch data through that endpoint
 * 3. Import the data to your new Supabase instance
 */

import * as fs from 'fs';
import * as path from 'path';

// Your production app URL where the export endpoint is deployed
const EXPORT_API_URL = 'https://your-app.vercel.app/api/export-data';
// Or if using Supabase Edge Function:
// const EXPORT_API_URL = 'https://pooeaxqkysmngpnpnswn.supabase.co/functions/v1/export-data';

// Tables to export
const TABLES_TO_EXPORT = [
  'agent_configs',
  'profiles',
  'n8n_connections',
  'knowledge_base_collections',
  'knowledge_base_documents',
  'knowledge_base_chunks',
  'knowledge_base_items',
  'composio_connections',
  'agent_messages',
  'copywriter_messages',
];

async function exportTableViaAPI(tableName: string): Promise<any[]> {
  console.log(`Exporting ${tableName}...`);

  const response = await fetch(`${EXPORT_API_URL}?table=${tableName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Add authentication if needed
      // 'Authorization': 'Bearer YOUR_AUTH_TOKEN',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to export ${tableName}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`  Exported ${data.length} rows from ${tableName}`);

  return data;
}

async function main() {
  console.log('Starting data export via API...\n');

  const backupDir = path.join(process.cwd(), 'migration-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const tableName of TABLES_TO_EXPORT) {
    try {
      const data = await exportTableViaAPI(tableName);

      const backupFile = path.join(backupDir, `${tableName}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
      console.log(`  Saved to: ${backupFile}\n`);
    } catch (error) {
      console.error(`Error exporting ${tableName}:`, error);
    }

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nExport complete! Files saved to migration-backup/');
  console.log('Next step: Run import script to load data into new Supabase instance');
}

main().catch(console.error);
