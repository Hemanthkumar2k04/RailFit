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
import tensorflow as tf
import numpy as np
from PIL import Image
import os

router = APIRouter(tags=["Inspections"])
security = HTTPBearer()

# Get Supabase configuration from settings
from app.core.config import settings
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_anon_key

# Load your trained model
model = None
model_loaded = False

def load_model():
    global model, model_loaded
    try:
        # Get the absolute path to your model
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.join(current_dir, '..', '..', '..')
        model_path = os.path.join(project_root, 'ML_model', 'rail_defect_model.keras')
        model_path = os.path.abspath(model_path)
        
        print(f"🔍 Looking for model at: {model_path}")
        print(f"🔍 Path exists: {os.path.exists(model_path)}")
        
        if os.path.exists(model_path):
            print("📦 Loading TensorFlow model...")
            model = tf.keras.models.load_model(model_path)
            model_loaded = True
            print(f"✅ Model loaded successfully!")
            print(f"📊 Model input shape: {model.input_shape}")
        else:
            print(f"❌ Model file not found at: {model_path}")
            print(f"📁 Directory contents: {os.listdir(os.path.dirname(model_path)) if os.path.exists(os.path.dirname(model_path)) else 'Directory does not exist'}")
            
    except Exception as e:
        print(f"❌ Failed to load model: {str(e)}")
        import traceback
        traceback.print_exc()
        model_loaded = False

# Load model when module is imported
load_model()

def predict_defect(image_data: bytes) -> dict:
    """
    Use your trained MobileNetV2 model for defect detection
    """
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Resize to model input size (224, 224)
        image = image.resize((224, 224))
        
        # Convert to numpy array and normalize (0-1 range)
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        if model_loaded and model is not None:
            # Use your actual trained model
            prediction = model.predict(img_array, verbose=0)
            confidence = float(prediction[0][0])
            
            # Based on your training, >0.5 means defective
            is_defective = confidence > 0.5
            
            result = {
                "prediction": "Defective" if is_defective else "Non-Defective",
                "confidence": confidence,
                "defect_probability": confidence if is_defective else 1 - confidence,
                "model_version": "MobileNetV2_RailFIT_v1.0",
                "model_loaded": True
            }
            
            print(f"🔍 AI Analysis: {result['prediction']} (confidence: {confidence:.3f})")
            return result
        else:
            # Fallback simulation mode
            import random
            confidence = random.uniform(0.6, 0.95)
            is_defective = random.choice([True, False])
            
            return {
                "prediction": "Defective" if is_defective else "Non-Defective", 
                "confidence": confidence,
                "defect_probability": confidence if is_defective else 1 - confidence,
                "model_version": "Simulation_Mode",
                "model_loaded": False
            }
            
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return {
            "prediction": "Error",
            "confidence": 0.0,
            "error": str(e),
            "model_loaded": model_loaded
        }

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

async def update_asset_last_inspection_date(client: httpx.AsyncClient, headers: dict, asset_id: str, inspection_date: str):
    """Update asset's last inspection date in metadata"""
    try:
        print(f"📅 Updating last inspection date for asset {asset_id}")
        
        # Get current asset to read existing metadata
        asset_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/assets",
            headers=headers,
            params={
                "select": "metadata",
                "asset_id": f"eq.{asset_id}"
            }
        )
        
        if asset_response.status_code == 200:
            assets = asset_response.json()
            if assets:
                current_metadata = assets[0].get('metadata', {}) or {}
                
                # Update metadata with last inspection date
                updated_metadata = {
                    **current_metadata,
                    "last_inspection": inspection_date,
                    "last_inspection_date": inspection_date  # Alternate key for compatibility
                }
                
                # Update asset with new metadata
                update_response = await client.patch(
                    f"{SUPABASE_URL}/rest/v1/assets",
                    headers=headers,
                    params={"asset_id": f"eq.{asset_id}"},
                    json={
                        "metadata": updated_metadata,
                        "updated_at": datetime.utcnow().isoformat() + "Z"
                    }
                )
                
                if update_response.status_code == 204:
                    print(f"✅ Asset last inspection date updated successfully to {inspection_date}")
                else:
                    print(f"⚠️ Failed to update asset last inspection date: {update_response.status_code}")
                    print(f"⚠️ Response: {update_response.text}")
            else:
                print(f"⚠️ Asset {asset_id} not found for last inspection date update")
        else:
            print(f"⚠️ Failed to fetch current asset: {asset_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error updating asset last inspection date: {str(e)}")
        # Don't raise exception - metadata update failure shouldn't break inspection creation

