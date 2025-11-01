# CORS Configuration Guide

## Current Deployment Setup
- **Backend**: https://railfit-backend.onrender.com (Render)
- **Frontend**: https://rail-fit.vercel.app (Vercel)

## How to Configure CORS to Avoid Errors

### 1. **Backend (Render) - Environment Variables**

Go to your Render Dashboard → Select your backend service → Settings → Environment

Add these environment variables:

```
ALLOWED_ORIGINS=https://rail-fit.vercel.app,https://railfit-backend.onrender.com
FRONTEND_URL=https://rail-fit.vercel.app
DEBUG=false
```

**Important**: Make sure these are set correctly:
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET_KEY` - Your JWT secret key

### 2. **Frontend (Vercel) - Environment Variables**

Go to your Vercel Dashboard → Select your frontend project → Settings → Environment Variables

Add this environment variable:

```
VITE_API_BASE_URL=https://railfit-backend.onrender.com
```

Make sure it's set for **Production** environment.

### 3. **For Local Development**

#### Backend (.env file in `/backend` directory):

```env
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://rail-fit.vercel.app
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads/
```

#### Frontend (.env.local file in `/RailFit_Frontend` directory):

```env
VITE_API_BASE_URL=http://localhost:8000
```

Or to test with your Render backend locally:

```env
VITE_API_BASE_URL=https://railfit-backend.onrender.com
```

### 4. **Docker Compose (Local Testing)**

When running with Docker:

```bash
docker-compose up --build
```

Set environment variables in `.env` file at project root:

```env
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET_KEY=your-secret-key
VITE_API_BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000,http://127.0.0.1:5173,http://127.0.0.1:3000
```

## Testing CORS Configuration

### Test the backend health endpoint:

```bash
curl -X GET https://railfit-backend.onrender.com/health
```

### Test login with correct CORS headers:

```bash
curl -X POST https://railfit-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://rail-fit.vercel.app" \
  -d '{"email":"admin@railfit.com","password":"railway123"}'
```

## Troubleshooting CORS Errors

### Error: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**: 
1. Check that `ALLOWED_ORIGINS` on the backend includes your frontend URL
2. Verify `VITE_API_BASE_URL` on frontend points to correct backend URL
3. Restart/redeploy both frontend and backend after changing environment variables

### Error: "401 Unauthorized"

This means CORS is working, but authentication failed. Check:
1. Credentials (email/password) are correct
2. User exists in database
3. Database connection is working

### Error: "Cannot reach backend"

1. Check that `VITE_API_BASE_URL` is correct and accessible
2. Verify backend service is running on Render
3. Check network connectivity

## Key Files Modified

- `/RailFit_Frontend/.env.production` - Production frontend config
- `/RailFit_Frontend/.env.local` - Local development frontend config
- `/backend/.env.production` - Production backend config
- `/backend/.env` - Local development backend config
- `/backend/app/core/config.py` - CORS configuration logic
- `/docker-compose.yml` - Docker local deployment config

## Summary

All necessary CORS configuration has been set up. The main points are:

1. **Backend CORS allows**: `https://rail-fit.vercel.app` and local URLs
2. **Frontend API points to**: `https://railfit-backend.onrender.com` (production) or `http://localhost:8000` (local)
3. **Environment variables** are properly configured in both Vercel and Render dashboards
4. **CORS headers** are automatically handled by FastAPI middleware

You should now be able to login without CORS errors!
