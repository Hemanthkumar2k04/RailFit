-- ============================================================================
-- RailFit RUL (Remaining Useful Life) Tracking System
-- Standalone SQL Script - Run this AFTER your main schema is deployed
-- Created: September 2025
-- ============================================================================

-- This script adds RUL tracking capabilities to an existing RailFit database
-- Prerequisites: users, vendors, and assets tables must already exist

BEGIN;

-- ============================================================================
-- STEP 1: EXTEND EXISTING VENDORS TABLE WITH RUL PARAMETERS
-- ============================================================================

-- Add RUL-related columns to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS degradation_rate DECIMAL(5,4) DEFAULT 0.0100,
ADD COLUMN IF NOT EXISTS average_life_span_days INTEGER DEFAULT 3650;

-- Update existing vendors with realistic degradation rates
UPDATE vendors SET 
    degradation_rate = CASE 
        WHEN name ILIKE '%railtech%' THEN 0.0080  -- High quality, slower degradation
        WHEN name ILIKE '%trackmaster%' THEN 0.0120  -- Lower quality, faster degradation
        WHEN name ILIKE '%clipcorp%' THEN 0.0100    -- Standard degradation
        WHEN name ILIKE '%padtech%' THEN 0.0090     -- Good quality
        ELSE 0.0100  -- Default 1% daily degradation
    END,
    average_life_span_days = CASE 
        WHEN name ILIKE '%railtech%' THEN 4000   -- ~11 years
        WHEN name ILIKE '%trackmaster%' THEN 3200 -- ~8.8 years
        WHEN name ILIKE '%clipcorp%' THEN 3650   -- 10 years
        WHEN name ILIKE '%padtech%' THEN 3800    -- ~10.4 years
        ELSE 3650  -- Default 10 years
    END;

-- ============================================================================
-- STEP 2: CREATE ASSET_RUL TABLE
-- ============================================================================

-- Drop table if it exists (for clean reinstall)
DROP TABLE IF EXISTS asset_rul CASCADE;

-- Create the main RUL tracking table
CREATE TABLE asset_rul (
    rul_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    current_health_score DECIMAL(5,2) NOT NULL CHECK (current_health_score >= 0 AND current_health_score <= 100),
    degradation_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0100,
    predicted_rul_days INTEGER NOT NULL DEFAULT 0,
    confidence_level DECIMAL(3,2) DEFAULT 0.85 CHECK (confidence_level >= 0 AND confidence_level <= 1),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    calculation_method VARCHAR(50) DEFAULT 'linear',
    
    -- Ensure one RUL record per asset
    CONSTRAINT unique_asset_rul UNIQUE (asset_id)
);

-- Create indexes for performance
CREATE INDEX idx_asset_rul_asset_id ON asset_rul(asset_id);
CREATE INDEX idx_asset_rul_predicted_rul ON asset_rul(predicted_rul_days);
CREATE INDEX idx_asset_rul_last_updated ON asset_rul(last_updated);
CREATE INDEX idx_asset_rul_health_score ON asset_rul(current_health_score);

-- ============================================================================
-- STEP 3: CREATE RUL CALCULATION FUNCTIONS
-- ============================================================================

-- Linear degradation model (simple and predictable)
CREATE OR REPLACE FUNCTION calculate_rul_linear(
    health_score DECIMAL(5,2),
    degradation_rate DECIMAL(5,4)
) RETURNS INTEGER AS $$
BEGIN
    -- Formula: RUL = health_score / degradation_rate
    IF health_score <= 0 OR degradation_rate <= 0 THEN
        RETURN 0;
    END IF;
    
    RETURN FLOOR(health_score / degradation_rate);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exponential degradation model (more realistic for aging assets)
CREATE OR REPLACE FUNCTION calculate_rul_exponential(
    health_score DECIMAL(5,2),
    degradation_rate DECIMAL(5,4),
    failure_threshold DECIMAL(5,2) DEFAULT 20.0
) RETURNS INTEGER AS $$
DECLARE
    days_to_threshold INTEGER;
BEGIN
    -- Exponential decay: health(t) = health_0 * exp(-rate * t)
    -- Solve for t when health(t) = threshold
    
    IF health_score <= failure_threshold OR degradation_rate <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Calculate days until health reaches failure threshold
    days_to_threshold := FLOOR(LN(health_score / failure_threshold) / degradation_rate);
    
    RETURN GREATEST(0, days_to_threshold);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update RUL for a specific asset
