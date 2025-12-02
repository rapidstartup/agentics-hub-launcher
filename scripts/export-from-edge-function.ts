/**
 * Export Data Using Edge Function on OLD Supabase (Lovable Cloud)
 *
 * This script calls an edge function deployed on the OLD Lovable Cloud Supabase.
 * The edge function has access to SUPABASE_SERVICE_ROLE_KEY automatically,
 * so it can bypass RLS and export all data.
 *
 * Steps:
 * 1. Deploy edge function to OLD Lovable Cloud:
 *    npx supabase functions deploy export-all-data --project-ref pooeaxqkysmngpnpnswn
 *
 * 2. Run this script:
 *    npx tsx scripts/export-from-edge-function.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// OLD Supabase (Lovable Cloud)
const OLD_SUPABASE_URL = 'https://pooeaxqkysmngpnpnswn.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2VheHFreXNtbmdwbnBuc3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTk3ODgsImV4cCI6MjA3NjgzNTc4OH0.Tx38u656P8LUvpQCH5rp6d5flDtV_f9_vsMEn8cr4FI';

// Edge function endpoint
const EXPORT_FUNCTION_URL = `${OLD_SUPABASE_URL}/functions/v1/export-all-data`;

const backupDir = path.join(process.cwd(), 'migration-backup');

const TABLES = [
  'agent_configs',
  'agent_messages',
  'clients',
  'knowledge_base_items',
  'market_research_reports',
  'n8n_connections',
  'project_agents',
  'project_asset_statuses',
  'project_tasks',
  'projects'
];

async function exportTable(tableName: string): Promise<void> {
  try {
    console.log(`Exporting ${tableName}...`);

    const response = await fetch(`${EXPORT_FUNCTION_URL}?table=${tableName}`, {
      method: 'GET',
      headers: {
        'apikey': OLD_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${OLD_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ✗ Failed: ${response.status} ${response.statusText}`);
      console.error(`  Error: ${errorText}`);
      return;
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(`  ✗ Unexpected response format:`, data);
      return;
    }

    // Save to file
    const filePath = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`  ✓ Exported ${data.length} rows to ${filePath}`);

  } catch (error) {
    console.error(`  ✗ Error exporting ${tableName}:`, error instanceof Error ? error.message : error);
  }
}

async function exportAllAtOnce(): Promise<void> {
  try {
    console.log('Attempting to export all tables in one request...');

    const response = await fetch(EXPORT_FUNCTION_URL, {
      method: 'GET',
      headers: {
        'apikey': OLD_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${OLD_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed: ${response.status} ${response.statusText}`);
      console.error(`Error: ${errorText}`);
      return;
    }

    const result = await response.json();

    if (!result.data || !result.stats) {
      console.error('Unexpected response format:', result);
      return;
    }

    console.log('\nExport Summary:');
    console.log(`Total rows: ${result.totalRows}`);
    console.log('\nPer table:');

    for (const [tableName, stats] of Object.entries(result.stats as Record<string, { rows: number, error?: string }>)) {
      if (stats.error) {
        console.log(`  ${tableName}: ERROR - ${stats.error}`);
      } else {
        console.log(`  ${tableName}: ${stats.rows} rows`);

        // Save each table to file
        if (result.data[tableName]) {
          const filePath = path.join(backupDir, `${tableName}.json`);
          fs.writeFileSync(filePath, JSON.stringify(result.data[tableName], null, 2));
        }
      }
    }

    console.log('\n✓ All exports saved to migration-backup/');

  } catch (error) {
    console.error('Error exporting all tables:', error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('Data Export from Lovable Cloud via Edge Function\n');
  console.log(`Edge Function URL: ${EXPORT_FUNCTION_URL}\n`);

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}\n`);
  }

  // Try exporting all at once first
  console.log('Strategy: Export all tables in one request\n');
  await exportAllAtOnce();

  console.log('\n' + '='.repeat(60));
  console.log('Export Complete!');
  console.log('='.repeat(60));
  console.log(`\nBackup files saved in: ${backupDir}`);
  console.log('\nNext step: Run import script');
  console.log('  npx tsx scripts/import-from-backup.ts');
}

main().catch(console.error);
