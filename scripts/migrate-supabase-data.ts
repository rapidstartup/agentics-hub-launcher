import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Old Supabase instance (Lovable Cloud)
const OLD_SUPABASE_URL = 'https://pooeaxqkysmngpnpnswn.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2VheHFreXNtbmdwbnBuc3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTk3ODgsImV4cCI6MjA3NjgzNTc4OH0.Tx38u656P8LUvpQCH5rp6d5flDtV_f9_vsMEn8cr4FI';

// New Supabase instance (Your account)
const NEW_SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const NEW_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY);

// Define the tables to migrate in dependency order
// Tables without foreign keys first, then tables that depend on them
// Note: Some tables may not exist in the old instance - the script will skip them
const TABLES_TO_MIGRATE = [
  // Core Supabase auth tables
  'profiles',

  // N8N and agent configuration (likely exist in Lovable)
  'agent_configs',
  'n8n_connections',
  'n8n_workflows',

  // Knowledge base (likely exists)
  'knowledge_base_collections',
  'knowledge_base_documents',
  'knowledge_base_chunks',
  'knowledge_base_items',

  // Composio connections (if you were using Composio)
  'composio_connections',

  // Messages (likely exists)
  'agent_messages',
  'copywriter_messages',

  // Client and project management (newer tables, may not exist in old instance)
  'clients',
  'projects',
  'project_assets',
  'project_tasks',
  'project_agents',
  'project_comments',

  // Admin/department tables
  'admin_tasks',
  'campaigns',
  'department_agents',
  'department_kpis',
];

interface MigrationStats {
  table: string;
  exported: number;
  imported: number;
  errors: string[];
}

async function getTableData(supabase: any, tableName: string): Promise<any[]> {
  console.log(`Fetching data from table: ${tableName}`);

  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      // Check if table doesn't exist
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('not found')) {
        console.log(`  Table ${tableName} does not exist in source database (skipping)`);
        return [];
      }
      console.error(`Error fetching ${tableName}:`, error.message || error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allData = allData.concat(data);
    console.log(`  Fetched ${data.length} rows (total: ${allData.length})`);

    if (data.length < pageSize) {
      break;
    }

    page++;
  }

  return allData;
}

async function insertTableData(supabase: any, tableName: string, data: any[]): Promise<number> {
  if (data.length === 0) {
    console.log(`No data to insert for ${tableName}`);
    return 0;
  }

  console.log(`Inserting ${data.length} rows into ${tableName}`);

  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const { error } = await supabase
      .from(tableName)
      .insert(batch);

    if (error) {
      const errorDetails = {
        message: error.message || 'Unknown error',
        code: error.code,
        details: error.details,
        hint: error.hint,
      };
      console.error(`Error inserting batch into ${tableName}:`, JSON.stringify(errorDetails, null, 2));
      throw new Error(`Insert failed: ${error.message || JSON.stringify(error)}`);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${data.length} rows`);
  }

  return inserted;
}

async function migrateTable(tableName: string): Promise<MigrationStats> {
  const stats: MigrationStats = {
    table: tableName,
    exported: 0,
    imported: 0,
    errors: [],
  };

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Migrating table: ${tableName}`);
    console.log('='.repeat(60));

    // Export data from old instance
    const data = await getTableData(oldSupabase, tableName);
    stats.exported = data.length;

    if (data.length === 0) {
      console.log(`Table ${tableName} is empty, skipping...`);
      return stats;
    }

    // Save to file as backup
    const backupDir = path.join(process.cwd(), 'migration-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    console.log(`Backup saved to: ${backupFile}`);

    // Import data to new instance
    const imported = await insertTableData(newSupabase, tableName, data);
    stats.imported = imported;

    console.log(`Successfully migrated ${tableName}: ${imported}/${data.length} rows`);

  } catch (error) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMsg = JSON.stringify(error, null, 2);
    } else {
      errorMsg = String(error);
    }
    stats.errors.push(errorMsg);
    console.error(`Failed to migrate ${tableName}:`, errorMsg);
  }

  return stats;
}

async function migrateStorageBuckets() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Checking storage buckets...');
  console.log('='.repeat(60));

  try {
    const { data: oldBuckets, error: oldError } = await oldSupabase.storage.listBuckets();

    if (oldError) {
      console.error('Error listing old buckets:', oldError);
      return;
    }

    console.log(`Found ${oldBuckets?.length || 0} buckets in old instance`);

    if (!oldBuckets || oldBuckets.length === 0) {
      console.log('No storage buckets to migrate');
      return;
    }

    for (const bucket of oldBuckets) {
      console.log(`\nBucket: ${bucket.name}`);
      console.log(`  Public: ${bucket.public}`);
      console.log(`  NOTE: Storage files need to be migrated manually or via separate script`);
      console.log(`  You can use the Supabase dashboard to download/upload files`);
    }

  } catch (error) {
    console.error('Error migrating storage buckets:', error);
  }
}

async function main() {
  console.log('Starting Supabase Data Migration');
  console.log(`From: ${OLD_SUPABASE_URL}`);
  console.log(`To: ${NEW_SUPABASE_URL}`);
  console.log('\n');

  const allStats: MigrationStats[] = [];

  // Migrate each table
  for (const tableName of TABLES_TO_MIGRATE) {
    const stats = await migrateTable(tableName);
    allStats.push(stats);

    // Small delay between tables to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Check storage buckets
  await migrateStorageBuckets();

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('Migration Summary');
  console.log('='.repeat(60));

  let totalExported = 0;
  let totalImported = 0;
  let totalErrors = 0;

  for (const stats of allStats) {
    totalExported += stats.exported;
    totalImported += stats.imported;

    // Only count as errors if table exists but failed, not if table doesn't exist
    const tableDoesntExist = stats.errors.some(err =>
      err.includes('does not exist') || err.includes('not found')
    );

    if (stats.errors.length > 0 && !tableDoesntExist) {
      totalErrors += stats.errors.length;
    }

    const status = stats.errors.length > 0 && !tableDoesntExist ? 'FAILED' :
                   tableDoesntExist ? 'SKIPPED' :
                   stats.exported === 0 ? 'EMPTY' : 'SUCCESS';

    console.log(`${stats.table.padEnd(40)} ${status.padEnd(10)} ${stats.imported}/${stats.exported} rows`);

    if (stats.errors.length > 0 && !tableDoesntExist) {
      stats.errors.forEach(err => console.log(`  ERROR: ${err}`));
    }
  }

  console.log('\n');
  console.log(`Total Exported: ${totalExported} rows`);
  console.log(`Total Imported: ${totalImported} rows`);
  console.log(`Tables with Errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\nSome tables failed to migrate. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\nMigration completed successfully!');
  }
}

// Run the migration
main().catch(console.error);
