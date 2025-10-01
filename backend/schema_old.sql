-- RailFit Asset Management Database Schema with RUL Tracking
-- Designed for Supabase PostgreSQL
-- Created: September 2025
-- Updated: Added Remaining Useful Life (RUL) tracking system

-- ===========================================================================
-- CORE SCHEMA SETUP
-- ===========================================================================

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS asset_rul CASCADE;
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

-- 2. VENDORS TABLE (Enhanced with RUL parameters)
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB, -- Flexible JSON structure for various contact details
    warranty_terms TEXT,
    certifications TEXT[],
    degradation_rate DECIMAL(5,4) DEFAULT 0.0100, -- Daily degradation rate (1% default)
    average_life_span_days INTEGER DEFAULT 3650, -- Average asset lifespan in days (10 years default)
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

-- ===========================================================================
-- RUL (REMAINING USEFUL LIFE) TRACKING SYSTEM
-- ===========================================================================

-- 8. ASSET_RUL TABLE
CREATE TABLE asset_rul (
    rul_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    current_health_score DECIMAL(5,2) NOT NULL CHECK (current_health_score >= 0 AND current_health_score <= 100),
    degradation_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0100, -- Daily degradation rate
    predicted_rul_days INTEGER NOT NULL DEFAULT 0, -- Remaining useful life in days
    confidence_level DECIMAL(3,2) DEFAULT 0.85, -- Confidence in prediction (0-1)
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    calculation_method VARCHAR(50) DEFAULT 'linear', -- 'linear', 'exponential', 'ml_model'
    
    -- Ensure unique constraint per asset
    CONSTRAINT unique_asset_rul UNIQUE (asset_id)
);

-- ===========================================================================
-- RUL CALCULATION FUNCTIONS
-- ===========================================================================

-- Function to calculate RUL using linear degradation model
CREATE OR REPLACE FUNCTION calculate_rul_linear(
    health_score DECIMAL(5,2),
    degradation_rate DECIMAL(5,4)
) RETURNS INTEGER AS $$
BEGIN
    -- Linear RUL calculation: RUL = health_score / degradation_rate
    IF health_score <= 0 OR degradation_rate <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Calculate days until health score reaches 0
    RETURN FLOOR(health_score / degradation_rate);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate RUL with exponential degradation
CREATE OR REPLACE FUNCTION calculate_rul_exponential(
    health_score DECIMAL(5,2),
    degradation_rate DECIMAL(5,4),
    threshold DECIMAL(5,2) DEFAULT 20.0
) RETURNS INTEGER AS $$
DECLARE
    days_to_threshold INTEGER;
BEGIN
    -- Exponential decay model
    IF health_score <= threshold OR degradation_rate <= 0 THEN
        RETURN 0;
    END IF;
    
    days_to_threshold := FLOOR(LN(health_score / threshold) / degradation_rate);
    RETURN GREATEST(0, days_to_threshold);
END;
$$ LANGUAGE plpgsql;

-- Function to update RUL for a specific asset
CREATE OR REPLACE FUNCTION update_asset_rul(asset_uuid UUID) RETURNS VOID AS $$
DECLARE
    asset_health DECIMAL(5,2);
    vendor_degradation_rate DECIMAL(5,4);
    calculated_rul INTEGER;
