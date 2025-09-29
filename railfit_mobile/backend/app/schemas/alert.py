from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class AlertType(str, Enum):
    MAINTENANCE = "maintenance"
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class AlertPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertBase(BaseModel):
    asset_id: int
    type: AlertType
    message: str
    priority: AlertPriority
    description: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    acknowledged: Optional[bool] = None
    acknowledged_by: Optional[int] = None
    resolution_notes: Optional[str] = None

class Alert(AlertBase):
    id: int
    acknowledged: bool = False
    acknowledged_by: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True