# URGENT: Fix CORS Error - Vercel Configuration

## Problem
Frontend is getting CORS error because it's still using the old Railway URL instead of your new Render backend.

## Root Cause
Vercel doesn't read `.env.production` files from git. Environment variables must be set in the Vercel Dashboard.

## Solution: Update Vercel Environment Variables

### Steps:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard

2. **Select your project** (rail-fit or railfit-frontend)

3. **Go to Settings → Environment Variables**

4. **Add/Update this environment variable:**
   ```
   VITE_API_BASE_URL=https://railfit-backend.onrender.com
   ```
   
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://railfit-backend.onrender.com`
   - **Environments**: Select `Production` (and optionally `Preview` and `Development`)

5. **Save the environment variable**

6. **Redeploy your frontend:**
   - Go to Deployments tab
   - Click on the latest deployment
   - Click "Redeploy" (or just push a new commit to trigger auto-deployment)

7. **Wait for deployment to complete** (usually 30-60 seconds)

8. **Clear browser cache** and test login again

## Alternative: Manual Build & Deploy

If redeploying doesn't work:

```bash
# Build with explicit environment variable
VITE_API_BASE_URL=https://railfit-backend.onrender.com npm run build

# Deploy using Vercel CLI
vercel --prod
```

## Verification

After deployment, check that:
- Your site loads without errors
- Login page displays correctly  
- When you try to login, it contacts `https://railfit-backend.onrender.com` (check Network tab in DevTools)
- No CORS errors appear

## Backend CORS Configuration

Make sure your **Render backend** environment variables are also set:

In Render Dashboard → Your Backend Service → Settings → Environment:

```
ALLOWED_ORIGINS=https://rail-fit.vercel.app,https://railfit-backend.onrender.com,http://localhost:5173,http://localhost:3000
```

And restart the service for changes to take effect.

## Network Request Check

Open DevTools (F12) → Network tab → Try to login

Look for the XHR/Fetch request to `/api/auth/login`. 
- It should go to: `https://railfit-backend.onrender.com/api/auth/login`
- Response headers should include: `access-control-allow-origin: https://rail-fit.vercel.app`

If you see the old Railway URL or no CORS headers, the env var isn't set correctly.

## Questions?

- Check Vercel logs: Deployments → Recent deployment → View Build Logs
- Check Request URL: DevTools → Network → Filter requests
- Check environment was injected: Check the built code (but Vite should handle this)
