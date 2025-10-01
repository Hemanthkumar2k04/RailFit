-- ============================================================================-- RailFit Asset Management Database Schema with RUL Tracking

-- RailFit Complete Database Schema-- Designed for Supabase PostgreSQL

-- Comprehensive PostgreSQL/Supabase schema for railway asset management system-- Created: September 2025

-- Version: 2.0 - Consolidated Schema with Region Support-- Updated: Added Remaining Useful Life (RUL) tracking system

-- Created: October 2025

-- ============================================================================-- ===========================================================================

-- CORE SCHEMA SETUP

-- Drop existing tables and types for clean installation-- ===========================================================================

DROP TABLE IF EXISTS asset_rul CASCADE;

DROP TABLE IF EXISTS photos CASCADE;-- Drop tables if they exist (for clean reinstall)

DROP TABLE IF EXISTS api_integrations CASCADE;DROP TABLE IF EXISTS asset_rul CASCADE;

DROP TABLE IF EXISTS alerts CASCADE;DROP TABLE IF EXISTS photos CASCADE;

DROP TABLE IF EXISTS inspections CASCADE;DROP TABLE IF EXISTS api_integrations CASCADE;

DROP TABLE IF EXISTS assets CASCADE;DROP TABLE IF EXISTS alerts CASCADE;

DROP TABLE IF EXISTS vendors CASCADE;DROP TABLE IF EXISTS inspections CASCADE;

DROP TABLE IF EXISTS users CASCADE;DROP TABLE IF EXISTS assets CASCADE;

DROP TABLE IF EXISTS vendors CASCADE;

-- Drop custom types if they existDROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;

DROP TYPE IF EXISTS asset_type CASCADE;-- Drop custom types if they exist

DROP TYPE IF EXISTS asset_status CASCADE;DROP TYPE IF EXISTS user_role CASCADE;

DROP TYPE IF EXISTS asset_condition CASCADE;DROP TYPE IF EXISTS asset_type CASCADE;

DROP TYPE IF EXISTS alert_type CASCADE;DROP TYPE IF EXISTS asset_status CASCADE;

DROP TYPE IF EXISTS alert_priority CASCADE;DROP TYPE IF EXISTS asset_condition CASCADE;

DROP TYPE IF EXISTS sync_type CASCADE;DROP TYPE IF EXISTS alert_type CASCADE;

DROP TYPE IF EXISTS sync_status CASCADE;DROP TYPE IF EXISTS alert_priority CASCADE;

DROP TYPE IF EXISTS sync_type CASCADE;

-- ============================================================================DROP TYPE IF EXISTS sync_status CASCADE;

-- ENUM TYPES

-- ============================================================================-- Create custom ENUM types with updated values

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'field_inspector');

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'field_inspector');CREATE TYPE asset_type AS ENUM ('Elastic Rail Clip', 'Rail Pad', 'Liner', 'Sleeper');

CREATE TYPE asset_type AS ENUM ('Elastic Rail Clip', 'Rail Pad', 'Liner', 'Sleeper');CREATE TYPE asset_status AS ENUM ('active', 'under_maintenance', 'retired', 'not_installed');

CREATE TYPE asset_status AS ENUM ('active', 'under_maintenance', 'retired', 'not_installed');CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'ok', 'critical');

CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'ok', 'critical');CREATE TYPE alert_type AS ENUM ('immediate_maintenance', 'predictive_failure', 'info');

CREATE TYPE alert_type AS ENUM ('immediate_maintenance', 'predictive_failure', 'info');CREATE TYPE alert_priority AS ENUM ('high', 'medium', 'low');

CREATE TYPE alert_priority AS ENUM ('high', 'medium', 'low');CREATE TYPE sync_type AS ENUM ('full', 'delta');

CREATE TYPE sync_type AS ENUM ('full', 'delta');CREATE TYPE sync_status AS ENUM ('success', 'failed');

CREATE TYPE sync_status AS ENUM ('success', 'failed');

-- 1. USERS TABLE

