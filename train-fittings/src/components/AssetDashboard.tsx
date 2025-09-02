// src/components/AssetDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCodeIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AssetStatusCard } from './AssetStatusCard';
import { QRScanner } from './QRScanner';
import { AnalyticsChart } from './AnalyticsChart';
import { AlertNotifications } from './AlertNotifications';
import { ApiService, Asset } from '../services/api';
import { useToast } from '../hooks/use-toast';

export const AssetDashboard: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const { toast } = useToast();

  // Load assets from backend API only
  useEffect(() => {
    loadAssetsFromBackend();
  }, []);

  const loadAssetsFromBackend = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Checking backend connection...');
      
      // Check if backend is healthy
      const isHealthy = await ApiService.healthCheck();
      setBackendConnected(isHealthy);

      if (!isHealthy) {
        throw new Error('Backend service is not available. Please check if the Flask server is running on http://localhost:5000');
      }

      console.log('Backend connected, fetching assets...');
      
      // Load assets from backend
      const fetchedAssets = await ApiService.fetchAllAssets();
      console.log('Assets fetched:', fetchedAssets);
      
      setAssets(fetchedAssets);
      
      // Generate AI alerts after loading assets
      try {
        await ApiService.generateAIAlerts();
      } catch (alertError) {
        console.warn('Failed to generate AI alerts:', alertError);
      }
      
      toast({
        title: "Data Loaded Successfully",
        description: `Loaded ${fetchedAssets.length} assets from database via backend API`,
      });

    } catch (err) {
      console.error('Failed to load assets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setBackendConnected(false);
      
      toast({
        title: "Backend Connection Failed",
        description: "Please ensure Flask backend is running on http://localhost:5000",
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      console.log('Scanning QR code:', qrCode);
      
      // Look up asset by QR code via backend API
      const foundAsset = await ApiService.fetchAssetByQRCode(qrCode);
      
      toast({
        title: "Asset Found",
        description: `Scanned: ${foundAsset.name} at ${foundAsset.location}`,
      });
      
      // You could navigate to asset details or highlight the asset
      
    } catch (err) {
      console.error('QR scan failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Asset not found';
      
      toast({
        title: "Asset Not Found",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const statusCounts = {
    healthy: assets.filter(a => a.status === 'healthy').length,
    warning: assets.filter(a => a.status === 'warning').length,
    critical: assets.filter(a => a.status === 'critical').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length
  };

  const criticalAssets = assets.filter(a => a.status === 'critical' || a.predictiveScore < 40);
  const warrantyExpiringSoon = assets.filter(a => {
    const daysUntilExpiry = Math.ceil((a.warrantyExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground mb-2">Connecting to backend...</p>
            <p className="text-xs text-muted-foreground">Ensure Flask server is running on port 5000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Asset Management System
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">
                Smart warranty tracking with predictive analytics
              </p>
              <Badge 
                variant={backendConnected ? 'default' : 'destructive'}
                className="text-xs"
              >
                {backendConnected ? '🟢 Live Data' : '🔴 Backend Offline'}
              </Badge>
              {backendConnected && (
                <Badge variant="outline" className="text-xs">
                  Database Connected
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={loadAssetsFromBackend}
              disabled={loading}
            >
              <ArrowPathIcon className="w-4 h-4" />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button 
              variant="default"
              onClick={() => setScannerOpen(true)}
              className="shadow-lg"
              disabled={!backendConnected}
            >
              <QrCodeIcon className="w-4 h-4" />
              Scan Asset
            </Button>
            <Button variant="outline" disabled={!backendConnected}>
              <ChartBarIcon className="w-4 h-4" />
              Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Backend Connection Error Banner */}
      {!backendConnected && (
        <div className="mb-6">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive">Backend Connection Failed</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {error || 'Unable to connect to Flask backend server'}
                  </p>
                  <div className="text-xs space-y-1">
                    <p>• Ensure Flask backend is running: <code className="bg-muted px-1 rounded">python app.py</code></p>
                    <p>• Backend should be accessible at: <code className="bg-muted px-1 rounded">http://localhost:5000</code></p>
                    <p>• Check console for detailed error messages</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={loadAssetsFromBackend}>
                  Retry Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Alert Banner */}
      {backendConnected && criticalAssets.length > 0 && (
        <div className="mb-6">
          <Card className="border-warning bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
                <div>
                  <h3 className="font-semibold text-warning">Critical Assets Alert</h3>
                  <p className="text-sm text-muted-foreground">
                    {criticalAssets.length} assets require immediate attention
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Healthy Assets</p>
                <p className="text-2xl font-bold text-green-800">{statusCounts.healthy}</p>
                <p className="text-xs text-green-600 mt-1">
                  {assets.length > 0 ? Math.round((statusCounts.healthy / assets.length) * 100) : 0}% of total
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Warning</p>
                <p className="text-2xl font-bold text-yellow-800">{statusCounts.warning}</p>
                <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Critical</p>
                <p className="text-2xl font-bold text-red-800">{statusCounts.critical}</p>
                <p className="text-xs text-red-600 mt-1">Immediate action</p>
              </div>
              <BellAlertIcon className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Maintenance</p>
                <p className="text-2xl font-bold text-blue-800">{statusCounts.maintenance}</p>
                <p className="text-xs text-blue-600 mt-1">Scheduled service</p>
              </div>
              <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Show message when no assets loaded */}
      {backendConnected && assets.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <ChartBarIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
          <p className="text-muted-foreground mb-4">
            No assets were found in the database. Make sure your Supabase database has data.
          </p>
          <Button onClick={loadAssetsFromBackend}>
            Refresh Data
          </Button>
        </div>
      )}

      {/* Main Content Tabs - Only show if backend is connected and has assets */}
      {backendConnected && assets.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Asset Overview ({assets.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({criticalAssets.length})</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <AssetStatusCard key={asset.id} asset={asset} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsChart assets={assets} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertNotifications 
              criticalAssets={criticalAssets}
              warrantyExpiring={warrantyExpiringSoon}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Maintenance</CardTitle>
                  <CardDescription>
                    Assets scheduled for maintenance in the next 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assets.filter(a => a.status === 'warning' || a.predictiveScore < 60).slice(0, 5).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Last service: {asset.lastMaintenance.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={asset.status === 'critical' ? 'destructive' : 'secondary'}>
                            Score: {asset.predictiveScore}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {assets.filter(a => a.status === 'warning' || a.predictiveScore < 60).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No assets require immediate maintenance
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Warranty Expiring Soon</CardTitle>
                  <CardDescription>
                    Assets with warranty expiring in next 90 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {warrantyExpiringSoon.slice(0, 5).map((asset) => {
                      const daysLeft = Math.ceil((asset.warrantyExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={asset.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <WrenchScrewdriverIcon className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">{asset.location}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={daysLeft <= 30 ? 'destructive' : 'secondary'}>
                              {daysLeft} days left
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {warrantyExpiringSoon.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No warranties expiring soon
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <QRScanner 
          open={scannerOpen} 
          onClose={() => setScannerOpen(false)}
          onScan={handleQRScan}
        />
      )}
    </div>
  );
};