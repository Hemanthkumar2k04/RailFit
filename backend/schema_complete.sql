-- RailFit Complete Database Schema
-- Comprehensive PostgreSQL/Supabase schema for railway asset management system
-- Recovered from $RJXT8WM.sql (358 lines of production-ready schema)

-- Create ENUM types for asset management
CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'ok', 'critical');
CREATE TYPE asset_status AS ENUM ('active', 'under_maintenance', 'retired');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'field_inspector');

-- Drop existing tables if they exist (for clean recreation)
DROP TABLE IF EXISTS api_integrations CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'field_inspector',
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Create vendors table
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB NOT NULL DEFAULT '{}', -- Store phone, email, address as JSON
    warranty_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create assets table
CREATE TABLE assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(100) UNIQUE NOT NULL, -- User-friendly asset code (e.g., AST-001)
    type VARCHAR(100) NOT NULL, -- rail_joint, clip, pad, etc.
    location VARCHAR(255) NOT NULL,
    gps_lat DECIMAL(10, 8),
    gps_lng DECIMAL(11, 8),
    status asset_status NOT NULL DEFAULT 'active',
    condition asset_condition NOT NULL DEFAULT 'good',
    health_score DECIMAL(3, 2) DEFAULT 0.75 CHECK (health_score >= 0 AND health_score <= 1),
    predicted_rul INTEGER DEFAULT 365, -- Remaining Useful Life in days
    vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    installation_date DATE,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}' -- Additional flexible data storage
);

-- Create inspections table
CREATE TABLE inspections (
    inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    inspection_type VARCHAR(50) NOT NULL DEFAULT 'visual' CHECK (inspection_type IN ('visual', 'detailed', 'ai_assisted')),
    result VARCHAR(50) NOT NULL CHECK (result IN ('Defective', 'Non-Defective', 'Needs_Review')),
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    notes TEXT,
    image_data TEXT, -- Base64 encoded image data
    ai_prediction JSONB, -- Store AI prediction results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Create api_integrations table for external system connections
CREATE TABLE api_integrations (
    integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
    system VARCHAR(100) NOT NULL, -- 'sap', 'oracle', 'custom', etc.
    external_id VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(500),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    UNIQUE(system, external_id)
);

-- Create alerts table
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('immediate_maintenance', 'predictive_failure', 'info')),
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Create photos table
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

-- Enable RLS (Row Level Security) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inspections
CREATE POLICY "Allow authenticated users to read inspections" ON inspections
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create inspections" ON inspections
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update own inspections" ON inspections
  FOR UPDATE TO authenticated
  USING (inspector_id = auth.uid());

CREATE POLICY "Allow admin/manager to delete inspections" ON inspections
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Insert demo users with same passwords (password: "password123")
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
WHERE created_at >= NOW() - INTERVAL '1 year';

-- Grant permissions for Supabase
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'RailFit database schema created successfully! Complete with 7 tables, indexes, triggers, RLS policies, and sample data.' as status;