-- ============================================================================CREATE TABLE users (

-- TABLES    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

-- ============================================================================    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

-- 1. USERS TABLE    password_hash VARCHAR(255) NOT NULL,

CREATE TABLE users (    role user_role NOT NULL DEFAULT 'field_inspector',

    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    name VARCHAR(255) NOT NULL,    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    email VARCHAR(255) UNIQUE NOT NULL,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    password_hash VARCHAR(255) NOT NULL,);

    role user_role NOT NULL DEFAULT 'field_inspector',

    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,-- 2. VENDORS TABLE (Enhanced with RUL parameters)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,CREATE TABLE vendors (

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

);    name VARCHAR(255) NOT NULL,

    contact_info JSONB, -- Flexible JSON structure for various contact details

-- 2. VENDORS TABLE    warranty_terms TEXT,

CREATE TABLE vendors (    certifications TEXT[],

    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    degradation_rate DECIMAL(5,4) DEFAULT 0.0100, -- Daily degradation rate (1% default)

    name VARCHAR(255) NOT NULL,    average_life_span_days INTEGER DEFAULT 3650, -- Average asset lifespan in days (10 years default)

    contact_info JSONB DEFAULT '{}'::jsonb, -- {phone, email, address, website}    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    warranty_terms TEXT,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    certifications TEXT[],);

    degradation_rate DECIMAL(5,4) DEFAULT 0.0100, -- Daily degradation rate

    average_life_span_days INTEGER DEFAULT 3650, -- Average asset lifespan in days-- 3. ASSETS TABLE (Updated with new condition column and status enum)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,CREATE TABLE assets (

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

);    type asset_type NOT NULL,

    vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,

-- 3. ASSETS TABLE (Main table with all asset information)    install_date DATE,

CREATE TABLE assets (    location VARCHAR(500),

    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    gps_lat DECIMAL(10, 8), -- Latitude with high precision

    type asset_type NOT NULL,    gps_lng DECIMAL(11, 8), -- Longitude with high precision

    vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,    warranty_period INTEGER, -- in months

    install_date DATE,    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),

    location VARCHAR(500),    predicted_rul INTEGER, -- Remaining Useful Life in months

    region VARCHAR(100), -- Railway region (e.g., Northern Railway, Southern Railway)    status asset_status NOT NULL DEFAULT 'active',

    gps_lat DECIMAL(10, 8), -- Latitude    condition asset_condition NOT NULL DEFAULT 'good',

    gps_lng DECIMAL(11, 8), -- Longitude    qr_code VARCHAR(255), -- QR code identifier

    warranty_period INTEGER, -- in months    metadata JSONB, -- Additional flexible data

    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    predicted_rul INTEGER, -- Remaining Useful Life in months    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    status asset_status NOT NULL DEFAULT 'active',);

    condition asset_condition NOT NULL DEFAULT 'good',

    qr_code VARCHAR(255), -- QR code identifier-- 4. INSPECTIONS TABLE

    metadata JSONB DEFAULT '{}'::jsonb, -- Flexible JSON for additional dataCREATE TABLE inspections (

    -- Metadata should contain: model, serial_number, manufacturer, description,    inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- last_inspection, next_maintenance, maintenance_schedule, warranty_expiry,    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,

    -- purchase_cost, technical_specs, etc.    inspector_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP    notes TEXT,

);    photo_url VARCHAR(500),

    gps_lat DECIMAL(10, 8),

-- 4. INSPECTIONS TABLE    gps_lng DECIMAL(11, 8),

CREATE TABLE inspections (    weather_conditions VARCHAR(255),

    inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    temperature DECIMAL(5, 2),

    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    inspector_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,);

    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),

    notes TEXT,-- 5. ALERTS TABLE

    photo_url VARCHAR(500),CREATE TABLE alerts (

    gps_lat DECIMAL(10, 8),    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    gps_lng DECIMAL(11, 8),    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,

    weather_conditions VARCHAR(255),    type alert_type NOT NULL,

    temperature DECIMAL(5, 2),    message TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,    priority alert_priority NOT NULL DEFAULT 'medium',

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

);    acknowledged_by UUID REFERENCES users(user_id) ON DELETE SET NULL,

    acknowledged_at TIMESTAMP WITH TIME ZONE,

-- 5. ALERTS TABLE    resolved_at TIMESTAMP WITH TIME ZONE,

