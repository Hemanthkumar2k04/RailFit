# 🛤️ RailFit - Smart Railway Asset Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Smart Asset Management Solution for Railway Infrastructure**  
> Developed for Smart India Hackathon (SIH) 2025

## 🎯 Project Overview

RailFit is an intelligent railway asset management system designed to track, monitor, and maintain critical railway components including **Rail Clips**, **Rail Pads**, **Liners**, and **Sleepers**. The system provides real-time asset tracking, predictive maintenance alerts, and seamless integration with existing railway management systems.

### ✨ Key Features

- 🔍 **QR Code Asset Tracking** - Unique identification for every component
- 📊 **Real-time Health Monitoring** - AI-powered health scoring and RUL prediction  
- ⚡ **Predictive Maintenance** - Smart alerts before component failure
- 👥 **Role-based Access Control** - Admin, Manager, and Field Inspector roles
- 🔗 **API Integration** - Seamless sync with UDM and TMS systems
- 📱 **Mobile-friendly Interface** - Field inspection support
- 📈 **Analytics Dashboard** - Performance metrics and trends
- 🛡️ **Secure Authentication** - JWT-based user management

## 🏗️ System Architecture

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Frontend      │    Backend      │    Database     │
│                 │                 │                 │
│  React + TS     │   FastAPI       │   Supabase      │
│  Tailwind CSS   │   SQLAlchemy    │   PostgreSQL    │
│  Vite           │   Alembic       │                 │
└─────────────────┴─────────────────┴─────────────────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                    ┌─────────────────┐
                    │   External APIs │
                    │   UDM / TMS     │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Supabase Account** (free tier available)
- **Git** for version control

### 1. Clone Repository

```bash
git clone https://github.com/KeerthanaShreeVenugopal/SIH.git
cd SIH
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations
alembic upgrade head

# Start backend server
python main.py
```

**Backend will run on:** `http://localhost:8000`  
**API Documentation:** `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../RailFit_Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

### 4. Database Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy project URL and keys

2. **Run Schema:**
   - Open Supabase SQL Editor
   - Copy contents of `backend/schema.sql`
   - Execute to create tables and sample data

3. **Update Environment:**
   ```bash
   # Edit backend/.env file
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
   JWT_SECRET_KEY=your-secure-secret-key
   ```

## 📁 Project Structure

```
SIH/
├── backend/                    # FastAPI Backend
│   ├── app/                   # Application code
│   │   ├── api/              # API endpoints
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── core/             # Core configurations
│   ├── alembic/              # Database migrations
│   ├── sample_data/          # Test data files
│   ├── schema.sql            # Database schema
│   ├── requirements.txt      # Python dependencies
│   └── main.py               # Application entry point
├── RailFit_Frontend/          # React Frontend
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React contexts
│   │   └── assets/           # Static assets
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
├── ML_model/                  # Machine Learning
│   └── script.py             # Prediction algorithms
└── README.md                 # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Asset Management
- `GET /assets/` - List all assets
- `POST /assets/` - Create new asset
- `GET /assets/{asset_id}` - Get asset details
- `PUT /assets/{asset_id}` - Update asset
- `DELETE /assets/{asset_id}` - Delete asset
- `GET /assets/{asset_id}/qr-code` - Generate QR code

### Inspections
- `GET /inspections/` - List inspections
- `POST /inspections/` - Create inspection
- `GET /inspections/asset/{asset_id}` - Asset inspections

### Alerts & Analytics
- `GET /alerts/` - Active alerts
- `POST /alerts/acknowledge` - Acknowledge alert
- `GET /analytics/dashboard` - Dashboard metrics

**Complete API Documentation:** Available at `/docs` when backend is running

## 🗄️ Database Schema

### Core Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Users** | System users with role-based access | `user_id`, `name`, `email`, `role`, `last_active` |
| **Assets** | Railway components being tracked | `asset_id`, `type`, `location`, `health_score`, `predicted_rul` |
| **Inspections** | Field inspection records | `inspection_id`, `asset_id`, `inspector_id`, `condition_rating` |
| **Vendors** | Component suppliers | `vendor_id`, `name`, `contact_info`, `warranty_terms` |
| **Alerts** | Maintenance and failure alerts | `alert_id`, `asset_id`, `type`, `priority`, `acknowledged_at` |
| **API Integrations** | External system sync logs | `integration_id`, `system`, `sync_status`, `sync_time` |
| **Photos** | Asset and inspection images | `photo_id`, `asset_id`, `inspection_id`, `url` |

### Asset Types
- **Elastic Rail Clip** - Rail fastening component
- **Rail Pad** - Vibration dampening pad
- **Liner** - Protective liner component  
- **Sleeper** - Railway sleeper/tie

## 👥 User Roles & Permissions

| Role | Permissions | Description |
|------|-------------|-------------|
| **Admin** | Full system access | User management, system configuration, reports |
| **Manager** | Asset & inspection management | View analytics, manage inspections, approve maintenance |
| **Field Inspector** | Field operations | Create inspections, view assigned assets, capture photos |

## 🛠️ Development

### Adding New Features

1. **Backend (API Endpoint):**
   ```bash
   # Add to app/api/endpoints/
   # Update models in app/models/
   # Add schemas in app/schemas/
   # Implement logic in app/services/
   ```

2. **Frontend (Component):**
   ```bash
   # Add component in src/components/
   # Update routing in src/App.tsx
   # Add to navigation if needed
   ```

3. **Database Changes:**
   ```bash
   # Create migration
   alembic revision --autogenerate -m "Description"
   
   # Apply migration
   alembic upgrade head
   ```

### Code Quality

```bash
# Backend testing
cd backend
python -m pytest

# Frontend testing
cd RailFit_Frontend
npm run test

# Linting
npm run lint
```

## 🚢 Deployment

### Production Environment

1. **Backend Deployment (Railway/Render):**
   ```bash
   # Set environment variables
   # Deploy from GitHub repository
   # Run database migrations
   ```

2. **Frontend Deployment (Vercel/Netlify):**
   ```bash
   # Build production bundle
   npm run build
   
   # Deploy dist/ folder
   ```

3. **Database (Supabase):**
   - Already cloud-hosted
   - Configure production settings
   - Set up backups

### Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=your-database-url
JWT_SECRET_KEY=your-secret-key
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Frontend:**
```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🤝 Team Collaboration

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "Add: new feature description"
git push origin feature/new-feature

# Create pull request for review
```

### Database Changes
- All team members use shared Supabase database
- Local development can use the same cloud database
- Migrations are versioned and shared via Git

### API Testing
- Use Postman collection (available in `/docs`)
- Test endpoints at `http://localhost:8000/docs`
- Frontend can connect to shared backend

## 📊 Monitoring & Analytics

- **Health Scores:** 0-100 scale asset health monitoring
- **RUL Prediction:** Remaining Useful Life in months
- **Alert System:** Priority-based maintenance alerts
- **Performance Metrics:** Component lifecycle analytics
- **Integration Logs:** UDM/TMS sync status tracking

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python environment
python --version

# Verify dependencies
pip list

# Check environment variables
python -c "from app.core.config import settings; print(settings.database_url)"
```

**Database connection fails:**
```bash
# Test Supabase connection
# Check .env configuration
# Verify Supabase project status
```

**Frontend build errors:**
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
```

## 📄 License

This project is developed for Smart India Hackathon 2025. All rights reserved.

---

## 📞 Support

- **Team:** RailFit Development Team
- **GitHub:** [Repository Issues](https://github.com/KeerthanaShreeVenugopal/SIH/issues)

---

**Built with ❤️ for Smart India Hackathon 2025**