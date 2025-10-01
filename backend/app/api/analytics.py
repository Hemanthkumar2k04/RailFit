from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any
from app.core.security import verify_token
import httpx

router = APIRouter(tags=["Analytics"])
security = HTTPBearer()

# Get Supabase configuration from settings
from app.core.config import settings
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_anon_key


@router.get("/asset-health-rul")
async def get_asset_health_rul_summary(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get asset health and RUL summary from the asset_health_rul_summary view.
    Returns comprehensive data for AI analytics dashboard.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch asset health RUL summary
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/asset_health_rul_summary",
                headers=headers,
                params={"select": "*"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch asset health RUL summary: {response.text}"
                )
            
            return response.json()
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch asset health RUL summary: {str(e)}"
        )


@router.get("/rul-analytics")
async def get_rul_analytics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get RUL analytics from the rul_analytics view.
    Returns aggregated RUL statistics and predictions.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch RUL analytics
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/rul_analytics",
                headers=headers,
                params={"select": "*", "limit": "1"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch RUL analytics: {response.text}"
                )
            
            data = response.json()
            return data[0] if data else {}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch RUL analytics: {str(e)}"
        )


@router.get("/vendor-performance")
async def get_vendor_rul_performance(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get vendor RUL performance from the vendor_rul_performance view.
    Returns vendor-wise asset health and RUL statistics.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch vendor RUL performance
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/vendor_rul_performance",
                headers=headers,
                params={"select": "*"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch vendor RUL performance: {response.text}"
                )
            
            return response.json()
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch vendor RUL performance: {str(e)}"
        )


@router.get("/regional-statistics")
async def get_regional_rul_statistics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get regional RUL statistics from the regional_rul_statistics view.
    Returns region-wise asset health and RUL breakdowns.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch regional RUL statistics
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/regional_rul_statistics",
                headers=headers,
                params={"select": "*"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch regional RUL statistics: {response.text}"
                )
            
            return response.json()
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch regional RUL statistics: {str(e)}"
        )


@router.get("/overview")
async def get_analytics_overview(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get comprehensive analytics overview combining multiple data sources.
    Returns a complete analytics dashboard data set.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
            
            # Fetch all analytics data in parallel
            asset_health_task = client.get(
                f"{SUPABASE_URL}/rest/v1/asset_health_rul_summary",
                headers=headers,
                params={"select": "*"}
            )
            
            rul_analytics_task = client.get(
                f"{SUPABASE_URL}/rest/v1/rul_analytics",
                headers=headers,
                params={"select": "*", "limit": "1"}
            )
            
            vendor_performance_task = client.get(
                f"{SUPABASE_URL}/rest/v1/vendor_rul_performance",
                headers=headers,
                params={"select": "*"}
            )
            
            regional_stats_task = client.get(
                f"{SUPABASE_URL}/rest/v1/regional_rul_statistics",
                headers=headers,
                params={"select": "*"}
            )
            
            # Wait for all requests
            import asyncio
            responses = await asyncio.gather(
                asset_health_task,
                rul_analytics_task,
                vendor_performance_task,
                regional_stats_task,
                return_exceptions=True
            )
            
            # Process responses
            result = {
                "asset_health_rul": [],
                "rul_analytics": {},
                "vendor_performance": [],
                "regional_statistics": []
            }
            
            if not isinstance(responses[0], Exception) and responses[0].status_code == 200:
                result["asset_health_rul"] = responses[0].json()
            
            if not isinstance(responses[1], Exception) and responses[1].status_code == 200:
                data = responses[1].json()
                result["rul_analytics"] = data[0] if data else {}
            
            if not isinstance(responses[2], Exception) and responses[2].status_code == 200:
                result["vendor_performance"] = responses[2].json()
            
            if not isinstance(responses[3], Exception) and responses[3].status_code == 200:
                result["regional_statistics"] = responses[3].json()
            
            return result
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics overview: {str(e)}"
        )