CREATE TABLE alerts (    metadata JSONB -- Additional alert-specific data

    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),);

    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,

    type alert_type NOT NULL,-- 6. API_INTEGRATIONS (Sync Log) TABLE

    message TEXT NOT NULL,CREATE TABLE api_integrations (

    priority alert_priority NOT NULL DEFAULT 'medium',    integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,    system VARCHAR(100) NOT NULL, -- 'UDM', 'TMS', etc.

    acknowledged_by UUID REFERENCES users(user_id) ON DELETE SET NULL,    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,

    acknowledged_at TIMESTAMP WITH TIME ZONE,    sync_type sync_type NOT NULL,

    resolved_at TIMESTAMP WITH TIME ZONE,    sync_status sync_status NOT NULL,

    metadata JSONB DEFAULT '{}'::jsonb    sync_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

);    records_processed INTEGER DEFAULT 0,

    error_message TEXT,

-- 6. API_INTEGRATIONS (Sync Log) TABLE    metadata JSONB -- Additional sync-specific data

CREATE TABLE api_integrations ();

    integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    system VARCHAR(100) NOT NULL, -- 'UDM', 'TMS', etc.-- 7. PHOTOS TABLE (Optional separate table for better file management)

    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,CREATE TABLE photos (

    sync_type sync_type NOT NULL,    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sync_status sync_status NOT NULL,    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,

    sync_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,    inspection_id UUID REFERENCES inspections(inspection_id) ON DELETE CASCADE,

    records_processed INTEGER DEFAULT 0,    url VARCHAR(500) NOT NULL,

    error_message TEXT,    filename VARCHAR(255),

    metadata JSONB DEFAULT '{}'::jsonb    file_size INTEGER, -- in bytes

);    mime_type VARCHAR(100),

    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- 7. PHOTOS TABLE    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,

CREATE TABLE photos (    description TEXT,

    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    

    asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,    -- Ensure photo belongs to either asset or inspection

    inspection_id UUID REFERENCES inspections(inspection_id) ON DELETE CASCADE,    CONSTRAINT photos_reference_check CHECK (

    url VARCHAR(500) NOT NULL,        (asset_id IS NOT NULL AND inspection_id IS NULL) OR

    filename VARCHAR(255),        (asset_id IS NULL AND inspection_id IS NOT NULL)

    file_size INTEGER, -- in bytes    )

    mime_type VARCHAR(100),);

    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,-- Create indexes for better query performance

    description TEXT,CREATE INDEX idx_users_email ON users(email);

    CREATE INDEX idx_users_role ON users(role);

    -- Ensure photo belongs to either asset or inspectionCREATE INDEX idx_assets_type ON assets(type);

    CONSTRAINT photos_reference_check CHECK (CREATE INDEX idx_assets_status ON assets(status);

        (asset_id IS NOT NULL AND inspection_id IS NULL) ORCREATE INDEX idx_assets_condition ON assets(condition);

        (asset_id IS NULL AND inspection_id IS NOT NULL)CREATE INDEX idx_assets_vendor ON assets(vendor_id);

    )CREATE INDEX idx_assets_location ON assets USING GIN(to_tsvector('english', location));

);CREATE INDEX idx_assets_gps ON assets(gps_lat, gps_lng);

CREATE INDEX idx_inspections_asset ON inspections(asset_id);

-- ============================================================================CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);

-- INDEXES FOR PERFORMANCECREATE INDEX idx_inspections_date ON inspections(inspection_date);

-- ============================================================================CREATE INDEX idx_alerts_asset ON alerts(asset_id);

CREATE INDEX idx_alerts_priority ON alerts(priority);

-- Users indexesCREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged_at);

CREATE INDEX idx_users_email ON users(email);CREATE INDEX idx_api_integrations_asset ON api_integrations(asset_id);

CREATE INDEX idx_users_role ON users(role);CREATE INDEX idx_api_integrations_system ON api_integrations(system);

CREATE INDEX idx_photos_asset ON photos(asset_id);

-- Vendors indexesCREATE INDEX idx_photos_inspection ON photos(inspection_id);

CREATE INDEX idx_vendors_name ON vendors(name);

-- Create updated_at trigger function

-- Assets indexesCREATE OR REPLACE FUNCTION update_updated_at_column()

CREATE INDEX idx_assets_type ON assets(type);RETURNS TRIGGER AS $$

CREATE INDEX idx_assets_status ON assets(status);BEGIN

