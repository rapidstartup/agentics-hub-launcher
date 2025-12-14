/**
 * Export Data Using ALL Available Methods
 *
 * This script tries multiple approaches to export data from Lovable Cloud:
 * 1. Via existing edge functions (if they have export capability)
 * 2. Direct Supabase client with anon key (limited by RLS)
 * 3. Database dumps via pg_dump (if accessible)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const OLD_SUPABASE_URL = 'https://pooeaxqkysmngpnpnswn.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2VheHFreXNtbmdwbnBuc3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTk3ODgsImV4cCI6MjA3NjgzNTc4OH0.Tx38u656P8LUvpQCH5rp6d5flDtV_f9_vsMEn8cr4FI';

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

// Method 1: Try via existing edge function endpoint
async function tryExistingEdgeFunction(): Promise<boolean> {
  console.log('\n' + '='.repeat(60));
  console.log('METHOD 1: Check for existing export edge function');
  console.log('='.repeat(60));

  const possibleEndpoints = [
    '/functions/v1/export-all-data',
    '/functions/v1/export-old-data',
    '/functions/v1/data-export'
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      const url = `${OLD_SUPABASE_URL}${endpoint}`;
      console.log(`Trying ${url}...`);

      const response = await fetch(url, {
        headers: {
          'apikey': OLD_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${OLD_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.status !== 404) {
        console.log(`✓ Found endpoint! Status: ${response.status}`);
        const data = await response.json();
        console.log('Response:', data);
        return true;
      }
    } catch (error) {
      // Continue to next endpoint
    }
  }

  console.log('✗ No existing export endpoints found');
  return false;
}

// Method 2: Direct Supabase client (may be limited by RLS)
async function tryDirectAccess(): Promise<Record<string, number>> {
  console.log('\n' + '='.repeat(60));
  console.log('METHOD 2: Direct Supabase client (with RLS limitations)');
  console.log('='.repeat(60));

  const supabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);

  const results: Record<string, number> = {};

  // Ensure backup dir exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const tableName of TABLES) {
    try {
      console.log(`\nExporting ${tableName}...`);

      // Try to fetch with no filters (will respect RLS)
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error(`  ✗ Error: ${error.message}`);
          if (error.code === 'PGRST301') {
            console.error(`  ℹ Table doesn't exist or no access`);
          }
          break;
        }

        if (!data || data.length === 0) {
          if (page === 0 && count !== null) {
            console.log(`  ℹ Table exists but RLS returned 0 rows (actual count: ${count})`);
          }
          break;
        }

        allData = allData.concat(data);

        if (data.length < pageSize) break;

        page++;
      }

      if (allData.length > 0) {
        const filePath = path.join(backupDir, `${tableName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
        console.log(`  ✓ Exported ${allData.length} rows`);
        results[tableName] = allData.length;
      } else {
        console.log(`  ⊘ No data accessible (RLS may be blocking)`);
        results[tableName] = 0;
      }

    } catch (error) {
      console.error(`  ✗ Failed: ${error instanceof Error ? error.message : error}`);
      results[tableName] = 0;
    }
  }

  return results;
}

// Method 3: Try to get schema information
async function tryGetSchema(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('METHOD 3: Get table schema information');
  console.log('='.repeat(60));

  const supabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);

  for (const tableName of TABLES) {
    try {
      // Try to get just structure (1 row)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`${tableName}: Error - ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`${tableName}: Accessible, columns:`, Object.keys(data[0]));
      } else {
        console.log(`${tableName}: Exists but empty or RLS blocked`);
      }
    } catch (error) {
      console.log(`${tableName}: Failed - ${error}`);
    }
  }
}

async function main() {
  console.log('Lovable Cloud Data Export - All Methods\n');

  // Try Method 1: Existing edge functions
  const foundEdgeFunction = await tryExistingEdgeFunction();

  if (foundEdgeFunction) {
    console.log('\n✓ Can use edge function method!');
    return;
  }

  // Try Method 2: Direct access
  const results = await tryDirectAccess();

  // Try Method 3: Get schema info
  await tryGetSchema();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const totalRows = Object.values(results).reduce((a, b) => a + b, 0);

  console.log(`\nTotal rows exported: ${totalRows}`);
  console.log('\nPer table:');
  for (const [table, count] of Object.entries(results)) {
    console.log(`  ${table.padEnd(30)} ${count} rows`);
  }

  if (totalRows === 0) {
    console.log('\n⚠ WARNING: No data could be exported!');
    console.log('\nPossible solutions:');
    console.log('1. Deploy export edge function to Lovable Cloud (needs Lovable support)');
    console.log('2. Use browser console export method (see EXPORT-VIA-EDGE-FUNCTION.md)');
    console.log('3. Ask Lovable support for data export');
    console.log('4. Modify an existing edge function to add export capability');
  } else if (totalRows < 50) {
    console.log('\n⚠ WARNING: Only partial data exported (expected ~50 rows)');
    console.log('RLS policies are likely blocking full access.');
    console.log('\nConsider using browser console export method (see EXPORT-VIA-EDGE-FUNCTION.md)');
  } else {
    console.log('\n✓ Export appears complete!');
    console.log(`\nBackup saved in: ${backupDir}`);
    console.log('\nNext step: Import to new Supabase');
    console.log('  npx tsx scripts/import-from-backup.ts');
  }
}

main().catch(console.error);
