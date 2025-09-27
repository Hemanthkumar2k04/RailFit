from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any
from app.core.security import verify_token
import httpx

router = APIRouter(prefix="/vendors", tags=["Vendors"])
security = HTTPBearer()

# Get Supabase configuration from settings
from app.core.config import settings
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_anon_key

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

@router.get("/{vendor_id}")
async def get_vendor_by_id(
    vendor_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get vendor details by vendor ID"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch vendor from Supabase
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/vendors",
                headers=headers,
                params={"vendor_id": f"eq.{vendor_id}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {response.status_code}"
                )
            
            vendors = response.json()
            
            if not vendors:
                raise HTTPException(
                    status_code=404,
                    detail="Vendor not found"
                )
            
            vendor = vendors[0]
            
            # Format response
            contact_info = vendor.get("contact_info", {})
            return {
                "id": vendor.get("vendor_id"),
                "name": vendor.get("name"),
                "contact_email": contact_info.get("email"),
                "contact_phone": contact_info.get("phone"),
                "address": contact_info.get("address"),
                "warranty_terms": vendor.get("warranty_terms"),
                "certifications": vendor.get("certifications"),
                "is_active": True,  # Default to active since not in schema
                "created_at": vendor.get("created_at"),
                "updated_at": vendor.get("updated_at")
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch vendor: {str(e)}"
        )

@router.get("")
async def get_all_vendors(
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get all vendors"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch vendors from Supabase
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/vendors",
                headers=headers,
                params={"order": "name.asc"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {response.status_code}"
                )
            
            vendors = response.json()
            
            # Format response
            formatted_vendors = []
            for vendor in vendors:
                contact_info = vendor.get("contact_info", {})
                formatted_vendors.append({
                    "id": vendor.get("vendor_id"),
                    "name": vendor.get("name"),
                    "contact_email": contact_info.get("email"),
                    "contact_phone": contact_info.get("phone"),
                    "address": contact_info.get("address"),
                    "warranty_terms": vendor.get("warranty_terms"),
                    "certifications": vendor.get("certifications"),
                    "is_active": True,  # Default to active since not in schema
                    "created_at": vendor.get("created_at"),
                    "updated_at": vendor.get("updated_at")
                })
            
            return {
                "vendors": formatted_vendors,
                "total": len(formatted_vendors)
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch vendors: {str(e)}"
        )