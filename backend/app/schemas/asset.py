from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class AssetStatus(str, Enum):
    ACTIVE = "active"
    NEEDS_MAINTENANCE = "needs_maintenance"
    CRITICAL = "critical"
    RETIRED = "retired"

class AssetType(str, Enum):
    ELASTIC_RAIL_CLIP = "Elastic Rail Clip"
    RAIL_PAD = "Rail Pad"
    FISHPLATE = "Fishplate"
    RAIL_BOLT = "Rail Bolt"
    ANCHOR = "Anchor"
    SWITCH_COMPONENT = "Switch Component"
    SIGNAL_EQUIPMENT = "Signal Equipment"
    TRACK_CIRCUIT = "Track Circuit"

class AssetBase(BaseModel):
    type: AssetType
    vendor: str
    location: str
    install_date: datetime
    warranty_period: int  # months

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    type: Optional[AssetType] = None
    vendor: Optional[str] = None
    location: Optional[str] = None
    health_score: Optional[int] = None
    predicted_rul: Optional[int] = None
    status: Optional[AssetStatus] = None

class Asset(AssetBase):
    id: int
    asset_id: str  # Generated unique identifier like RF-2024-001234
    health_score: Optional[int] = 100
    predicted_rul: Optional[int] = None  # Remaining Useful Life in months
    status: AssetStatus = AssetStatus.ACTIVE
    qr_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssetWithQR(Asset):
    qr_code_image: Optional[str] = None  # Base64 encoded QR code image