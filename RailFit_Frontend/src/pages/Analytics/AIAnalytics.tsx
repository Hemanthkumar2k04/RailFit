import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ReferenceLine
} from 'recharts';

// Supabase Configuration
const SUPABASE_URL = 'https://nlxrpnjccouogrfbbgmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE';

// Type Definitions
// AssetHealthData interface removed (unused) to fix TS unused-symbol error

interface RULDistribution {
  assetType: string;
  critical: number;
  warning: number;
  monitor: number;
  good: number;
  total: number;
}

interface ScatterData {
  assetId: string;
  type: string;
  location: string;
  healthScore: number;
  rulDays: number;
  priority: string;
  alertCount: number;
  vendor: string;
}

interface HeatmapAsset {
  assetId: string;
  lat: number;
  lng: number;
  healthScore: number;
  type: string;
  location: string;
  rulDays: number;
  priority: string;
}

interface GaugeData {
  fleetHealth: number;
  totalAssets: number;
  excellentCount: number;
  goodCount: number;
  okCount: number;
  criticalCount: number;
}

interface Asset {
  id: string;
  asset_id: string;
  asset_type: string;
  location: string;
  health_score: number;
  rul_days: number;
  priority: string;
  alert_count: number;
  vendor: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

// Supabase API Helper
const supabaseApi = {
  async getAssets(): Promise<Asset[]> {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/assets?select=*&order=updated_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};

// Gauge Chart Component
const GaugeChart: React.FC<{ data: GaugeData }> = ({ data }) => {
  const getColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 60) return '#EAB308';
    if (score >= 40) return '#F59E0B';
    return '#DC2626';
  };

  const rotation = (data.fleetHealth / 100) * 180 - 90;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Fleet Health Score</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-32">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 10 90 A 90 90 0 0 1 190 90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
            <path d="M 10 90 A 90 90 0 0 1 55 23" fill="none" stroke="#DC2626" strokeWidth="20" />
            <path d="M 55 23 A 90 90 0 0 1 100 10" fill="none" stroke="#F59E0B" strokeWidth="20" />
            <path d="M 100 10 A 90 90 0 0 1 145 23" fill="none" stroke="#EAB308" strokeWidth="20" />
            <path d="M 145 23 A 90 90 0 0 1 190 90" fill="none" stroke="#16A34A" strokeWidth="20" />
            <line
              x1="100" y1="90" x2="100" y2="30"
              stroke={getColor(data.fleetHealth)}
              strokeWidth="3"
              transform={`rotate(${rotation} 100 90)`}
              style={{ transition: 'transform 1s ease-out' }}
            />
            <circle cx="100" cy="90" r="6" fill={getColor(data.fleetHealth)} />
          </svg>
        </div>
        
        <div className="text-center mt-4">
          <div className="text-4xl font-bold" style={{ color: getColor(data.fleetHealth) }}>
            {data.fleetHealth.toFixed(1)}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {data.totalAssets} Total Assets
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 w-full text-center text-sm">
          <div>
            <div className="text-green-600 font-bold">{data.excellentCount}</div>
            <div className="text-gray-500">Excellent</div>
          </div>
          <div>
            <div className="text-yellow-600 font-bold">{data.goodCount}</div>
            <div className="text-gray-500">Good</div>
          </div>
          <div>
            <div className="text-orange-600 font-bold">{data.okCount}</div>
            <div className="text-gray-500">OK</div>
          </div>
          <div>
            <div className="text-red-600 font-bold">{data.criticalCount}</div>
            <div className="text-gray-500">Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Heatmap Component
const HeatmapChart: React.FC<{ data: HeatmapAsset[] }> = ({ data }) => {
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-500';
    if (health >= 60) return 'bg-yellow-500';
    if (health >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const [selectedAsset, setSelectedAsset] = useState<HeatmapAsset | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Geographic Asset Health Distribution</h3>
        <div className="text-center text-gray-500 py-8">No geographic data available</div>
      </div>
    );
  }

  const lats = data.map(d => d.lat).filter(v => v);
  const lngs = data.map(d => d.lng).filter(v => v);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Geographic Asset Health Distribution</h3>
      <div className="text-sm text-gray-600 mb-4">
        Coordinates: Latitude (Y) vs Longitude (X) | Color = Health Score
      </div>
      
