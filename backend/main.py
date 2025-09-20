from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
from typing import List, Dict, Any, Optional
import os
import uuid
import qrcode
import io
import base64
from datetime import datetime, date

# Pydantic models for asset management
class AssetCreate(BaseModel):
    type: str
    vendor: str
    installDate: str
    location: str
    warrantyPeriod: int

class AssetUpdate(BaseModel):
    healthScore: Optional[int] = None
    status: Optional[str] = None

class Asset(BaseModel):
    assetId: str
    type: str
    vendor: str
    installDate: str
    location: str
    warrantyPeriod: int
    healthScore: Optional[int] = None
    predictedRUL: Optional[int] = None
    status: str = "active"
    lastInspection: Optional[str] = None

app = FastAPI(title="RailFit Backend API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample dashboard data
dashboard_data = {
    "totalAssets": 2847,
    "operationalAssets": 1234,
    "maintenanceQueue": 175,
    "criticalAlerts": 18,
    "assetDistribution": {
        "excellent": 1851,
        "good": 803,
        "fair": 175,
        "critical": 18
    },
    "systemUptime": 97.8,
    "avgResponseTime": 2.1,
    "zones": [
        {"name": "Northern Railway Zone", "status": "Online"},
        {"name": "Southern Railway Zone", "status": "Online"},
        {"name": "Eastern Railway Zone", "status": "Maintenance"}
    ]
}

# Sample alert data
alerts_data = [
    {"id": 1, "type": "Critical", "message": "Immediate Action Required", "affected": "Track Section 7A"},
    {"id": 2, "type": "Warning", "message": "Warranty Expiring Soon", "affected": "PAD038449"}
]

# In-memory asset storage (in production, use a proper database)
assets_db = {
    "RF-2024-001234": {
        "assetId": "RF-2024-001234",
        "type": "Elastic Rail Clip",
        "vendor": "ABC Industries",
        "installDate": "2024-01-15",
        "location": "Delhi-Mumbai Route, KM 245",
        "warrantyPeriod": 24,
        "healthScore": 85,
        "predictedRUL": 18,
        "status": "active",
        "lastInspection": "2024-08-10"
    },
    "RF-2024-001235": {
        "assetId": "RF-2024-001235",
        "type": "Rail Pad",
        "vendor": "XYZ Corp",
        "installDate": "2024-02-20",
        "location": "Mumbai-Chennai Route, KM 150",
        "warrantyPeriod": 18,
        "healthScore": 92,
        "predictedRUL": 24,
        "status": "active",
        "lastInspection": "2024-09-01"
    }
}

def read_csv_file(filename: str) -> List[Dict]:
    """Helper function to read CSV file and return as list of dictionaries"""
    try:
        if os.path.exists(filename):
            df = pd.read_csv(filename)
            return df.to_dict('records')
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading CSV file: {str(e)}")

def generate_qr_code(asset_id: str) -> str:
    """Generate QR code for asset and return as base64 string"""
    try:
        # Create QR code with asset information
        qr_data = f"https://railfit.app/assets/{asset_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{qr_code_b64}"
    except Exception as e:
        # Fallback to simple text encoding if QR code generation fails
        qr_data = f"RAILFIT_ASSET:{asset_id}"
        return f"data:image/png;base64,{base64.b64encode(qr_data.encode()).decode()}"

def generate_asset_id() -> str:
    """Generate unique asset ID"""
    return f"RF-{datetime.now().year}-{str(uuid.uuid4())[:6].upper()}"

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "RailFit Backend API is running"}

@app.get("/api/dashboard")
async def get_dashboard():
    """Get dashboard data"""
    return dashboard_data

@app.get("/api/alerts")
async def get_alerts():
    """Get maintenance and critical alerts from CSV data"""
    try:
        # Read the fittings CSV file
        fittings_data = read_csv_file('fittings.csv')
        
        if not fittings_data:
            return {"maintenanceAlerts": [], "criticalAlerts": []}
        
        # Filter for maintenance alerts (Fail inspection or Defective performance)
        maintenance_alerts = [
            asset for asset in fittings_data 
            if asset.get('Inspection_Result') == 'Fail' or asset.get('Performance_Status') == 'Defective'
        ]
        
        # Filter for critical alerts
        critical_alerts = [
            asset for asset in fittings_data 
            if asset.get('Performance_Status') == 'Critical'
        ]
        
        return {
            "maintenanceAlerts": maintenance_alerts,
            "criticalAlerts": critical_alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing alerts: {str(e)}")

# Asset Management Endpoints
@app.get("/api/assets")
async def get_assets(
    type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get all assets with optional filtering"""
    try:
        assets = list(assets_db.values())
        
        # Apply filters
        if type:
            assets = [asset for asset in assets if type.lower() in asset["type"].lower()]
        if location:
            assets = [asset for asset in assets if location.lower() in asset["location"].lower()]
        if status:
            assets = [asset for asset in assets if asset["status"] == status]
        
        return {"assets": assets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching assets: {str(e)}")

@app.post("/api/assets")
async def create_asset(asset: AssetCreate):
    """Add new asset with QR code generation"""
    try:
        asset_id = generate_asset_id()
        
        # Create new asset
        new_asset = {
            "assetId": asset_id,
            "type": asset.type,
            "vendor": asset.vendor,
            "installDate": asset.installDate,
            "location": asset.location,
            "warrantyPeriod": asset.warrantyPeriod,
            "healthScore": 100,  # Default for new assets
            "predictedRUL": asset.warrantyPeriod,  # Default to warranty period
            "status": "active",
            "lastInspection": None
        }
        
        # Store in database
        assets_db[asset_id] = new_asset
        
        # Generate QR code
        qr_code = generate_qr_code(asset_id)
        
        return {
            "assetId": asset_id,
            "qrCode": qr_code,
            "asset": new_asset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating asset: {str(e)}")

@app.get("/api/assets/{asset_id}")
async def get_asset(asset_id: str):
    """Get detailed asset information"""
    try:
        if asset_id not in assets_db:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        asset = assets_db[asset_id]
        
        # Add inspection history (mock data for now)
        asset_with_history = asset.copy()
        asset_with_history["inspectionHistory"] = [
            {"date": "2024-08-10", "result": "Pass", "score": 85},
            {"date": "2024-06-15", "result": "Pass", "score": 88},
            {"date": "2024-04-20", "result": "Pass", "score": 90}
        ]
        
        return asset_with_history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching asset: {str(e)}")

@app.put("/api/assets/{asset_id}")
async def update_asset(asset_id: str, update_data: AssetUpdate):
    """Update asset health score and status"""
    try:
        if asset_id not in assets_db:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        asset = assets_db[asset_id]
        
        # Update fields
        if update_data.healthScore is not None:
            asset["healthScore"] = update_data.healthScore
            asset["lastInspection"] = datetime.now().strftime("%Y-%m-%d")
        
        if update_data.status is not None:
            asset["status"] = update_data.status
        
        assets_db[asset_id] = asset
        
        return {"message": "Asset updated successfully", "asset": asset}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating asset: {str(e)}")

@app.get("/api/fittings")
async def get_fittings():
    """Get all fittings data from CSV"""
    try:
        fittings_data = read_csv_file('fittings.csv')
        return fittings_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading fittings data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)