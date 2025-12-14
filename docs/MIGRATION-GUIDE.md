# Supabase Migration Guide

## Overview
This guide walks you through migrating from Lovable Cloud's hosted Supabase to your own Supabase account.

**Old Instance:** `pooeaxqkysmngpnpnswn.supabase.co` (Lovable Cloud)
**New Instance:** `bzldwfwyriwvlyfixmrt.supabase.co` (Your Account)

## Migration Steps

### Phase 1: Prepare New Supabase Instance

#### Step 1: Install Supabase CLI (if not already installed)
```bash
# Windows (via npm)
npm install -g supabase

# Or via Homebrew (if using WSL)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

#### Step 2: Link to New Supabase Project
```bash
# Login to Supabase
supabase login

# Link to your new project
supabase link --project-ref bzldwfwyriwvlyfixmrt
```

#### Step 3: Run All Migrations on New Instance
This will create all tables, functions, RLS policies, and triggers:

```bash
# Push all migrations to the new instance
supabase db push
```

This command will apply all 42 migration files in the `supabase/migrations/` directory.

#### Step 4: Deploy Edge Functions
```bash
# Deploy all edge functions to the new instance
supabase functions deploy
```

#### Step 5: Set Up Storage Buckets
Check your old instance for storage buckets and create them in the new instance:
- Go to Supabase Dashboard → Storage
- Create the same buckets with the same public/private settings
- Set up the same storage policies

Common buckets you might have:
- `knowledge-base` (for document uploads)
- `avatars` (for user avatars)
- Any other custom buckets

### Phase 2: Migrate Data

#### Step 1: Install TypeScript Dependencies
```bash
npm install --save-dev tsx @types/node
```

#### Step 2: Review the Migration Script
Check `scripts/migrate-supabase-data.ts` and update the `TABLES_TO_MIGRATE` array if needed. The script will:
- Export all data from old instance
- Save JSON backups to `migration-backup/` directory
- Import data to new instance
- Provide detailed logs

#### Step 3: Run the Migration Script
```bash
npx tsx scripts/migrate-supabase-data.ts
```

**Important Notes:**
- The script uses the anon key for the old instance (read-only access)
- The script uses the service role key for the new instance (write access)
- Data is migrated in dependency order (tables without foreign keys first)
- Backups are saved locally before importing
- The script handles pagination for large tables

#### Step 4: Verify Data Migration
After the script completes:
1. Check the console output for any errors
2. Review the `migration-backup/` directory for JSON backups
3. Query your new Supabase instance to verify data:

```sql
-- Check row counts for key tables
SELECT 'profiles' as table_name, count(*) as rows FROM profiles
UNION ALL
SELECT 'agent_configs', count(*) FROM agent_configs
UNION ALL
SELECT 'clients', count(*) FROM clients
UNION ALL
SELECT 'projects', count(*) FROM projects;
```

#### Step 5: Migrate Storage Files (if applicable)
Storage files need to be migrated separately. Options:

**Option A: Manual via Dashboard**
1. Download files from old instance's Storage
2. Upload to new instance's Storage

**Option B: Programmatic (create a separate script)**
```typescript
// Example for migrating storage files
const { data: files } = await oldSupabase.storage
  .from('bucket-name')
  .list();

for (const file of files) {
  const { data: fileData } = await oldSupabase.storage
    .from('bucket-name')
    .download(file.name);

  await newSupabase.storage
    .from('bucket-name')
    .upload(file.name, fileData);
}
```

### Phase 3: Update Application Configuration

#### Step 1: Verify Local Environment
Your `.env` file has been updated with new credentials:
```env
VITE_SUPABASE_PROJECT_ID=bzldwfwyriwvlyfixmrt
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
VITE_SUPABASE_URL=https://bzldwfwyriwvlyfixmrt.supabase.co
```

#### Step 2: Test Locally
```bash
# Start the development server
npm run dev

# Test key functionality:
# - User authentication
# - Database queries
# - Storage uploads/downloads
# - Edge function calls
```

#### Step 3: Update Vercel Production Secrets
**IMPORTANT:** Only do this after successful local testing!

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Set environment variables in Vercel
vercel env add VITE_SUPABASE_PROJECT_ID production
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add VITE_SUPABASE_URL production
```

Or via Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Update each variable with the new values
3. Select "Production" environment

#### Step 4: Deploy to Production
```bash
# Redeploy to apply new environment variables
vercel --prod
```

### Phase 4: Verification and Cleanup

#### Step 1: Test Production
After deployment, thoroughly test:
- [ ] User login/signup
- [ ] Database read/write operations
- [ ] File uploads/downloads
- [ ] Edge functions
- [ ] Composio integrations
- [ ] N8N workflows
- [ ] Knowledge base operations

#### Step 2: Monitor for Issues
- Check Vercel logs for errors
- Check Supabase logs for failed queries
- Monitor user reports

#### Step 3: Keep Old Instance (temporary)
**Don't delete the old Lovable Cloud instance immediately!**
- Keep it running for 1-2 weeks as a backup
- Monitor the new instance for any data issues
- Once confident, you can decommission the old instance

## Rollback Plan

If something goes wrong:

1. **Quick Rollback (Vercel)**
   ```bash
   # Revert environment variables in Vercel
   # Point back to old Supabase instance
   ```

2. **Data Restore**
   - JSON backups are saved in `migration-backup/` directory
   - Can be re-imported using a modified version of the migration script

3. **Schema Restore**
   - All migrations are version-controlled in `supabase/migrations/`
   - Can be reapplied to a fresh Supabase instance

## Troubleshooting

### Common Issues

**Issue: Migration script fails with "relation does not exist"**
- Solution: Make sure you ran `supabase db push` first to apply all migrations

**Issue: RLS policy violations during data import**
- Solution: The script uses the service role key which bypasses RLS

**Issue: Foreign key constraint errors**
- Solution: Check the `TABLES_TO_MIGRATE` order in the script. Parent tables must be migrated before child tables.

**Issue: Storage files not accessible**
- Solution: Check storage bucket policies are correctly set up in the new instance

**Issue: Edge functions returning errors**
- Solution: Verify environment variables are set in Supabase dashboard (Settings → Edge Functions → Environment Variables)

## Post-Migration Checklist

- [ ] All migrations applied successfully
- [ ] All data migrated (verify row counts)
- [ ] Storage buckets created and configured
- [ ] Storage files migrated (if applicable)
- [ ] Edge functions deployed
- [ ] Local environment tested
- [ ] Vercel environment variables updated
- [ ] Production deployed and tested
- [ ] Monitoring in place
- [ ] Team notified of migration
- [ ] Old instance kept as backup (temporary)

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migration Guide](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues during migration:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check the JSON backups in `migration-backup/`
4. The old instance is still available for reference
