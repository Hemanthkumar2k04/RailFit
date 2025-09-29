from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from app.core.security import verify_token
import httpx
import uuid
import base64
import io
from datetime import datetime
from pydantic import BaseModel
import numpy as np
from PIL import Image

router = APIRouter(tags=["Inspections"])
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = "https://nlxrpnjccouogrfbbgmk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE"

# Load your trained model (initialize once when server starts)
# model = tf.keras.models.load_model('/path/to/your/railfit_model.h5')

# For now, we'll simulate the model prediction
def predict_defect(image_data: bytes) -> dict:
    """
    Simulate your MobileNetV2 model prediction
    Replace this with actual model inference
    """
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))
        image = image.resize((224, 224))
        
        # Convert to numpy array and normalize
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Simulate model prediction (replace with actual model.predict())
        # pred = model.predict(img_array)
        # For demo, we'll simulate random prediction
        import random
        confidence = random.uniform(0.1, 0.95)
        is_defective = confidence > 0.5
        
        return {
            "prediction": "Defective" if is_defective else "Non-Defective",
            "confidence": float(confidence),
            "defect_probability": float(confidence if is_defective else 1 - confidence)
        }
    except Exception as e:
        return {
            "prediction": "Error",
            "confidence": 0.0,
            "error": str(e)
        }

# Pydantic models
class InspectionCreate(BaseModel):
    asset_id: str
    location: str
    inspection_type: str = "visual"
    notes: Optional[str] = None

class Inspection(BaseModel):
    inspection_id: str
    asset_id: str
    inspector_id: str
    inspector_name: str
    location: str
    inspection_date: str
    inspection_type: str
    result: str
    confidence_score: Optional[float]
    notes: Optional[str]
    image_data: Optional[str]
    ai_prediction: Optional[dict]
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

@router.post("", response_model=Inspection)
async def create_inspection(
    asset_id: str = Form(...),
    location: str = Form(...),
    inspection_type: str = Form("visual"),
    notes: str = Form(""),
    image: UploadFile = File(None),
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)  # Add this back
):
    """Create a new inspection with AI-powered defect detection"""
    try:
        # Generate inspection data
        inspection_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat() + "Z"
        
        # Handle missing name field safely
        inspector_name = current_user.get("name") or current_user.get("email") or "Unknown Inspector"
        
        ai_prediction = None
        confidence_score = None
        image_data_base64 = None
        
        # Process uploaded image if provided
        if image:
            # Validate file type
            if not image.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only image files are allowed"
                )
            
            # Read image data
            image_bytes = await image.read()
            
            # Convert to base64 for storage
            image_data_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Run AI prediction
            ai_prediction = predict_defect(image_bytes)
            confidence_score = ai_prediction.get('confidence')
        
        # Determine inspection result
        if ai_prediction:
            result = ai_prediction['prediction']
        else:
            result = "Manual Inspection Required"
        
        inspection_data = {
            "inspection_id": inspection_id,
            "asset_id": asset_id,
            "inspector_id": current_user["user_id"],
            "inspector_name": inspector_name,
            "location": location,
            "inspection_date": current_time,
            "inspection_type": inspection_type,
            "result": result,
            "confidence_score": confidence_score,
            "notes": notes,
            "image_data": image_data_base64,
            "ai_prediction": ai_prediction,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Store in Supabase
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                json=inspection_data
            )
            
            if response.status_code != 201:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create inspection: {response.text}"
                )
            
            return inspection_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create inspection: {str(e)}"
        )
    
@router.get("", response_model=List[Inspection])
async def get_inspections(
    asset_id: Optional[str] = None,
    inspector_id: Optional[str] = None,
    result: Optional[str] = None,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get inspections with optional filtering"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Build query parameters
            params = {
                "limit": str(limit),
                "order": "created_at.desc"
            }
            
            if asset_id:
                params["asset_id"] = f"eq.{asset_id}"
            if inspector_id:
                params["inspector_id"] = f"eq.{inspector_id}"
            if result:
                params["result"] = f"eq.{result}"
            
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve inspections"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve inspections: {str(e)}"
        )

@router.get("/{inspection_id}", response_model=Inspection)
async def get_inspection(
    inspection_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get inspection by ID"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                params={"inspection_id": f"eq.{inspection_id}"}
            )
            
            if response.status_code == 200:
                inspections = response.json()
                if inspections:
                    return inspections[0]
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Inspection not found"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve inspection"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve inspection: {str(e)}"
        )

@router.get("/analytics/summary")
async def get_inspection_analytics(
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Get inspection analytics and summary"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Get all inspections
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                params={"select": "result,confidence_score,inspection_date,inspector_name"}
            )
            
            if response.status_code == 200:
                inspections = response.json()
                
                total_inspections = len(inspections)
                defective_count = len([i for i in inspections if i.get('result') == 'Defective'])
                non_defective_count = len([i for i in inspections if i.get('result') == 'Non-Defective'])
                
                # Calculate average confidence
                confidence_scores = [i.get('confidence_score') for i in inspections if i.get('confidence_score')]
                avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
                
                # Get recent inspections (last 7 days)
                from datetime import datetime, timedelta
                week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
                recent_inspections = [i for i in inspections if i.get('inspection_date', '') > week_ago]
                
                return {
                    "total_inspections": total_inspections,
                    "defective_count": defective_count,
                    "non_defective_count": non_defective_count,
                    "defect_rate": (defective_count / total_inspections * 100) if total_inspections > 0 else 0,
                    "average_confidence": round(avg_confidence, 2),
                    "recent_inspections_count": len(recent_inspections),
                    "top_inspectors": [
                        {"name": "John Smith", "count": 45},
                        {"name": "Sarah Johnson", "count": 38},
                        {"name": "Mike Wilson", "count": 31}
                    ]
                }
            else:
                # Return default values if no data
                return {
                    "total_inspections": 0,
                    "defective_count": 0,
                    "non_defective_count": 0,
                    "defect_rate": 0,
                    "average_confidence": 0,
                    "recent_inspections_count": 0,
                    "top_inspectors": []
                }
                
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get inspection analytics: {str(e)}"
        )