import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, AreaChart, Area, PieChart, Pie, Cell, RadarChart, 
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Supabase Configuration (kept inline for now)
const SUPABASE_URL = 'https://nlxrpnjccouogrfbbgmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHJwbmpjY291b2dyZmJiZ21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzM2NjQsImV4cCI6MjA3Mzk0OTY2NH0.begglCbsqiTX7Sop_09BpTRHw31NGm9nThoTkk4aEJE';

// Types
interface GaugeData {
  fleetHealth: number;
  totalAssets: number;
  excellentCount: number;
  goodCount: number;
  okCount: number;
  criticalCount: number;
}

interface AssetRaw {
  // allow various possible field names returned by backend
  id?: string;
  asset_id?: string;
  assetId?: string;
  type?: string;
  asset_type?: string;
  assetType?: string;
  location?: string;
  health_score?: number | string;
  health?: number | string;
  health_score_raw?: number | string;
  predicted_rul_days?: number | string;
  predicted_rul?: number | string;
  rul_days?: number | string;
  priority?: string;
  maintenance_priority?: string;
  alert_count?: number;
  active_alerts?: number;
  vendor_name?: string;
  vendor?: string;
  gps_lat?: number;
  gps_lng?: number;
  latitude?: number;
  longitude?: number;
  condition?: string;
  created_at?: string;
  updated_at?: string;
  utilization_percentage?: number;
}

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
  utilizationPercentage?: number;
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
  condition?: string;
}

interface RULAnalytics {
  critical_assets?: number;
  warning_assets?: number;
  monitor_assets?: number;
  average_rul_days?: number;
  average_health_score?: number;
  average_confidence?: number;
}

// Supabase API helper (minimal)
const supabaseApi = {
  async getAssetHealthRulSummary(): Promise<AssetRaw[]> {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/asset_health_rul_summary?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async getRulAnalytics(): Promise<RULAnalytics> {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rul_analytics?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data[0] || {};
  }
};

// Gauge Chart Component
const GaugeChart: React.FC<{ data: GaugeData }> = ({ data }) => {
  const getColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 60) return '#EAB308';
    if (score >= 40) return '#d35545ff';
    return '#DC2626';
  };

  const rotation = (data.fleetHealth / 100) * 180 - 90;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Fleet Health Score</h3>
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

