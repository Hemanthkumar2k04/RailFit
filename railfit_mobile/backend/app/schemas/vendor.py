from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class VendorBase(BaseModel):
    name: str
    contact_email: EmailStr
    contact_phone: str
    address: Optional[str] = None
    warranty_terms: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    warranty_terms: Optional[str] = None
    is_active: Optional[bool] = None

class Vendor(VendorBase):
    id: int
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True