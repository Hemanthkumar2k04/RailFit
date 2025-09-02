// src/components/AlertNotifications.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExclamationTriangleIcon,
  BellAlertIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  warrantyExpiry: Date;
  lastMaintenance: Date;
  predictiveScore: number;
  qrCode: string;
}

interface AlertNotificationsProps {
  criticalAssets: Asset[];
  warrantyExpiring: Asset[];
}

export const AlertNotifications: React.FC<AlertNotificationsProps> = ({ 
  criticalAssets, 
  warrantyExpiring 
}) => {
  const generateAlerts = () => {
    const alerts = [];

    // Critical asset alerts
    criticalAssets.forEach(asset => {
      alerts.push({
        id: `critical-${asset.id}`,
        type: 'critical',
        title: 'Critical Asset Alert',
        message: `${asset.name} requires immediate attention`,
        asset: asset.name,
        location: asset.location,
        timestamp: new Date(),
        action: 'Schedule Emergency Maintenance'
      });
    });

    // Warranty expiring alerts
    warrantyExpiring.forEach(asset => {
      const daysLeft = Math.ceil(
        (asset.warrantyExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      alerts.push({
        id: `warranty-${asset.id}`,
        type: 'warranty',
        title: 'Warranty Expiring Soon',
        message: `${asset.name} warranty expires in ${daysLeft} days`,
        asset: asset.name,
        location: asset.location,
        timestamp: new Date(),
        action: 'Renew Warranty'
      });
    });

    // Predictive maintenance alerts
    criticalAssets
      .filter(asset => asset.predictiveScore < 40)
      .forEach(asset => {
        alerts.push({
          id: `predictive-${asset.id}`,
          type: 'predictive',
          title: 'Predictive Maintenance Alert',
          message: `AI predicts ${asset.name} may fail within 30 days (${asset.predictiveScore}% health)`,
          asset: asset.name,
          location: asset.location,
          timestamp: new Date(),
          action: 'Schedule Preventive Maintenance'
        });
      });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />;
      case 'warranty':
        return <CalendarIcon className="w-5 h-5 text-warning" />;
      case 'predictive':
        return <BellAlertIcon className="w-5 h-5 text-primary" />;
      default:
        return <BellAlertIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warranty':
        return 'secondary';
      case 'predictive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warranty: alerts.filter(a => a.type === 'warranty').length,
    predictive: alerts.filter(a => a.type === 'predictive').length
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Total Alerts</p>
                <p className="text-2xl font-bold text-primary">{alertStats.total}</p>
              </div>
              <BellAlertIcon className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Critical</p>
                <p className="text-2xl font-bold text-destructive">{alertStats.critical}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Warranty</p>
                <p className="text-2xl font-bold text-warning">{alertStats.warranty}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Predictive</p>
                <p className="text-2xl font-bold text-success">{alertStats.predictive}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            Real-time notifications and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 mx-auto text-success mb-4" />
              <h3 className="text-lg font-medium text-success mb-2">All Systems Normal</h3>
              <p className="text-muted-foreground">No active alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                      <Badge variant={getAlertVariant(alert.type)} className="ml-2">
                        {alert.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                      <span>{alert.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{alert.asset}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button 
                          variant={alert.type === 'critical' ? 'destructive' : 'default'} 
                          size="sm"
                        >
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure automatic alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Alert Channels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <Badge variant="outline" className="text-success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Alerts</span>
                  <Badge variant="outline" className="text-success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <Badge variant="outline" className="text-success">Enabled</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Alert Thresholds</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Health Score Alert</span>
                  <Badge variant="outline">&lt; 40%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Warranty Warning</span>
                  <Badge variant="outline">90 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maintenance Due</span>
                  <Badge variant="outline">30 days</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button variant="outline">Configure Settings</Button>
            <Button>Test Notifications</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};