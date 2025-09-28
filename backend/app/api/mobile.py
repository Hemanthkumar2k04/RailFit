from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.security import verify_token
import httpx
import json

router = APIRouter(tags=["Mobile"])
security = HTTPBearer()

# Get Supabase configuration from settings
from app.core.config import settings
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_anon_key

# Request/Response models
class QRScanRequest(BaseModel):
    qr_data: str
    scan_location: Optional[str] = None
    scan_timestamp: Optional[str] = None
    device_id: Optional[str] = None

class AssetResponse(BaseModel):
    asset_id: str
    type: str
    location: str
    status: str
    condition: str
    health_score: Optional[int] = None
    predicted_rul_days: Optional[int] = None
    install_date: Optional[str] = None
    last_inspection: Optional[str] = None
    next_maintenance: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    vendor_info: Optional[Dict[str, Any]] = None
    qr_version: Optional[str] = None

async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    token = credentials.credentials
    try:
        payload = verify_token(token)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/scan", response_model=AssetResponse)
async def process_qr_scan(
    scan_request: QRScanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """
    Process QR code scan from mobile app and return asset information
    
    Expected QR code JSON structure:
    {
        "asset_id": "d23e0996-33e1-443e-8943-6a4a924f177a",
        "type": "Rail Pad",
        "location": "Visitor Center XX-34", 
        "status": "active",
        "health_score": 95,
        "predicted_rul_days": 120,
        "last_inspection": "2024-08-15",
        "next_maintenance": "2024-11-15",
        "qr_version": "1.0"
    }
    """
    try:
        # Parse QR data - expecting JSON format
        try:
            qr_json = json.loads(scan_request.qr_data)
            asset_id = qr_json.get('asset_id')
            qr_version = qr_json.get('qr_version', 'unknown')
            
            # Validate QR structure
            if not asset_id:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid QR code: Missing asset_id field"
                )
                
            # Log QR version for analytics
            print(f"Processing QR scan - Version: {qr_version}, Asset: {asset_id}")
            
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid QR code: Expected JSON format"
            )

        # Fetch asset from database
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Get asset information
            asset_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=headers,
                params={"asset_id": f"eq.{asset_id}"}
            )
            
            if asset_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {asset_response.status_code}"
                )
            
            assets = asset_response.json()
            
            if not assets:
                raise HTTPException(
                    status_code=404,
                    detail="Asset not found"
                )
            
            asset = assets[0]
            
            # Get vendor information if vendor_id exists
            vendor_info = None
            if asset.get("vendor_id"):
                vendor_response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/vendors",
                    headers=headers,
                    params={"vendor_id": f"eq.{asset['vendor_id']}"}
                )
                
                if vendor_response.status_code == 200:
                    vendors = vendor_response.json()
                    if vendors:
                        vendor = vendors[0]
                        contact_info = vendor.get("contact_info", {})
                        vendor_info = {
                            "id": vendor.get("vendor_id"),
                            "name": vendor.get("name"),
                            "contact_email": contact_info.get("email"),
                            "contact_phone": contact_info.get("phone"),
                            "address": contact_info.get("address"),
                            "warranty_terms": vendor.get("warranty_terms")
                        }
            
            # Log the scan activity (optional)
            scan_log = {
                "asset_id": asset_id,
                "user_id": current_user.get("user_id"),
                "scan_location": scan_request.scan_location,
                "scan_timestamp": scan_request.scan_timestamp,
                "device_id": scan_request.device_id,
                "created_at": "now()"
            }
            
            # Insert scan log (optional - you might want to create a scan_logs table)
            # await client.post(f"{SUPABASE_URL}/rest/v1/scan_logs", json=scan_log, headers=headers)
            
            # Extract metadata fields for QR compatibility
            metadata = asset.get("metadata", {})
            
            # Format response
            return AssetResponse(
                asset_id=asset.get("asset_id"),
                type=asset.get("type"),
                location=asset.get("location"),
                status=asset.get("status"),
                condition=asset.get("condition"),
                health_score=asset.get("health_score"),
                predicted_rul_days=asset.get("predicted_rul_days"),
                install_date=asset.get("install_date"),
                last_inspection=metadata.get("last_inspection"),
                next_maintenance=metadata.get("next_maintenance"),
                metadata=metadata,
                vendor_info=vendor_info,
                qr_version=qr_version
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process QR scan: {str(e)}"
        )

@router.get("/asset/{asset_id}", response_model=AssetResponse)
async def get_asset_by_id(
    asset_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """
    Get asset information by asset ID for mobile app
    This is a simplified version of the scan endpoint for direct asset lookup
    """
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Get asset information
            asset_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=headers,
                params={"asset_id": f"eq.{asset_id}"}
            )
            
            if asset_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {asset_response.status_code}"
                )
            
            assets = asset_response.json()
            
            if not assets:
                raise HTTPException(
                    status_code=404,
                    detail="Asset not found"
                )
            
            asset = assets[0]
            
            # Get vendor information if vendor_id exists
            vendor_info = None
            if asset.get("vendor_id"):
                vendor_response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/vendors",
                    headers=headers,
                    params={"vendor_id": f"eq.{asset['vendor_id']}"}
                )
                
                if vendor_response.status_code == 200:
                    vendors = vendor_response.json()
                    if vendors:
                        vendor = vendors[0]
                        contact_info = vendor.get("contact_info", {})
                        vendor_info = {
                            "id": vendor.get("vendor_id"),
                            "name": vendor.get("name"),
                            "contact_email": contact_info.get("email"),
                            "contact_phone": contact_info.get("phone"),
                            "address": contact_info.get("address"),
                            "warranty_terms": vendor.get("warranty_terms")
                        }
            
            # Extract metadata fields for QR compatibility
            metadata = asset.get("metadata", {})
            
            # Format response
            return AssetResponse(
                asset_id=asset.get("asset_id"),
                type=asset.get("type"),
                location=asset.get("location"),
                status=asset.get("status"),
                condition=asset.get("condition"),
                health_score=asset.get("health_score"),
                predicted_rul_days=asset.get("predicted_rul_days"),
                install_date=asset.get("install_date"),
                last_inspection=metadata.get("last_inspection"),
                next_maintenance=metadata.get("next_maintenance"),
                metadata=metadata,
                vendor_info=vendor_info,
                qr_version="1.0"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch asset: {str(e)}"
        )

@router.post("/scan/batch")
async def process_batch_scan(
    scan_requests: List[QRScanRequest],
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """
    Process multiple QR code scans in batch for mobile app
    Useful for offline scanning scenarios where multiple codes are scanned and synced later
    """
    results = []
    errors = []
    
    for i, scan_request in enumerate(scan_requests):
        try:
            # Reuse the single scan logic
            result = await process_qr_scan(scan_request, current_user)
            results.append({
                "index": i,
                "success": True,
                "data": result
            })
        except Exception as e:
            errors.append({
                "index": i,
                "success": False,
                "error": str(e),
                "qr_data": scan_request.qr_data
            })
    
    return {
        "total_scanned": len(scan_requests),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }

@router.get("/health")
async def mobile_health_check():
    """
    Health check endpoint for mobile app
    No authentication required
    """
    return {
        "status": "healthy",
        "service": "RailFIT Mobile API",
        "version": "1.0.0",
        "endpoints": [
            "/api/mobile/scan - Process QR code scan",
            "/api/mobile/asset/{asset_id} - Get asset by ID",
            "/api/mobile/scan/batch - Process batch scans",
            "/api/mobile/health - Health check"
        ]
    }