CREATE INDEX idx_assets_condition ON assets(condition);    NEW.updated_at = CURRENT_TIMESTAMP;

CREATE INDEX idx_assets_vendor ON assets(vendor_id);    RETURN NEW;

CREATE INDEX idx_assets_region ON assets(region);END;

CREATE INDEX idx_assets_location ON assets USING GIN(to_tsvector('english', location));$$ language 'plpgsql';

CREATE INDEX idx_assets_gps ON assets(gps_lat, gps_lng);

CREATE INDEX idx_assets_health_score ON assets(health_score);-- Add updated_at triggers to relevant tables

CREATE INDEX idx_assets_predicted_rul ON assets(predicted_rul);CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users

CREATE INDEX idx_assets_qr_code ON assets(qr_code);    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- Inspections indexesCREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors

CREATE INDEX idx_inspections_asset ON inspections(asset_id);    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);

CREATE INDEX idx_inspections_date ON inspections(inspection_date);CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets

    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Alerts indexes

CREATE INDEX idx_alerts_asset ON alerts(asset_id);CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections

CREATE INDEX idx_alerts_priority ON alerts(priority);    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged_at);

CREATE INDEX idx_alerts_created ON alerts(created_at);-- Disable RLS (Row Level Security) for all tables

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- API Integrations indexesALTER TABLE vendors DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_api_integrations_asset ON api_integrations(asset_id);ALTER TABLE assets DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_api_integrations_system ON api_integrations(system);ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_api_integrations_sync_time ON api_integrations(sync_time);ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

ALTER TABLE api_integrations DISABLE ROW LEVEL SECURITY;

-- Photos indexesALTER TABLE photos DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_photos_asset ON photos(asset_id);

CREATE INDEX idx_photos_inspection ON photos(inspection_id);-- Insert demo users with same passwords

INSERT INTO users (name, email, password_hash, role) VALUES 

-- ============================================================================('Admin User', 'admin@railfit.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwPQZDNwNP.J1.JGW', 'admin'),

-- TRIGGERS AND FUNCTIONS('Manager User', 'manager@railfit.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwPQZDNwNP.J1.JGW', 'manager'),

-- ============================================================================('Field Inspector', 'inspector@railfit.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwPQZDNwNP.J1.JGW', 'field_inspector');



-- Update timestamp trigger function-- Insert sample vendors

CREATE OR REPLACE FUNCTION update_updated_at_column()INSERT INTO vendors (name, contact_info, warranty_terms) VALUES 

RETURNS TRIGGER AS $$('RailTech Industries', '{"phone": "+1-555-0101", "email": "contact@railtech.com", "address": "123 Railway Ave, Industrial City"}', '24 months standard warranty with replacement guarantee'),

BEGIN('TrackMaster Corp', '{"phone": "+1-555-0102", "email": "sales@trackmaster.com", "address": "456 Track Street, Metro City"}', '36 months extended warranty with on-site service'),

    NEW.updated_at = CURRENT_TIMESTAMP;('ClipCorp Solutions', '{"phone": "+1-555-0103", "email": "info@clipcorp.com", "address": "789 Component Blvd, Tech Park"}', '18 months warranty with performance guarantee'),

    RETURN NEW;('PadTech Industries', '{"phone": "+1-555-0104", "email": "support@padtech.com", "address": "321 Damper Road, Industrial Zone"}', '30 months warranty with maintenance support');

END;

$$ LANGUAGE plpgsql;-- Create a view for asset summary with vendor information

CREATE OR REPLACE VIEW asset_summary AS

-- Apply updated_at triggers to relevant tablesSELECT 

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users    a.asset_id,

    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    a.type,

    a.location,

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors    a.status,

    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    a.condition,

    a.health_score,

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets    a.predicted_rul,

    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    v.name AS vendor_name,

    COUNT(i.inspection_id) AS total_inspections,

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections    MAX(i.inspection_date) AS last_inspection_date,

    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    COUNT(al.alert_id) AS active_alerts

FROM assets a

-- ============================================================================LEFT JOIN vendors v ON a.vendor_id = v.vendor_id

-- VIEWS FOR ANALYTICS AND REPORTINGLEFT JOIN inspections i ON a.asset_id = i.asset_id