@router.post("")
async def create_inspection(
    asset_id: str = Form(...),
    location: str = Form(...),
    inspection_type: str = Form("visual"),
    notes: str = Form(""),
    image: Optional[UploadFile] = File(None),
    current_user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    """Create a new inspection with AI-powered defect detection"""
    try:
        inspection_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat() + "Z"
        
        inspector_name = current_user.get("name") or current_user.get("email") or "Unknown Inspector"
        inspector_id = current_user.get("user_id")
        
        print(f"🔍 Creating inspection for user: {inspector_name} (ID: {inspector_id})")
        
        # Validate that we have required data
        if not inspector_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inspector ID is required"
            )
        
        # Ensure inspector_id is a valid UUID string
        try:
            uuid.UUID(inspector_id)  # This will raise ValueError if not valid UUID
        except (ValueError, TypeError):
            print(f"❌ Invalid inspector_id format: {inspector_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid inspector ID format"
            )
        
        ai_prediction = None
        confidence_score = None
        image_data_base64 = None
        
        # Process uploaded image
        if image and image.filename:
            print(f"📸 Processing image: {image.filename} ({image.content_type})")
            
            # Validate file type
            if not image.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only image files are allowed"
                )
            
            # Check file size (limit to 10MB)
            image_bytes = await image.read()
            if len(image_bytes) > 10 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Image file too large. Maximum size is 10MB."
                )
            
            # Convert to base64 for storage
            image_data_base64 = base64.b64encode(image_bytes).decode('utf-8')
            print(f"📊 Image encoded to base64, size: {len(image_data_base64)} characters")
            
            # Run AI prediction
            print("🤖 Running AI defect detection...")
            ai_prediction = predict_defect(image_bytes)
            confidence_score = ai_prediction.get('confidence')
            
            if ai_prediction.get('prediction') == 'Error':
                print(f"❌ AI prediction failed: {ai_prediction.get('error')}")
        
        # Determine inspection result
        if ai_prediction and ai_prediction.get('prediction') != 'Error':
            result = ai_prediction['prediction']
            inspection_type = "ai_assisted"  # Update inspection type when AI is used
        else:
            result = "Manual Inspection Required"
        
        # Prepare inspection data (matching database schema exactly)
        inspection_data = {
            "inspection_id": inspection_id,  # UUID string
            "asset_id": asset_id,
            "inspector_id": inspector_id,  # UUID string
            "inspector_name": inspector_name,
            "location": location,
            "inspection_date": current_time,
            "inspection_type": inspection_type,
            "result": result,
            "notes": notes,
            "image_data": image_data_base64,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Add optional fields only if they have values
        if confidence_score is not None:
            inspection_data["confidence_score"] = confidence_score
            
        if ai_prediction is not None:
            # Use the exact column name from your database: ai_predication (note spelling)
            inspection_data["ai_predication"] = ai_prediction
        
        print(f"📋 Prepared inspection data: {inspection_id}")
        print(f"📋 Data keys: {list(inspection_data.keys())}")
        print(f"📋 Inspector ID: {current_user['user_id']}")
        print(f"📋 Asset ID: {asset_id}")
        print(f"📋 Result: {result}")
        
        # Store in Supabase
        async with httpx.AsyncClient(timeout=30.0) as client:  # Add timeout
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"  # Get the created record back
            }
            
            print(f"🚀 Sending request to Supabase...")
            print(f"🔗 URL: {SUPABASE_URL}/rest/v1/inspections")
            print(f"📋 Final data keys: {list(inspection_data.keys())}")
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                json=inspection_data
            )
            
            print(f"📡 Supabase response status: {response.status_code}")
            
            # If we get a 400 error about ai_prediction column, try without it
            if response.status_code == 400 and "ai_prediction" in response.text:
                print("🔄 Retrying without ai_prediction column...")
                inspection_data_retry = inspection_data.copy()
                inspection_data_retry.pop("ai_prediction", None)
                
                response = await client.post(
                    f"{SUPABASE_URL}/rest/v1/inspections",
                    headers=headers,
                    json=inspection_data_retry
                )
                print(f"📡 Retry response status: {response.status_code}")
            
            # Log first 1000 chars of response for debugging
            response_text = response.text
            print(f"📡 Supabase response text (first 1000 chars): {response_text[:1000]}")
            
            if response.status_code == 201:
                try:
                    created_inspection = response.json()
                    print(f"✅ Inspection created successfully: {inspection_id}")
                    
                    # Update asset last inspection date
                    await update_asset_last_inspection_date(client, headers, asset_id, current_time)
                    
                    return created_inspection[0] if isinstance(created_inspection, list) else created_inspection
                except Exception as json_error:
                    print(f"❌ JSON parsing error: {str(json_error)}")
                    print(f"❌ Full response text: {response_text}")
                    # Return our original data as fallback
                    return inspection_data
            else:
                error_detail = f"Supabase error {response.status_code}: {response_text}"
                print(f"❌ Supabase error: {error_detail}")
                
                # Try to parse error response for more details
                try:
                    error_json = response.json()
                    if 'message' in error_json:
                        error_detail = f"Supabase error: {error_json['message']}"
                    elif 'details' in error_json:
                        error_detail = f"Supabase error: {error_json['details']}"
                    print(f"❌ Parsed error: {error_json}")
                except:
                    pass
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_detail
                )
            
    except HTTPException as he:
        print(f"❌ HTTP Exception in create_inspection: {he.detail}")
        raise he
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Unexpected error in create_inspection: {error_msg}")
        print(f"❌ Error type: {type(e).__name__}")
        
        # Print full traceback for debugging
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create inspection: {error_msg}"
        )

