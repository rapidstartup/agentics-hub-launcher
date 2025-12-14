/**
 * Import Data from JSON Backups
 *
 * This script imports data from the JSON backup files created by export-via-api.ts
 * into your new Supabase instance.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// New Supabase instance (Your account)
const NEW_SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const NEW_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8';

const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY);

const backupDir = path.join(process.cwd(), 'migration-backup');

interface ImportStats {
  table: string;
  total: number;
  imported: number;
  errors: string[];
}

async function importTable(tableName: string): Promise<ImportStats> {
  const stats: ImportStats = {
    table: tableName,
    total: 0,
    imported: 0,
    errors: [],
  };

  try {
    const backupFile = path.join(backupDir, `${tableName}.json`);

    if (!fs.existsSync(backupFile)) {
      console.log(`⊘ No backup file for ${tableName} (${backupFile})`);
      return stats;
    }

    const fileContent = fs.readFileSync(backupFile, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`⊘ ${tableName}: No data to import`);
      return stats;
    }

    stats.total = data.length;
    console.log(`\nImporting ${tableName} (${data.length} rows)...`);

    // Import in batches
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const { data: result, error } = await newSupabase
        .from(tableName)
        .insert(batch);

      if (error) {
        const errorMsg = `Batch ${i}-${i + batch.length}: ${error.message}`;
        stats.errors.push(errorMsg);
        console.error(`  ✗ ${errorMsg}`);

        // If it's a unique constraint violation, try individual inserts
        if (error.code === '23505') {
          console.log(`  ⟳ Retrying batch individually...`);
          for (const row of batch) {
            const { error: rowError } = await newSupabase
              .from(tableName)
              .insert([row]);

            if (!rowError) {
              imported++;
            } else if (!rowError.message.includes('duplicate')) {
              console.error(`    ✗ Row error: ${rowError.message}`);
            }
          }
        }
      } else {
        imported += batch.length;
        console.log(`  ✓ Imported ${imported}/${data.length} rows`);
      }
    }

    stats.imported = imported;
    console.log(`✓ Completed ${tableName}: ${imported}/${data.length} rows imported`);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    stats.errors.push(errorMsg);
    console.error(`✗ Failed to import ${tableName}: ${errorMsg}`);
  }

  return stats;
}

async function main() {
  console.log('Starting data import from JSON backups...\n');
  console.log(`Backup directory: ${backupDir}\n`);

  if (!fs.existsSync(backupDir)) {
    console.error(`Error: Backup directory does not exist: ${backupDir}`);
    console.error('Please run export-via-api.ts first to create backups.');
    process.exit(1);
  }

  // List all JSON files in backup directory
  const backupFiles = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  console.log(`Found ${backupFiles.length} backup files to import:\n`);
  backupFiles.forEach(table => console.log(`  - ${table}`));
  console.log('');

  const allStats: ImportStats[] = [];

  // Import each table
  for (const tableName of backupFiles) {
    const stats = await importTable(tableName);
    allStats.push(stats);

    // Small delay between tables
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Import Summary');
  console.log('='.repeat(60));

  let totalRows = 0;
  let totalImported = 0;
  let totalErrors = 0;

  for (const stats of allStats) {
    totalRows += stats.total;
    totalImported += stats.imported;
    if (stats.errors.length > 0) {
      totalErrors++;
    }

    const status = stats.errors.length > 0 ? 'PARTIAL' :
                   stats.total === 0 ? 'EMPTY' : 'SUCCESS';

    console.log(`${stats.table.padEnd(40)} ${status.padEnd(10)} ${stats.imported}/${stats.total} rows`);

    if (stats.errors.length > 0 && stats.errors.length <= 3) {
      stats.errors.forEach(err => console.log(`  ${err}`));
    } else if (stats.errors.length > 3) {
      console.log(`  ${stats.errors.length} errors (showing first 3):`);
      stats.errors.slice(0, 3).forEach(err => console.log(`  ${err}`));
    }
  }

  console.log('\n');
  console.log(`Total Rows in Backups: ${totalRows}`);
  console.log(`Total Rows Imported: ${totalImported}`);
  console.log(`Tables with Issues: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\nSome tables had issues during import. Check errors above.');
    console.log('Note: Duplicate key errors are normal if you ran this script multiple times.');
  } else {
    console.log('\n✓ All data imported successfully!');
  }
}

main().catch(console.error);
