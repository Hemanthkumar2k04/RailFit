"""
Dashboard API endpoints for RailFIT
"""
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard")
async def get_dashboard() -> Dict[str, Any]:
    """
    Get dashboard data including asset statistics and system metrics
    """
    # Mock data for now - replace with actual database queries later
    return {
        "totalAssets": 1247,
        "operationalAssets": 1165,
        "maintenanceQueue": 23,
        "criticalAlerts": 4,
        "assetDistribution": {
            "excellent": 450,
            "good": 715,
            "fair": 78,
            "critical": 4
        },
        "systemUptime": 99.8,
        "avgResponseTime": 245,
        "zones": [
            {"name": "Zone A", "status": "operational"},
            {"name": "Zone B", "status": "maintenance"},
            {"name": "Zone C", "status": "operational"},
            {"name": "Zone D", "status": "operational"}
        ]
    }

@router.get("/fittings")
async def get_fittings():
    """Get list of rail fittings for inspection tracking"""
    # Mock data for now - replace with actual database queries later
    return [
        {
            "Fitting_ID": "FIT-001",
            "QR_Code": "QR123456789",
            "Fitting_Type": "Rail Bolt",
            "Vendor_Name": "SteelWorks Ltd",
            "Vendor_Lot": "LOT-2024-001",
            "Manufacture_Date": "2024-01-15",
            "Supply_Date": "2024-02-01",
            "Location": "Track Section A",
            "Warranty_Period": "5 years",
            "Inspection_Date": "2024-09-15",
            "Inspection_Result": "Pass",
            "Performance_Status": "Good"
        },
        {
            "Fitting_ID": "FIT-002",
            "QR_Code": "QR987654321",
            "Fitting_Type": "Rail Clamp",
            "Vendor_Name": "FastRail Inc",
            "Vendor_Lot": "LOT-2024-002",
            "Manufacture_Date": "2024-02-20",
            "Supply_Date": "2024-03-01",
            "Location": "Track Section B",
            "Warranty_Period": "3 years", 
            "Inspection_Date": "2024-09-10",
            "Inspection_Result": "Pass",
            "Performance_Status": "Excellent"
        },
        {
            "Fitting_ID": "FIT-003",
            "QR_Code": "QR555777999",
            "Fitting_Type": "Junction Connector",
            "Vendor_Name": "RailTech Solutions",
            "Vendor_Lot": "LOT-2024-003",
            "Manufacture_Date": "2024-03-10",
            "Supply_Date": "2024-03-25",
            "Location": "Junction Point C",
            "Warranty_Period": "7 years",
            "Inspection_Date": "2024-09-05",
            "Inspection_Result": "Fail",
            "Performance_Status": "Critical"
        }
    ]