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
