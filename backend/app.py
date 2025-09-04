from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import qrcode
import uuid
import base64
from io import BytesIO
import os
import sqlite3
import json

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

# Initialize SQLite database for QR codes and components
def init_db():
    try:
        # Use a database in temp directory if current directory is not writable
        db_path = os.path.join(os.environ.get('TEMP', '.'), 'railway_components.db')
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # Components table
        c.execute('''CREATE TABLE IF NOT EXISTS components (
            id TEXT PRIMARY KEY,
            qr_code TEXT UNIQUE,
            component_type TEXT,
            vendor TEXT,
            lot_number TEXT,
            manufacture_date TEXT,
            warranty_end TEXT,
            location TEXT,
            status TEXT DEFAULT 'active',
            last_inspection TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        # Scan logs table
        c.execute('''CREATE TABLE IF NOT EXISTS scan_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id TEXT,
            scanned_by TEXT,
            scan_location TEXT,
            scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (component_id) REFERENCES components (id)
        )''')
        
        # Users table for authentication
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT,
            role TEXT DEFAULT 'inspector',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        conn.commit()
        conn.close()
        print(f"Database initialized at: {db_path}")
        return db_path
    except Exception as e:
        print(f"Database initialization error: {e}")
        return None

# Store database path globally
DB_PATH = None

# Initialize database on startup
DB_PATH = init_db()

# Load existing dataset
csv_path = os.path.join(os.path.dirname(__file__), "data.csv")
if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
else:
    # Create empty DataFrame if CSV doesn't exist
    df = pd.DataFrame(columns=['ItemID', 'Type', 'Vendor', 'LotNo', 'SupplyDate', 'WarrantyEnd', 'LastInspection'])

def generate_qr_code(data):
    """Generate QR code for component data"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    # Convert to base64 for API response
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

def get_db_connection():
    """Get database connection"""
    if DB_PATH:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    else:
        # Fallback to in-memory database
        conn = sqlite3.connect(':memory:')
        conn.row_factory = sqlite3.Row
        return conn

def check_component_status(component):
    """Enhanced AI status checking for components"""
    today = datetime.now().date()
    issues = []
    
    # Check warranty
    if component.get('warranty_end'):
        warranty_end = datetime.strptime(component['warranty_end'], "%Y-%m-%d").date()
        if today > warranty_end:
            issues.append("Warranty Expired")
        elif (warranty_end - today).days < 30:
            issues.append("Warranty Expiring Soon")
    
    # Check last inspection
    if component.get('last_inspection'):
        last_inspection = datetime.strptime(component['last_inspection'], "%Y-%m-%d").date()
        days_since_inspection = (today - last_inspection).days
        if days_since_inspection > 365:
            issues.append("Inspection Overdue")
        elif days_since_inspection > 300:
            issues.append("Inspection Due Soon")
    
    # Check component age
    if component.get('manufacture_date'):
        manufacture_date = datetime.strptime(component['manufacture_date'], "%Y-%m-%d").date()
        age_years = (today - manufacture_date).days / 365
        if age_years > 10:
            issues.append("Component Aging")
    
    return issues if issues else ["OK"]

def row_with_ai(row):
    r = row.to_dict()
    # Convert row to component format for consistency
    component_dict = {
        'warranty_end': r.get('WarrantyEnd'),
        'last_inspection': r.get('LastInspection'),
        'manufacture_date': r.get('SupplyDate')
    }
    r["AI_Status"] = check_component_status(component_dict)
    return r

# Root route for sanity
@app.route("/")
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Railway QR Code Tracking System - MVP Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: #2c5aa0; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
            .button:hover { background: #45a049; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .form-group { margin: 10px 0; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
            .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            .qr-display { text-align: center; padding: 20px; }
            .component-list { max-height: 400px; overflow-y: auto; }
            .component-item { padding: 10px; border-bottom: 1px solid #eee; }
            .status-ok { color: green; }
            .status-warning { color: orange; }
            .status-error { color: red; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚂 Railway QR Code Tracking System</h1>
                <p>MVP Dashboard for Smart India Hackathon 2025</p>
                <p><a href="/react" style="color: white; text-decoration: underline;">Switch to React Dashboard</a></p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📦 Add New Component</h3>
                    <form id="componentForm">
                        <div class="form-group">
                            <label>Component Type:</label>
                            <select id="componentType" required>
                                <option value="">Select Type</option>
                                <option value="Track Fastening">Track Fastening</option>
                                <option value="Bolt">Bolt</option>
                                <option value="Washer">Washer</option>
                                <option value="Clip">Clip</option>
                                <option value="Screw">Screw</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Vendor:</label>
                            <input type="text" id="vendor" required placeholder="Enter vendor name">
                        </div>
                        <div class="form-group">
                            <label>Lot Number:</label>
                            <input type="text" id="lotNumber" required placeholder="Enter lot number">
                        </div>
                        <div class="form-group">
                            <label>Manufacture Date:</label>
                            <input type="date" id="manufactureDate">
                        </div>
                        <div class="form-group">
                            <label>Warranty End Date:</label>
                            <input type="date" id="warrantyEnd">
                        </div>
                        <div class="form-group">
                            <label>Location:</label>
                            <input type="text" id="location" placeholder="Enter location">
                        </div>
                        <button type="submit" class="button">Create Component & Generate QR</button>
                    </form>
                </div>
                
                <div class="card">
                    <h3>📱 Generated QR Code</h3>
                    <div id="qrDisplay" class="qr-display">
                        <p>Generate a component to see QR code</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>📊 Dashboard Analytics</h3>
                <div id="analytics">
                    <button class="button" onclick="loadAnalytics()">Load Analytics</button>
                    <div id="analyticsData"></div>
                </div>
            </div>
            
            <div class="card">
                <h3>📋 All Components</h3>
                <button class="button" onclick="loadComponents()">Refresh Components</button>
                <div id="componentsList" class="component-list"></div>
            </div>
        </div>
        
        <script>
            // Handle component creation
            document.getElementById('componentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const componentData = {
                    component_type: document.getElementById('componentType').value,
                    vendor: document.getElementById('vendor').value,
                    lot_number: document.getElementById('lotNumber').value,
                    manufacture_date: document.getElementById('manufactureDate').value,
                    warranty_end: document.getElementById('warrantyEnd').value,
                    location: document.getElementById('location').value
                };
                
                try {
                    const response = await fetch('/api/components', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(componentData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert(`Component created successfully! ID: ${result.component_id}`);
                        
                        // Display QR code
                        document.getElementById('qrDisplay').innerHTML = `
                            <h4>QR Code Generated</h4>
                            <p><strong>Component ID:</strong> ${result.component_id}</p>
                            <img src="data:image/png;base64,${result.qr_code_image}" alt="QR Code" style="max-width: 200px;">
                            <p><small>Scan this QR code to track the component</small></p>
                        `;
                        
                        // Reset form
                        document.getElementById('componentForm').reset();
                        
                        // Refresh components list
                        loadComponents();
                    } else {
                        alert('Error creating component: ' + result.error);
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            });
            
            // Load components
            async function loadComponents() {
                try {
                    const response = await fetch('/api/components');
                    const data = await response.json();
                    
                    const componentsList = document.getElementById('componentsList');
                    componentsList.innerHTML = '';
                    
                    const allComponents = [...(data.database_components || []), ...(data.legacy_components || [])];
                    
                    if (allComponents.length === 0) {
                        componentsList.innerHTML = '<p>No components found. Create your first component above!</p>';
                        return;
                    }
                    
                    allComponents.forEach(comp => {
                        const statusClass = comp.AI_Status && comp.AI_Status.includes('OK') ? 'status-ok' : 
                                          comp.AI_Status && comp.AI_Status.some(s => s.includes('Soon')) ? 'status-warning' : 'status-error';
                        
                        componentsList.innerHTML += `
                            <div class="component-item">
                                <strong>${comp.component_type || comp.Type}</strong> - ${comp.vendor || comp.Vendor}
                                <br><small>Lot: ${comp.lot_number || comp.LotNo} | Status: <span class="${statusClass}">${comp.AI_Status ? comp.AI_Status.join(', ') : 'Unknown'}</span></small>
                                ${comp.id ? `<br><small>ID: ${comp.id}</small>` : ''}
                            </div>
                        `;
                    });
                } catch (error) {
                    document.getElementById('componentsList').innerHTML = '<p>Error loading components: ' + error.message + '</p>';
                }
            }
            
            // Load analytics
            async function loadAnalytics() {
                try {
                    const response = await fetch('/api/analytics/dashboard');
                    const data = await response.json();
                    
                    document.getElementById('analyticsData').innerHTML = `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                                <h4>Total Components</h4>
                                <h2>${data.summary?.total_components || 0}</h2>
                            </div>
                            <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">
                                <h4>Component Types</h4>
                                <h2>${data.summary?.types_tracked || 0}</h2>
                            </div>
                            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                                <h4>Recent Scans</h4>
                                <h2>${data.summary?.recent_activity || 0}</h2>
                            </div>
                            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
                                <h4>High Risk</h4>
                                <h2 style="color: #f44336;">${data.ai_insights?.high_risk_components || 0}</h2>
                            </div>
                        </div>
                        <div style="margin-top: 20px;">
                            <h4>AI Insights:</h4>
                            <p>🔍 <strong>${data.ai_insights?.total_tracked || 0}</strong> components tracked</p>
                            <p>⚠️ <strong>${data.ai_insights?.attention_needed || 0}</strong> components need attention</p>
                            <p>🚨 <strong>${data.ai_insights?.high_risk_components || 0}</strong> high-risk components</p>
                        </div>
                    `;
                } catch (error) {
                    document.getElementById('analyticsData').innerHTML = '<p>Error loading analytics: ' + error.message + '</p>';
                }
            }
            
            // Load components on page load
            window.addEventListener('load', () => {
                loadComponents();
                loadAnalytics();
            });
        </script>
    </body>
    </html>
    '''

