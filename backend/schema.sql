-- RailFit Asset Management Database Schema (Updated)
-- Designed for Supabase PostgreSQL
-- Created: September 2025

-- Disable Row Level Security (RLS) for all tables
-- Note: In production, consider enabling RLS for better security

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS api_integrations CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS asset_type CASCADE;
DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS asset_condition CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS alert_priority CASCADE;
DROP TYPE IF EXISTS sync_type CASCADE;
DROP TYPE IF EXISTS sync_status CASCADE;

-- Create custom ENUM types with updated values
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'field_inspector');
CREATE TYPE asset_type AS ENUM ('Elastic Rail Clip', 'Rail Pad', 'Liner', 'Sleeper');
CREATE TYPE asset_status AS ENUM ('active', 'under_maintenance', 'retired', 'not_installed');
CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'ok', 'critical');
CREATE TYPE alert_type AS ENUM ('immediate_maintenance', 'predictive_failure', 'info');
CREATE TYPE alert_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE sync_type AS ENUM ('full', 'delta');
CREATE TYPE sync_status AS ENUM ('success', 'failed');

-- 1. USERS TABLE
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'field_inspector',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VENDORS TABLE
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB, -- Flexible JSON structure for various contact details
    warranty_terms TEXT,
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ASSETS TABLE (Updated with new condition column and status enum)
CREATE TABLE assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type asset_type NOT NULL,
    vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    install_date DATE,
    location VARCHAR(500),
    gps_lat DECIMAL(10, 8), -- Latitude with high precision
    gps_lng DECIMAL(11, 8), -- Longitude with high precision
    warranty_period INTEGER, -- in months
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    predicted_rul INTEGER, -- Remaining Useful Life in months
    status asset_status NOT NULL DEFAULT 'active',
    condition asset_condition NOT NULL DEFAULT 'good',
    qr_code VARCHAR(255), -- QR code identifier
    metadata JSONB, -- Additional flexible data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INSPECTIONS TABLE
CREATE TABLE inspections (
    inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    notes TEXT,
    photo_url VARCHAR(500),
    gps_lat DECIMAL(10, 8),
    gps_lng DECIMAL(11, 8),
    weather_conditions VARCHAR(255),
    temperature DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ALERTS TABLE
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    message TEXT NOT NULL,
    priority alert_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB -- Additional alert-specific data
);

-- 6. API_INTEGRATIONS (Sync Log) TABLE
CREATE TABLE api_integrations (
    integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system VARCHAR(100) NOT NULL, -- 'UDM', 'TMS', etc.
    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
    sync_type sync_type NOT NULL,
    sync_status sync_status NOT NULL,
    sync_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB -- Additional sync-specific data
);

