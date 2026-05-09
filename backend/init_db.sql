-- RailFit Asset Management Database Schema with RUL Tracking
-- Designed for Supabase PostgreSQL
-- Created: September 2025
-- Updated: Added Remaining Useful Life (RUL) tracking system

-- ===========================================================================
-- CORE SCHEMA SETUP
-- ===========================================================================

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

-- 2. VENDORS TABLE (Enhanced with RUL parameters)
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB DEFAULT '{}'::jsonb, -- Flexible JSON structure for various contact details
    warranty_terms TEXT,
    certifications TEXT[],
    degradation_rate DECIMAL(5,4) DEFAULT 0.0100, -- Daily degradation rate (1% default)
    average_life_span_days INTEGER DEFAULT 3650, -- Average asset lifespan in days (10 years default)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ASSETS TABLE (Updated with new condition, region, predicted_rul)
CREATE TABLE assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type asset_type NOT NULL,
    vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    install_date DATE,
    location VARCHAR(500),
    region VARCHAR(100),
    gps_lat DECIMAL(10, 8), -- Latitude with high precision
    gps_lng DECIMAL(11, 8), -- Longitude with high precision
    warranty_period INTEGER, -- in months
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    predicted_rul INTEGER, -- Remaining Useful Life in months
    status asset_status NOT NULL DEFAULT 'active',
    condition asset_condition NOT NULL DEFAULT 'good',
    qr_code VARCHAR(255), -- QR code identifier
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional flexible data
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
-- Mock Alert Data for RailFit System
-- This script inserts sample alert records into the alerts table
-- Make sure to run this after you have assets in your database

-- First, check how many assets we have
DO $$
DECLARE
    asset_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO asset_count FROM assets;
    IF asset_count = 0 THEN
        RAISE EXCEPTION 'No assets found in database. Please insert assets first.';
    END IF;
    RAISE NOTICE 'Found % assets in database', asset_count;
END $$;

-- Insert mock alerts with different priorities and types
-- This version uses COALESCE to fall back to any asset if specific types don't exist

INSERT INTO alerts (asset_id, type, message, priority, acknowledged_by, acknowledged_at, resolved_at, metadata)
VALUES
-- Critical alerts (unresolved)
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Elastic Rail Clip' LIMIT 1 OFFSET 0),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 0)
    ),
    'immediate_maintenance',
    'Health score dropped below 30%. Replacement recommended immediately.',
    'high',
    NULL,
    NULL,
    NULL,
    '{"sensor_reading": 28, "threshold": 30, "location_details": "Platform 3, Section A"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Rail Pad' LIMIT 1 OFFSET 0),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 1)
    ),
    'immediate_maintenance',
    'Severe wear detected. Risk of failure imminent.',
    'high',
    NULL,
    NULL,
    NULL,
    '{"wear_level": 85, "max_wear": 80, "inspection_id": "INS-2024-001"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Liner' LIMIT 1 OFFSET 0),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 2)
    ),
    'immediate_maintenance',
    'RUL below critical threshold. Immediate maintenance required.',
    'high',
    NULL,
    NULL,
    NULL,
    '{"rul_days": 5, "critical_threshold": 7, "priority_level": "urgent"}'::jsonb
),

-- Predictive failure alerts (medium priority)
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Elastic Rail Clip' LIMIT 1 OFFSET 1),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 3)
    ),
    'predictive_failure',
    'Anomaly detected in vibration pattern during last inspection.',
    'medium',
    NULL,
    NULL,
    NULL,
    '{"vibration_level": 7.5, "normal_range": "3-6", "deviation": "25%"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Sleeper' LIMIT 1 OFFSET 0),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 4)
    ),
    'predictive_failure',
    'Predicted failure in next 30 days based on current degradation rate.',
    'medium',
    NULL,
    NULL,
    NULL,
    '{"predicted_failure_date": "2025-11-01", "confidence": 0.87, "model_version": "v2.3"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Rail Pad' LIMIT 1 OFFSET 1),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 5)
    ),
    'predictive_failure',
    'Warranty expires in 15 days. Schedule preventive inspection.',
    'medium',
    NULL,
    NULL,
    NULL,
    '{"warranty_end_date": "2025-10-17", "days_remaining": 15, "vendor_contact": "warranty@vendor.com"}'::jsonb
),

