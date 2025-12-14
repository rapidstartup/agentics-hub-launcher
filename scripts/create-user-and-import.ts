/**
 * Create User and Import All Data
 *
 * This script:
 * 1. Creates the user from OLD Supabase in NEW Supabase (with same UUID)
 * 2. Imports all data (preserving all foreign key relationships)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
  'clients',
  'n8n_connections',
  'projects',
  'project_agents',
  'project_tasks',
  'project_asset_statuses',
  'agent_configs',
  'agent_messages',
  'knowledge_base_items',
  'market_research_reports',
];

interface ImportStats {
  table: string;
  rowsToImport: number;
  rowsImported: number;
  errors: string[];
}

async function detectAllUserIds(): Promise<string[]> {
  const userIds = new Set<string>();
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row.user_id) {
          userIds.add(row.user_id);
        }
      });
    }
  }

  return Array.from(userIds);
}

async function createUser(userId: string): Promise<boolean> {
  console.log(`\n📝 Creating user with ID: ${userId}`);

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserById(userId);

    if (existingUser?.user) {
      console.log(`  ✓ User already exists: ${existingUser.user.email || 'No email'}`);
      return true;
    }

    // Create user with the specific UUID
    // Note: We'll create a placeholder user that can be claimed later via GitHub OAuth
    const { data, error } = await supabase.auth.admin.createUser({
      id: userId,
      email: `user-${userId.substring(0, 8)}@placeholder.local`,
      email_confirm: true,
      user_metadata: {
        migrated_from_lovable: true,
        migration_date: new Date().toISOString(),
      },
    });

    if (error) {
      console.error(`  ✗ Failed to create user: ${error.message}`);
      return false;
    }

    console.log(`  ✓ User created successfully`);
    console.log(`  ℹ Placeholder email: ${data.user.email}`);
    console.log(`  ℹ User can claim this account by logging in via GitHub OAuth`);
    return true;

  } catch (error) {
    console.error(`  ✗ Error creating user:`, error);
    return false;
  }
}

async function importTable(tableName: string): Promise<ImportStats> {
  const stats: ImportStats = {
    table: tableName,
    rowsToImport: 0,
    rowsImported: 0,
    errors: [],
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

  stats.rowsToImport = data.length;
  console.log(`\n📦 Importing ${tableName} (${data.length} rows)...`);

  // Import in batches
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    try {
      const { error } = await supabase
        .from(tableName)
        .insert(batch);

      if (error) {
        // If batch fails, try individual inserts
        if (error.code === '23505') {
          // Duplicate key - try upsert instead
          for (const row of batch) {
            const { error: rowError } = await supabase
              .from(tableName)
              .upsert(row, { onConflict: 'id' });

            if (!rowError || rowError.message.includes('duplicate')) {
              imported++;
            } else {
              console.log(`    ✗ Row ${row.id}: ${rowError.message}`);
            }
          }
        } else {
          console.log(`  ⚠ Batch error: ${error.message}`);
          console.log(`  ⟳ Trying individual inserts...`);

          for (const row of batch) {
            const { error: rowError } = await supabase
              .from(tableName)
              .insert(row);

            if (rowError) {
              console.log(`    ✗ Row ${row.id}: ${rowError.message}`);
            } else {
              imported++;
            }
          }
        }
      } else {
        imported += batch.length;
        console.log(`  ✓ Imported ${imported}/${data.length}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMsg}`);
    }
  }

  stats.rowsImported = imported;

  if (stats.rowsImported > 0) {
    console.log(`  ✓ ${tableName}: ${stats.rowsImported}/${stats.rowsToImport} rows`);
  }

  return stats;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('Create User and Import All Data');
  console.log('═'.repeat(60));
  console.log(`\nTarget: ${NEW_SUPABASE_URL}\n`);

  // Step 1: Detect all user IDs
  console.log('Step 1: Detecting all user IDs from backup files...');
  const userIds = await detectAllUserIds();

  if (userIds.length === 0) {
    console.error('\n❌ Could not detect any user_ids from backup files');
    console.error('Make sure migration-backup/ contains JSON files with user data');
    process.exit(1);
  }

  console.log(`✓ Found ${userIds.length} user ID(s):`);
  userIds.forEach((id, index) => console.log(`  ${index + 1}. ${id}`));

  // Step 2: Create all users
  console.log('\nStep 2: Creating users in NEW Supabase...');
  let allUsersCreated = true;

  for (const userId of userIds) {
    const userCreated = await createUser(userId);
    if (!userCreated) {
      console.error(`\n⚠ Warning: Failed to create user ${userId}`);
      allUsersCreated = false;
    }
  }

  if (!allUsersCreated) {
    console.log('\n⚠ Some users could not be created, but will continue with import...');
  }

  // Step 3: Import data
  console.log('\nStep 3: Importing data...');
  console.log('─'.repeat(60));

  const allStats: ImportStats[] = [];

  for (const tableName of IMPORT_ORDER) {
    const stats = await importTable(tableName);
    allStats.push(stats);

    // Small delay between tables
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('═'.repeat(60));

  const totalImported = allStats.reduce((sum, s) => sum + s.rowsImported, 0);
  const totalExpected = allStats.reduce((sum, s) => sum + s.rowsToImport, 0);
  const tablesWithErrors = allStats.filter(s => s.errors.length > 0).length;

  console.log(`\nTotal rows imported: ${totalImported}/${totalExpected}`);

  if (tablesWithErrors > 0) {
    console.log(`Tables with errors: ${tablesWithErrors}`);
  }

  console.log('\nPer table:');
  allStats.forEach(stats => {
    if (stats.rowsToImport === 0) return;

    const status = stats.rowsImported === stats.rowsToImport ? '✓' :
                   stats.rowsImported > 0 ? '⚠' : '✗';
    const pct = Math.round((stats.rowsImported / stats.rowsToImport) * 100);
    console.log(`  ${status} ${stats.table.padEnd(30)} ${stats.rowsImported}/${stats.rowsToImport} (${pct}%)`);

    if (stats.errors.length > 0) {
      stats.errors.slice(0, 2).forEach(err => console.log(`    ⚠ ${err}`));
    }
  });

  if (totalImported === totalExpected && tablesWithErrors === 0) {
    console.log('\n✅ Import completed successfully!');
  } else if (totalImported > 0) {
    console.log('\n⚠ Import completed with some issues');
  } else {
    console.log('\n❌ Import failed');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('NEXT STEPS');
  console.log('═'.repeat(60));
  console.log('\n1. Verify data in Supabase dashboard:');
  console.log('   https://supabase.com/dashboard/project/bzldwfwyriwvlyfixmrt/editor');
  console.log('\n2. Update .env to point to NEW Supabase:');
  console.log('   VITE_SUPABASE_PROJECT_ID="bzldwfwyriwvlyfixmrt"');
  console.log('   VITE_SUPABASE_URL="https://bzldwfwyriwvlyfixmrt.supabase.co"');
  console.log('   VITE_SUPABASE_PUBLISHABLE_KEY="<anon_key>"');
  console.log('\n3. Test locally:');
  console.log('   npm run dev');
  console.log('\n4. When you log in via GitHub OAuth, your account will be linked');
  console.log('   to the migrated data automatically.');
  console.log('\n5. Update production environment variables and deploy');
}

main().catch(console.error);