      <div className="relative h-96 bg-gray-100 rounded overflow-auto">
        <div className="relative w-full h-full">
          {data.map((asset, idx) => {
            const x = ((asset.lng - minLng) / (maxLng - minLng || 1)) * 100;
            const y = ((asset.lat - minLat) / (maxLat - minLat || 1)) * 100;
            
            return (
              <div
                key={idx}
                className={`absolute w-4 h-4 rounded-full ${getHealthColor(asset.healthScore)} 
                  opacity-70 hover:opacity-100 cursor-pointer transition-all hover:scale-150 hover:z-10`}
                style={{
                  left: `${x}%`,
                  top: `${100 - y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => setSelectedAsset(asset)}
                title={`${asset.type} - Health: ${asset.healthScore}`}
              />
            );
          })}
        </div>
      </div>

      {selectedAsset && (
        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <div className="font-semibold">{selectedAsset.type}</div>
          <div className="text-sm text-gray-700">
            <div>Location: {selectedAsset.location}</div>
            <div>Health Score: {selectedAsset.healthScore}</div>
            <div>RUL: {selectedAsset.rulDays} days</div>
            <div>Priority: {selectedAsset.priority}</div>
            <div className="text-xs text-gray-500 mt-1">
              GPS: {selectedAsset.lat.toFixed(4)}, {selectedAsset.lng.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span> Critical (0-39)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span> OK (40-59)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Good (60-79)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span> Excellent (80-100)
        </span>
      </div>
    </div>
  );
};

// Main Dashboard Component
const AIAnalytics: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch assets from Supabase
  const fetchAssets = async () => {
    try {
      const data = await supabaseApi.getAssets();
      setAssets(data || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchAssets();

    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchAssets, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Process data for charts
  const processData = () => {
    if (assets.length === 0) {
      return {
        gaugeData: {
          fleetHealth: 0,
          totalAssets: 0,
          excellentCount: 0,
          goodCount: 0,
          okCount: 0,
          criticalCount: 0
        },
        barData: [],
        scatterData: [],
        heatmapData: [],
        lineChartData: []
      };
    }

    // Gauge Data
    const totalHealth = assets.reduce((sum, a) => sum + (a.health_score || 0), 0);
    const fleetHealth = totalHealth / assets.length;
    const excellentCount = assets.filter(a => a.health_score >= 80).length;
    const goodCount = assets.filter(a => a.health_score >= 60 && a.health_score < 80).length;
    const okCount = assets.filter(a => a.health_score >= 40 && a.health_score < 60).length;
    const criticalCount = assets.filter(a => a.health_score < 40).length;

    const gaugeData: GaugeData = {
      fleetHealth,
      totalAssets: assets.length,
      excellentCount,
      goodCount,
      okCount,
      criticalCount
    };

    // Bar Data - RUL Distribution by Asset Type
    const assetTypes = [...new Set(assets.map(a => a.asset_type))];
    const barData: RULDistribution[] = assetTypes.map(type => {
      const typeAssets = assets.filter(a => a.asset_type === type);
      return {
        assetType: type,
        critical: typeAssets.filter(a => a.rul_days <= 30).length,
        warning: typeAssets.filter(a => a.rul_days > 30 && a.rul_days <= 90).length,
        monitor: typeAssets.filter(a => a.rul_days > 90 && a.rul_days <= 365).length,
        good: typeAssets.filter(a => a.rul_days > 365).length,
        total: typeAssets.length
      };
    });

    // Scatter Data
    const scatterData: ScatterData[] = assets.map(a => ({
      assetId: a.asset_id,
      type: a.asset_type,
      location: a.location,
      healthScore: a.health_score || 0,
      rulDays: a.rul_days || 0,
      priority: a.priority || 'Low',
      alertCount: a.alert_count || 0,
      vendor: a.vendor || 'Unknown'
    }));

    // Heatmap Data
    const heatmapData: HeatmapAsset[] = assets
      .filter(a => a.latitude && a.longitude)
      .map(a => ({
        assetId: a.asset_id,
        lat: a.latitude!,
        lng: a.longitude!,
        healthScore: a.health_score || 0,
        type: a.asset_type,
        location: a.location,
        rulDays: a.rul_days || 0,
        priority: a.priority || 'Low'
      }));

    // Line Chart Data - Group by asset type and time
    const lineChartData: any[] = [];
    for (let i = 23; i >= 0; i--) {
      const weekLabel = `Week ${24 - i}`;
      const weekData: any = { week: weekLabel };
      
      assetTypes.forEach(type => {
        const typeAssets = assets.filter(a => a.asset_type === type);
        const avgHealth = typeAssets.length > 0
          ? typeAssets.reduce((sum, a) => sum + (a.health_score || 0), 0) / typeAssets.length
          : 0;
        weekData[type] = avgHealth;
      });
      
      lineChartData.push(weekData);
    }

    return { gaugeData, barData, scatterData, heatmapData, lineChartData };
  };

  const { gaugeData, barData, scatterData, heatmapData, lineChartData } = processData();

  const assetTypes = [...new Set(assets.map(a => a.asset_type))];
  const colors: Record<string, string> = {
    'Rail Pad': '#3B82F6',
    'Elastic Rail Clip': '#10B981',
    'Liner': '#F59E0B',
    'Sleeper': '#8B5CF6'
  };

  const priorityColors: Record<string, string> = {
    'Immediate': '#DC2626',
    'High': '#F59E0B',
    'Medium': '#EAB308',
    'Low': '#16A34A'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <p className="text-red-700 text-xs mb-4">
            Make sure your Supabase database has an 'assets' table with proper columns.
          </p>
          <button
            onClick={fetchAssets}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RailFit Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time asset health monitoring and predictive maintenance</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">No assets found in database</p>
            <p className="text-yellow-700 text-sm">
              Please add some assets to the 'assets' table in your Supabase database to see analytics.
            </p>
          </div>
        ) : (
          <>
            {/* Gauge Chart */}
            <div className="mb-6">
              <GaugeChart data={gaugeData} />
            </div>

            {/* Line Chart and Bar Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Line Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Health Score Trends Over Time</h3>
                <div className="text-sm text-gray-600 mb-4">
                  X-axis: Time (weeks) | Y-axis: Health Score (0-100)
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={40} stroke="#DC2626" strokeDasharray="3 3" label="Critical" />
                    {assetTypes.map(type => (
                      <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        stroke={colors[type] || '#6366F1'}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">RUL Distribution by Asset Type</h3>
                <div className="text-sm text-gray-600 mb-4">
                  X-axis: Number of Assets | Y-axis: Asset Types | Stacked by RUL Category
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="assetType" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" stackId="a" fill="#DC2626" name="Critical (≤30d)" />
                    <Bar dataKey="warning" stackId="a" fill="#F59E0B" name="Warning (31-90d)" />
                    <Bar dataKey="monitor" stackId="a" fill="#EAB308" name="Monitor (91-365d)" />
                    <Bar dataKey="good" stackId="a" fill="#16A34A" name="Good (>365d)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heatmap */}
            {heatmapData.length > 0 && (
              <div className="mb-6">
                <HeatmapChart data={heatmapData} />
              </div>
            )}

            {/* Scatter Plot */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Health vs RUL Priority Matrix</h3>
              <div className="text-sm text-gray-600 mb-4">
                X-axis: Health Score (0-100) | Y-axis: RUL Days | Color = Priority | Size = Alert Count
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="healthScore" domain={[0, 100]} name="Health Score" />
                  <YAxis type="number" dataKey="rulDays" name="RUL (days)" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="font-semibold">{data.type}</p>
                            <p className="text-sm">ID: {data.assetId}</p>
                            <p className="text-sm">Location: {data.location}</p>
                            <p className="text-sm">Health: {data.healthScore}</p>
                            <p className="text-sm">RUL: {data.rulDays} days</p>
                            <p className="text-sm">Priority: {data.priority}</p>
                            <p className="text-sm">Alerts: {data.alertCount}</p>
                            <p className="text-sm">Vendor: {data.vendor}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={50} stroke="#666" strokeDasharray="3 3" />
                  <ReferenceLine y={180} stroke="#666" strokeDasharray="3 3" />
                  
                  {Object.entries(priorityColors).map(([priority, color]) => (
                    <Scatter
                      key={priority}
                      name={priority}
                      data={scatterData.filter(d => d.priority === priority)}
                      fill={color}
                    >
                      {scatterData.filter(d => d.priority === priority).map((_, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0.7} />
                      ))}
                    </Scatter>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <strong>Bottom-Left Quadrant:</strong> Critical - Low health + Low RUL → Immediate action needed
                </div>
                <div>
                  <strong>Bottom-Right Quadrant:</strong> Age-Related - High health + Low RUL → Plan replacement
                </div>
                <div>
                  <strong>Top-Left Quadrant:</strong> Quality Issue - Low health + High RUL → Investigate vendor/installation
                </div>
                <div>
                  <strong>Top-Right Quadrant:</strong> Optimal - High health + High RUL → Routine monitoring
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAnalytics;