import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8';

const TABLES = [
  'clients',
  'projects',
  'project_tasks',
  'agent_configs',
  'knowledge_base_items',
  'n8n_connections',
];

async function main() {
  const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

  console.log('Checking tables in NEW Supabase...\n');

  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`✗ ${table.padEnd(30)} ERROR: ${error.message}`);
      } else {
        console.log(`✓ ${table.padEnd(30)} EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`✗ ${table.padEnd(30)} EXCEPTION: ${err}`);
    }
  }
}

main().catch(console.error);
