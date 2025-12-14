/**
 * Import Central Brain Data - Batched Version
 * This script imports data in smaller batches to avoid payload size limits
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration - update these values
const SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const IMPORT_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/import-central-brain-data`;
const EXPORT_FILE = './central-brain-export.json';

// Tables in import order (same as function)
const IMPORT_ORDER = [
  'content_groups',
  'app_settings',
  'agent_boards',
  'project_groups',
  'board_settings',
  'board_tools',
  'assets',
  'prompt_templates',
  'ai_roles',
  'knowledge_entries',
  'swipe_files',
  'project_strategies',
  'market_research',
  'funnels',
  'project_tools',
  'integrations',
  'offers',
  'offer_assets',
  'creative_cards',
  'canvas_blocks',
  'canvas_groups',
  'canvas_edges',
  'agent_chat_sessions',
  'agent_chat_messages',
  'ad_spy_settings',
  'ad_spy_competitors',
  'ad_spy_boards',
  'ad_spy_ads',
  'ad_spy_board_items',
  'ad_spy_search_history',
  'ad_spy_research_agents',
  'chat_sessions',
  'chat_messages',
];

async function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify({ data });
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData),
      },
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(jsonData);
    req.end();
  });
}

async function importTable(tableName, tableData) {
  if (!tableData || tableData.length === 0) {
    return { inserted: 0, skipped: true };
  }
  
  console.log(`  Importing ${tableName}: ${tableData.length} records...`);
  
  const dataForTable = {};
  dataForTable[tableName] = tableData;
  
  const result = await makeRequest(IMPORT_FUNCTION_URL, dataForTable);
  
  if (result.status !== 200) {
    console.log(`  ❌ ${tableName} failed: HTTP ${result.status}`);
    // Try to parse error
    try {
      const errorData = JSON.parse(result.body);
      return { inserted: 0, error: errorData.error || `HTTP ${result.status}` };
    } catch {
      return { inserted: 0, error: `HTTP ${result.status}` };
    }
  }
  
  try {
    const response = JSON.parse(result.body);
    const tableResult = response.results?.[tableName];
    if (tableResult) {
      if (tableResult.errors?.length > 0) {
        console.log(`  ⚠️  ${tableName}: ${tableResult.inserted} inserted, ${tableResult.errors.length} errors`);
        tableResult.errors.forEach(e => console.log(`      - ${e}`));
      } else {
        console.log(`  ✅ ${tableName}: ${tableResult.inserted} records imported`);
      }
      return tableResult;
    }
    return { inserted: tableData.length, errors: [] };
  } catch {
    return { inserted: 0, error: 'Failed to parse response' };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Central Brain Data Import - Batched');
  console.log('='.repeat(60));
  
  // Read export file
  console.log('\nReading export file...');
  if (!fs.existsSync(EXPORT_FILE)) {
    console.error(`❌ Export file not found: ${EXPORT_FILE}`);
    process.exit(1);
  }
  
  const exportJson = fs.readFileSync(EXPORT_FILE, 'utf8');
  const exportData = JSON.parse(exportJson);
  
  console.log(`Export date: ${exportData.exportedAt || 'unknown'}`);
  console.log(`Total records: ${exportData.summary?.totalRecords || 'unknown'}`);
  
  // Get the data section
  const data = exportData.data || exportData;
  
  // Show what we're importing
  console.log('\nTables with data:');
  for (const table of IMPORT_ORDER) {
    const count = data[table]?.length || 0;
    if (count > 0) {
      console.log(`  - ${table}: ${count} records`);
    }
  }
  
  // Import tables one by one
  console.log('\n' + '-'.repeat(60));
  console.log('Starting import (one table at a time)...');
  console.log('-'.repeat(60));
  
  const results = {};
  let totalInserted = 0;
  let tablesWithErrors = 0;
  
  for (const tableName of IMPORT_ORDER) {
    const tableData = data[tableName];
    
    try {
      const result = await importTable(tableName, tableData);
      results[tableName] = result;
      
      if (result.inserted) {
        totalInserted += result.inserted;
      }
      if (result.errors?.length > 0 || result.error) {
        tablesWithErrors++;
      }
    } catch (err) {
      console.log(`  ❌ ${tableName}: ${err.message}`);
      results[tableName] = { inserted: 0, error: err.message };
      tablesWithErrors++;
    }
    
    // Small delay between tables to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total records inserted: ${totalInserted}`);
  console.log(`Tables with errors: ${tablesWithErrors}`);
  
  if (tablesWithErrors > 0) {
    console.log('\nTables with errors:');
    for (const [table, result] of Object.entries(results)) {
      if (result.errors?.length > 0 || result.error) {
        console.log(`  ${table}:`);
        if (result.error) {
          console.log(`    - ${result.error}`);
        }
        if (result.errors) {
          result.errors.forEach(e => console.log(`    - ${e}`));
        }
      }
    }
  }
  
  console.log('\n✅ Import complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
