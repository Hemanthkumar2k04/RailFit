# Test script to verify FastAPI conversion
# Run this with: python test_server.py (after installing dependencies)

import requests
import json

def test_api_endpoints():
    base_url = "http://localhost:5000"
    
    endpoints = [
        "/",
        "/api/dashboard", 
        "/api/alerts",
        "/api/fittings"
    ]
    
    print("Testing FastAPI endpoints...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            print(f"✓ {endpoint}: {response.status_code}")
            if response.status_code == 200:
                print(f"  Response sample: {str(response.json())[:100]}...")
        except requests.exceptions.ConnectionError:
            print(f"✗ {endpoint}: Server not running")
        except Exception as e:
            print(f"✗ {endpoint}: Error - {str(e)}")

if __name__ == "__main__":
    test_api_endpoints()