from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from app.core.security import verify_token
import httpx
import uuid
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/assets", tags=["Assets"])
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = "https://nlxrpnjccouogrfbbgmk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE"

# Pydantic models
class AssetCreate(BaseModel):
    type: str
    vendor_id: Optional[str] = None
    install_date: Optional[str] = None
    location: str
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    warranty_period: Optional[int] = None
    health_score: Optional[int] = 85
    predicted_rul: Optional[int] = None
    status: str = "active"
    metadata: Optional[Dict[str, Any]] = None

class Asset(BaseModel):
    asset_id: str
    type: str
    vendor_id: Optional[str]
    install_date: Optional[str]
    location: str
    gps_lat: Optional[float]
    gps_lng: Optional[float]
    warranty_period: Optional[int]
    health_score: Optional[int]
    predicted_rul: Optional[int]
    status: str
    qr_code: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: str
    updated_at: str

async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    return payload

@router.post("/", response_model=Asset)
async def create_asset(
    asset: AssetCreate,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Create a new asset (Manager or Admin only)"""
    # Check if user has manager or admin role
    if current_user.get("role") not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Manager or Admin role required."
        )
    
    try:
        # Generate asset data
        asset_id = str(uuid.uuid4())
        qr_code = f"QR-{asset_id[:8]}"
        current_time = datetime.utcnow().isoformat() + "Z"
        
        asset_data = {
            "asset_id": asset_id,
            "type": asset.type,
            "vendor_id": asset.vendor_id,
            "install_date": asset.install_date,
            "location": asset.location,
            "gps_lat": asset.gps_lat,
            "gps_lng": asset.gps_lng,
            "warranty_period": asset.warranty_period,
            "health_score": asset.health_score or 85,
            "predicted_rul": asset.predicted_rul,
            "status": asset.status,
            "qr_code": qr_code,
            "metadata": asset.metadata or {},
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Create asset in Supabase
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=headers,
                json=asset_data
            )
            
            if response.status_code != 201:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create asset: {response.text}"
                )
            
            return asset_data
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset: {str(e)}"
        )

@router.get("/", response_model=List[Asset])
async def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get all assets with optional filtering"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Build query parameters
            params = {}
            if asset_type:
                params["type"] = f"eq.{asset_type}"
            if location:
                params["location"] = f"ilike.%{location}%"
            if status:
                params["status"] = f"eq.{status}"
            
            params["limit"] = str(limit)
            params["offset"] = str(skip)
            
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve assets"
                )
                
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve assets: {str(e)}"
        )

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(
    asset_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get asset by ID"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=headers,
                params={"asset_id": f"eq.{asset_id}"}
            )
            
            if response.status_code == 200:
                assets = response.json()
                if assets:
                    return assets[0]
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Asset not found"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve asset"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve asset: {str(e)}"
        )