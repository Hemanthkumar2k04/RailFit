from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
import httpx
from typing import Optional
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

from app.core.config import settings
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_anon_key

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return credentials.credentials

@router.get("/")
async def get_alerts(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    token: str = Depends(verify_token)
):
    """
    Fetch alerts from database with optional filtering
    status: 'resolved', 'acknowledged', 'new' (unacknowledged and unresolved)
    priority: 'high', 'medium', 'low'
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch alerts with asset information
            params = {
                "select": "alert_id,type,message,priority,created_at,acknowledged_at,resolved_at,metadata,assets(asset_id,name,type,location)"
            }
            
            # Add filters based on query parameters
            filters = []
            if priority:
                filters.append(f"priority=eq.{priority}")
            
            if status == "resolved":
                filters.append("resolved_at=not.is.null")
            elif status == "acknowledged":
                filters.append("acknowledged_at=not.is.null")
                filters.append("resolved_at=is.null")
            elif status == "new":
                filters.append("acknowledged_at=is.null")
                filters.append("resolved_at=is.null")
            
            if filters:
                params["and"] = f"({','.join(filters)})"
            
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/alerts",
                params=params,
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch alerts")
            
            alerts_data = response.json()
            
            # Transform data to frontend format
            formatted_alerts = []
            for alert in alerts_data:
                asset = alert.get("assets", {})
                
                # Determine status
                status_text = "New"
                if alert.get("resolved_at"):
                    status_text = "Resolved"
                elif alert.get("acknowledged_at"):
                    status_text = "Acknowledged"
                
                # Calculate time ago
                created_at = datetime.fromisoformat(alert["created_at"].replace("Z", "+00:00"))
                time_diff = datetime.now(created_at.tzinfo) - created_at
                
                if time_diff.days > 0:
                    time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
                elif time_diff.seconds >= 3600:
                    hours = time_diff.seconds // 3600
                    time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
                else:
                    minutes = time_diff.seconds // 60
                    time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
                
                formatted_alerts.append({
                    "alert_id": alert["alert_id"],
                    "type": alert["type"],
                    "message": alert["message"],
                    "priority": alert["priority"],
                    "status": status_text,
                    "asset_name": asset.get("name", "Unknown Asset"),
                    "asset_type": asset.get("type", "Unknown"),
                    "location": asset.get("location", "Unknown Location"),
                    "created_at": alert["created_at"],
                    "time_ago": time_ago,
                    "metadata": alert.get("metadata", {})
                })
            
            # Sort by priority (high first) then by creation date (newest first)
            priority_order = {"high": 0, "medium": 1, "low": 2}
            formatted_alerts.sort(
                key=lambda x: (priority_order.get(x["priority"], 3), x["created_at"]),
                reverse=True
            )
            
            return formatted_alerts
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@router.patch("/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str, token: str = Depends(verify_token)):
    """Mark an alert as resolved"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Update the alert to mark it as resolved
            update_data = {
                "resolved_at": datetime.utcnow().isoformat()
            }
            
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/alerts?alert_id=eq.{alert_id}",
                json=update_data,
                headers=headers
            )
            
            if response.status_code not in [200, 204]:
                raise HTTPException(status_code=response.status_code, detail="Failed to dismiss alert")
            
            return {"message": "Alert dismissed successfully", "alert_id": alert_id}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dismissing alert: {str(e)}")
