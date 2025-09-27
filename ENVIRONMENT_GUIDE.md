# Environment Variables Guide

## 🎯 Quick Answer: You DON'T need .env files for deployment!

### Local Development Only
- **Backend**: Use `.env` file in `backend/` directory (copy from `.env.example`)
- **Frontend**: Use `.env.local` file in `RailFit_Frontend/` directory (copy from `.env.example`)

### Production Deployment
- **Backend**: Set environment variables in Railway/Render dashboard
- **Frontend**: Set build-time environment variables in Vercel/Netlify dashboard

---

## 📁 File Structure

```
SIH/
├── backend/
│   ├── .env.example          # Template for local development
│   └── .env                  # Your local development file (gitignored)
├── RailFit_Frontend/
│   ├── .env.example          # Template for local frontend development  
│   └── .env.local            # Your local development file (gitignored)
└── README.md
```

---

## 🔧 Local Development Setup

### Backend (.env file)
```bash
# Copy the example file
cd backend
cp .env.example .env

# Edit with your values
# The .env.example already has working Supabase values
```

### Frontend (.env.local file)  
```bash
# Copy the example file
cd RailFit_Frontend
cp .env.example .env.local

# For local development, this should work as-is:
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Production Deployment

### Railway (Backend)
Set these environment variables in Railway dashboard:
```
DATABASE_URL=postgresql://postgres:Mvok4pePZ8VCQdYX@db.nlxrpnjccouogrfbbgmk.supabase.co:5432/postgres
SUPABASE_URL=https://nlxrpnjccouogrfbbgmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET_KEY=89a55cdf9f854e723e17cc9264e3836efb932460b146719610bc80c6512f8b4c
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=false
PORT=8000
```

### Vercel (Frontend)
Set these build-time environment variables in Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
VITE_APP_NAME=RailFIT Asset Management
VITE_APP_VERSION=1.0.0
```

---

## ⚠️ Important Notes

### ❌ Don't Do This:
- Don't commit `.env` files to git
- Don't upload `.env` files to deployment platforms
- Don't put production secrets in `.env` files

### ✅ Do This:
- Use platform environment variables for production
- Keep `.env` files only for local development
- Use `.env.example` files as templates
- Add `.env` and `.env.local` to `.gitignore`

---

## 🛡️ Security Best Practices

1. **Never commit secrets**: `.env` files should be in `.gitignore`
2. **Use platform env vars**: Railway, Vercel, etc. encrypt environment variables
3. **Rotate secrets**: Change JWT_SECRET_KEY and database passwords regularly
4. **Separate environments**: Different secrets for development/staging/production

---

## 🔍 Verification

### Check if .env files are gitignored:
```bash
git status
# Should NOT show .env files
```

### Check platform environment variables:
- **Railway**: Service → Variables tab
- **Vercel**: Project → Settings → Environment Variables
- **Render**: Service → Environment tab