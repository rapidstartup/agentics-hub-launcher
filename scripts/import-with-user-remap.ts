/**
 * Import Data with User ID Remapping
 *
 * This script imports data from backup files and remaps the old user_id
 * to a new user_id in your new Supabase instance.
 *
 * Steps:
 * 1. Log into your app once (via GitHub OAuth) to create your user in new Supabase
 * 2. Get your new user_id from Supabase dashboard or by logging in
 * 3. Run this script with: npx tsx scripts/import-with-user-remap.ts <NEW_USER_ID>
 *
 * Or let it auto-detect if you provide your email:
 *    npx tsx scripts/import-with-user-remap.ts --email your@email.com
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// NEW Supabase (your own instance)
const NEW_SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8';

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const backupDir = path.join(process.cwd(), 'migration-backup');

// Import order respecting foreign key dependencies
const IMPORT_ORDER = [
  'clients',                    // No dependencies (except user)
  'n8n_connections',            // No dependencies (except user)
  'projects',                   // Depends on clients + user
  'project_agents',             // Depends on projects + user
  'project_tasks',              // Depends on projects + user
  'project_asset_statuses',     // Depends on projects, tasks + user
  'agent_configs',              // May depend on connections + user
  'agent_messages',             // Depends on agent_configs + user
  'knowledge_base_items',       // Depends on clients, projects, tasks + user
  'market_research_reports',    // Depends on clients + user
];

interface ImportStats {
  table: string;
  rowsToImport: number;
  rowsImported: number;
  errors: string[];
  skipped: number;
}

function remapUserIds(data: any[], oldUserId: string, newUserId: string): any[] {
  return data.map(row => {
    const newRow = { ...row };
    if (newRow.user_id === oldUserId) {
      newRow.user_id = newUserId;
    }
    return newRow;
  });
}

async function findOrCreateUser(email?: string): Promise<string | null> {
  if (!email) {
    return null;
  }

  // Try to find user by email
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error.message);
    return null;
  }

  const user = users.users.find(u => u.email === email);

  if (user) {
    console.log(`✓ Found existing user: ${user.email} (${user.id})`);
    return user.id;
  }

  console.log(`User with email ${email} not found.`);
  console.log('Please log into your app first to create the user via GitHub OAuth.');
  return null;
}

async function importTable(
  tableName: string,
  oldUserId: string,
  newUserId: string
): Promise<ImportStats> {
  const stats: ImportStats = {
    table: tableName,
    rowsToImport: 0,
    rowsImported: 0,
    errors: [],
    skipped: 0,
  };

  const filePath = path.join(backupDir, `${tableName}.json`);

  if (!fs.existsSync(filePath)) {
    return stats;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  let data: any[];

  try {
    data = JSON.parse(fileContent);
  } catch (error) {
    stats.errors.push('Invalid JSON');
    return stats;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return stats;
  }

  // Remap user IDs
  const remappedData = remapUserIds(data, oldUserId, newUserId);

  stats.rowsToImport = remappedData.length;
  console.log(`\n📦 Importing ${tableName} (${remappedData.length} rows)...`);

  // Import in batches
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < remappedData.length; i += batchSize) {
    const batch = remappedData.slice(i, i + batchSize);

    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) {
        // Try individual inserts for this batch
        console.log(`  ⚠ Batch error, trying individual inserts...`);

        for (const row of batch) {
          const { error: rowError } = await supabase
            .from(tableName)
            .upsert(row, { onConflict: 'id' });

          if (rowError) {
            if (!rowError.message.includes('duplicate')) {
              console.log(`    ✗ Row ${row.id}: ${rowError.message}`);
              stats.skipped++;
            } else {
              // Duplicate means it already exists, count as imported
              imported++;
            }
          } else {
            imported++;
          }
        }
      } else {
        imported += batch.length;
        console.log(`  ✓ Imported ${imported}/${remappedData.length}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMsg}`);
    }
  }

  stats.rowsImported = imported;

  if (stats.rowsImported > 0) {
    console.log(`  ✓ ${tableName}: ${stats.rowsImported}/${stats.rowsToImport} rows imported`);
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);

  let newUserId: string | null = null;
  let email: string | null = null;

  // Parse arguments
  if (args.length === 0) {
    console.error('❌ Error: Please provide a new user ID or email');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/import-with-user-remap.ts <NEW_USER_ID>');
    console.log('  npx tsx scripts/import-with-user-remap.ts --email your@email.com');
    console.log('\nTo get your user ID:');
    console.log('  1. Log into your app (via GitHub OAuth) once');
    console.log('  2. Go to Supabase dashboard → Authentication → Users');
    console.log('  3. Copy your user ID');
    process.exit(1);
  }

  if (args[0] === '--email' && args[1]) {
    email = args[1];
    newUserId = await findOrCreateUser(email);
  } else {
    newUserId = args[0];
  }

  if (!newUserId) {
    console.error('❌ Could not determine user ID');
    process.exit(1);
  }

  console.log('Data Import with User ID Remapping\n');
  console.log(`Target Supabase: ${NEW_SUPABASE_URL}`);
  console.log(`New User ID: ${newUserId}\n`);
  console.log('='.repeat(60));

  // Detect old user ID from backup files
  const clientsFile = path.join(backupDir, 'clients.json');
  if (!fs.existsSync(clientsFile)) {
    console.error('❌ No backup files found in migration-backup/');
    process.exit(1);
  }

  const clientsData = JSON.parse(fs.readFileSync(clientsFile, 'utf-8'));
  const oldUserId = clientsData[0]?.user_id;

  if (!oldUserId) {
    console.error('❌ Could not detect old user_id from backup files');
    process.exit(1);
  }

  console.log(`Old User ID: ${oldUserId}`);
  console.log(`Remapping: ${oldUserId} → ${newUserId}\n`);

  const allStats: ImportStats[] = [];

  for (const tableName of IMPORT_ORDER) {
    const stats = await importTable(tableName, oldUserId, newUserId);
    allStats.push(stats);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));

  const totalImported = allStats.reduce((sum, s) => sum + s.rowsImported, 0);
  const totalSkipped = allStats.reduce((sum, s) => sum + s.skipped, 0);
  const totalErrors = allStats.filter(s => s.errors.length > 0).length;

  console.log(`\nTotal rows imported: ${totalImported}`);
  if (totalSkipped > 0) {
    console.log(`Total rows skipped: ${totalSkipped}`);
  }
  if (totalErrors > 0) {
    console.log(`Tables with errors: ${totalErrors}`);
  }

  console.log('\nPer table:');
  allStats.forEach(stats => {
    if (stats.rowsToImport === 0) return;

    const status = stats.rowsImported === stats.rowsToImport ? '✓' :
                   stats.rowsImported > 0 ? '⚠' : '✗';
    console.log(`  ${status} ${stats.table.padEnd(30)} ${stats.rowsImported}/${stats.rowsToImport} rows`);
  });

  if (totalErrors === 0 && totalSkipped === 0) {
    console.log('\n✓ Import completed successfully!');
  } else {
    console.log('\n⚠ Import completed with some issues');
  }

  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEPS');
  console.log('='.repeat(60));
  console.log('\n1. Verify data in Supabase dashboard:');
  console.log('   https://supabase.com/dashboard/project/bzldwfwyriwvlyfixmrt/editor');
  console.log('\n2. Test your app locally:');
  console.log('   npm run dev');
  console.log('\n3. Update production environment variables and deploy');
}

main().catch(console.error);
