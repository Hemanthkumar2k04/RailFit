from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager" 
    FIELD_INSPECTOR = "field_inspector"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.FIELD_INSPECTOR

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    hashed_password: str
    is_active: bool = True
    last_active: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    is_active: bool = True
    last_active: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True