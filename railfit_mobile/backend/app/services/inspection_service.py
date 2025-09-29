from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.asset import Asset as AssetModel
from app.schemas.asset import AssetCreate, AssetUpdate
from typing import List, Optional
import uuid
from datetime import datetime
import qrcode
import io
import base64

class AssetService:
    
    @staticmethod
    def generate_asset_id() -> str:
        """Generate unique asset ID"""
        return f"RF-{datetime.now().year}-{str(uuid.uuid4())[:6].upper()}"
    
    @staticmethod
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
    
    @staticmethod
    async def create_asset(db: AsyncSession, asset: AssetCreate) -> AssetModel:
        """Create a new asset"""
        asset_id = AssetService.generate_asset_id()
        qr_code = AssetService.generate_qr_code(asset_id)
        
        # Calculate initial predicted RUL based on warranty period
        predicted_rul = asset.warranty_period
        
        db_asset = AssetModel(
            asset_id=asset_id,
            type=asset.type,
            vendor=asset.vendor,
            location=asset.location,
            install_date=asset.install_date,
            warranty_period=asset.warranty_period,
            predicted_rul=predicted_rul,
            qr_code=qr_code
        )
        
        db.add(db_asset)
        await db.commit()
        await db.refresh(db_asset)
        
        return db_asset
    
    @staticmethod
    async def get_assets(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        asset_type: Optional[str] = None,
        location: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[AssetModel]:
        """Get assets with optional filtering"""
        query = select(AssetModel)
        
        # Apply filters
        conditions = []
        if asset_type:
            conditions.append(AssetModel.type.ilike(f"%{asset_type}%"))
        if location:
            conditions.append(AssetModel.location.ilike(f"%{location}%"))
        if status:
            conditions.append(AssetModel.status == status)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_asset_by_id(db: AsyncSession, asset_id: str) -> Optional[AssetModel]:
        """Get asset by asset_id"""
        result = await db.execute(select(AssetModel).where(AssetModel.asset_id == asset_id))
        return result.scalars().first()
    
    @staticmethod
    async def update_asset(
        db: AsyncSession, 
        asset_id: str, 
        asset_update: AssetUpdate
    ) -> Optional[AssetModel]:
        """Update asset"""
        db_asset = await AssetService.get_asset_by_id(db, asset_id)
        if not db_asset:
            return None
        
        # Update fields
        update_data = asset_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_asset, field, value)
        
        await db.commit()
        await db.refresh(db_asset)
        
        return db_asset
    
    @staticmethod
    async def delete_asset(db: AsyncSession, asset_id: str) -> bool:
        """Delete asset"""
        db_asset = await AssetService.get_asset_by_id(db, asset_id)
        if not db_asset:
            return False
        
        await db.delete(db_asset)
        await db.commit()
        return True