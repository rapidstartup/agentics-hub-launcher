/**
 * Get the correct Supabase keys for Vercel
 *
 * This fetches and displays the exact keys you need to copy to Vercel
 */

import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'bzldwfwyriwvlyfixmrt';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

// Try to get keys from .env
console.log('═'.repeat(70));
console.log('SUPABASE KEYS FOR VERCEL ENVIRONMENT VARIABLES');
console.log('═'.repeat(70));
console.log('\nCopy these EXACT values to Vercel:\n');

console.log('1️⃣  VITE_SUPABASE_URL');
console.log('   ' + SUPABASE_URL);
console.log('');

console.log('2️⃣  VITE_SUPABASE_PROJECT_ID');
console.log('   ' + PROJECT_ID);
console.log('');

// Read from .env
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const anonKeyMatch = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY="([^"]+)"/);
const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

if (anonKeyMatch) {
  console.log('3️⃣  VITE_SUPABASE_PUBLISHABLE_KEY');
  console.log('   ' + anonKeyMatch[1]);
  console.log('');
} else {
  console.log('❌ Could not find VITE_SUPABASE_PUBLISHABLE_KEY in .env');
}

if (serviceKeyMatch) {
  console.log('4️⃣  SUPABASE_SERVICE_ROLE_KEY');
  console.log('   ' + serviceKeyMatch[1]);
  console.log('');
} else {
  console.log('❌ Could not find SUPABASE_SERVICE_ROLE_KEY in .env');
}

console.log('═'.repeat(70));
console.log('VERCEL SETUP INSTRUCTIONS');
console.log('═'.repeat(70));
console.log('\n1. Go to your Vercel project settings');
console.log('2. Navigate to: Environment Variables');
console.log('3. Update these 4 variables with the values above');
console.log('4. Make sure to set them for: Production, Preview, AND Development');
console.log('5. Redeploy your application');
console.log('\n⚠️  IMPORTANT: After updating env vars, you MUST redeploy!');
console.log('   Environment variables only take effect after a new deployment.\n');

// Test the keys
async function testKeys() {
  console.log('═'.repeat(70));
  console.log('TESTING KEYS');
  console.log('═'.repeat(70));

  if (!anonKeyMatch || !serviceKeyMatch) {
    console.log('\n❌ Cannot test - keys not found in .env\n');
    return;
  }

  const anonKey = anonKeyMatch[1];
  const serviceKey = serviceKeyMatch[1];

  // Test anon key
  console.log('\nTesting anon key...');
  try {
    const supabase = createClient(SUPABASE_URL, anonKey);
    const { error } = await supabase.from('clients').select('count', { count: 'exact', head: true });

    if (error && error.message.includes('Invalid API key')) {
      console.log('❌ Anon key is INVALID');
    } else {
      console.log('✅ Anon key is VALID');
    }
  } catch (err) {
    console.log('❌ Error testing anon key:', err);
  }

  // Test service key
  console.log('\nTesting service role key...');
  try {
    const supabase = createClient(SUPABASE_URL, serviceKey);
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('❌ Service key is INVALID:', error.message);
    } else {
      console.log(`✅ Service key is VALID (found ${data.users.length} users)`);
    }
  } catch (err) {
    console.log('❌ Error testing service key:', err);
  }

  console.log('\n');
}

testKeys().catch(console.error);