-- ============================================================================LEFT JOIN alerts al ON a.asset_id = al.asset_id AND al.acknowledged_at IS NULL

GROUP BY a.asset_id, a.type, a.location, a.status, a.condition, a.health_score, a.predicted_rul, v.name;

-- Asset health summary view with vendor information

CREATE OR REPLACE VIEW asset_health_summary AS-- ===========================================================================

SELECT -- RUL (REMAINING USEFUL LIFE) TRACKING SYSTEM

    a.asset_id,-- ===========================================================================

    a.type,

    a.location,-- 8. ASSET_RUL TABLE

    a.region,CREATE TABLE asset_rul (

    a.status,    rul_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    a.condition,    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,

    a.health_score,    current_health_score DECIMAL(5,2) NOT NULL CHECK (current_health_score >= 0 AND current_health_score <= 100),

    a.predicted_rul,    degradation_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0100, -- Daily degradation rate

    a.install_date,    predicted_rul_days INTEGER NOT NULL DEFAULT 0, -- Remaining useful life in days

    a.qr_code,    confidence_level DECIMAL(3,2) DEFAULT 0.85, -- Confidence in prediction (0-1)

    v.name as vendor_name,    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    v.contact_info as vendor_contact,    calculation_method VARCHAR(50) DEFAULT 'linear', -- 'linear', 'exponential', 'ml_model'

    v.warranty_terms,    

    -- Extract metadata fields    -- Ensure unique constraint per asset

    a.metadata->>'model' as model,    CONSTRAINT unique_asset_rul UNIQUE (asset_id)

    a.metadata->>'serial_number' as serial_number,);

    a.metadata->>'manufacturer' as manufacturer,

    a.metadata->>'description' as description,-- ===========================================================================

    -- Maintenance info-- RUL CALCULATION FUNCTIONS

    (a.metadata->>'last_inspection')::date as last_inspection,-- ===========================================================================

    (a.metadata->>'next_maintenance')::date as next_maintenance,

    a.metadata->>'maintenance_schedule' as maintenance_schedule,-- Function to calculate RUL using linear degradation model

    -- FinancialCREATE OR REPLACE FUNCTION calculate_rul_linear(

    (a.metadata->>'purchase_cost')::numeric as purchase_cost,    health_score DECIMAL(5,2),

    -- Calculated fields    degradation_rate DECIMAL(5,4)

    CASE ) RETURNS INTEGER AS $$

        WHEN a.predicted_rul IS NULL THEN 'Not Calculated'BEGIN

        WHEN a.predicted_rul <= 1 THEN 'Critical (≤1 month)'    -- Linear RUL calculation: RUL = health_score / degradation_rate

        WHEN a.predicted_rul <= 3 THEN 'Warning (≤3 months)'    IF health_score <= 0 OR degradation_rate <= 0 THEN

        WHEN a.predicted_rul <= 12 THEN 'Monitor (≤1 year)'        RETURN 0;

        ELSE 'Good (>1 year)'    END IF;

    END as rul_category,    

    CASE     -- Calculate days until health score reaches 0

        WHEN a.predicted_rul IS NULL THEN 'Unknown'    RETURN FLOOR(health_score / degradation_rate);

        WHEN a.predicted_rul <= 1 OR a.health_score <= 20 THEN 'Immediate'END;

        WHEN a.predicted_rul <= 3 OR a.health_score <= 40 THEN 'High'$$ LANGUAGE plpgsql;

        WHEN a.predicted_rul <= 12 OR a.health_score <= 60 THEN 'Medium'

        ELSE 'Low'-- Function to calculate RUL with exponential degradation

    END as maintenance_priority,CREATE OR REPLACE FUNCTION calculate_rul_exponential(

    CASE     health_score DECIMAL(5,2),

        WHEN a.install_date IS NOT NULL THEN    degradation_rate DECIMAL(5,4),

            (CURRENT_DATE - a.install_date)::INTEGER    threshold DECIMAL(5,2) DEFAULT 20.0

        ELSE NULL) RETURNS INTEGER AS $$

    END as days_in_service,DECLARE

    a.created_at,    days_to_threshold INTEGER;

    a.updated_atBEGIN

FROM assets a    -- Exponential decay model

LEFT JOIN vendors v ON a.vendor_id = v.vendor_id    IF health_score <= threshold OR degradation_rate <= 0 THEN

