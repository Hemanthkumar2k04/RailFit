# RailFIT Deployment Guide

## Overview
This guide covers deploying the RailFIT Asset Management system, which consists of:
- **Backend**: FastAPI application with Supabase database
- **Frontend**: React + TypeScript + Vite application
- **Database**: PostgreSQL via Supabase

## Prerequisites
- Docker installed (for local testing)
- Git repository access
- Supabase account with database configured
- Domain name (optional, for custom domains)

## Quick Deploy Options

### Option 1: Railway (Recommended)
Railway provides easy deployment with automatic HTTPS and domain.

#### Backend Deployment:
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET_KEY`
3. Railway will automatically detect the Dockerfile and deploy

#### Frontend Deployment:
1. Deploy frontend to Vercel/Netlify
2. Set `VITE_API_BASE_URL` to your Railway backend URL
3. Build and deploy

### Option 2: Render
Similar to Railway, supports both backend and frontend.

### Option 3: Docker Compose (Self-hosted)
For VPS deployment:

```bash
# Clone repository
git clone <your-repo-url>
cd SIH

# Copy environment file
cp .env.production.template .env.production

# Edit environment variables
nano .env.production

# Deploy with Docker Compose
docker-compose up -d
```

## Environment Variables Required

### Backend (.env):
```
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=false
```

### Frontend:
```
VITE_API_BASE_URL=https://your-backend-domain.com
```

## API Endpoints Available
After deployment, your API will have these endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset
- `GET /api/assets/{id}` - Get asset details
- `GET /api/assets/metrics` - Asset metrics

### Inspections
- `GET /api/inspections` - List inspections
- `POST /api/inspections` - Create inspection

### Vendors
- `GET /api/vendors` - List vendors
- `GET /api/vendors/{id}` - Get vendor details

### Mobile
- `POST /api/mobile/scan` - QR code scanning
- `GET /api/mobile/health` - Health check

### Dashboard
- `GET /api/dashboard/dashboard` - Dashboard data
- `GET /api/dashboard/fittings` - Rail fittings data

## Testing Deployment

### Health Check
```bash
curl https://your-backend-url/health
```

### API Documentation
Visit: `https://your-backend-url/docs`

## Default Users
The system includes demo users:
- Admin: `admin@railfit.com` / `admin123`
- Manager: `manager@railfit.com` / `admin123`  
- Inspector: `inspector@railfit.com` / `admin123`

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure frontend URL is in CORS allowed origins
2. **Database Connection**: Verify DATABASE_URL format
3. **Authentication**: Check JWT_SECRET_KEY is set
4. **File Uploads**: Ensure upload directory permissions

### Logs:
- Railway: Check deployment logs in dashboard
- Docker: `docker-compose logs backend`

## Scaling Considerations
- Use CDN for frontend static assets
- Configure database connection pooling
- Consider Redis for session storage
- Monitor API performance and add rate limiting

## Security Notes
- Use strong JWT secret keys
- Enable HTTPS in production
- Set proper CORS origins
- Use environment variables for secrets
- Regular security updates