# React Dashboard Route
@app.route("/react")
def react_dashboard():
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Railway QR Tracking - React Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
            color: white; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5rem; font-weight: 800; }
        .header p { margin: 5px 0; font-size: 1.1rem; opacity: 0.9; }
        .header a { color: #fbbf24; text-decoration: none; font-weight: 600; }
        .card { 
            background: white; padding: 30px; margin: 20px 0; border-radius: 16px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 10px 25px rgba(0,0,0,0.1);
        }
        .card h3 { margin-top: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
        .button { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white; padding: 12px 24px; border: none; border-radius: 8px; 
            cursor: pointer; margin: 8px; font-weight: 600; font-size: 14px;
            transition: all 0.2s ease;
        }
        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
        .button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .button.secondary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; }
        .form-group { margin: 15px 0; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }
        .form-group input, .form-group select { 
            width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; 
            box-sizing: border-box; font-size: 14px; transition: border-color 0.2s ease;
        }
        .form-group input:focus, .form-group select:focus {
            outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .qr-display { text-align: center; padding: 30px; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1; }
        .qr-result { background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; }
        .component-list { max-height: 500px; overflow-y: auto; border-radius: 8px; }
        .component-item { 
            padding: 20px; border-bottom: 1px solid #f3f4f6; transition: background-color 0.2s ease;
        }
        .component-item:hover { background-color: #f9fafb; }
        .status-ok { color: #059669; font-weight: 600; background: #ecfdf5; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
        .status-warning { color: #d97706; font-weight: 600; background: #fffbeb; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
        .status-error { color: #dc2626; font-weight: 600; background: #fef2f2; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
        .loading { text-align: center; padding: 40px; color: #6b7280; }
        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 20px; }
        .stat-card { padding: 24px; border-radius: 12px; text-align: center; transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-card h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card h2 { margin: 0; font-size: 2.5rem; font-weight: 800; }
        .blue { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; }
        .purple { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #7c3aed; }
        .green { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #059669; }
        .orange { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); color: #ea580c; }
        .red-text { color: #dc2626; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        function App() {
            const [components, setComponents] = useState([]);
            const [analytics, setAnalytics] = useState({});
            const [qrCode, setQrCode] = useState(null);
            const [loading, setLoading] = useState(false);
            const [newComponent, setNewComponent] = useState({
                component_type: '',
                vendor: '',
                lot_number: '',
                manufacture_date: '',
                warranty_end: '',
                location: ''
            });

            const API_BASE = '/';

            const loadComponents = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`${API_BASE}api/components`);
                    const data = await response.json();
                    const allComponents = [...(data.database_components || []), ...(data.legacy_components || [])];
                    setComponents(allComponents);
                } catch (error) {
                    console.error('Error loading components:', error);
                } finally {
                    setLoading(false);
                }
            };

            const loadAnalytics = async () => {
                try {
                    const response = await fetch(`${API_BASE}api/analytics/dashboard`);
                    const data = await response.json();
                    setAnalytics(data);
                } catch (error) {
                    console.error('Error loading analytics:', error);
                }
            };

            const handleCreateComponent = async (e) => {
                e.preventDefault();
                try {
                    setLoading(true);
                    const response = await fetch(`${API_BASE}api/components`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newComponent)
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert(`Component created successfully! ID: ${result.component_id}`);
                        setQrCode(result);
                        setNewComponent({
                            component_type: '',
                            vendor: '',
                            lot_number: '',
                            manufacture_date: '',
                            warranty_end: '',
                            location: ''
                        });
                        await loadComponents();
                        await loadAnalytics();
                    } else {
                        alert('Error creating component: ' + result.error);
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                } finally {
                    setLoading(false);
                }
            };

            const handleInputChange = (e) => {
                setNewComponent({
                    ...newComponent,
                    [e.target.name]: e.target.value
                });
            };

            useEffect(() => {
                loadComponents();
                loadAnalytics();
            }, []);

            return (
                <div className="container">
                    <div className="header">
                        <h1>🚂 Railway QR Code Tracking System</h1>
                        <p>React Dashboard - Smart India Hackathon 2025 MVP</p>
                        <p><a href="/">← Back to Basic Dashboard</a></p>
                    </div>

                    <div className="grid">
                        <div className="card">
                            <h3>📦 Add New Railway Component</h3>
                            <form onSubmit={handleCreateComponent}>
                                <div className="form-group">
                                    <label>Component Type:</label>
                                    <select 
                                        name="component_type" 
                                        value={newComponent.component_type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Component Type</option>
                                        <option value="Elastic Rail Clip">Elastic Rail Clip</option>
                                        <option value="Rail Pad">Rail Pad</option>
                                        <option value="Liner">Liner</option>
                                        <option value="Sleeper">Sleeper</option>
                                        <option value="Fish Plate">Fish Plate</option>
                                        <option value="Bolt">Bolt</option>
                                        <option value="Washer">Washer</option>
                                        <option value="Screw">Screw</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vendor:</label>
                                    <input 
                                        type="text" 
                                        name="vendor"
                                        value={newComponent.vendor}
                                        onChange={handleInputChange}
                                        placeholder="Enter vendor name"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Lot Number:</label>
                                    <input 
                                        type="text" 
                                        name="lot_number"
                                        value={newComponent.lot_number}
                                        onChange={handleInputChange}
                                        placeholder="Enter lot number"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Manufacture Date:</label>
                                    <input 
                                        type="date" 
                                        name="manufacture_date"
                                        value={newComponent.manufacture_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Warranty End Date:</label>
                                    <input 
                                        type="date" 
                                        name="warranty_end"
                                        value={newComponent.warranty_end}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location:</label>
                                    <input 
                                        type="text" 
                                        name="location"
                                        value={newComponent.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Platform 1, Section A-5"
                                    />
                                </div>
                                <button type="submit" className="button" disabled={loading}>
                                    {loading ? '⏳ Creating...' : '🎯 Create Component & Generate QR'}
                                </button>
                            </form>
                        </div>

                        <div className="card">
                            <h3>📱 Generated QR Code</h3>
                            <div className="qr-display">
                                {qrCode ? (
                                    <div className="qr-result">
                                        <h4>✅ QR Code Generated Successfully!</h4>
                                        <p><strong>Component ID:</strong> {qrCode.component_id}</p>
                                        <img 
                                            src={`data:image/png;base64,${qrCode.qr_code_image}`} 
                                            alt="QR Code" 
                                            style={{maxWidth: '200px', margin: '20px 0'}}
                                        />
                                        <p><small>📱 Scan this QR code to track the component</small></p>
                                    </div>
                                ) : (
                                    <div>
                                        <h4>🎯 Ready to Generate QR Code</h4>
                                        <p>Create a component above to generate its QR code</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>📊 Dashboard Analytics</h3>
                        <button className="button secondary" onClick={loadAnalytics}>
                            🔄 Refresh Analytics
                        </button>
                        {analytics.summary ? (
                            <div>
                                <div className="analytics-grid">
                                    <div className="stat-card blue">
                                        <h4>Total Components</h4>
                                        <h2>{analytics.summary.total_components || 0}</h2>
                                    </div>
                                    <div className="stat-card purple">
                                        <h4>Component Types</h4>
                                        <h2>{analytics.summary.types_tracked || 0}</h2>
                                    </div>
                                    <div className="stat-card green">
                                        <h4>Recent Scans</h4>
                                        <h2>{analytics.summary.recent_activity || 0}</h2>
                                    </div>
                                    <div className="stat-card orange">
                                        <h4>High Risk</h4>
                                        <h2 className="red-text">{analytics.ai_insights?.high_risk_components || 0}</h2>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="loading">📈 Loading analytics data...</div>
                        )}
                    </div>

                    <div className="card">
                        <h3>📋 All Railway Components</h3>
                        <button className="button secondary" onClick={loadComponents}>
                            🔄 Refresh Components
                        </button>
                        <div className="component-list">
                            {loading ? (
                                <div className="loading">⏳ Loading components...</div>
                            ) : components.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                                    <h4>🎯 No components found</h4>
                                    <p>Create your first railway component above to get started!</p>
                                </div>
                            ) : (
                                components.map((comp, index) => {
                                    const statusClass = comp.AI_Status && comp.AI_Status.includes('OK') ? 'status-ok' : 
                                                      comp.AI_Status && comp.AI_Status.some(s => s.includes('Soon')) ? 'status-warning' : 'status-error';
                                    
                                    return (
                                        <div key={index} className="component-item">
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                                <div>
                                                    <h4 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600'}}>
                                                        {comp.component_type || comp.Type}
                                                    </h4>
                                                    <p style={{margin: '0 0 8px 0', color: '#6b7280'}}>
                                                        <strong>Vendor:</strong> {comp.vendor || comp.Vendor}
                                                    </p>
                                                    <p style={{margin: '0 0 8px 0', color: '#6b7280'}}>
                                                        <strong>Lot:</strong> {comp.lot_number || comp.LotNo}
                                                    </p>
                                                    {comp.location && (
                                                        <p style={{margin: '0 0 8px 0', color: '#6b7280'}}>
                                                            <strong>📍 Location:</strong> {comp.location}
                                                        </p>
                                                    )}
                                                    {comp.id && (
                                                        <p style={{margin: '0', fontSize: '12px', color: '#9ca3af'}}>
                                                            ID: {comp.id}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className={statusClass}>
                                                        {comp.AI_Status ? comp.AI_Status.join(', ') : 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
    '''

# ==================== COMPONENT MANAGEMENT APIs ====================

@app.route("/api/components", methods=["GET"])
def get_all_components():
    """Get all railway components with AI analysis"""
    try:
        # Get from database
        conn = get_db_connection()
        components = conn.execute('SELECT * FROM components ORDER BY created_at DESC').fetchall()
        conn.close()
        
        # Also include legacy CSV data with AI analysis
        legacy_items = [row_with_ai(r) for _, r in df.iterrows()]
        
        # Convert database results to dict
        db_components = []
        for comp in components:
            comp_dict = dict(comp)
            comp_dict["AI_Status"] = check_component_status(comp_dict)
            db_components.append(comp_dict)
        
        return jsonify({
            "database_components": db_components,
            "legacy_components": legacy_items,
            "total_count": len(db_components) + len(legacy_items)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/components", methods=["POST"])
def create_component():
    """Create new railway component with QR code"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['component_type', 'vendor', 'lot_number']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Generate unique ID and QR code data
        component_id = str(uuid.uuid4())
        qr_data = {
            "id": component_id,
            "type": data['component_type'],
            "vendor": data['vendor'],
            "lot": data['lot_number'],
            "date": datetime.now().isoformat()
        }
        qr_code_text = json.dumps(qr_data)
        
        # Insert into database
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO components 
            (id, qr_code, component_type, vendor, lot_number, manufacture_date, 
             warranty_end, location, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            component_id,
            qr_code_text,
            data['component_type'],
            data['vendor'],
            data['lot_number'],
            data.get('manufacture_date', datetime.now().date().isoformat()),
            data.get('warranty_end'),
            data.get('location'),
            data.get('status', 'active')
        ))
        conn.commit()
        conn.close()
        
        # Generate QR code image
        qr_image = generate_qr_code(qr_code_text)
        
        return jsonify({
            "success": True,
            "component_id": component_id,
            "qr_code_data": qr_data,
            "qr_code_image": qr_image
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/components/<component_id>", methods=["GET"])
def get_component(component_id):
    """Get specific component details"""
    try:
        conn = get_db_connection()
        component = conn.execute(
            'SELECT * FROM components WHERE id = ?', (component_id,)
        ).fetchone()
        conn.close()
        
        if not component:
            return jsonify({"error": "Component not found"}), 404
        
        comp_dict = dict(component)
        comp_dict["AI_Status"] = check_component_status(comp_dict)
        
        return jsonify(comp_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== QR CODE APIs ====================

@app.route("/api/qr/generate", methods=["POST"])
def generate_qr_endpoint():
    """Generate QR code for component data"""
    try:
        data = request.get_json()
        qr_text = data.get('data', '')
        
        if not qr_text:
            return jsonify({"error": "QR data is required"}), 400
        
        qr_image = generate_qr_code(qr_text)
        return jsonify({
            "success": True,
            "qr_code_image": qr_image,
            "data": qr_text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/scan/<qr_code>", methods=["POST"])
def scan_component(qr_code):
    """Record component scan and return component details"""
    try:
        data = request.get_json()
        scanned_by = data.get('scanned_by', 'Unknown')
        scan_location = data.get('location', 'Unknown')
        notes = data.get('notes', '')
        
        # Find component by QR code
        conn = get_db_connection()
        component = conn.execute(
            'SELECT * FROM components WHERE qr_code = ?', (qr_code,)
        ).fetchone()
        
        if not component:
            conn.close()
            return jsonify({"error": "Component not found"}), 404
        
        # Record scan log
        conn.execute('''
            INSERT INTO scan_logs (component_id, scanned_by, scan_location, notes)
            VALUES (?, ?, ?, ?)
        ''', (component['id'], scanned_by, scan_location, notes))
        conn.commit()
        conn.close()
        
        comp_dict = dict(component)
        comp_dict["AI_Status"] = check_component_status(comp_dict)
        
        return jsonify({
            "success": True,
            "component": comp_dict,
            "scan_recorded": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== ANALYTICS APIs ====================

@app.route("/api/analytics/dashboard", methods=["GET"])
def get_dashboard_analytics():
    """Get dashboard analytics for railway components"""
    try:
        conn = get_db_connection()
        
        # Component counts by type
        type_counts = conn.execute('''
            SELECT component_type, COUNT(*) as count 
            FROM components 
            GROUP BY component_type
        ''').fetchall()
        
        # Recent scans
        recent_scans = conn.execute('''
            SELECT c.component_type, c.vendor, s.scan_timestamp, s.scanned_by, s.scan_location
            FROM scan_logs s
            JOIN components c ON s.component_id = c.id
            ORDER BY s.scan_timestamp DESC
            LIMIT 10
        ''').fetchall()
        
        # Components by status
        total_components = conn.execute('SELECT COUNT(*) as count FROM components').fetchone()
        
        # Warranty analysis
        warranty_analysis = conn.execute('''
            SELECT 
                SUM(CASE WHEN date(warranty_end) < date('now') THEN 1 ELSE 0 END) as expired,
                SUM(CASE WHEN date(warranty_end) BETWEEN date('now') AND date('now', '+30 days') THEN 1 ELSE 0 END) as expiring_soon,
                SUM(CASE WHEN date(warranty_end) > date('now', '+30 days') THEN 1 ELSE 0 END) as active
            FROM components
            WHERE warranty_end IS NOT NULL
        ''').fetchone()
        
        conn.close()
        
        # AI insights
        ai_insights = {
            "high_risk_components": warranty_analysis['expired'] if warranty_analysis else 0,
            "attention_needed": warranty_analysis['expiring_soon'] if warranty_analysis else 0,
            "total_tracked": total_components['count'] if total_components else 0
        }
        
        return jsonify({
            "component_types": [dict(row) for row in type_counts],
            "recent_scans": [dict(row) for row in recent_scans],
            "warranty_status": dict(warranty_analysis) if warranty_analysis else {},
            "ai_insights": ai_insights,
            "summary": {
                "total_components": total_components['count'] if total_components else 0,
                "types_tracked": len(type_counts),
                "recent_activity": len(recent_scans)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== INTEGRATION APIs (Mock) ====================

@app.route("/api/integration/udm", methods=["POST"])
def sync_with_udm():
    """Mock integration with UDM portal"""
    try:
        data = request.get_json()
        # This would integrate with actual UDM APIs
        return jsonify({
            "success": True,
            "message": "Data synced with UDM portal",
            "udm_response": "Mock response from ireps.gov.in",
            "synced_components": data.get('component_ids', [])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/integration/tms", methods=["POST"])
def sync_with_tms():
    """Mock integration with TMS portal"""
    try:
        data = request.get_json()
        # This would integrate with actual TMS APIs
        return jsonify({
            "success": True,
            "message": "Data synced with TMS portal",
            "tms_response": "Mock response from irecept.gov.in",
            "synced_components": data.get('component_ids', [])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== UTILITY APIs ====================

@app.route("/api/components/search", methods=["GET"])
def search_components():
    """Search components by various criteria"""
    try:
        vendor = request.args.get('vendor')
        component_type = request.args.get('type')
        status = request.args.get('status')
        
        conn = get_db_connection()
        query = 'SELECT * FROM components WHERE 1=1'
        params = []
        
        if vendor:
            query += ' AND vendor LIKE ?'
            params.append(f'%{vendor}%')
        if component_type:
            query += ' AND component_type LIKE ?'
            params.append(f'%{component_type}%')
        if status:
            query += ' AND status = ?'
            params.append(status)
            
        components = conn.execute(query, params).fetchall()
        conn.close()
        
        results = []
        for comp in components:
            comp_dict = dict(comp)
            comp_dict["AI_Status"] = check_component_status(comp_dict)
            results.append(comp_dict)
        
        return jsonify({
            "results": results,
            "count": len(results),
            "search_criteria": {
                "vendor": vendor,
                "type": component_type,
                "status": status
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/components/<component_id>/update", methods=["PUT"])
def update_component(component_id):
    """Update component information"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        
        # Build update query dynamically
        updates = []
        params = []
        
        allowed_fields = ['location', 'status', 'last_inspection', 'warranty_end']
        for field in allowed_fields:
            if field in data:
                updates.append(f'{field} = ?')
                params.append(data[field])
        
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
        
        params.append(component_id)
        query = f'UPDATE components SET {", ".join(updates)} WHERE id = ?'
        
        result = conn.execute(query, params)
        conn.commit()
        
        if result.rowcount == 0:
            conn.close()
            return jsonify({"error": "Component not found"}), 404
        
        # Get updated component
        updated_comp = conn.execute('SELECT * FROM components WHERE id = ?', (component_id,)).fetchone()
        conn.close()
        
        comp_dict = dict(updated_comp)
        comp_dict["AI_Status"] = check_component_status(comp_dict)
        
        return jsonify({
            "success": True,
            "component": comp_dict,
            "updated_fields": list(data.keys())
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reports/warranty", methods=["GET"])
def warranty_report():
    """Generate warranty status report"""
    try:
        conn = get_db_connection()
        
        # Expired warranties
        expired = conn.execute('''
            SELECT * FROM components 
            WHERE date(warranty_end) < date('now')
            ORDER BY warranty_end
        ''').fetchall()
        
        # Expiring soon (next 30 days)
        expiring_soon = conn.execute('''
            SELECT * FROM components 
            WHERE date(warranty_end) BETWEEN date('now') AND date('now', '+30 days')
            ORDER BY warranty_end
        ''').fetchall()
        
        # Warranty distribution by vendor
        vendor_warranty = conn.execute('''
            SELECT vendor, 
                   COUNT(*) as total,
                   SUM(CASE WHEN date(warranty_end) < date('now') THEN 1 ELSE 0 END) as expired,
                   SUM(CASE WHEN date(warranty_end) BETWEEN date('now') AND date('now', '+30 days') THEN 1 ELSE 0 END) as expiring_soon
            FROM components 
            WHERE warranty_end IS NOT NULL
            GROUP BY vendor
        ''').fetchall()
        
        conn.close()
        
        return jsonify({
            "expired_warranties": [dict(row) for row in expired],
            "expiring_soon": [dict(row) for row in expiring_soon],
            "vendor_analysis": [dict(row) for row in vendor_warranty],
            "summary": {
                "total_expired": len(expired),
                "total_expiring_soon": len(expiring_soon),
                "vendors_affected": len(vendor_warranty)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/batch/<lot_number>", methods=["GET"])
def get_batch_components(lot_number):
    """Get all components from a specific batch/lot"""
    try:
        conn = get_db_connection()
        components = conn.execute(
            'SELECT * FROM components WHERE lot_number = ?', (lot_number,)
        ).fetchall()
        conn.close()
        
        if not components:
            return jsonify({"error": "No components found for this lot number"}), 404
        
        results = []
        for comp in components:
            comp_dict = dict(comp)
            comp_dict["AI_Status"] = check_component_status(comp_dict)
            results.append(comp_dict)
        
        # Batch analysis
        total_components = len(results)
        issues = sum(1 for comp in results if comp["AI_Status"] != ["OK"])
        
        return jsonify({
            "lot_number": lot_number,
            "components": results,
            "batch_analysis": {
                "total_components": total_components,
                "components_with_issues": issues,
                "health_percentage": ((total_components - issues) / total_components * 100) if total_components > 0 else 0
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