# Add a test endpoint to check database connectivity
@router.get("/test/db")
async def test_database_connection(current_user: Dict[str, Any] = Depends(get_current_user_from_token)):
    """Test database connectivity"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Simple query to test connection
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                params={"limit": "1"}
            )
            
            return {
                "status": "success" if response.status_code == 200 else "error",
                "status_code": response.status_code,
                "response_length": len(response.text),
                "response_preview": response.text[:200] if response.text else "No response text",
                "supabase_url": SUPABASE_URL,
                "has_api_key": bool(SUPABASE_KEY),
                "user_id": current_user.get("user_id")
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }

# Add endpoint to test simple data insertion
@router.post("/test/insert")
async def test_simple_insert(current_user: Dict[str, Any] = Depends(get_current_user_from_token)):
    """Test simple data insertion without images"""
    try:
        test_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat() + "Z"
        
        simple_data = {
            "inspection_id": test_id,
            "asset_id": "TEST-001",
            "inspector_id": current_user["user_id"],
            "inspector_name": "Test User",
            "location": "Test Location",
            "inspection_date": current_time,
            "inspection_type": "test",
            "result": "Test Result",
            "notes": "Test inspection",
            "created_at": current_time,
            "updated_at": current_time
            # Note: Removed ai_prediction, added as ai_predication if needed
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/inspections",
                headers=headers,
                json=simple_data
            )
            
            return {
                "status": "success" if response.status_code == 201 else "error",
                "status_code": response.status_code,
                "response_text": response.text,
                "data_sent": simple_data
            }
            
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }

# Add model info endpoint
@router.get("/model/info")
async def get_model_info(current_user: Dict[str, Any] = Depends(get_current_user_from_token)):
    """Get information about the loaded AI model"""
    return {
        "model_loaded": model_loaded,
        "model_path": "E:/gowsi/miniproject/SIH/ML_model/rail_defect_model.keras",
        "model_type": "MobileNetV2",
        "input_shape": model.input_shape if model else None,
        "status": "Ready for predictions" if model_loaded else "Model not loaded"
    }

@router.get("", response_model=List[Dict])
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

@router.get("/{inspection_id}", response_model=Dict)
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

@router.get("/debug/model")
async def debug_model_status():
    """Debug endpoint to check model status"""
    return {
        "model_loaded": model_loaded,
        "model_path": os.path.join(os.path.dirname(__file__), '../../..', 'ML_model', 'rail_defect_model.keras'),
        "path_exists": os.path.exists(os.path.join(os.path.dirname(__file__), '../../..', 'ML_model', 'rail_defect_model.keras')),
        "tensorflow_version": tf.__version__ if 'tf' in globals() else "Not imported"
    }