CREATE OR REPLACE FUNCTION update_asset_rul(asset_uuid UUID) RETURNS BOOLEAN AS $$
DECLARE
    asset_health DECIMAL(5,2);
    vendor_degradation_rate DECIMAL(5,4);
    calculated_rul INTEGER;
    rows_affected INTEGER;
BEGIN
    -- Get current health score and vendor degradation rate
    SELECT 
        a.health_score, 
        COALESCE(v.degradation_rate, 0.0100)
    INTO 
        asset_health, 
        vendor_degradation_rate
    FROM assets a
    LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
    WHERE a.asset_id = asset_uuid;
    
    -- Skip if asset not found or no health score
    IF asset_health IS NULL THEN
        RETURN FALSE;
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
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Bulk update RUL for all assets
CREATE OR REPLACE FUNCTION update_all_asset_rul() RETURNS INTEGER AS $$
DECLARE
    asset_record RECORD;
    updated_count INTEGER := 0;
    success BOOLEAN;
BEGIN
    -- Process all assets with health scores
    FOR asset_record IN 
        SELECT asset_id 
        FROM assets 
        WHERE health_score IS NOT NULL AND health_score > 0
    LOOP
        success := update_asset_rul(asset_record.asset_id);
        IF success THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: CREATE AUTOMATIC UPDATE TRIGGERS
-- ============================================================================

-- Trigger function to update RUL when asset health changes
CREATE OR REPLACE FUNCTION trigger_update_asset_rul() RETURNS TRIGGER AS $$
BEGIN
    -- Only update RUL if health_score actually changed
    IF OLD.health_score IS DISTINCT FROM NEW.health_score THEN
        PERFORM update_asset_rul(NEW.asset_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS assets_health_score_update_trigger ON assets;
CREATE TRIGGER assets_health_score_update_trigger
    AFTER UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_asset_rul();

-- Update timestamp trigger for asset_rul table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_asset_rul_timestamp_trigger
    BEFORE UPDATE ON asset_rul
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: CREATE RUL VIEWS AND ANALYTICS
-- ============================================================================

-- Comprehensive asset health and RUL summary view
CREATE OR REPLACE VIEW asset_health_rul_summary AS
SELECT 
    a.asset_id,
    a.type,
    a.location,
    a.status,
    a.condition,
    a.health_score,
    a.install_date,
    
    -- RUL Information
    ar.predicted_rul_days,
    ar.degradation_rate,
    ar.confidence_level,
    ar.calculation_method,
    ar.last_updated as rul_last_calculated,
    
    -- Vendor Information
    v.name as vendor_name,
    v.average_life_span_days,
    
    -- Calculated Fields
    CASE 
        WHEN ar.predicted_rul_days IS NULL THEN 'Not Calculated'
        WHEN ar.predicted_rul_days <= 30 THEN 'Critical (≤30 days)'
        WHEN ar.predicted_rul_days <= 90 THEN 'Warning (≤90 days)'
        WHEN ar.predicted_rul_days <= 365 THEN 'Monitor (≤1 year)'
        ELSE 'Good (>1 year)'
    END as rul_category,
    
    CASE 
        WHEN ar.predicted_rul_days IS NULL THEN 'Unknown'
        WHEN ar.predicted_rul_days <= 30 OR a.health_score <= 20 THEN 'Immediate'
        WHEN ar.predicted_rul_days <= 90 OR a.health_score <= 40 THEN 'High'
        WHEN ar.predicted_rul_days <= 365 OR a.health_score <= 60 THEN 'Medium'
        ELSE 'Low'
    END as maintenance_priority,
    
    -- Asset utilization percentage
    CASE 
        WHEN v.average_life_span_days > 0 AND ar.predicted_rul_days IS NOT NULL THEN
            ROUND(((v.average_life_span_days - ar.predicted_rul_days) * 100.0 / v.average_life_span_days), 2)
        ELSE NULL
    END as utilization_percentage,
    
    -- Days since installation
    CASE 
        WHEN a.install_date IS NOT NULL THEN
            (CURRENT_DATE - a.install_date)::INTEGER
        ELSE NULL
    END as days_in_service
    
FROM assets a
LEFT JOIN asset_rul ar ON a.asset_id = ar.asset_id
LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
ORDER BY 
    CASE WHEN ar.predicted_rul_days IS NULL THEN 999999 ELSE ar.predicted_rul_days END ASC,
    a.health_score ASC;

-- RUL system analytics and KPIs
CREATE OR REPLACE VIEW rul_analytics AS
SELECT 
    -- Asset Counts
    COUNT(*) as total_assets_with_rul,
    COUNT(CASE WHEN predicted_rul_days <= 30 THEN 1 END) as critical_assets,
    COUNT(CASE WHEN predicted_rul_days <= 90 THEN 1 END) as warning_assets,
    COUNT(CASE WHEN predicted_rul_days <= 365 THEN 1 END) as monitor_assets,
    COUNT(CASE WHEN predicted_rul_days > 365 THEN 1 END) as healthy_assets,
    
    -- Health and RUL Averages
    ROUND(AVG(predicted_rul_days), 0) as average_rul_days,
    ROUND(AVG(current_health_score), 2) as average_health_score,
    ROUND(AVG(confidence_level), 2) as average_confidence,
    
    -- System Health Percentages
    ROUND((COUNT(CASE WHEN predicted_rul_days <= 30 THEN 1 END) * 100.0 / COUNT(*)), 2) as critical_percentage,
    ROUND((COUNT(CASE WHEN predicted_rul_days <= 90 THEN 1 END) * 100.0 / COUNT(*)), 2) as warning_percentage,
    
    -- Last Update Information
    MAX(last_updated) as last_calculation_time,
    MIN(last_updated) as oldest_calculation_time
FROM asset_rul
WHERE predicted_rul_days IS NOT NULL;

-- Vendor RUL performance comparison
CREATE OR REPLACE VIEW vendor_rul_performance AS
SELECT 
    v.name as vendor_name,
    v.degradation_rate as vendor_degradation_rate,
    v.average_life_span_days as expected_lifespan,
    
    COUNT(ar.asset_id) as assets_tracked,
    ROUND(AVG(ar.current_health_score), 2) as avg_health_score,
    ROUND(AVG(ar.predicted_rul_days), 0) as avg_rul_days,
    
    -- Performance vs expectations
    ROUND(AVG(ar.predicted_rul_days) * 100.0 / v.average_life_span_days, 2) as performance_ratio,
    
    COUNT(CASE WHEN ar.predicted_rul_days <= 90 THEN 1 END) as assets_needing_attention
    
FROM vendors v
LEFT JOIN assets a ON v.vendor_id = a.vendor_id
LEFT JOIN asset_rul ar ON a.asset_id = ar.asset_id
WHERE ar.asset_id IS NOT NULL
GROUP BY v.vendor_id, v.name, v.degradation_rate, v.average_life_span_days
ORDER BY performance_ratio DESC;

-- ============================================================================
-- STEP 6: INITIALIZE RUL DATA
-- ============================================================================

-- Calculate initial RUL for all existing assets
SELECT update_all_asset_rul() as assets_with_rul_calculated;

-- ============================================================================
-- STEP 7: PERMISSIONS AND SECURITY
-- ============================================================================

-- Disable RLS for asset_rul table (adjust as needed)
ALTER TABLE asset_rul DISABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust based on your security model)
GRANT ALL PRIVILEGES ON TABLE asset_rul TO postgres;
GRANT ALL ON TABLE asset_rul TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