ORDER BY         RETURN 0;

    CASE WHEN a.predicted_rul IS NULL THEN 999999 ELSE a.predicted_rul END ASC,    END IF;

    a.health_score ASC;    

    days_to_threshold := FLOOR(LN(health_score / threshold) / degradation_rate);

-- System analytics view    RETURN GREATEST(0, days_to_threshold);

CREATE OR REPLACE VIEW system_analytics ASEND;

SELECT $$ LANGUAGE plpgsql;

    -- Asset counts

    COUNT(*) as total_assets,-- Function to update RUL for a specific asset

    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_assets,CREATE OR REPLACE FUNCTION update_asset_rul(asset_uuid UUID) RETURNS VOID AS $$

    COUNT(CASE WHEN status = 'under_maintenance' THEN 1 END) as maintenance_assets,DECLARE

    COUNT(CASE WHEN status = 'retired' THEN 1 END) as retired_assets,    asset_health DECIMAL(5,2);

    COUNT(CASE WHEN status = 'not_installed' THEN 1 END) as not_installed_assets,    vendor_degradation_rate DECIMAL(5,4);

        calculated_rul INTEGER;

    -- Condition distributionBEGIN

    COUNT(CASE WHEN condition = 'excellent' THEN 1 END) as excellent_condition,    -- Get current health score and degradation rate

    COUNT(CASE WHEN condition = 'good' THEN 1 END) as good_condition,    SELECT a.health_score, COALESCE(v.degradation_rate, 0.0100)

    COUNT(CASE WHEN condition = 'ok' THEN 1 END) as ok_condition,    INTO asset_health, vendor_degradation_rate

    COUNT(CASE WHEN condition = 'critical' THEN 1 END) as critical_condition,    FROM assets a

        LEFT JOIN vendors v ON a.vendor_id = v.vendor_id

    -- Health metrics    WHERE a.asset_id = asset_uuid;

    ROUND(AVG(health_score), 2) as avg_health_score,    

    ROUND(AVG(predicted_rul), 1) as avg_rul_months,    -- Skip if asset not found or no health score

        IF asset_health IS NULL THEN

    -- RUL distribution        RETURN;

    COUNT(CASE WHEN predicted_rul <= 1 THEN 1 END) as critical_rul_assets,    END IF;

    COUNT(CASE WHEN predicted_rul <= 3 THEN 1 END) as warning_rul_assets,    

    COUNT(CASE WHEN predicted_rul <= 12 THEN 1 END) as monitor_rul_assets,    -- Calculate RUL using linear model

        calculated_rul := calculate_rul_linear(asset_health, vendor_degradation_rate);

    -- Type distribution    

    COUNT(CASE WHEN type = 'Elastic Rail Clip' THEN 1 END) as elastic_rail_clips,    -- Insert or update asset_rul table

    COUNT(CASE WHEN type = 'Rail Pad' THEN 1 END) as rail_pads,    INSERT INTO asset_rul (

    COUNT(CASE WHEN type = 'Liner' THEN 1 END) as liners,        asset_id, 

    COUNT(CASE WHEN type = 'Sleeper' THEN 1 END) as sleepers        current_health_score, 

FROM assets;        degradation_rate, 

        predicted_rul_days,

-- Vendor performance view        last_updated

CREATE OR REPLACE VIEW vendor_performance AS    ) VALUES (

SELECT         asset_uuid, 

    v.vendor_id,        asset_health, 

    v.name as vendor_name,        vendor_degradation_rate, 

    v.degradation_rate,        calculated_rul,

    v.average_life_span_days,        CURRENT_TIMESTAMP

    COUNT(a.asset_id) as total_assets,    )

    ROUND(AVG(a.health_score), 2) as avg_health_score,    ON CONFLICT (asset_id) DO UPDATE SET

    ROUND(AVG(a.predicted_rul), 1) as avg_rul_months,        current_health_score = EXCLUDED.current_health_score,

    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_assets,        degradation_rate = EXCLUDED.degradation_rate,

    COUNT(CASE WHEN a.condition = 'critical' THEN 1 END) as critical_assets,        predicted_rul_days = EXCLUDED.predicted_rul_days,

    COUNT(CASE WHEN a.predicted_rul <= 3 THEN 1 END) as assets_needing_attention        last_updated = CURRENT_TIMESTAMP;

