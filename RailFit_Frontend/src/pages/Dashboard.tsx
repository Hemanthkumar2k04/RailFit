import React, { useEffect, useState } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";

// Mock UI components since we can't import the actual ones
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
const Card = ({ children, className = "", ...props }: CardProps) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
const CardContent = ({ children, className = "", ...props }: CardContentProps) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
const CardHeader = ({ children, className = "", ...props }: CardHeaderProps) => (
  <div className={`p-6 pb-3 ${className}`} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}
const CardTitle = ({ children, className = "", ...props }: CardTitleProps) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}
const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
  destructive: "bg-red-100 text-red-800",
  outline: "border border-gray-200 text-gray-700"
};
const Badge = ({ children, variant = "default", className = "", ...props }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "icon";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}
const buttonVariants: Record<ButtonVariant, string> = {
  default: "bg-black text-white hover:bg-gray-800",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100"
};
const buttonSizes: Record<ButtonSize, string> = {
  default: "px-4 py-2 h-9",
  sm: "px-3 py-1.5 h-8 text-sm",
  icon: "w-9 h-9"
};
const Button = ({ children, variant = "default", size = "default", className = "", disabled = false, ...props }: ButtonProps) => {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Progress = ({ value = 0, className = "", barColor = "bg-blue-600", ...props }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`} {...props}>
      <div 
        className={`h-full ${barColor} transition-all duration-300 ease-out rounded-full`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

// Icons as simple components
const RefreshIcon = ({ className = "", ...props }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const TrendingUpIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertTriangleIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ActivityIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PackageIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const PlusIcon = ({ className = "" }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Mock Modal Component
interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded?: (asset: any) => void;
}
const AddAssetModal = ({ isOpen, onClose, onAssetAdded }: AddAssetModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Asset</h2>
        <p className="text-gray-600 mb-4">Asset creation form would go here.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onAssetAdded?.({}); onClose(); }}>Add Asset</Button>
        </div>
      </div>
    </div>
  );
};

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

export default function Dashboard() {
  const [dashboard] = useState<DashboardData>({
    totalAssets: 1247,
    operationalAssets: 1185,
    maintenanceQueue: 45,
    criticalAlerts: 17,
    assetDistribution: {
      excellent: 712,
      good: 385,
      fair: 133,
      critical: 17
    },
    systemUptime: 99.201,
    avgResponseTime: 1.3,
    zones: [
      { name: "Northern Railways", status: "Online" },
      { name: "Sourthern Railways", status: "Online" },
      { name: "Eastern Railways", status: "Maintenance" },
      { name: "Western Railways", status: "Online" }
    ]
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
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
              <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold">{dashboard.totalAssets.toLocaleString()}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUpIcon className="mr-1" />
                    <span>+127 this quarter</span>
                  </div>
                </div>
                <div className="text-3xl">🚆</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Operational Assets</p>
                  <p className="text-2xl font-bold text-emerald-600">{dashboard.operationalAssets.toLocaleString()}</p>
                  <div className="mt-2 space-y-1">
                    {/* Updated progress bar color to match the green theme */}
                    <Progress value={operationalPercentage} className="h-2" barColor="bg-emerald-400" />
                    <Badge variant="secondary" className="text-xs">
                      {operationalPercentage}% Active
                    </Badge>
                  </div>
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Maintenance Queue</p>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.maintenanceQueue}</p>
                  <div className="mt-2 space-y-1">
                    <Progress value={maintenancePercentage} className="h-2" barColor="bg-amber-600" />
                    <Badge variant="outline" className="text-xs">
                      {maintenancePercentage}% of fleet
                    </Badge>
                  </div>
                </div>
                <AlertTriangleIcon className="text-amber-500 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-400">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Health Distribution */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ActivityIcon />
                Asset Health Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Health Bar */}
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-1000"
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
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${item.color} rounded`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ActivityIcon />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50 border">
                    <div className="text-2xl font-bold text-emerald-500">
                      {formatNumber(dashboard.systemUptime, 2)}%
                    </div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                    <Progress value={dashboard.systemUptime} className="mt-2 h-1" barColor="bg-emerald-500" />
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 border">
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
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                      <span className="font-medium text-sm">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          zone.status === 'Online' ? "bg-green-500 animate-pulse" : 
                          zone.status === 'Offline' ? "bg-red-500" : "bg-amber-500"
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
                  setShowAddAssetModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 shadow-lg border mb-3 rounded-full"
                variant="outline"
              >
                <PackageIcon />
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
              <PlusIcon />
            </Button>
          </div>

          {/* Backdrop */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-20 -z-10"
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
    </div>
  );
}