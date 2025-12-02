import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8';

async function main() {
  const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error.message);
    return;
  }

  console.log(`\nUsers in NEW Supabase (${NEW_SUPABASE_URL}):\n`);

  if (data.users.length === 0) {
    console.log('  No users yet!');
    console.log('\n  Please log into your app once (via GitHub OAuth) to create your user.');
    console.log('  Then run this script again to get your user ID.\n');
  } else {
    data.users.forEach(u => {
      console.log(`  Email: ${u.email || 'N/A'}`);
      console.log(`  ID:    ${u.id}`);
      console.log(`  Provider: ${u.app_metadata?.provider || 'N/A'}`);
      console.log('');
    });

    console.log(`\nTo import data with user remapping, run:`);
    console.log(`  npx tsx scripts/import-with-user-remap.ts ${data.users[0].id}`);
  }
}

main().catch(console.error);