BEGIN
    -- Get current health score and degradation rate
    SELECT a.health_score, COALESCE(v.degradation_rate, 0.0100)
    INTO asset_health, vendor_degradation_rate
    FROM assets a
    LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
    WHERE a.asset_id = asset_uuid;
    
    -- Skip if asset not found or no health score
    IF asset_health IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate RUL using linear model
    calculated_rul := calculate_rul_linear(asset_health, vendor_degradation_rate);
    
    -- Insert or update asset_rul table
    INSERT INTO asset_rul (
        asset_id, 
        current_health_score, 
        degradation_rate, 
        predicted_rul_days,
        last_updated
    ) VALUES (
        asset_uuid, 
        asset_health, 
        vendor_degradation_rate, 
        calculated_rul,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (asset_id) DO UPDATE SET
        current_health_score = EXCLUDED.current_health_score,
        degradation_rate = EXCLUDED.degradation_rate,
        predicted_rul_days = EXCLUDED.predicted_rul_days,
        last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to update RUL for all assets
CREATE OR REPLACE FUNCTION update_all_asset_rul() RETURNS INTEGER AS $$
DECLARE
    asset_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR asset_record IN SELECT asset_id FROM assets WHERE health_score IS NOT NULL LOOP
        PERFORM update_asset_rul(asset_record.asset_id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function for trigger to automatically update RUL when asset health changes
CREATE OR REPLACE FUNCTION trigger_update_asset_rul() RETURNS TRIGGER AS $$
BEGIN
    -- Update RUL when health_score changes
    IF OLD.health_score IS DISTINCT FROM NEW.health_score THEN
        PERFORM update_asset_rul(NEW.asset_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on assets table
CREATE TRIGGER assets_health_score_update_trigger
    AFTER UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_asset_rul();

-- ===========================================================================
-- ENHANCED VIEWS WITH RUL INTEGRATION
-- ===========================================================================

-- Enhanced asset summary with RUL information
CREATE OR REPLACE VIEW asset_health_rul_summary AS
SELECT 
    a.asset_id,
    a.type,
    a.location,
    a.status,
    a.condition,
    a.health_score,
    ar.predicted_rul_days,
    ar.degradation_rate,
    ar.confidence_level,
    ar.last_updated as rul_last_calculated,
    v.name as vendor_name,
    v.average_life_span_days,
    
    -- RUL categories for easy filtering
    CASE 
        WHEN ar.predicted_rul_days <= 30 THEN 'Critical (≤30 days)'
        WHEN ar.predicted_rul_days <= 90 THEN 'Warning (≤90 days)'
        WHEN ar.predicted_rul_days <= 365 THEN 'Monitor (≤1 year)'
        ELSE 'Good (>1 year)'
    END as rul_category,
    
    -- Maintenance priority based on RUL and health score
    CASE 
        WHEN ar.predicted_rul_days <= 30 OR a.health_score <= 20 THEN 'Immediate'
        WHEN ar.predicted_rul_days <= 90 OR a.health_score <= 40 THEN 'High'
        WHEN ar.predicted_rul_days <= 365 OR a.health_score <= 60 THEN 'Medium'
        ELSE 'Low'
    END as maintenance_priority,
    
    -- Calculate utilization percentage
    ROUND(
        ((v.average_life_span_days - ar.predicted_rul_days) * 100.0 / v.average_life_span_days), 
        2
    ) as utilization_percentage,
    
    COUNT(i.inspection_id) AS total_inspections,
    MAX(i.inspection_date) AS last_inspection_date,
    COUNT(al.alert_id) AS active_alerts
    
FROM assets a
LEFT JOIN asset_rul ar ON a.asset_id = ar.asset_id
LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
LEFT JOIN inspections i ON a.asset_id = i.asset_id
LEFT JOIN alerts al ON a.asset_id = al.asset_id AND al.acknowledged_at IS NULL
WHERE a.health_score IS NOT NULL
GROUP BY a.asset_id, a.type, a.location, a.status, a.condition, a.health_score, 
         ar.predicted_rul_days, ar.degradation_rate, ar.confidence_level, 
         ar.last_updated, v.name, v.average_life_span_days
ORDER BY ar.predicted_rul_days ASC;

-- RUL analytics view
CREATE OR REPLACE VIEW rul_analytics AS
SELECT 
    COUNT(*) as total_assets_tracked,
    COUNT(CASE WHEN predicted_rul_days <= 30 THEN 1 END) as critical_assets,
    COUNT(CASE WHEN predicted_rul_days <= 90 THEN 1 END) as warning_assets,
    COUNT(CASE WHEN predicted_rul_days <= 365 THEN 1 END) as monitor_assets,
    ROUND(AVG(predicted_rul_days), 0) as average_rul_days,
    ROUND(AVG(current_health_score), 2) as average_health_score,
    ROUND(AVG(confidence_level), 2) as average_confidence,
    MAX(last_updated) as last_calculation_time
FROM asset_rul;

-- ===========================================================================
-- SAMPLE DATA AND INITIALIZATION
-- ===========================================================================

-- Insert demo users
INSERT INTO users (name, email, password_hash, role) VALUES 
('System Administrator', 'admin@railfit.com', '$2b$12$Zsyxb.cHRE/gyrDSVyB9VeRaVwj71iH51x1h3WCmmXOe0kOQbo1Aa', 'admin'),
('Railway Manager', 'manager@railfit.com', '$2b$12$/cHgpBhjZb.0Of5aRxHiwOLDtQMHjfRUUCXZFXipEe6Y4eWEuV2Qq', 'manager'),
('Field Inspector', 'inspector@railfit.com', '$2b$12$gavADr5MfW788rjt/oTd2eU0XuqG94F6HMTKLPohpn3UyExkoa.BS', 'field_inspector');

-- Insert sample vendors with RUL parameters
INSERT INTO vendors (name, contact_info, warranty_terms, degradation_rate, average_life_span_days) VALUES 
('RailTech Industries', '{"phone": "+1-555-0101", "email": "contact@railtech.com"}', '24 months standard warranty', 0.0080, 4000),
('TrackMaster Corp', '{"phone": "+1-555-0102", "email": "sales@trackmaster.com"}', '36 months extended warranty', 0.0120, 3200),
('ClipCorp Solutions', '{"phone": "+1-555-0103", "email": "info@clipcorp.com"}', '18 months warranty', 0.0100, 3650),
('PadTech Industries', '{"phone": "+1-555-0104", "email": "support@padtech.com"}', '30 months warranty', 0.0090, 3800);

-- Insert sample assets with health scores
INSERT INTO assets (type, vendor_id, location, health_score, status, condition, install_date) VALUES 
('Rail Pad', (SELECT vendor_id FROM vendors WHERE name = 'RailTech Industries' LIMIT 1), 'Track Section A-1 Mile 10', 85, 'active', 'good', '2022-01-15'),
('Elastic Rail Clip', (SELECT vendor_id FROM vendors WHERE name = 'TrackMaster Corp' LIMIT 1), 'Junction Point B-3 Platform 2', 65, 'active', 'ok', '2021-06-20'),
('Sleeper', (SELECT vendor_id FROM vendors WHERE name = 'ClipCorp Solutions' LIMIT 1), 'Bridge Section C-2 Span 1', 45, 'under_maintenance', 'ok', '2020-03-10'),
('Liner', (SELECT vendor_id FROM vendors WHERE name = 'PadTech Industries' LIMIT 1), 'Tunnel Entrance D-4', 25, 'active', 'critical', '2019-11-05'),
('Rail Pad', (SELECT vendor_id FROM vendors WHERE name = 'RailTech Industries' LIMIT 1), 'Station Platform E-1', 90, 'active', 'excellent', '2023-02-28');

-- Calculate initial RUL for all assets
SELECT update_all_asset_rul() as initial_rul_calculations;

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
CREATE INDEX idx_asset_rul_asset_id ON asset_rul(asset_id);
CREATE INDEX idx_asset_rul_predicted_rul ON asset_rul(predicted_rul_days);
CREATE INDEX idx_asset_rul_last_updated ON asset_rul(last_updated);

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_rul_updated_at BEFORE UPDATE ON asset_rul
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS (Row Level Security) for all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE asset_rul DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===========================================================================
-- SUCCESS MESSAGE AND TESTING
-- ===========================================================================

SELECT 
    'RailFit Database Schema with RUL Tracking System deployed successfully!' as status,
    'Features implemented:' as features_title,
    'Core Tables: users, vendors, assets, inspections, alerts, api_integrations, photos' as core_tables,
    'RUL System: asset_rul table with automatic calculations' as rul_system,
    'Functions: calculate_rul_linear(), calculate_rul_exponential(), update_asset_rul()' as functions,
    'Views: asset_health_rul_summary, rul_analytics' as views,
    'Triggers: Automatic RUL updates when health_score changes' as triggers;

-- Display sample RUL data
SELECT 'Sample RUL Calculations:' as sample_title;
SELECT 
    type,
    location,
    health_score,
    predicted_rul_days,
    rul_category,
    maintenance_priority
FROM asset_health_rul_summary 
LIMIT 5;