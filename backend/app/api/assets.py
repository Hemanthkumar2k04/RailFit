from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.core.permissions import require_any_authenticated, require_manager_or_higher
from app.schemas.asset import Asset, AssetCreate, AssetUpdate, AssetWithQR
from app.services.asset_service import AssetService
from app.models.user import User as UserModel

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/", response_model=AssetWithQR)
async def create_asset(
    asset: AssetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_manager_or_higher)
):
    """Create a new asset (Manager or Admin only)"""
    try:
        db_asset = await AssetService.create_asset(db, asset)
        
        # Return asset with QR code image
        result = AssetWithQR.from_orm(db_asset)
        result.qr_code_image = db_asset.qr_code
        
        return result
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
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_any_authenticated)
):
    """Get all assets with optional filtering"""
    try:
        assets = await AssetService.get_assets(
            db=db,
            skip=skip,
            limit=limit,
            asset_type=asset_type,
            location=location,
            status=status
        )
        return assets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assets: {str(e)}"
        )

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_any_authenticated)
):
    """Get asset by ID"""
    asset = await AssetService.get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return asset

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(
    asset_id: str,
    asset_update: AssetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_manager_or_higher)
):
    """Update asset (Manager or Admin only)"""
    asset = await AssetService.update_asset(db, asset_id, asset_update)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_manager_or_higher)
):
    """Delete asset (Manager or Admin only)"""
    success = await AssetService.delete_asset(db, asset_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return {"message": "Asset deleted successfully"}

@router.get("/{asset_id}/qr", response_model=dict)
async def get_asset_qr_code(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_any_authenticated)
):
    """Get QR code for asset"""
    asset = await AssetService.get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    return {
        "asset_id": asset_id,
        "qr_code": asset.qr_code
    }