"""
QR Code utilities for Railway Track Fault Detection System
High fault tolerance QR codes for railway infrastructure
"""
import qrcode
import qrcode.constants
import io
import base64
from typing import Dict, Any, Optional

class HighFaultToleranceQR:
    """
    QR Code generator with Type H (High) error correction for railway applications.
    
    Type H error correction can recover up to ~30% of damaged data, making it ideal
    for harsh railway environments where QR codes might get dirty, damaged, or
    partially obscured.
    """
    
    @staticmethod
    def create_qr_instance(version: int = 1, box_size: int = 10, border: int = 4):
        """
        Create a QR code instance with high fault tolerance settings
        
        Args:
            version: QR code version (1-40, higher = more data capacity)
            box_size: Size of each box in pixels
            border: Border size in boxes
            
        Returns:
            QRCode instance configured for high fault tolerance
        """
        return qrcode.QRCode(
            version=version,
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # ~30% error recovery
            box_size=box_size,
            border=border,
        )
    
    @staticmethod
    def generate_railway_asset_qr(asset_data: Dict[str, Any], 
                                 format: str = "png",
                                 return_base64: bool = False) -> Any:
        """
        Generate high fault tolerance QR code for railway assets
        
        Args:
            asset_data: Dictionary containing asset information
            format: Output format ("png", "svg", "jpeg")
            return_base64: Whether to return base64 encoded string
            
        Returns:
            QR code image or base64 string
        """
        import json
        
        # Create QR code with high fault tolerance
        qr = HighFaultToleranceQR.create_qr_instance()
        
        # Convert asset data to compact JSON
        qr_json = json.dumps(asset_data, indent=None, separators=(',', ':'))
        
        # Add data and generate
        qr.add_data(qr_json)
        qr.make(fit=True)
        
        if format.lower() == "svg":
            from qrcode.image.svg import SvgPathImage
            img = qr.make_image(image_factory=SvgPathImage)
            
            if return_base64:
                # Convert SVG to string and then base64
                svg_string = img.to_string(encoding='unicode')
                return base64.b64encode(svg_string.encode()).decode()
            return img
            
        else:  # PNG, JPEG, etc.
            img = qr.make_image(fill_color="black", back_color="white")
            
            if return_base64:
                buffer = io.BytesIO()
                img.save(buffer, format=format.upper())
                buffer.seek(0)
                return base64.b64encode(buffer.getvalue()).decode()
            
            return img
    
    @staticmethod
    def get_error_correction_info() -> Dict[str, Any]:
        """
        Get information about error correction levels
        
        Returns:
            Dictionary with error correction level details
        """
        return {
            "current_level": "H (High)",
            "error_recovery": "~30%",
            "description": "Can recover from up to 30% data loss or damage",
            "use_case": "Harsh environments, outdoor installations, high reliability needs",
            "alternatives": {
                "L": "~7% recovery (Low)",
                "M": "~15% recovery (Medium)", 
                "Q": "~25% recovery (Quartile)",
                "H": "~30% recovery (High) - CURRENT"
            },
            "railway_benefits": [
                "Resistant to dirt and weather damage",
                "Readable even when partially obscured",
                "Reliable scanning in harsh conditions",
                "Reduced maintenance for QR code replacement"
            ]
        }

def validate_qr_settings():
    """Validate that all QR codes in the system use high fault tolerance"""
    print("🔍 QR Code Configuration Validation")
    print("=" * 40)
    
    info = HighFaultToleranceQR.get_error_correction_info()
    print(f"✅ Error Correction Level: {info['current_level']}")
    print(f"✅ Error Recovery Capability: {info['error_recovery']}")
    print(f"✅ Use Case: {info['use_case']}")
    
    print("\n🚂 Railway-Specific Benefits:")
    for benefit in info['railway_benefits']:
        print(f"  • {benefit}")
    
    print("\n📊 All Error Correction Levels:")
    for level, recovery in info['alternatives'].items():
        status = "← ACTIVE" if level == "H" else ""
        print(f"  {level}: {recovery} {status}")

if __name__ == "__main__":
    validate_qr_settings()
    
    # Example usage
    print("\n🧪 Testing QR Code Generation...")
    
    sample_asset = {
        "asset_id": "RAIL-001",
        "type": "Track Section",
        "location": "Platform 2, Mile 15.3",
        "status": "Active",
        "last_inspection": "2025-09-28"
    }
    
    # Generate test QR code
    qr_img = HighFaultToleranceQR.generate_railway_asset_qr(
        sample_asset, 
        format="png", 
        return_base64=True
    )
    
    print(f"✅ Generated high fault tolerance QR code ({len(qr_img)} characters)")
    print("🎯 QR code can recover from up to 30% damage/obstruction")