-- Migration: Add region column to assets table
-- Description: Add railway region information to assets for better geographical categorization
-- Created: October 2025

-- Add last_updated column if it doesn't exist (required by trigger)
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add region column to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Add comment to the column
COMMENT ON COLUMN assets.region IS 'Railway region where the asset is installed (e.g., Northern Railway, Southern Railway, etc.)';

-- Create index on region for faster filtering
CREATE INDEX IF NOT EXISTS idx_assets_region ON assets(region);

-- Update existing assets to have a default region (optional, can be NULL)
-- UPDATE assets SET region = 'Unassigned' WHERE region IS NULL;

-- Example regions for Indian Railways (uncomment if you want to pre-populate):
-- UPDATE assets SET region = 'Northern Railway' WHERE location LIKE '%Delhi%' OR location LIKE '%Punjab%';
-- UPDATE assets SET region = 'Southern Railway' WHERE location LIKE '%Chennai%' OR location LIKE '%Tamil Nadu%';
-- UPDATE assets SET region = 'Eastern Railway' WHERE location LIKE '%Kolkata%' OR location LIKE '%West Bengal%';
-- UPDATE assets SET region = 'Western Railway' WHERE location LIKE '%Mumbai%' OR location LIKE '%Maharashtra%';
-- UPDATE assets SET region = 'Central Railway' WHERE location LIKE '%Nagpur%' OR location LIKE '%Madhya Pradesh%';