-- Info alerts (low priority)
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Elastic Rail Clip' LIMIT 1 OFFSET 2),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 6)
    ),
    'info',
    'Scheduled maintenance due in 7 days.',
    'low',
    NULL,
    NULL,
    NULL,
    '{"next_maintenance": "2025-10-09", "maintenance_type": "routine", "estimated_duration": "2h"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Liner' LIMIT 1 OFFSET 1),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 7)
    ),
    'info',
    'New firmware update available for connected sensors.',
    'low',
    NULL,
    NULL,
    NULL,
    '{"firmware_version": "v3.1.2", "release_date": "2025-10-01", "update_size": "2.4MB"}'::jsonb
),

-- Acknowledged but not resolved
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Rail Pad' LIMIT 1 OFFSET 2),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 8)
    ),
    'immediate_maintenance',
    'Crack detected in mounting bracket. Investigation in progress.',
    'high',
    (SELECT user_id FROM users WHERE role = 'field_inspector' LIMIT 1),
    NOW() - INTERVAL '2 hours',
    NULL,
    '{"crack_size": "15mm", "location": "mounting_point_b", "inspector": "Field Team A"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Sleeper' LIMIT 1 OFFSET 1),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 9)
    ),
    'predictive_failure',
    'Unusual load distribution pattern detected.',
    'medium',
    (SELECT user_id FROM users WHERE role = 'manager' LIMIT 1),
    NOW() - INTERVAL '1 day',
    NULL,
    '{"load_variance": 18, "normal_variance": 10, "measurement_date": "2025-10-01"}'::jsonb
),

-- Resolved alerts (for history)
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Elastic Rail Clip' LIMIT 1 OFFSET 3),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 10)
    ),
    'predictive_failure',
    'Minor misalignment detected and corrected.',
    'medium',
    (SELECT user_id FROM users WHERE role = 'field_inspector' LIMIT 1),
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    '{"misalignment": "2mm", "correction_applied": true, "follow_up_required": false}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Rail Pad' LIMIT 1 OFFSET 3),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 11)
    ),
    'info',
    'Routine inspection completed successfully.',
    'low',
    (SELECT user_id FROM users WHERE role = 'field_inspector' LIMIT 1),
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    '{"inspection_result": "pass", "next_inspection": "2025-11-15", "notes": "All parameters within range"}'::jsonb
),

-- Additional critical alerts
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Liner' LIMIT 1 OFFSET 2),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 12)
    ),
    'immediate_maintenance',
    'Temperature sensor reading abnormally high.',
    'high',
    NULL,
    NULL,
    NULL,
    '{"temperature": 85, "normal_range": "20-60", "sensor_id": "TEMP-445"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Sleeper' LIMIT 1 OFFSET 2),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 13)
    ),
    'immediate_maintenance',
    'Structural integrity compromised. Immediate replacement needed.',
    'high',
    NULL,
    NULL,
    NULL,
    '{"integrity_score": 25, "min_safe_score": 50, "risk_level": "critical"}'::jsonb
),

-- More predictive alerts
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Elastic Rail Clip' LIMIT 1 OFFSET 4),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 14)
    ),
    'predictive_failure',
    'Corrosion detected in early stages. Monitor closely.',
    'medium',
    NULL,
    NULL,
    NULL,
    '{"corrosion_level": 2, "max_level": 5, "environment": "high_humidity"}'::jsonb
),
(
    COALESCE(
        (SELECT asset_id FROM assets WHERE type = 'Rail Pad' LIMIT 1 OFFSET 4),
        (SELECT asset_id FROM assets LIMIT 1 OFFSET 15)
    ),
    'predictive_failure',
    'Stress test indicates potential weakness developing.',
    'medium',
    NULL,
    NULL,
    NULL,
    '{"stress_threshold": 0.78, "current_stress": 0.82, "tolerance": 0.05}'::jsonb
);

-- Verify the inserted data
SELECT 
    a.alert_id,
    ast.type as asset_type,
    a.type as alert_type,
    a.priority,
    a.message,
    CASE 
        WHEN a.resolved_at IS NOT NULL THEN 'Resolved'
        WHEN a.acknowledged_at IS NOT NULL THEN 'Acknowledged'
        ELSE 'New'
    END as status,
    a.created_at
FROM alerts a
JOIN assets ast ON a.asset_id = ast.asset_id
ORDER BY 
    CASE a.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
    END,
    a.created_at DESC;
