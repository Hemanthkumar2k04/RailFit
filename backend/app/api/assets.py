from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from typing import List, Optional, Dict, Any
from app.core.security import verify_token
import httpx
import uuid
import json
import qrcode
import io
import base64
import csv
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(tags=["Assets"])
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

@router.post("", response_model=Asset)
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
        
        # Prepare metadata with default inspection and maintenance dates
        metadata = asset.metadata or {}
        if "last_inspection" not in metadata:
            metadata["last_inspection"] = "2024-08-15"
        if "next_maintenance" not in metadata:
            metadata["next_maintenance"] = "2024-11-15"
            
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
            "metadata": metadata,
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

class AssetListResponse(BaseModel):
    assets: List[Asset]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

@router.get("", response_model=AssetListResponse)
async def get_assets(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get all assets with pagination and optional filtering"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Calculate offset from page number
            skip = (page - 1) * limit
            
            # Build query parameters for data fetch
            params = {}
            if asset_type:
                params["type"] = f"eq.{asset_type}"
            if location:
                params["location"] = f"ilike.%{location}%"
            if status:
                params["status"] = f"eq.{status}"
            
            params["limit"] = str(limit)
            params["offset"] = str(skip)
            params["order"] = "created_at.desc"  # Order by most recent first
            
            # Get total count for pagination
            count_params = {}
            if asset_type:
                count_params["type"] = f"eq.{asset_type}"
            if location:
                count_params["location"] = f"ilike.%{location}%"
            if status:
                count_params["status"] = f"eq.{status}"
            
            # Fetch total count
            count_headers = headers.copy()
            count_headers["Prefer"] = "count=exact"
            
            count_response = await client.head(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=count_headers,
                params=count_params
            )
            
            total = 0
            if "content-range" in count_response.headers:
                content_range = count_response.headers["content-range"]
                if "/" in content_range:
                    total = int(content_range.split("/")[1])
            
            # Fetch paginated data
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/assets",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                assets = response.json()
                
                # Calculate pagination metadata
                total_pages = (total + limit - 1) // limit  # Ceiling division
                has_next = page < total_pages
                has_prev = page > 1
                
                return AssetListResponse(
                    assets=assets,
                    total=total,
                    page=page,
                    limit=limit,
                    total_pages=total_pages,
                    has_next=has_next,
                    has_prev=has_prev
                )
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

@router.get("/{asset_id}/qr")
async def generate_asset_qr_code(
    asset_id: str,
    format: str = Query("png", description="Output format: png, svg, or json"),
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Generate QR code for an asset with full asset details"""
    try:
        # First, get the asset details
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
                    asset = assets[0]
                    
                    # Create simplified QR code data structure
                    qr_data = {
                        "asset_id": asset.get("asset_id"),
                        "type": asset.get("type"),
                        "location": asset.get("location"),
                        "status": asset.get("status"),
                        "health_score": asset.get("health_score"),
                        "predicted_rul_days": 120,  # Static value for all assets for now
                        "last_inspection": asset.get("metadata", {}).get("last_inspection", "2024-08-15") if asset.get("metadata") else "2024-08-15",
                        "next_maintenance": asset.get("metadata", {}).get("next_maintenance", "2024-11-15") if asset.get("metadata") else "2024-11-15",
                        "qr_version": "1.0"
                    }
                    
                    # Remove None values to keep QR code clean
                    qr_data = {k: v for k, v in qr_data.items() if v is not None}
                    
                    if format.lower() == "json":
                        # Return raw JSON data
                        return qr_data
                    
                    # Generate QR code
                    qr_json = json.dumps(qr_data, indent=None, separators=(',', ':'))
                    
                    # Create QR code instance
                    qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_L,
                        box_size=10,
                        border=4,
                    )
                    
                    qr.add_data(qr_json)
                    qr.make(fit=True)
                    
                    if format.lower() == "svg":
                        # Generate SVG
                        from qrcode.image.svg import SvgPathImage
                        img = qr.make_image(image_factory=SvgPathImage)
                        svg_buffer = io.BytesIO()
                        img.save(svg_buffer)
                        svg_content = svg_buffer.getvalue().decode('utf-8')
                        
                        return Response(
                            content=svg_content,
                            media_type="image/svg+xml",
                            headers={"Content-Disposition": f"inline; filename=asset_{asset_id}_qr.svg"}
                        )
                    else:
                        # Generate PNG (default)
                        img = qr.make_image(fill_color="black", back_color="white")
                        img_buffer = io.BytesIO()
                        img.save(img_buffer, format='PNG')
                        img_buffer.seek(0)
                        
                        return Response(
                            content=img_buffer.getvalue(),
                            media_type="image/png",
                            headers={"Content-Disposition": f"inline; filename=asset_{asset_id}_qr.png"}
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Asset not found"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve asset for QR generation"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate QR code: {str(e)}"
        )

@router.post("/bulk-import")
async def bulk_import_assets(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """
    Bulk import assets from CSV file
    Expected CSV columns: type,location,vendor_id,install_date,warranty_period,health_score,status,description,serial_number,model,manufacturer
    Note: `vendor_id` may be either an existing vendor UUID or a vendor name. If a name is provided,
    the import will attempt to lookup the vendor and create it if not present.
    """
    # Check if user has manager or admin role
    if current_user.get("role") not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Manager or Admin role required."
        )
    
    try:
        # Validate file type
        if not file.filename.lower().endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are supported"
            )
        
        # Read and parse CSV content
        content = await file.read()
        csv_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        # Process each row
        successful_imports = []
        failed_imports = []
        row_number = 1  # Start from 1 (header is row 0)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            for row in csv_reader:
                row_number += 1
                try:
                    # Validate required fields
                    if not row.get('type') or not row.get('location'):
                        failed_imports.append({
                            'row': row_number,
                            'error': 'Missing required fields: type and location are mandatory',
                            'data': row
                        })
                        continue
                    
                    # Generate asset data
                    asset_id = str(uuid.uuid4())
                    qr_code = f"QR-{asset_id[:8]}"
                    current_time = datetime.utcnow().isoformat() + "Z"
                    
                    # Prepare metadata from additional fields
                    metadata = {}
                    if row.get('serial_number'):
                        metadata['serial_number'] = row['serial_number']
                    if row.get('model'):
                        metadata['model'] = row['model']
                    if row.get('manufacturer'):
                        metadata['manufacturer'] = row['manufacturer']
                    if row.get('description'):
                        metadata['description'] = row['description']

                    # Default values for inspection and maintenance
                    metadata['last_inspection'] = "2024-08-15"
                    metadata['next_maintenance'] = "2024-11-15"

                    # Resolve vendor_id: accept UUIDs (verify existence) or vendor names (lookup/create)
                    vendor_input = (row.get('vendor_id') or '').strip()
                    resolved_vendor_id: Optional[str] = None
                    if vendor_input:
                        # Try UUID format first
                        try:
                            uuid_obj = uuid.UUID(vendor_input)
                            # Verify vendor exists
                            vendor_resp = await client.get(
                                f"{SUPABASE_URL}/rest/v1/vendors",
                                headers=headers,
                                params={"vendor_id": f"eq.{vendor_input}"}
                            )
                            if vendor_resp.status_code == 200 and vendor_resp.json():
                                resolved_vendor_id = vendor_input
                        except ValueError:
                            # Treat as vendor name: lookup by name
                            name = vendor_input
                            vendor_resp = await client.get(
                                f"{SUPABASE_URL}/rest/v1/vendors",
                                headers=headers,
                                params={"name": f"eq.{name}"}
                            )
                            if vendor_resp.status_code == 200 and vendor_resp.json():
                                resolved_vendor_id = vendor_resp.json()[0].get('vendor_id')
                            else:
                                # Create vendor and return its id
                                create_resp = await client.post(
                                    f"{SUPABASE_URL}/rest/v1/vendors",
                                    headers={**headers, "Prefer": "return=representation"},
                                    json={"name": name}
                                )
                                if create_resp.status_code in (200, 201):
                                    created = create_resp.json()
                                    # Supabase returns an array when return=representation
                                    if isinstance(created, list) and len(created) > 0:
                                        resolved_vendor_id = created[0].get('vendor_id')
                                    elif isinstance(created, dict):
                                        resolved_vendor_id = created.get('vendor_id')

                    # Normalize status values (map common variants)
                    raw_status = (row.get('status') or 'active').strip()
                    status_map = {
                        'maintenance': 'needs_maintenance',
                        'needs_maintenance': 'needs_maintenance',
                        'active': 'active',
                        'critical': 'critical',
                        'retired': 'retired'
                    }
                    normalized_status = status_map.get(raw_status.lower(), 'active')

                    asset_data = {
                        "asset_id": asset_id,
                        "type": row['type'].strip(),
                        "vendor_id": resolved_vendor_id,
                        "install_date": row.get('install_date', '').strip() or None,
                        "location": row['location'].strip(),
                        "gps_lat": None,
                        "gps_lng": None,
                        "warranty_period": int(row['warranty_period']) if row.get('warranty_period', '').strip() else None,
                        "health_score": int(row.get('health_score', 85)),
                        "predicted_rul": None,
                        "status": normalized_status,
                        "qr_code": qr_code,
                        "metadata": metadata,
                        "created_at": current_time,
                        "updated_at": current_time
                    }
                    
                    # Insert into Supabase
                    response = await client.post(
                        f"{SUPABASE_URL}/rest/v1/assets",
                        headers=headers,
                        json=asset_data
                    )
                    
                    if response.status_code == 201:
                        successful_imports.append({
                            'asset_id': asset_id,
                            'type': asset_data['type'],
                            'location': asset_data['location'],
                            'row': row_number
                        })
                    else:
                        failed_imports.append({
                            'row': row_number,
                            'error': f'Database error: {response.text}',
                            'data': row
                        })
                        
                except ValueError as ve:
                    failed_imports.append({
                        'row': row_number,
                        'error': f'Invalid data format: {str(ve)}',
                        'data': row
                    })
                except Exception as e:
                    failed_imports.append({
                        'row': row_number,
                        'error': f'Processing error: {str(e)}',
                        'data': row
                    })
        
        return {
            'total_processed': row_number - 1,  # Subtract 1 for header row
            'successful_imports': len(successful_imports),
            'failed_imports': len(failed_imports),
            'successful_assets': successful_imports,
            'errors': failed_imports
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk import failed: {str(e)}"
        )