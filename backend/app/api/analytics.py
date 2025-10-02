from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import httpx
from typing import Dict, Any, List
import asyncio
from datetime import datetime, timedelta

router = APIRouter(tags=["Analytics"])
security = HTTPBearer()

from app.core.config import settings
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_anon_key

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    return credentials.credentials

@router.get("/overview")
async def get_analytics_overview(token: str = Depends(verify_token)):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            assets_response, inspections_response, alerts_response, vendors_response = await asyncio.gather(
                client.get(f"{SUPABASE_URL}/rest/v1/assets", params={"select": "*"}, headers=headers),
                client.get(f"{SUPABASE_URL}/rest/v1/inspections", params={"select": "*"}, headers=headers),
                client.get(f"{SUPABASE_URL}/rest/v1/alerts", params={"select": "*"}, headers=headers),
                client.get(f"{SUPABASE_URL}/rest/v1/vendors", params={"select": "*"}, headers=headers)
            )
            
            assets = assets_response.json() if assets_response.status_code == 200 else []
            inspections = inspections_response.json() if inspections_response.status_code == 200 else []
            alerts = alerts_response.json() if alerts_response.status_code == 200 else []
            vendors = vendors_response.json() if vendors_response.status_code == 200 else []
            
            total_assets = len(assets)
            asset_by_type = {}
            asset_by_status = {"active": 0, "under_maintenance": 0, "retired": 0, "not_installed": 0}
            asset_by_condition = {"excellent": 0, "good": 0, "ok": 0, "critical": 0}
            asset_by_location = {}
            health_scores = []
            
            for asset in assets:
                asset_type = asset.get("type", "Unknown")
                asset_by_type[asset_type] = asset_by_type.get(asset_type, 0) + 1
                
                status = asset.get("status", "active")
                if status in asset_by_status:
                    asset_by_status[status] += 1
                
                condition = asset.get("condition", "ok")
                if condition in asset_by_condition:
                    asset_by_condition[condition] += 1
                
                location = asset.get("location", "Unknown")
                asset_by_location[location] = asset_by_location.get(location, 0) + 1
                
                if asset.get("health_score"):
                    health_scores.append(float(asset["health_score"]))
            
            avg_health_score = sum(health_scores) / len(health_scores) if health_scores else 0
            
            total_inspections = len(inspections)
            inspections_by_month = {}
            recent_inspections = []
            
            for inspection in inspections:
                inspection_date = inspection.get("inspection_date")
                if inspection_date:
                    month = inspection_date[:7]
                    inspections_by_month[month] = inspections_by_month.get(month, 0) + 1
                    
                    try:
                        insp_datetime = datetime.fromisoformat(inspection_date.replace("Z", "+00:00"))
                        if datetime.now(insp_datetime.tzinfo) - insp_datetime < timedelta(days=7):
                            recent_inspections.append(inspection)
                    except:
                        pass
            
            total_alerts = len(alerts)
            alerts_by_priority = {"high": 0, "medium": 0, "low": 0}
            alerts_by_type = {}
            unresolved_alerts = 0
            
            for alert in alerts:
                priority = alert.get("priority", "medium")
                if priority in alerts_by_priority:
                    alerts_by_priority[priority] += 1
                
                alert_type = alert.get("type", "info")
                alerts_by_type[alert_type] = alerts_by_type.get(alert_type, 0) + 1
                
                if not alert.get("resolved_at"):
                    unresolved_alerts += 1
            
            total_vendors = len(vendors)
            assets_per_vendor = {}
            
            for asset in assets:
                vendor_id = asset.get("vendor_id")
                if vendor_id:
                    vendor_name = next((v["name"] for v in vendors if v["vendor_id"] == vendor_id), f"Vendor {vendor_id[:8]}")
                    assets_per_vendor[vendor_name] = assets_per_vendor.get(vendor_name, 0) + 1
            
            return {
                "summary": {
                    "total_assets": total_assets,
                    "total_inspections": total_inspections,
                    "total_alerts": total_alerts,
                    "total_vendors": total_vendors,
                    "average_health_score": round(avg_health_score, 2),
                    "unresolved_alerts": unresolved_alerts,
                    "recent_inspections_7days": len(recent_inspections)
                },
                "assets": {
                    "by_type": [{"name": k, "count": v} for k, v in asset_by_type.items()],
                    "by_status": [{"name": k, "count": v} for k, v in asset_by_status.items()],
                    "by_condition": [{"name": k, "count": v} for k, v in asset_by_condition.items()],
                    "by_location": [{"name": k, "count": v} for k, v in sorted(asset_by_location.items(), key=lambda x: x[1], reverse=True)[:10]]
                },
                "inspections": {
                    "by_month": [{"month": k, "count": v} for k, v in sorted(inspections_by_month.items())[-12:]],
                    "total": total_inspections,
                    "recent_count": len(recent_inspections)
                },
                "alerts": {
                    "by_priority": [{"priority": k, "count": v} for k, v in alerts_by_priority.items()],
                    "by_type": [{"type": k, "count": v} for k, v in alerts_by_type.items()],
                    "total": total_alerts,
                    "unresolved": unresolved_alerts,
                    "resolved": total_alerts - unresolved_alerts
                },
                "vendors": {
                    "total": total_vendors,
                    "assets_per_vendor": [{"vendor": k, "count": v} for k, v in sorted(assets_per_vendor.items(), key=lambda x: x[1], reverse=True)[:10]]
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")