FROM vendors vEND;

LEFT JOIN assets a ON v.vendor_id = a.vendor_id$$ LANGUAGE plpgsql;

GROUP BY v.vendor_id, v.name, v.degradation_rate, v.average_life_span_days

HAVING COUNT(a.asset_id) > 0-- Function to update RUL for all assets

ORDER BY avg_health_score DESC;CREATE OR REPLACE FUNCTION update_all_asset_rul() RETURNS INTEGER AS $$

DECLARE

-- Regional statistics view    asset_record RECORD;

CREATE OR REPLACE VIEW regional_statistics AS    updated_count INTEGER := 0;

SELECT BEGIN

    region,    FOR asset_record IN SELECT asset_id FROM assets WHERE health_score IS NOT NULL LOOP

    COUNT(*) as total_assets,        PERFORM update_asset_rul(asset_record.asset_id);

    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_assets,        updated_count := updated_count + 1;

    COUNT(CASE WHEN condition = 'critical' THEN 1 END) as critical_assets,    END LOOP;

    ROUND(AVG(health_score), 2) as avg_health_score,    

    COUNT(CASE WHEN predicted_rul <= 3 THEN 1 END) as urgent_maintenance_needed    RETURN updated_count;

FROM assetsEND;

WHERE region IS NOT NULL$$ LANGUAGE plpgsql;

GROUP BY region

ORDER BY critical_assets DESC, avg_health_score ASC;-- Function for trigger to automatically update RUL when asset health changes

CREATE OR REPLACE FUNCTION trigger_update_asset_rul() RETURNS TRIGGER AS $$

-- ============================================================================BEGIN

-- ROW LEVEL SECURITY (RLS)    -- Update RUL when health_score changes

-- ============================================================================    IF OLD.health_score IS DISTINCT FROM NEW.health_score THEN

        PERFORM update_asset_rul(NEW.asset_id);

-- Disable RLS for all tables (enable in production with appropriate policies)    END IF;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;    

ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;    RETURN NEW;

ALTER TABLE assets DISABLE ROW LEVEL SECURITY;END;

ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;$$ LANGUAGE plpgsql;

ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

ALTER TABLE api_integrations DISABLE ROW LEVEL SECURITY;-- Create trigger on assets table

ALTER TABLE photos DISABLE ROW LEVEL SECURITY;CREATE TRIGGER assets_health_score_update_trigger

    AFTER UPDATE ON assets

-- ============================================================================    FOR EACH ROW

-- COMMENTS    EXECUTE FUNCTION trigger_update_asset_rul();

-- ============================================================================

-- ===========================================================================

COMMENT ON TABLE assets IS 'Main assets table storing all railway asset information';-- ENHANCED VIEWS WITH RUL INTEGRATION

COMMENT ON COLUMN assets.region IS 'Railway region (e.g., Northern Railway, Southern Railway)';-- ===========================================================================

COMMENT ON COLUMN assets.metadata IS 'JSONB field containing: model, serial_number, manufacturer, description, maintenance info, technical specs, etc.';

COMMENT ON COLUMN assets.health_score IS 'Asset health score from 0-100';-- Enhanced asset summary with RUL information

COMMENT ON COLUMN assets.predicted_rul IS 'Remaining Useful Life in months';CREATE OR REPLACE VIEW asset_health_rul_summary AS

COMMENT ON COLUMN vendors.contact_info IS 'JSONB containing: phone, email, address, website';SELECT 

COMMENT ON COLUMN vendors.degradation_rate IS 'Daily degradation rate (default 0.01 = 1%)';    a.asset_id,

    a.type,

-- ============================================================================    a.location,

-- COMPLETION MESSAGE    a.status,

-- ============================================================================    a.condition,

    a.health_score,

SELECT     ar.predicted_rul_days,

    'RailFit Database Schema Created Successfully!' as status,    ar.degradation_rate,

    '✓ All tables created' as tables,    ar.confidence_level,

    '✓ All indexes created' as indexes,    ar.last_updated as rul_last_calculated,

    '✓ All triggers created' as triggers,    v.name as vendor_name,

    '✓ All views created' as views;    v.average_life_span_days,

    
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