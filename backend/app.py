from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from datetime import datetime, date
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_anomalies(asset):
    """Check for warranty and inspection anomalies"""
    try:
        today = date.today()
        warranty_end = datetime.strptime(asset["warranty_end"], "%Y-%m-%d").date()
        last_inspection = datetime.strptime(asset["last_inspection"], "%Y-%m-%d").date()

        issues = []
        
        # Check warranty status
        if today > warranty_end:
            issues.append("Warranty Expired")
        elif (warranty_end - today).days <= 30:
            issues.append("Warranty Expiring Soon")
        
        # Check inspection status
        days_since_inspection = (today - last_inspection).days
        if days_since_inspection > 365:
            issues.append("Inspection Overdue")
        elif days_since_inspection > 300:
            issues.append("Inspection Due Soon")
        
        return issues if issues else ["OK"]
    except Exception as e:
        return [f"Analysis Error: {str(e)}"]

def format_asset_for_frontend(asset):
    """Format asset data for frontend consumption"""
    return {
        "id": asset["item_id"],
        "name": asset["name"],
        "category": asset["category"],
        "location": asset["location"],
        "status": asset["status"],
        "warrantyExpiry": asset["warranty_end"],
        "lastMaintenance": asset["last_inspection"],
        "predictiveScore": asset["predictive_score"],
        "qrCode": asset["qr_code"],
        "aiStatus": check_anomalies(asset),
        "createdAt": asset.get("created_at"),
        "updatedAt": asset.get("updated_at")
    }

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health_check():
    try:
        # Test Supabase connection
        response = supabase.table("assets").select("count").execute()
        return jsonify({
            "status": "healthy",
            "message": "Backend connected to Supabase successfully",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database connection failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

# Root route
@app.route("/")
def home():
    return jsonify({
        "message": "Asset Management API",
        "version": "1.0.0",
        "endpoints": [
            "/api/health",
            "/api/assets",
            "/api/assets/<asset_id>",
            "/api/assets/qr/<qr_code>"
        ]
    })

# Get all assets
@app.route("/api/assets", methods=["GET"])
def get_all_assets():
    try:
        response = supabase.table("assets").select("*").order("created_at", desc=False).execute()
        assets = [format_asset_for_frontend(asset) for asset in response.data]
        return jsonify({
            "success": True,
            "data": assets,
            "count": len(assets)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch assets: {str(e)}"
        }), 500

# Get single asset by item_id
@app.route("/api/assets/<asset_id>", methods=["GET"])
def get_asset_by_id(asset_id):
    try:
        response = supabase.table("assets").select("*").eq("item_id", asset_id).execute()
        if not response.data:
            return jsonify({
                "success": False,
                "error": "Asset not found"
            }), 404
        
        asset = format_asset_for_frontend(response.data[0])
        return jsonify({
            "success": True,
            "data": asset
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch asset: {str(e)}"
        }), 500

# Get asset by QR code
@app.route("/api/assets/qr/<qr_code>", methods=["GET"])
def get_asset_by_qr(qr_code):
    try:
        response = supabase.table("assets").select("*").eq("qr_code", qr_code).execute()
        if not response.data:
            return jsonify({
                "success": False,
                "error": "Asset with QR code not found"
            }), 404
        
        asset = format_asset_for_frontend(response.data[0])
        return jsonify({
            "success": True,
            "data": asset
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch asset: {str(e)}"
        }), 500

# Add new asset
@app.route("/api/assets", methods=["POST"])
def add_asset():
    try:
        data = request.json
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        # Validate required fields
        required_fields = ["item_id", "name", "category", "location", "warranty_end", "last_inspection", "qr_code"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        response = supabase.table("assets").insert(data).execute()
        asset = format_asset_for_frontend(response.data[0])
        return jsonify({
            "success": True,
            "data": asset,
            "message": "Asset created successfully"
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to create asset: {str(e)}"
        }), 500

# Update asset
@app.route("/api/assets/<asset_id>", methods=["PUT"])
def update_asset(asset_id):
    try:
        data = request.json
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        response = supabase.table("assets").update(data).eq("item_id", asset_id).execute()
        if not response.data:
            return jsonify({
                "success": False,
                "error": "Asset not found"
            }), 404
        
        asset = format_asset_for_frontend(response.data[0])
        return jsonify({
            "success": True,
            "data": asset,
            "message": "Asset updated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to update asset: {str(e)}"
        }), 500

# Generate AI alerts for all assets
@app.route("/api/alerts/generate", methods=["POST"])
def generate_ai_alerts():
    try:
        # Get all assets
        response = supabase.table("assets").select("*").execute()
        assets = response.data
        
        alerts_created = 0
        for asset in assets:
            issues = check_anomalies(asset)
            
            # Create alerts for issues (except "OK")
            for issue in issues:
                if issue != "OK":
                    alert_data = {
                        "asset_id": asset["id"],
                        "alert_type": "predictive" if "Score" in issue else "warranty" if "Warranty" in issue else "maintenance",
                        "title": f"Asset Alert: {asset['name']}",
                        "message": issue,
                        "severity": "high" if "Critical" in issue or "Expired" in issue else "medium",
                        "is_resolved": False
                    }
                    
                    # Check if alert already exists
                    existing = supabase.table("alerts").select("id").eq("asset_id", asset["id"]).eq("message", issue).eq("is_resolved", False).execute()
                    
                    if not existing.data:
                        supabase.table("alerts").insert(alert_data).execute()
                        alerts_created += 1
        
        return jsonify({
            "success": True,
            "message": f"Generated {alerts_created} new alerts",
            "alerts_created": alerts_created
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to generate alerts: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)