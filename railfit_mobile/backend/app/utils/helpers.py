from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class InspectionResult(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"

class InspectionBase(BaseModel):
    asset_id: int
    condition_rating: InspectionResult
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None

class InspectionCreate(InspectionBase):
    pass

class InspectionUpdate(BaseModel):
    condition_rating: Optional[InspectionResult] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None

class Inspection(InspectionBase):
    id: int
    inspector_id: int
    inspection_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True