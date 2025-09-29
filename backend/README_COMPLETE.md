# 🔧 RailFit Backend API

FastAPI-based backend service for the RailFit Railway Asset Management System.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Supabase account
- Virtual environment (recommended)

### Installation

```bash
# Create and activate virtual environment
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

# Start server
python main.py
```

**Server runs on:** `http://localhost:8000`  
**API Docs:** `http://localhost:8000/docs`  
**OpenAPI JSON:** `http://localhost:8000/openapi.json`

## 📁 Project Structure

```
backend/
├── app/                        # Main application package
│   ├── api/                   # API routes
│   │   ├── endpoints/         # Individual endpoint modules
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── assets.py     # Asset management
│   │   │   ├── inspections.py # Inspection endpoints
│   │   │   ├── alerts.py     # Alert management
│   │   │   └── analytics.py  # Analytics endpoints
│   │   └── api.py            # API router configuration
│   ├── core/                 # Core functionality
│   │   ├── config.py         # Application configuration
│   │   ├── database.py       # Database connection
│   │   ├── security.py       # Authentication & security
│   │   └── permissions.py    # Role-based permissions
│   ├── models/               # SQLAlchemy models
│   │   ├── user.py          # User model
│   │   ├── asset.py         # Asset model
│   │   ├── inspection.py    # Inspection model
│   │   ├── vendor.py        # Vendor model
│   │   └── alert.py         # Alert model
│   ├── schemas/              # Pydantic schemas
│   │   ├── user.py          # User schemas
│   │   ├── asset.py         # Asset schemas
│   │   ├── inspection.py    # Inspection schemas
│   │   └── common.py        # Common schemas
│   └── services/             # Business logic
│       ├── auth_service.py   # Authentication logic
│       ├── asset_service.py  # Asset management logic
│       ├── qr_service.py     # QR code generation
│       └── alert_service.py  # Alert processing
├── alembic/                   # Database migrations
├── sample_data/              # Sample/test data files
├── schema.sql                # Complete database schema
├── requirements.txt          # Python dependencies
├── alembic.ini              # Alembic configuration
└── main.py                  # Application entry point
```

## 🔗 API Endpoints

### Authentication & Users
```http
POST   /auth/register          # User registration
POST   /auth/login             # User login
POST   /auth/refresh           # Token refresh
GET    /auth/me               # Current user profile
PUT    /auth/me               # Update profile
```

### Asset Management
```http
GET    /assets/               # List all assets (with filters)
POST   /assets/               # Create new asset
GET    /assets/{id}           # Get asset details
PUT    /assets/{id}           # Update asset
DELETE /assets/{id}           # Delete asset
GET    /assets/{id}/qr-code   # Generate QR code
GET    /assets/{id}/inspections # Asset inspection history
GET    /assets/{id}/alerts    # Asset alerts
```

### Inspections
```http
GET    /inspections/          # List inspections
POST   /inspections/          # Create inspection
GET    /inspections/{id}      # Get inspection details
PUT    /inspections/{id}      # Update inspection
DELETE /inspections/{id}      # Delete inspection
POST   /inspections/{id}/photos # Upload inspection photos
```

### Alerts
```http
GET    /alerts/               # List alerts (filtered by status)
POST   /alerts/               # Create alert
GET    /alerts/{id}           # Get alert details
POST   /alerts/{id}/acknowledge # Acknowledge alert
POST   /alerts/{id}/resolve   # Resolve alert
```

### Vendors
```http
GET    /vendors/              # List vendors
POST   /vendors/              # Create vendor
GET    /vendors/{id}          # Get vendor details
PUT    /vendors/{id}          # Update vendor
DELETE /vendors/{id}          # Delete vendor
GET    /vendors/{id}/assets   # Vendor assets
```

### Analytics & Reports
```http
GET    /analytics/dashboard   # Dashboard metrics
GET    /analytics/assets      # Asset analytics
GET    /analytics/health      # Health score trends
GET    /analytics/predictions # RUL predictions
GET    /analytics/alerts      # Alert statistics
```

### Integration APIs
```http
POST   /integrations/udm/sync # Sync with UDM system
POST   /integrations/tms/sync # Sync with TMS system
GET    /integrations/logs     # Integration sync logs
```

## 🗄️ Database Models

### User Model
```python
class User:
    user_id: UUID (PK)
    name: str
    email: str (Unique)
    password_hash: str
    role: UserRole (admin/manager/field_inspector)
    last_active: datetime
    created_at: datetime
    updated_at: datetime
```

