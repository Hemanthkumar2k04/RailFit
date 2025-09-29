from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
from app.core.security import verify_password, create_access_token, verify_token
from app.core.config import settings
import httpx
from typing import Optional, Dict, Any
from pydantic import BaseModel

router = APIRouter(tags=["Authentication"])
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = "https://nlxrpnjccouogrfbbgmk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE"

# Pydantic models
class User(BaseModel):
    user_id: str
    name: str
    email: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "field_inspector"
    department: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: User

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/users",
            headers=headers,
            params={"email": f"eq.{email}"}
        )
        
        if response.status_code == 200:
            users = response.json()
            return users[0] if users else None
        return None

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/users",
            headers=headers,
            params={"user_id": f"eq.{user_id}"}
        )
        
        if response.status_code == 200:
            users = response.json()
            return users[0] if users else None
        return None

async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with email and password"""
    user = await get_user_by_email(email)
    if not user:
        return None
    
    # For demo purposes, accept some simple passwords
    # In production, you'd verify against the actual password_hash
    demo_passwords = {
        "admin@railfit.com": "admin123",
        "manager@railfit.com": "manager123", 
        "inspector@railfit.com": "inspector123"
    }
    
    if email in demo_passwords and password == demo_passwords[email]:
        return user
    
    # Also check against the actual hash if available
    if user.get("password_hash") and verify_password(password, user["password_hash"]):
        return user
    
    return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    
    user = await get_user_by_id(user_id=user_id)
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/login", response_model=Token)
async def login_user(login_data: LoginRequest):
    """Login user and return JWT token"""
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"user_id": user["user_id"], "email": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer", 
        "expires_in": settings.jwt_access_token_expire_minutes * 60,
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.post("/register", response_model=Token)
async def register_user(user_data: RegisterRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        from app.core.security import get_password_hash
        hashed_password = get_password_hash(user_data.password)
        
        # Generate user ID
        import uuid
        from datetime import datetime
        user_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat() + "Z"
        
        # Create user in Supabase
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            user_payload = {
                "user_id": user_id,
                "name": user_data.name,
                "email": user_data.email,
                "password_hash": hashed_password,
                "role": user_data.role,
                "created_at": current_time,
                "updated_at": current_time,
                "last_active": current_time
            }
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=headers,
                json=user_payload
            )
            
            if response.status_code != 201:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )
            
            # Create access token
            access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
            access_token = create_access_token(
                data={"user_id": user_id, "email": user_data.email, "role": user_data.role},
                expires_delta=access_token_expires
            )
            
            # Return token and user info
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.jwt_access_token_expire_minutes * 60,
                "user": {
                    "user_id": user_id,
                    "name": user_data.name,
                    "email": user_data.email,
                    "role": user_data.role
                }
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.get("/me", response_model=User)
async def read_users_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user info"""
    return {
        "user_id": current_user["user_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"]
    }