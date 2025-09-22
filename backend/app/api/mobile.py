from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.security import verify_token
import httpx
import json

router = APIRouter(tags=["Mobile"])
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = "https://nlxrpnjccouogrfbbgmk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE"

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
    install_date: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    vendor_info: Optional[Dict[str, Any]] = None

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
    
    The QR code data can be:
    1. Just an asset_id (UUID string)
    2. JSON string with asset information including asset_id
    """
    try:
        # Parse QR data - it could be JSON or just an asset ID
        asset_id = None
        
        try:
            # Try to parse as JSON first
            qr_json = json.loads(scan_request.qr_data)
            asset_id = qr_json.get('id') or qr_json.get('asset_id')
        except json.JSONDecodeError:
            # If not JSON, treat as plain asset ID
            asset_id = scan_request.qr_data.strip()
        
        if not asset_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid QR code: No asset ID found"
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
            
            # Format response
            return AssetResponse(
                asset_id=asset.get("asset_id"),
                type=asset.get("type"),
                location=asset.get("location"),
                status=asset.get("status"),
                condition=asset.get("condition"),
                health_score=asset.get("health_score"),
                install_date=asset.get("install_date"),
                metadata=asset.get("metadata"),
                vendor_info=vendor_info
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
            
            # Format response
            return AssetResponse(
                asset_id=asset.get("asset_id"),
                type=asset.get("type"),
                location=asset.get("location"),
                status=asset.get("status"),
                condition=asset.get("condition"),
                health_score=asset.get("health_score"),
                install_date=asset.get("install_date"),
                metadata=asset.get("metadata"),
                vendor_info=vendor_info
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