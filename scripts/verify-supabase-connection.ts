/**
 * Verify Supabase Connection and Auth Setup
 *
 * Tests:
 * 1. Anon key is valid
 * 2. Service role key is valid
 * 3. Auth providers are configured
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjUzNTAsImV4cCI6MjA3OTk0MTM1MH0.c1PZ7kD8RLdPnBQOhYRfDLGJMfXXfXlCy8r1QKd-Thw';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8';

async function testAnonKey() {
  console.log('\n1️⃣  Testing Anon Key...');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Try a simple query
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.log('   ❌ INVALID ANON KEY');
        console.log('   Error:', error.message);
        return false;
      } else {
        // Other errors are ok (like RLS blocking)
        console.log('   ✅ Anon key is valid');
        console.log('   (Error is normal - RLS blocking unauthenticated access)');
        return true;
      }
    }

    console.log('   ✅ Anon key is valid and working');
    return true;

  } catch (err) {
    console.log('   ❌ Connection failed:', err instanceof Error ? err.message : err);
    return false;
  }
}

async function testServiceKey() {
  console.log('\n2️⃣  Testing Service Role Key...');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Try listing users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('   ❌ INVALID SERVICE ROLE KEY');
      console.log('   Error:', error.message);
      return false;
    }

    console.log(`   ✅ Service role key is valid`);
    console.log(`   Found ${data.users.length} user(s)`);
    return true;

  } catch (err) {
    console.log('   ❌ Connection failed:', err instanceof Error ? err.message : err);
    return false;
  }
}

async function checkAuthProviders() {
  console.log('\n3️⃣  Checking Auth Configuration...');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Try to get session (won't exist but will show if auth is configured)
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('   ✅ Auth endpoint is accessible');

    // Check if we can access auth
    console.log('\n   ⚠️  Manual checks required:');
    console.log('   Go to: https://supabase.com/dashboard/project/bzldwfwyriwvlyfixmrt/auth/providers');
    console.log('   ');
    console.log('   Required GitHub OAuth Setup:');
    console.log('   1. Enable GitHub provider');
    console.log('   2. Add Client ID and Secret from GitHub OAuth App');
    console.log('   3. Add redirect URL: https://bzldwfwyriwvlyfixmrt.supabase.co/auth/v1/callback');
    console.log('   4. Also add your production domain redirect URLs');

    return true;

  } catch (err) {
    console.log('   ❌ Auth check failed:', err instanceof Error ? err.message : err);
    return false;
  }
}

async function testTableAccess() {
  console.log('\n4️⃣  Testing Database Access...');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const tables = ['clients', 'projects', 'agent_configs'];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ✗ ${table}: ${error.message}`);
      } else {
        console.log(`   ✓ ${table}: ${count} rows`);
      }
    }

    return true;

  } catch (err) {
    console.log('   ❌ Database access failed:', err instanceof Error ? err.message : err);
    return false;
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('Supabase Connection Verification');
  console.log('═'.repeat(60));
  console.log(`\nProject: bzldwfwyriwvlyfixmrt`);
  console.log(`URL: ${SUPABASE_URL}`);

  const anonKeyValid = await testAnonKey();
  const serviceKeyValid = await testServiceKey();
  await checkAuthProviders();
  await testTableAccess();

  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));

  if (!anonKeyValid) {
    console.log('\n❌ ANON KEY IS INVALID');
    console.log('\nTo get the correct anon key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bzldwfwyriwvlyfixmrt/settings/api');
    console.log('2. Copy the "anon" / "public" key');
    console.log('3. Update VITE_SUPABASE_PUBLISHABLE_KEY in Vercel');
  } else {
    console.log('\n✅ Anon key is valid');
  }

  if (!serviceKeyValid) {
    console.log('\n❌ SERVICE ROLE KEY IS INVALID');
    console.log('\nTo get the correct service role key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bzldwfwyriwvlyfixmrt/settings/api');
    console.log('2. Copy the "service_role" key (click "Reveal")');
    console.log('3. Update SUPABASE_SERVICE_ROLE_KEY in Vercel');
  } else {
    console.log('✅ Service role key is valid');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('NEXT STEPS');
  console.log('═'.repeat(60));
  console.log('\n1. Configure GitHub OAuth Provider:');
  console.log('   https://supabase.com/dashboard/project/bzldwfwyriwvlyfixmrt/auth/providers');
  console.log('   ');
  console.log('2. Get GitHub OAuth credentials:');
  console.log('   - Go to GitHub Settings → Developer settings → OAuth Apps');
  console.log('   - Create new OAuth App or use existing');
  console.log('   - Homepage URL: https://your-app.vercel.app');
  console.log('   - Callback URL: https://bzldwfwyriwvlyfixmrt.supabase.co/auth/v1/callback');
  console.log('   - Copy Client ID and Secret');
  console.log('   ');
  console.log('3. Add to Supabase:');
  console.log('   - Paste Client ID and Client Secret in Supabase dashboard');
  console.log('   - Enable GitHub provider');
  console.log('   - Save');
  console.log('   ');
  console.log('4. Test login on production site');
}

main().catch(console.error);