### Asset Model
```python
class Asset:
    asset_id: UUID (PK)
    type: AssetType (Elastic Rail Clip/Rail Pad/Liner/Sleeper)
    vendor_id: UUID (FK)
    install_date: date
    location: str
    gps_lat: decimal
    gps_lng: decimal
    warranty_period: int (months)
    health_score: int (0-100)
    predicted_rul: int (months)
    status: AssetStatus (active/needs_maintenance/retired)
    qr_code: str
    metadata: jsonb
    created_at: datetime
    updated_at: datetime
```

### Inspection Model
```python
class Inspection:
    inspection_id: UUID (PK)
    asset_id: UUID (FK)
    inspector_id: UUID (FK)
    inspection_date: datetime
    condition_rating: int (1-5)
    notes: text
    photo_url: str
    gps_lat: decimal
    gps_lng: decimal
    weather_conditions: str
    temperature: decimal
    created_at: datetime
    updated_at: datetime
```

## 🔐 Authentication & Security

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1234567890
}
```

### Role-based Access Control
- **Admin:** Full system access
- **Manager:** Asset and inspection management
- **Field Inspector:** Field operations only

### Security Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🛠️ Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=app tests/

# Run specific test file
python -m pytest tests/test_auth.py
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Add new field to asset table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

### Code Quality
```bash
# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/
```

## 📊 Logging & Monitoring

### Log Levels
- **DEBUG:** Detailed information for debugging
- **INFO:** General operational messages
- **WARNING:** Warning messages
- **ERROR:** Error conditions
- **CRITICAL:** Critical error conditions

### Log Configuration
```python
# logs/app.log - Application logs
# logs/access.log - Access logs
# logs/error.log - Error logs
```

### Health Check Endpoint
```http
GET /health
Response: {"status": "healthy", "database": "connected", "timestamp": "2025-09-20T12:00:00Z"}
```

## 🚢 Deployment

### Environment Variables
```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
JWT_SECRET_KEY=your-secure-secret-key

# Optional
DEBUG=false
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_HOURS=24
ALLOWED_ORIGINS=https://your-frontend.com
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads/
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway/Render Deployment
```bash
# Set environment variables in platform dashboard
# Connect GitHub repository
# Deploy automatically on push to main branch
```

## 🔧 Configuration

### Alembic Configuration (alembic.ini)
```ini
[alembic]
script_location = alembic
sqlalchemy.url = postgresql://postgres:password@localhost/railfit

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic
```

### CORS Configuration
```python
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-production-frontend.com"
]
```

## 📈 Performance

### Database Query Optimization
- Use indexes on frequently queried fields
- Implement pagination for large result sets
- Use database connection pooling
- Cache frequently accessed data

### Response Time Targets
- Authentication: < 200ms
- Asset queries: < 500ms
- Complex analytics: < 2s
- File uploads: < 5s

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check Supabase credentials
# Verify DATABASE_URL format
# Test connection: python -c "from app.core.database import engine; print('Connected')"
```

**Migration Failures:**
```bash
# Reset migrations: alembic downgrade base
# Recreate from schema: psql < schema.sql
# Stamp current version: alembic stamp head
```

**Import Errors:**
```bash
# Check PYTHONPATH
# Verify virtual environment activation
# Install missing dependencies
```

---

## 📝 API Usage Examples

### Authentication
```python
import requests

# Register user
response = requests.post("http://localhost:8000/auth/register", json={
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "field_inspector"
})

# Login
response = requests.post("http://localhost:8000/auth/login", json={
    "email": "john@example.com",
    "password": "securepassword"
})
token = response.json()["access_token"]

# Use token for authenticated requests
headers = {"Authorization": f"Bearer {token}"}
```

### Asset Management
```python
# Create asset
asset_data = {
    "type": "Elastic Rail Clip",
    "vendor_id": "vendor-uuid",
    "install_date": "2025-01-15",
    "location": "Main Line Section A",
    "gps_lat": 40.7128,
    "gps_lng": -74.0060,
    "warranty_period": 24,
    "health_score": 85,
    "predicted_rul": 18,
    "status": "active"
}

response = requests.post(
    "http://localhost:8000/assets/",
    json=asset_data,
    headers=headers
)
```

### Inspection Creation
```python
# Create inspection
inspection_data = {
    "asset_id": "asset-uuid",
    "condition_rating": 4,
    "notes": "Good condition, minor wear observed",
    "gps_lat": 40.7128,
    "gps_lng": -74.0060,
    "weather_conditions": "Clear",
    "temperature": 22.5
}

response = requests.post(
    "http://localhost:8000/inspections/",
    json=inspection_data,
    headers=headers
)
```

---

**For complete API documentation, visit:** `http://localhost:8000/docs`