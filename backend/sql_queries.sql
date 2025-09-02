-- sql_queries.sql
-- Create the assets table
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'maintenance')),
  warranty_end DATE NOT NULL,
  last_inspection DATE NOT NULL,
  predictive_score INTEGER DEFAULT 100 CHECK (predictive_score >= 0 AND predictive_score <= 100),
  qr_code VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on item_id for faster lookups
CREATE INDEX idx_assets_item_id ON assets(item_id);
CREATE INDEX idx_assets_qr_code ON assets(qr_code);
CREATE INDEX idx_assets_status ON assets(status);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO assets (item_id, name, category, location, status, warranty_end, last_inspection, predictive_score, qr_code) VALUES
('1', 'Industrial Generator #A01', 'Power Equipment', 'Sector A - Building 1', 'healthy', '2025-06-15', '2024-08-15', 85, 'QR_GEN_A01_2024'),
('2', 'HVAC System #B02', 'Climate Control', 'Sector B - Building 2', 'warning', '2024-12-30', '2024-07-20', 65, 'QR_HVAC_B02_2024'),
('3', 'Server Rack #C03', 'IT Equipment', 'Data Center - Floor 3', 'critical', '2024-11-15', '2024-06-10', 25, 'QR_SRV_C03_2024'),
('4', 'Water Pump #D04', 'Utilities', 'Basement - Utility Room', 'maintenance', '2025-03-20', '2024-08-30', 70, 'QR_PUMP_D04_2024'),
('5', 'Emergency Generator #A02', 'Power Equipment', 'Sector A - Building 2', 'healthy', '2025-08-10', '2024-09-01', 90, 'QR_GEN_A02_2024'),
('6', 'Chiller Unit #B03', 'Climate Control', 'Sector B - Rooftop', 'warning', '2024-10-15', '2023-12-20', 45, 'QR_CHILL_B03_2024'),
('7', 'Network Switch #C04', 'IT Equipment', 'Data Center - Floor 1', 'healthy', '2025-12-31', '2024-08-25', 78, 'QR_NET_C04_2024'),
('8', 'Fire Pump #D05', 'Safety Equipment', 'Basement - Safety Room', 'critical', '2024-09-30', '2023-11-15', 30, 'QR_FIRE_D05_2024');

-- Create maintenance_logs table for tracking maintenance history
CREATE TABLE maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) NOT NULL,
  description TEXT,
  performed_by VARCHAR(100),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cost DECIMAL(10,2),
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table for tracking system alerts
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('critical', 'warranty', 'predictive', 'maintenance')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Enable read access for all users" ON assets FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON assets FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON maintenance_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON maintenance_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON alerts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON alerts FOR UPDATE USING (true);