# Fix Vercel Deployment - Invalid API Key

## The Issue

Environment variables in Vercel are only loaded at **build time**. If you update them, you must trigger a **new deployment** to apply them.

## ✅ Steps to Fix

### 1. Verify Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Make sure these are set for **Production, Preview, AND Development**:

```
VITE_SUPABASE_URL=https://bzldwfwyriwvlyfixmrt.supabase.co
VITE_SUPABASE_PROJECT_ID=bzldwfwyriwvlyfixmrt
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjUzNTAsImV4cCI6MjA3OTk0MTM1MH0.7ahL3xSzBW_EtnbyUrcX6Smh51LWFO5gLnFbQ2rapD0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGR3Znd5cml3dmx5Zml4bXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NTM1MCwiZXhwIjoyMDc5OTQxMzUwfQ.F-L7H0VqKmGzBSIuooNI-5Wj-tgeGs_06zzQEA5SlF8
```

### 2. Trigger a Redeploy

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **•••** menu
4. Click **Redeploy**

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Redeploy with new Supabase keys"
git push
```

### 3. Wait for Build to Complete

Watch the deployment logs in Vercel dashboard. Make sure it completes successfully.

### 4. Test the New Deployment

1. Open your production URL
2. Try to sign up / log in with GitHub
3. Should work now!

## 🔍 How to Verify Keys in Build

In Vercel deployment logs, look for the build output. You can add this to your `vite.config.ts` temporarily to verify:

```typescript
console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
```

This will show which URL is being used during build.

## ⚠️ Common Mistakes

- ❌ Updating env vars but not redeploying
- ❌ Setting env vars only for "Production" (not Preview/Development)
- ❌ Having the old keys cached in browser (hard refresh: Ctrl+Shift+R)
- ❌ Using `.env.local` file which overrides Vercel env vars

## 🎯 Expected Result

After redeploying with correct env vars:
- ✅ GitHub login works
- ✅ Can see your migrated data
- ✅ All features work normally

---

**Note**: If it still doesn't work after redeployment, check the browser console (F12) for the actual error message. It might reveal more details about what's failing.
