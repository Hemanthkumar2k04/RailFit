# 🚨 DEPLOYMENT ENVIRONMENT VARIABLE FIX 🚨

Your Railway deployment is failing because the required environment variables are not properly set. Here's how to fix it:

## Required Environment Variables for Railway

You need to set these **exact** environment variable names in Railway:

### Critical Variables (Required)
```
SUPABASE_URL=https://nlxrpnjccouogrfbbgmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE
DATABASE_URL=postgresql://postgres:Mvok4pePZ8VCQdYX@db.nlxrpnjccouogrfbbgmk.supabase.co:5432/postgres
JWT_SECRET_KEY=89a55cdf9f854e723e17cc9264e3836efb932460b146719610bc80c6512f8b4c
```

### Optional Variables (With defaults)
```
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=false
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads/
```

## How to Set Environment Variables in Railway

1. **Go to your Railway project dashboard**
2. **Click on your backend service**
3. **Go to the "Variables" tab**
4. **Add each environment variable with the exact names and values above**

### Important Notes:
- ⚠️ **Variable names must be EXACT** (all caps)
- ⚠️ **No spaces around the = sign**
- ⚠️ **Make sure DEBUG=false for production**
- ⚠️ **Don't wrap values in quotes in Railway**

## Alternative: Use Railway CLI

If you have Railway CLI installed, you can set variables from command line:

```bash
railway variables set SUPABASE_URL=https://nlxrpnjccouogrfbbgmk.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE
railway variables set DATABASE_URL=postgresql://postgres:Mvok4pePZ8VCQdYX@db.nlxrpnjccouogrfbbgmk.supabase.co:5432/postgres
railway variables set JWT_SECRET_KEY=89a55cdf9f854e723e17cc9264e3836efb932460b146719610bc80c6512f8b4c
railway variables set DEBUG=false
```

## After Setting Variables

1. **Redeploy** your service in Railway
2. **Check the logs** to see if the startup errors are resolved
3. **Test the API endpoints** to ensure they're working

## Expected Result

After setting these variables, your deployment should start successfully and you should see logs like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Instead of the current ValidationError for missing environment variables.