COMMIT;

-- ============================================================================
-- VERIFICATION AND SUCCESS MESSAGE
-- ============================================================================

-- Verify installation
SELECT 
    'RUL System Installation Complete!' as status,
    (SELECT COUNT(*) FROM asset_rul) as assets_with_rul,
    (SELECT COUNT(*) FROM asset_rul WHERE predicted_rul_days <= 90) as assets_needing_attention;

-- Display sample results
SELECT 'Sample RUL Data:' as section;
SELECT * FROM asset_health_rul_summary LIMIT 5;

SELECT 'System Analytics:' as section;
SELECT * FROM rul_analytics;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- USAGE EXAMPLES (uncomment to test):

-- 1. View all assets with RUL information
SELECT * FROM asset_health_rul_summary;

-- 2. Find critical assets needing immediate attention
SELECT * FROM asset_health_rul_summary 
WHERE maintenance_priority = 'Immediate';

-- 3. Update an asset's health score (triggers automatic RUL recalculation)
UPDATE assets SET health_score = 25 WHERE location LIKE '%Track%' LIMIT 1;

-- 4. Manually recalculate RUL for all assets
SELECT update_all_asset_rul() as updated_count;

-- 5. Get vendor performance comparison
SELECT * FROM vendor_rul_performance;

-- 6. View system-wide RUL analytics
SELECT * FROM rul_analytics;

-- 7. Calculate RUL using different methods
SELECT 
    calculate_rul_linear(75.0, 0.01) as linear_rul,
    calculate_rul_exponential(75.0, 0.01, 20.0) as exponential_rul;
*/