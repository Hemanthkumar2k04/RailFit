from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from typing import List, Dict, Any
import os

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