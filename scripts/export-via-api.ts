/**
 * Data Export from Lovable Cloud Supabase
 *
 * This script connects directly to your old Supabase instance using the anon key
 * and exports data from tables. Works because the anon key has read access.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// OLD Supabase instance (Lovable Cloud)
const OLD_SUPABASE_URL = 'https://pooeaxqkysmngpnpnswn.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2VheHFreXNtbmdwbnBuc3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTk3ODgsImV4cCI6MjA3NjgzNTc4OH0.Tx38u656P8LUvpQCH5rp6d5flDtV_f9_vsMEn8cr4FI';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);

// ============================================================================
// IMPORTANT: You need to provide login credentials for a user in the old system
// to bypass RLS policies and access all data
// ============================================================================
const LOGIN_EMAIL = ''; // TODO: Add your user email from Lovable Cloud
const LOGIN_PASSWORD = ''; // TODO: Add your password

// Tables to export (based on Lovable dashboard showing data)
const TABLES_TO_EXPORT = [
  'agent_configs',
  'agent_messages',
  'clients',
  'knowledge_base_items',
  'market_research_reports',
  'n8n_connections',
  'project_agents',
  'project_asset_statuses',
  'project_tasks',
  'projects',
  'knowledge_base_collections',
  'knowledge_base_item_collections',
  // Tables with 0 rows (can skip but including for completeness)
  'ad_spy_ads',
  'ad_spy_searches',
  'campaigns',
  'department_agents',
  'facebook_ad_accounts',
  'google_sheets_connections',
];

async function exportTable(tableName: string): Promise<any[]> {
  console.log(`Exporting ${tableName}...`);

  try {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await oldSupabase
        .from(tableName)
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        // Check if table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log(`  ⊘ Table ${tableName} does not exist in old database`);
          return [];
        }
        console.error(`  ✗ Error: ${error.message}`);
        throw error;
      }

      if (!data || data.length === 0) {
        break;
      }

      allData = allData.concat(data);

      if (data.length < pageSize) {
        break;
      }

      page++;
    }

    if (allData.length > 0) {
      console.log(`  ✓ Exported ${allData.length} rows from ${tableName}`);
    } else {
      console.log(`  ⊘ Table ${tableName} is empty`);
    }

    return allData;
  } catch (error) {
    console.error(`  ✗ Failed to export ${tableName}:`, error);
    return [];
  }
}

async function main() {
  console.log('Starting data export from Lovable Cloud...\n');

  // Check if credentials are provided
  if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
    console.error('❌ ERROR: You must provide LOGIN_EMAIL and LOGIN_PASSWORD in this script!');
    console.error('   These are your user credentials from the Lovable Cloud app.');
    console.error('   Edit scripts/export-via-api.ts and add them at the top.\n');
    process.exit(1);
  }

  // Authenticate as a user to bypass RLS
  console.log('🔐 Authenticating...');
  const { data: authData, error: authError } = await oldSupabase.auth.signInWithPassword({
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    console.error('   Please check your LOGIN_EMAIL and LOGIN_PASSWORD.\n');
    process.exit(1);
  }

  console.log(`✓ Authenticated as: ${authData.user?.email}`);
  console.log(`  User ID: ${authData.user?.id}\n`);

  const backupDir = path.join(process.cwd(), 'migration-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const tableName of TABLES_TO_EXPORT) {
    const data = await exportTable(tableName);

    if (data.length > 0) {
      const backupFile = path.join(backupDir, `${tableName}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
      console.log(`  💾 Saved to: ${backupFile}\n`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\nExport complete! Files saved to migration-backup/');
  console.log('Next step: Run import script to load data into new Supabase instance');
}

main().catch(console.error);
