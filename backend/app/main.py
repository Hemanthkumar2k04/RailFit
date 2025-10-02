from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, assets, dashboard, inspections, vendors, mobile, analytics
from app.api import alerts 
# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth")  # Results in /api/auth/*
app.include_router(assets.router, prefix="/api/assets")  # Results in /api/assets/*
app.include_router(inspections.router, prefix="/api/inspections")  # Results in /api/inspections/*
app.include_router(vendors.router, prefix="/api/vendors")  # Results in /api/vendors/*
app.include_router(mobile.router, prefix="/api/mobile")  # Results in /api/mobile/*
app.include_router(dashboard.router)  # Results in /api/dashboard (defined in router)
app.include_router(alerts.router, prefix="/api/alerts")
app.include_router(analytics.router, prefix="/api/analytics")  # Results in /api/analytics/*

# Add OPTIONS handler for CORS preflight requests
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight OPTIONS requests"""
    return {"message": "OK"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.version,
        "status": "running",
        "features": [
            "Asset Management",
            "AI-Powered Inspections",
            "Defect Detection",
            "Audit Trail"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_model": "MobileNetV2",
        "database": "Supabase",
        "timestamp": "2024-09-21T10:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 5000))  # Use PORT env var or default to 5000
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)