-- 7. PHOTOS TABLE (Optional separate table for better file management)
CREATE TABLE photos (
    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES inspections(inspection_id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    filename VARCHAR(255),
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    description TEXT,
    
    -- Ensure photo belongs to either asset or inspection
    CONSTRAINT photos_reference_check CHECK (
        (asset_id IS NOT NULL AND inspection_id IS NULL) OR
        (asset_id IS NULL AND inspection_id IS NOT NULL)
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_condition ON assets(condition);
CREATE INDEX idx_assets_vendor ON assets(vendor_id);
CREATE INDEX idx_assets_location ON assets USING GIN(to_tsvector('english', location));
CREATE INDEX idx_assets_gps ON assets(gps_lat, gps_lng);
CREATE INDEX idx_inspections_asset ON inspections(asset_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
CREATE INDEX idx_alerts_asset ON alerts(asset_id);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged_at);
CREATE INDEX idx_api_integrations_asset ON api_integrations(asset_id);
CREATE INDEX idx_api_integrations_system ON api_integrations(system);
CREATE INDEX idx_photos_asset ON photos(asset_id);
CREATE INDEX idx_photos_inspection ON photos(inspection_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS (Row Level Security) for all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Insert demo users with same passwords
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@railfit.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwPQZDNwNP.J1.JGW', 'admin'),
('Manager User', 'manager@railfit.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwPQZDNwNP.J1.JGW', 'manager'),
('Field Inspector', 'inspector@railfit.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwPQZDNwNP.J1.JGW', 'field_inspector');

-- Insert sample vendors
INSERT INTO vendors (name, contact_info, warranty_terms) VALUES 
('RailTech Industries', '{"phone": "+1-555-0101", "email": "contact@railtech.com", "address": "123 Railway Ave, Industrial City"}', '24 months standard warranty with replacement guarantee'),
('TrackMaster Corp', '{"phone": "+1-555-0102", "email": "sales@trackmaster.com", "address": "456 Track Street, Metro City"}', '36 months extended warranty with on-site service'),
('ClipCorp Solutions', '{"phone": "+1-555-0103", "email": "info@clipcorp.com", "address": "789 Component Blvd, Tech Park"}', '18 months warranty with performance guarantee'),
('PadTech Industries', '{"phone": "+1-555-0104", "email": "support@padtech.com", "address": "321 Damper Road, Industrial Zone"}', '30 months warranty with maintenance support');

-- Create a view for asset summary with vendor information
CREATE OR REPLACE VIEW asset_summary AS
SELECT 
    a.asset_id,
    a.type,
    a.location,
    a.status,
    a.condition,
    a.health_score,
    a.predicted_rul,
    v.name AS vendor_name,
    COUNT(i.inspection_id) AS total_inspections,
    MAX(i.inspection_date) AS last_inspection_date,
    COUNT(al.alert_id) AS active_alerts
FROM assets a
LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
LEFT JOIN inspections i ON a.asset_id = i.asset_id
LEFT JOIN alerts al ON a.asset_id = al.asset_id AND al.acknowledged_at IS NULL
GROUP BY a.asset_id, a.type, a.location, a.status, a.condition, a.health_score, a.predicted_rul, v.name;

-- Grant permissions (adjust as needed for your Supabase setup)
-- These permissions ensure the app can read/write to all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'RailFit database schema updated successfully! New enums: asset_condition (excellent, good, ok, critical) and asset_status (active, under_maintenance, retired)' as status;


-- Create inspections table in Supabase
-- Run this SQL in your Supabase SQL editor

CREATE TABLE inspections (
  inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id VARCHAR(255) NOT NULL,
  inspector_id UUID NOT NULL,
  inspector_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  inspection_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  inspection_type VARCHAR(50) NOT NULL DEFAULT 'visual',
  result VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3,2), -- Values between 0.00 and 1.00
  notes TEXT,
  image_data TEXT, -- Base64 encoded image data
  ai_prediction JSONB, -- Store AI prediction results as JSON
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign key constraint (assuming you have a users table)
  CONSTRAINT fk_inspector_id FOREIGN KEY (inspector_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_inspections_asset_id ON inspections(asset_id);
CREATE INDEX idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX idx_inspections_result ON inspections(result);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
CREATE INDEX idx_inspections_created_at ON inspections(created_at);

-- Create RLS (Row Level Security) policies
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read inspections
CREATE POLICY "Allow authenticated users to read inspections" ON inspections
  FOR SELECT TO authenticated
  USING (true);

-- Policy: All authenticated users can create inspections
CREATE POLICY "Allow authenticated users to create inspections" ON inspections
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policy: Users can update their own inspections
CREATE POLICY "Allow users to update own inspections" ON inspections
  FOR UPDATE TO authenticated
  USING (inspector_id = auth.uid());

-- Policy: Only admin and managers can delete inspections
CREATE POLICY "Allow admin/manager to delete inspections" ON inspections
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inspections_updated_at 
  BEFORE UPDATE ON inspections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO inspections (
  asset_id,
  inspector_id,
  inspector_name,
  location,
  inspection_type,
  result,
  confidence_score,
  notes,
  ai_prediction
) VALUES 
(
  'AST-001',
  (SELECT user_id FROM users WHERE email = 'admin@railfit.com' LIMIT 1),
  'Admin User',
  'Track Section A-1',
  'ai_assisted',
  'Defective',
  0.87,
  'Visible crack detected on rail joint',
  '{"prediction": "Defective", "confidence": 0.87, "defect_probability": 0.87}'::jsonb
),
(
  'AST-002',
  (SELECT user_id FROM users WHERE email = 'inspector@railfit.com' LIMIT 1),
  'Inspector User',
  'Junction Point B-3',
  'visual',
  'Non-Defective',
  0.92,
  'All components within normal parameters',
  '{"prediction": "Non-Defective", "confidence": 0.92, "defect_probability": 0.08}'::jsonb
),
(
  'AST-003',
  (SELECT user_id FROM users WHERE email = 'manager@railfit.com' LIMIT 1),
  'Manager User',
  'Bridge Section C-2',
  'detailed',
  'Non-Defective',
  0.78,
  'Minor wear observed but within acceptable limits',
  '{"prediction": "Non-Defective", "confidence": 0.78, "defect_probability": 0.22}'::jsonb
);

-- Create view for inspection analytics
CREATE OR REPLACE VIEW inspection_analytics AS
SELECT 
  COUNT(*) as total_inspections,
  COUNT(CASE WHEN result = 'Defective' THEN 1 END) as defective_count,
  COUNT(CASE WHEN result = 'Non-Defective' THEN 1 END) as non_defective_count,
  ROUND(
    (COUNT(CASE WHEN result = 'Defective' THEN 1 END) * 100.0 / COUNT(*)), 
    2
  ) as defect_rate,
  ROUND(AVG(confidence_score), 2) as average_confidence,
  COUNT(CASE WHEN inspection_date >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_inspections_count
FROM inspections
WHERE created_at >= NOW() - INTERVAL '1 year'; -- Only count inspections from last year