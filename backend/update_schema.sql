-- Update schema to new enums
ALTER TYPE asset_status RENAME TO asset_status_old;
CREATE TYPE asset_status AS ENUM ('active', 'under_maintenance', 'retired');
ALTER TABLE assets ALTER COLUMN status TYPE asset_status USING status::text::asset_status;
DROP TYPE asset_status_old;

-- Add condition column
CREATE TYPE asset_condition AS ENUM ('good', 'ok', 'critical');
ALTER TABLE assets ADD COLUMN condition asset_condition DEFAULT 'good';

-- Update existing data to have condition based on health score
UPDATE assets SET condition = CASE 
    WHEN health_score >= 80 THEN 'good'::asset_condition
    WHEN health_score >= 60 THEN 'ok'::asset_condition
    ELSE 'critical'::asset_condition
END;