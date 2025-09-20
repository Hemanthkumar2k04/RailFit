import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, AlertTriangleIcon } from "lucide-react";

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

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboard(data));
  }, []);

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">RailFIT Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Railway Asset Management & Predictive Analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Railway Assets</CardTitle>
            <div className="text-2xl">🚆</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalAssets}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              <span>+127 this quarter</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operational Assets</CardTitle>
            <div className="h-4 w-4 rounded-full bg-slate-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.operationalAssets}</div>
            <div className="flex items-center justify-between mt-1">
              <Badge variant="secondary" className="text-xs">
                {((dashboard.operationalAssets / dashboard.totalAssets) * 100).toFixed(1)}% Operational
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Queue</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.maintenanceQueue}</div>
            <div className="flex items-center justify-between mt-1">
              <Badge variant="outline" className="text-xs">
                {((dashboard.maintenanceQueue / dashboard.totalAssets) * 100).toFixed(1)}% of fleet
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
            <div className="h-4 w-4 rounded-full bg-slate-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.criticalAlerts}</div>
            <div className="flex items-center justify-between mt-1">
              <Badge variant="outline" className="text-xs">Immediate Action Required</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rolling Stock Health Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">🚄 Rolling Stock Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <div className="text-sm font-medium text-center">Asset Health Distribution</div>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-slate-600 flex-none"
                   style={{ width: `${(dashboard.assetDistribution.excellent / dashboard.totalAssets) * 100}%` }}
                   title={`Excellent: ${dashboard.assetDistribution.excellent} assets`}/>
                <div className="h-full bg-slate-500 flex-none"
                   style={{ width: `${(dashboard.assetDistribution.good / dashboard.totalAssets) * 100}%` }}
                   title={`Good: ${dashboard.assetDistribution.good} assets`}/>
                <div className="h-full bg-slate-400 flex-none"
                   style={{ width: `${(dashboard.assetDistribution.fair / dashboard.totalAssets) * 100}%` }}
                   title={`Fair: ${dashboard.assetDistribution.fair} assets`}/>
                <div className="h-full bg-slate-700 flex-none"
                   style={{ width: `${(dashboard.assetDistribution.critical / dashboard.totalAssets) * 100}%` }}
                   title={`Critical: ${dashboard.assetDistribution.critical} assets`}/>
              </div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
                <div>Excellent ({dashboard.assetDistribution.excellent} assets)</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-500 rounded-sm"></div>
                <div>Good ({dashboard.assetDistribution.good} assets)</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
                <div>Fair ({dashboard.assetDistribution.fair} assets)</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                <div>Critical ({dashboard.assetDistribution.critical} assets)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Live System Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold">{dashboard.systemUptime}%</div>
                <div className="text-xs text-muted-foreground">System Uptime</div>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold">{dashboard.avgResponseTime}s</div>
                <div className="text-xs text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
            <div className="space-y-2">
              {dashboard.zones.map((zone, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{zone.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${zone.status === 'Online' ? "bg-slate-400" : "bg-slate-500"}`}/>
                    <span className="text-muted-foreground">{zone.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
