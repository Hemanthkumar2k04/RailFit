# RailFIT Mobile API Documentation

## Overview
The RailFIT Mobile API provides endpoints specifically designed for mobile applications to interact with the asset management system through QR code scanning and asset lookup.

## Base URL
```
http://localhost:5000/api/mobile
```

## Authentication
All endpoints (except health check) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the mobile API service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "RailFIT Mobile API",
  "version": "1.0.0",
  "endpoints": [...]
}
```

### 2. QR Code Scan
**POST** `/scan`

Process a QR code scan and return detailed asset information.

**Request Body:**
```json
{
  "qr_data": "d23e0996-33e1-443e-8943-6a4a924f177a",
  "scan_location": "Workshop Area", // optional
  "scan_timestamp": "2025-09-22T10:30:00Z", // optional
  "device_id": "mobile-scanner-001" // optional
}
```

**QR Data Formats Supported:**
1. **Plain Asset ID:** `"d23e0996-33e1-443e-8943-6a4a924f177a"`
2. **Full JSON Format (Recommended):** 
```json
{
  "asset_id": "d23e0996-33e1-443e-8943-6a4a924f177a",
  "type": "Rail Pad",
  "location": "Visitor Center XX-34",
  "status": "active",
  "health_score": 95,
  "predicted_rul_days": 120,
  "last_inspection": "2024-08-15",
  "next_maintenance": "2024-11-15",
  "qr_version": "1.0"
}
```
3. **Legacy JSON Format:** `'{"id":"d23e0996-33e1-443e-8943-6a4a924f177a","type":"Rail Pad"}'`

**Response:**
```json
{
  "asset_id": "d23e0996-33e1-443e-8943-6a4a924f177a",
  "type": "Rail Pad",
  "location": "Visitor Center XX-34",
  "status": "active",
  "condition": "excellent",
  "health_score": 95,
  "predicted_rul_days": 120,
  "install_date": "2024-03-12",
  "last_inspection": "2024-08-15",
  "next_maintenance": "2024-11-15",
  "qr_version": "1.0",
  "metadata": {
    "model": "Public-Pro",
    "description": "Visitor center rail pad with public access considerations",
    "manufacturer": "PadTech",
    "serial_number": "RP-013",
    "last_inspection": "2024-08-15",
    "next_maintenance": "2024-11-15"
  },
  "vendor_info": {
    "id": "1c927d10-e9aa-4225-8b5f-8fd81064512e",
    "name": "TrackMaster Corp",
    "contact_email": "sales@trackmaster.com",
    "contact_phone": "+1-555-0102",
    "address": "456 Track Street, Metro City",
    "warranty_terms": "36 months extended warranty with on-site service"
  }
}
```

### 3. Asset Lookup by ID
**GET** `/asset/{asset_id}`

Get asset information directly by asset ID.

**Parameters:**
- `asset_id` (path): The UUID of the asset

**Response:** Same as QR scan response

### 4. Batch QR Scan
**POST** `/scan/batch`

Process multiple QR code scans in a single request (useful for offline scenarios).

**Request Body:**
```json
[
  {
    "qr_data": "asset-id-1",
    "scan_location": "Area A",
    "device_id": "mobile-001"
  },
  {
    "qr_data": "asset-id-2", 
    "scan_location": "Area B",
    "device_id": "mobile-001"
  }
]
```

**Response:**
```json
{
  "total_scanned": 2,
  "successful": 1,
  "failed": 1,
  "results": [
    {
      "index": 0,
      "success": true,
      "data": { /* Asset data */ }
    }
  ],
  "errors": [
    {
      "index": 1,
      "success": false,
      "error": "Asset not found",
      "qr_data": "asset-id-2"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid QR code: No asset ID found"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Asset not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to process QR scan: Database connection error"
}
```

## Asset Status Values
- **condition**: `excellent`, `good`, `ok`, `critical`
- **status**: `active`, `under_maintenance`, `retired`, `not_installed`

## Usage Examples

### Login and Scan QR Code
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
const { access_token } = await loginResponse.json();

// 2. Scan QR Code
const scanResponse = await fetch('/api/mobile/scan', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qr_data: 'scanned-asset-id',
    scan_location: 'Field Location',
    device_id: 'mobile-device-123'
  })
});
const assetData = await scanResponse.json();
```

### Direct Asset Lookup
```javascript
const assetResponse = await fetch(`/api/mobile/asset/${assetId}`, {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
const assetData = await assetResponse.json();
```

## Notes for Mobile App Development

1. **QR Code Parsing**: The API handles both plain asset IDs and JSON-formatted QR codes
2. **Offline Support**: Use the batch scan endpoint to sync multiple scans when connectivity is restored
3. **Error Handling**: Always check response status and handle errors appropriately
4. **Authentication**: JWT tokens have an expiration time, implement token refresh logic
5. **Vendor Information**: Vendor details are automatically included when available
6. **Metadata**: Asset metadata contains additional technical specifications and maintenance info

## Testing

Health check (no auth required):
```bash
curl -X GET "http://localhost:5000/api/mobile/health"
```

QR scan with authentication:
```bash
curl -X POST "http://localhost:5000/api/mobile/scan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qr_data":"YOUR_ASSET_ID"}'
```