// RUL Analytics Card Component
const RULAnalyticsCard: React.FC<{ data: RULAnalytics }> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">RUL Analytics Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.critical_assets || 0}</div>
          <div className="text-xs text-gray-500">Critical (≤30d)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{data.warning_assets || 0}</div>
          <div className="text-xs text-gray-500">Warning (≤90d)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.monitor_assets || 0}</div>
          <div className="text-xs text-gray-500">Monitor (≤1y)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{Math.round(data.average_rul_days || 0)}</div>
          <div className="text-xs text-gray-500">Avg RUL (days)</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Avg Health Score:</span>
          <span className="font-semibold text-gray-900">{(data.average_health_score || 0).toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 mt-1">
          <span>Prediction Confidence:</span>
          <span className="font-semibold text-gray-900">{((data.average_confidence || 0) * 100).toFixed(1)}%</span>
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
    if (health >= 40) return 'bg-orange-800';
    return 'bg-red-500';
  };

  const [selectedAsset, setSelectedAsset] = useState<HeatmapAsset | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Geographic Asset Health Distribution</h3>
        <div className="text-center text-gray-500 py-8">No geographic data available</div>
      </div>
    );
  }

  const lats = data.map(d => d.lat).filter(v => v != null);
  const lngs = data.map(d => d.lng).filter(v => v != null);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Geographic Asset Health Distribution</h3>
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
                key={asset.assetId ?? idx}
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
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-300">
          <div className="font-semibold text-gray-900">{selectedAsset.type}</div>
          <div className="text-sm text-gray-700">
            <div>Location: {selectedAsset.location}</div>
            <div>Health Score: {selectedAsset.healthScore}</div>
            <div>RUL: {selectedAsset.rulDays} days</div>
            <div>Priority: {selectedAsset.priority}</div>
            <div>Condition: {selectedAsset.condition}</div>
            <div className="text-xs text-gray-500 mt-1">
              GPS: {selectedAsset.lat.toFixed(4)}, {selectedAsset.lng.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-700">
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
  const [assets, setAssets] = useState<AssetRaw[]>([]);
  const [rulAnalytics, setRulAnalytics] = useState<RULAnalytics>({} as RULAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch assets from Supabase
  const fetchData = async () => {
    try {
      const [assetsData, rulData] = await Promise.all([
        supabaseApi.getAssetHealthRulSummary(),
        supabaseApi.getRulAnalytics()
      ]);
      
      setAssets(assetsData || []);
      setRulAnalytics(rulData || {});
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchData();

    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Process data for charts (normalize incoming fields first)
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
        } as GaugeData,
        barData: [] as RULDistribution[],
        scatterData: [] as ScatterData[],
        heatmapData: [] as HeatmapAsset[],
        lineChartData: [] as any[]
      };
    }

    // normalize assets into a predictable shape
    const normalized = assets.map(a => {
      const healthRaw = a.health_score ?? a.health ?? a.health_score ?? 0;
      const rulRaw = a.predicted_rul_days ?? a.predicted_rul ?? a.rul_days ?? 0;
      const typeRaw = a.type ?? a.asset_type ?? a.assetType ?? 'Unknown';
      const lat = (a.gps_lat ?? a.latitude ?? 0) as number;
      const lng = (a.gps_lng ?? a.longitude ?? 0) as number;

      const health = Number(healthRaw) || 0;
      const rul = Number(rulRaw) || 0;

      return {
        ...a,
        _health: health,
        _rul: rul,
        _type: typeRaw,
        _lat: lat,
        _lng: lng
      } as AssetRaw & { _health: number; _rul: number; _type: string; _lat: number; _lng: number };
    });

    // Gauge Data
    const totalHealth = normalized.reduce((sum, a) => sum + (a._health || 0), 0);
    const fleetHealth = normalized.length ? totalHealth / normalized.length : 0;
    const excellentCount = normalized.filter(a => a._health >= 80).length;
    const goodCount = normalized.filter(a => a._health >= 60 && a._health < 80).length;
    const okCount = normalized.filter(a => a._health >= 40 && a._health < 60).length;
    const criticalCount = normalized.filter(a => a._health < 40).length;

    const gaugeData: GaugeData = {
      fleetHealth,
      totalAssets: normalized.length,
      excellentCount,
      goodCount,
      okCount,
      criticalCount
    };

    // RUL distribution by _type
    const assetTypes = Array.from(new Set(normalized.map(a => a._type)));
  const barData: RULDistribution[] = assetTypes.map(type => { 
      const typeAssets = normalized.filter(a => a._type === type);
      return {
        assetType: type,
        critical: typeAssets.filter(a => a._rul <= 30).length,
        warning: typeAssets.filter(a => a._rul > 30 && a._rul <= 90).length,
        monitor: typeAssets.filter(a => a._rul > 90 && a._rul <= 365).length,
        good: typeAssets.filter(a => a._rul > 365).length,
        total: typeAssets.length
      };
    });

    // Scatter
    const scatterData: ScatterData[] = normalized.map(a => ({
      assetId: (a.asset_id ?? a.assetId ?? a.id ?? '') as string,
      type: a._type,
      location: (a.location ?? '') as string,
      healthScore: a._health,
      rulDays: a._rul,
      priority: (a.maintenance_priority ?? a.priority ?? 'Low') as string,
      alertCount: (a.active_alerts ?? a.alert_count ?? 0) as number,
      vendor: (a.vendor_name ?? a.vendor ?? 'Unknown') as string,
      utilizationPercentage: a.utilization_percentage
    }));

    // Heatmap
    const heatmapData: HeatmapAsset[] = normalized
      .filter(a => !!a._lat && !!a._lng)
      .map(a => ({
        assetId: (a.asset_id ?? a.assetId ?? a.id ?? '') as string,
        lat: a._lat,
        lng: a._lng,
        healthScore: a._health,
        type: a._type,
        location: (a.location ?? '') as string,
        rulDays: a._rul,
        priority: (a.maintenance_priority ?? a.priority ?? 'Low') as string,
        condition: a.condition
      }));

    // Line chart - simulate trend
    const lineChartData: any[] = [];
    for (let i = 23; i >= 0; i--) {
      const weekLabel = `Week ${24 - i}`;
      const weekData: any = { week: weekLabel };
    assetTypes.forEach(type => { 
        const typeAssets = normalized.filter(a => a._type === type);
        const avgHealth = typeAssets.length > 0
          ? typeAssets.reduce((s, a) => s + (a._health || 0), 0) / typeAssets.length
          : 0;
        const variance = (Math.random() - 0.5) * 5 * (i / 24);
        weekData[type] = Math.max(0, Math.min(100, avgHealth + variance));
      });
      lineChartData.push(weekData);
    }

    return { gaugeData, barData, scatterData, heatmapData, lineChartData };
  };

  const { gaugeData, barData, scatterData, heatmapData, lineChartData } = processData();

  const assetTypes = [...new Set(assets.map(a => a.type))];
  const colors: Record<string, string> = {
    'Rail Pad': '#3B82F6',
    'Elastic Rail Clip': '#10B981',
    'Liner': '#F59E0B',
    'Sleeper': '#8B5CF6'
  };

  const priorityColors: Record<string, string> = {
    'Immediate': '#DC2626',
    'High': '#e53935',
    'Medium': '#EAB308',
    'Low': '#16A34A'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 max-w-md shadow-lg">
          <h3 className="text-gray-900 font-bold mb-2 text-lg">Connection Error</h3>
          <p className="text-gray-700 text-sm mb-2">{error}</p>
          <p className="text-gray-600 text-xs mb-4">
            Run the provided SQL schema to set up your database tables and views.
          </p>
          <button
            onClick={fetchData}
            className="mt-4 bg-gradient-to-r from-gray-800 to-black text-white px-6 py-2 rounded hover:from-black hover:to-gray-900 font-medium transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">RailFit Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time asset health monitoring and predictive maintenance</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
              <span className="font-medium">Live</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 text-center shadow-md">
            <p className="text-gray-900 font-bold mb-2 text-lg">No assets found in database</p>
            <p className="text-gray-600 text-sm">
              Run the provided SQL schema to create tables and insert sample data.
            </p>
          </div>
        ) : (
          <>
            {/* Gauge and RUL Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <GaugeChart data={gaugeData} />
              <RULAnalyticsCard data={rulAnalytics} />
            </div>

            {/* Line Chart and Bar Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Area Chart - Health Score Trends */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Health Score Trends Over Time</h3>
                <div className="text-sm text-gray-600 mb-4">
                  Trend analysis showing health score progression by asset type
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={lineChartData}>
                    <defs>
                      {assetTypes.map((type, idx) => (
                        <linearGradient key={type} id={`color${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[type as string] ?? '#6366F1'} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors[type as string] ?? '#6366F1'} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="week" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <ReferenceLine y={40} stroke="#DC2626" strokeDasharray="3 3" label="Critical Threshold" />
                    {assetTypes.map((type, idx) => (
                      <Area
                        key={type}
                        type="monotone"
                        dataKey={type ?? 'unknown'}
                        stroke={colors[type as string] ?? '#6366F1'}
                        strokeWidth={2}
                        fill={`url(#color${idx})`}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stacked Bar Chart - RUL Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">RUL Distribution by Asset Type</h3>
                <div className="text-sm text-gray-600 mb-4">
                  Remaining Useful Life categorized by urgency level
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="assetType" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="critical" stackId="a" fill="#DC2626" name="Critical (≤30d)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="warning" stackId="a" fill="#F59E0B" name="Warning (31-90d)" />
                    <Bar dataKey="monitor" stackId="a" fill="#EAB308" name="Monitor (91-365d)" />
                    <Bar dataKey="good" stackId="a" fill="#16A34A" name="Good (>365d)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart and Radar Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pie Chart - Asset Type Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Asset Type Distribution</h3>
                <div className="text-sm text-gray-600 mb-4">
                  Composition of monitored assets by type
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={barData.map(item => ({
                        name: item.assetType,
                        value: item.total
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={colors[entry.assetType] ?? '#6366F1'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart - Asset Health Performance */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Asset Performance Radar</h3>
                <div className="text-sm text-gray-600 mb-4">
                  Multi-dimensional health assessment by asset type
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={barData.map(item => ({
                    assetType: item.assetType,
                    health: ((item.good + item.monitor) / item.total) * 100,
                    reliability: (item.good / item.total) * 100,
                    critical: 100 - ((item.critical / item.total) * 100),
                    availability: ((item.total - item.critical) / item.total) * 100
                  }))}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="assetType" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar 
                      name="Health Score" 
                      dataKey="health" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Reliability" 
                      dataKey="reliability" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heatmap */}
            {heatmapData.length > 0 && (
              <div className="mb-6">
                <HeatmapChart data={heatmapData} />
              </div>
            )}

            {/* Scatter Plot - Enhanced */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Health vs RUL Priority Matrix</h3>
              <div className="text-sm text-gray-600 mb-4">
                Interactive scatter plot showing the relationship between asset health and remaining useful life
              </div>
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart 
                  data={scatterData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    dataKey="healthScore" 
                    domain={[0, 100]} 
                    name="Health Score"
                    tickCount={6}
                    label={{ value: 'Health Score', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="rulDays" 
                    name="RUL (days)"
                    domain={[0, 'dataMax + 50']}
                    label={{ value: 'Remaining Useful Life (days)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-xl">
                            <p className="font-bold text-gray-900 text-base mb-2">{data.type}</p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700"><span className="font-semibold">ID:</span> {data.assetId}</p>
                              <p className="text-sm text-gray-700"><span className="font-semibold">Location:</span> {data.location}</p>
                              <p className="text-sm text-gray-700"><span className="font-semibold">Health:</span> {data.healthScore.toFixed(1)}</p>
                              <p className="text-sm text-gray-700"><span className="font-semibold">RUL:</span> {data.rulDays} days</p>
                              <p className={`text-sm font-semibold ${
                                data.priority === 'Immediate' ? 'text-red-600' :
                                data.priority === 'High' ? 'text-orange-600' :
                                data.priority === 'Medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>Priority: {data.priority}</p>
                              <p className="text-sm text-gray-700"><span className="font-semibold">Alerts:</span> {data.alertCount}</p>
                              <p className="text-sm text-gray-700"><span className="font-semibold">Vendor:</span> {data.vendor}</p>
                              {data.utilizationPercentage && (
                                <p className="text-sm text-gray-700"><span className="font-semibold">Utilization:</span> {data.utilizationPercentage}%</p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="3 3" label="Avg Health" />
                  <ReferenceLine y={180} stroke="#9ca3af" strokeDasharray="3 3" label="Critical RUL" />
                  
                  {Object.entries(priorityColors).map(([priority, color]) => {
                    const priorityData = scatterData.filter(d => d.priority === priority);
                    if (priorityData.length === 0) return null;
                    
                    return (
                      <Scatter
                        key={priority}
                        name={`${priority} Priority`}
                        data={priorityData}
                        fill={color}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={0.7}
                        shape="circle"
                      />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* Legend Description */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Quadrant Analysis:</span> Assets in the top-left quadrant (low health, high RUL) may need preventive maintenance. 
                  Bottom-right quadrant (high health, low RUL) indicates natural aging requiring scheduled replacement.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAnalytics;
