import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUpIcon, AlertTriangleIcon, Plus, Package, RefreshCw, TrendingUp, Activity } from "lucide-react";
import AddAssetModal from "@/components/AddAssetModal";
import type { Asset } from "@/types/asset";

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

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/dashboard', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // You could add a toast notification here for error handling
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh dashboard every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAssetAdded = async (asset: Asset) => {
    console.log('New asset added:', asset);
    
    // Show success notification (you can implement a toast system)
    console.log('Asset successfully added to the system!');
    
    // Refresh dashboard data to reflect the new asset
    await fetchDashboardData();
    
    // Optional: You could also optimistically update the dashboard
    // without waiting for the API call to complete
  };

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!dashboard || !dashboard.assetDistribution) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const operationalPercentage = ((dashboard.operationalAssets / dashboard.totalAssets) * 100);
  const maintenancePercentage = ((dashboard.maintenanceQueue / dashboard.totalAssets) * 100);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">RailFIT Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Railway Asset Management & Predictive Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Railway Assets</CardTitle>
            <div className="text-2xl">🚆</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalAssets.toLocaleString()}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span>+127 this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operational Assets</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{dashboard.operationalAssets.toLocaleString()}</div>
            <div className="mt-2 space-y-2">
              <Progress value={operationalPercentage} className="h-2" />
              <Badge variant="secondary" className="text-xs">
                {operationalPercentage.toFixed(1)}% Operational
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Queue</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{dashboard.maintenanceQueue}</div>
            <div className="mt-2 space-y-2">
              <Progress value={maintenancePercentage} className="h-2" />
              <Badge variant="outline" className="text-xs">
                {maintenancePercentage.toFixed(1)}% of fleet
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{dashboard.criticalAlerts}</div>
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Immediate Action Required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rolling Stock Health Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Rolling Stock Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-center">Asset Health Distribution</div>
                <div className="w-full h-6 bg-muted rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-green-500 flex-none transition-all duration-1000"
                    style={{ width: `${((dashboard.assetDistribution?.excellent ?? 0) / (dashboard.totalAssets || 1)) * 100}%` }}
                    title={`Excellent: ${dashboard.assetDistribution?.excellent ?? 0} assets`}
                  />
                  <div 
                    className="h-full bg-blue-500 flex-none transition-all duration-1000"
                    style={{ width: `${((dashboard.assetDistribution?.good ?? 0) / (dashboard.totalAssets || 1)) * 100}%` }}
                    title={`Good: ${dashboard.assetDistribution?.good ?? 0} assets`}
                  />
                  <div 
                    className="h-full bg-yellow-500 flex-none transition-all duration-1000"
                    style={{ width: `${((dashboard.assetDistribution?.fair ?? 0) / (dashboard.totalAssets || 1)) * 100}%` }}
                    title={`Fair: ${dashboard.assetDistribution?.fair ?? 0} assets`}
                  />
                  <div 
                    className="h-full bg-red-500 flex-none transition-all duration-1000"
                    style={{ width: `${((dashboard.assetDistribution?.critical ?? 0) / (dashboard.totalAssets || 1)) * 100}%` }}
                    title={`Critical: ${dashboard.assetDistribution?.critical ?? 0} assets`}
                  />
                </div>
              </div>
              
              {/* Enhanced Legend with Progress Bars */}
              <div className="space-y-3">
                {[
                  { label: 'Excellent', value: dashboard.assetDistribution?.excellent ?? 0, color: 'bg-green-500' },
                  { label: 'Good', value: dashboard.assetDistribution?.good ?? 0, color: 'bg-blue-500' },
                  { label: 'Fair', value: dashboard.assetDistribution?.fair ?? 0, color: 'bg-yellow-500' },
                  { label: 'Critical', value: dashboard.assetDistribution?.critical ?? 0, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${item.color} rounded-sm`}></div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${(item.value / dashboard.totalAssets) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                        {item.value} assets
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live System Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg border bg-muted/30">
                  <div className="text-3xl font-bold text-green-600">{dashboard.systemUptime}%</div>
                  <div className="text-xs text-muted-foreground mt-1">System Uptime</div>
                  <Progress value={dashboard.systemUptime} className="mt-2 h-1" />
                </div>
                <div className="text-center p-4 rounded-lg border bg-muted/30">
                  <div className="text-3xl font-bold text-blue-600">{dashboard.avgResponseTime}s</div>
                  <div className="text-xs text-muted-foreground mt-1">Avg Response Time</div>
                  <div className="mt-2 flex justify-center">
                    <Badge variant={dashboard.avgResponseTime < 2 ? "secondary" : "outline"} className="text-xs">
                      {dashboard.avgResponseTime < 2 ? "Optimal" : "Normal"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Zone Status</h4>
                {dashboard.zones.map((zone, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <span className="font-medium text-sm">{zone.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        zone.status === 'Online' ? "bg-green-500" : 
                        zone.status === 'Offline' ? "bg-red-500" : "bg-yellow-500"
                      }`}/>
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
          {/* Quick Action Items */}
          <div className={`absolute bottom-16 right-0 transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
            <div className="flex flex-col gap-3 min-w-max">
              <Button
                onClick={() => {
                  setShowAddAssetModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 shadow-lg border px-4 py-3 rounded-full transition-all duration-200 hover:scale-105"
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Add Asset</span>
              </Button> 
            </div>
          </div>

          {/* Main FAB */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out ${
              isOpen ? 'rotate-45' : 'rotate-0'
            } hover:scale-110`}
          >
            <Plus className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
          </Button>
        </div>

        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onAssetAdded={handleAssetAdded}
      />
    </div>
  );
}