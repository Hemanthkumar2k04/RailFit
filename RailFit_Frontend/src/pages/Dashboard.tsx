import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Plus, Package, RefreshCw, TrendingUp, Activity } from "lucide-react";
import AddAssetModal from "@/components/AddAssetModal";

// Utility functions
const formatNumber = (num: number, decimals = 2): string => {
  if (num === undefined || num === null) return '0';
  return Number(num).toFixed(decimals);
};

const formatPercentage = (value: number, total: number, decimals = 1): string => {
  if (!total) return '0.0';
  return ((value / total) * 100).toFixed(decimals);
};

type DashboardData = {
  totalAssets: number;
  operationalAssets: number;
  maintenanceQueue: number;
  criticalAlerts: number;
  assetDistribution: {
    excellent: number;
    good: number;
    fair: number;
    critical: number;
  };
  systemUptime: number;
  avgResponseTime: number;
  zones: { name: string; status: string }[];
};

// Asset interface for API response
interface Asset {
  asset_id: string;
  type: string;
  location: string;
  health_score?: number;
  status: string;
  install_date?: string;
  vendor_id?: string;
  created_at: string;
  updated_at: string;
}

interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData>({
    totalAssets: 0,
    operationalAssets: 0,
    maintenanceQueue: 0,
    criticalAlerts: 0,
    assetDistribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      critical: 0
    },
    systemUptime: 99.201,
    avgResponseTime: 1.3,
    zones: [
      { name: "Northern Railways", status: "Online" },
      { name: "Southern Railways", status: "Online" },
      { name: "Eastern Railways", status: "Maintenance" },
      { name: "Western Railways", status: "Online" }
    ]
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const calculateMetricsFromAssets = (assets: Asset[]): Partial<DashboardData> => {
    console.log('Dashboard: Calculating metrics for', assets.length, 'assets');
    console.log('Dashboard: Assets received for calculation:', assets);
    
    const totalAssets = assets.length;
    
    // Count operational assets (active status)
    const operationalAssets = assets.filter(asset => 
      asset.status === 'active'
    ).length;
    
    // Count assets needing maintenance
    const maintenanceQueue = assets.filter(asset => 
      asset.status === 'needs_maintenance' || asset.status === 'under_repair'
    ).length;
    
    // Count critical alerts (assets with health score < 30 or critical status)
    const criticalAlerts = assets.filter(asset => 
      (asset.health_score && asset.health_score < 30) || 
      asset.status === 'decommissioned'
    ).length;
    
    // Calculate asset distribution based on health scores
    const assetDistribution = {
      excellent: assets.filter(asset => asset.health_score && asset.health_score >= 85).length,
      good: assets.filter(asset => asset.health_score && asset.health_score >= 70 && asset.health_score < 85).length,
      fair: assets.filter(asset => asset.health_score && asset.health_score >= 50 && asset.health_score < 70).length,
      critical: assets.filter(asset => !asset.health_score || asset.health_score < 50).length
    };
    
    const result = {
      totalAssets,
      operationalAssets,
      maintenanceQueue,
      criticalAlerts,
      assetDistribution
    };
    
    console.log('Dashboard: Calculated metrics result:', result);
    return result;
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      console.log('Dashboard: JWT token found:', !!token);
      
      if (!token) {
        console.warn('Dashboard: No authentication token found');
        setIsRefreshing(false);
        return;
      }

      console.log('Dashboard: Fetching assets from API...');
      // Fetch all assets with maximum allowed limit to get complete data for metrics
      const response = await fetch('http://localhost:5000/api/assets?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard: API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard: API error response:', errorText);
        throw new Error(`Failed to fetch assets: ${response.status} ${response.statusText}`);
      }

      const data: AssetListResponse = await response.json();
      console.log('Dashboard: Assets received:', data.total, 'assets');
      console.log('Dashboard: Assets data:', data);
      
      const calculatedMetrics = calculateMetricsFromAssets(data.assets);
      console.log('Dashboard: Calculated metrics:', calculatedMetrics);
      
      setDashboard(prev => ({
        ...prev,
        ...calculatedMetrics
      }));
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load initial data
    fetchDashboardData();
    
    // Auto-refresh dashboard every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssetAdded = async (asset: any) => {
    console.log('New asset added:', asset);
    await fetchDashboardData();
  };

  const operationalPercentage = parseFloat(formatPercentage(dashboard.operationalAssets, dashboard.totalAssets));
  const maintenancePercentage = parseFloat(formatPercentage(dashboard.maintenanceQueue, dashboard.totalAssets));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">RailFIT Dashboard</h1>
            <p className="text-gray-600 mt-1">Railway Asset Management & Predictive Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          <Card className="h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold">{dashboard.totalAssets.toLocaleString()}</p>
                  <div className="flex items-center text-sm text-emerald-600 mt-1">
                    <TrendingUp className="mr-1" />
                    <span>+127 this quarter</span>
                  </div>
                </div>
                <div className="text-3xl">🚆</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-400 h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Operational Assets</p>
                  <p className="text-2xl font-bold text-emerald-600">{dashboard.operationalAssets.toLocaleString()}</p>
                  <div className="mt-2 space-y-1">
                    <Progress value={operationalPercentage} className="h-2" />
                    <Badge variant="secondary" className="text-xs">
                      {operationalPercentage}% Active
                    </Badge>
                  </div>
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-400 h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Maintenance Queue</p>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.maintenanceQueue}</p>
                  <div className="mt-2 space-y-1">
                    <Progress value={maintenancePercentage} className="h-2" />
                    <Badge variant="outline" className="text-xs">
                      {maintenancePercentage}% of fleet
                    </Badge>
                  </div>
                </div>
                <AlertTriangle className="text-amber-500 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-400 h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-rose-600">{dashboard.criticalAlerts}</p>
                  <div className="mt-2">
                    <Badge variant="destructive" className="text-xs">
                      Immediate Action Required
                    </Badge>
                  </div>
                </div>
                <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Asset Health Distribution */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity />
                Asset Health Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6">
              <div className="space-y-6">
                {/* Health Bar */}
                <div className="w-full h-5 bg-muted/20 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-1000 outline"
                    style={{ width: `${(dashboard.assetDistribution.excellent / dashboard.totalAssets) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-slate-400 transition-all duration-1000"
                    style={{ width: `${(dashboard.assetDistribution.good / dashboard.totalAssets) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-amber-400 transition-all duration-1000"
                    style={{ width: `${(dashboard.assetDistribution.fair / dashboard.totalAssets) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-rose-400 transition-all duration-1000"
                    style={{ width: `${(dashboard.assetDistribution.critical / dashboard.totalAssets) * 100}%` }}
                  />
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Excellent', value: dashboard.assetDistribution.excellent, color: 'bg-emerald-400' },
                    { label: 'Good', value: dashboard.assetDistribution.good, color: 'bg-slate-400' },
                    { label: 'Fair', value: dashboard.assetDistribution.fair, color: 'bg-amber-400' },
                    { label: 'Critical', value: dashboard.assetDistribution.critical, color: 'bg-rose-400' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-400">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 ${item.color} rounded shadow-sm`} />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/20 border">
                    <div className="text-2xl font-bold text-emerald-500">
                      {formatNumber(dashboard.systemUptime, 2)}%
                    </div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                    <Progress value={dashboard.systemUptime} className="mt-2 h-1" />
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/20 border">
                    <div className="text-2xl font-bold text-slate-500">
                      {formatNumber(dashboard.avgResponseTime, 1)}s
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                    <Badge variant={dashboard.avgResponseTime < 2 ? "secondary" : "outline"} className="mt-2">
                      {dashboard.avgResponseTime < 2 ? "Optimal" : "Normal"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Zone Status</h4>
                  {dashboard.zones.map((zone, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border">
                      <span className="font-medium text-sm">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          zone.status === 'Online' ? "bg-emerald-400 animate-pulse" : 
                          zone.status === 'Offline' ? "bg-rose-400" : "bg-amber-400"
                        }`} />
                        <Badge 
                          variant={zone.status === 'Online' ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {zone.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Quick Actions */}
            <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assets?addAsset=true');
                }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 shadow-lg border mb-3 rounded-full"
                variant="outline"
              >
                <Package />
                Add Asset
              </Button>
            </div>

            {/* Main FAB */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-12 h-12 rounded-full shadow-lg transition-transform duration-200 ${
                isOpen ? 'rotate-45' : 'rotate-0'
              } hover:scale-110`}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {/* Add Asset Modal */}
        <AddAssetModal
          isOpen={showAddAssetModal}
          onClose={() => setShowAddAssetModal(false)}
          onAssetAdded={handleAssetAdded}
        />
      </div>
    </div>
  );
}