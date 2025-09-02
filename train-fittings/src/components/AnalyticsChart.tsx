// src/components/AnalyticsChart.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
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

interface AnalyticsChartProps {
  assets: Asset[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ assets }) => {
  const categoryStats = assets.reduce((acc, asset) => {
    const category = asset.category;
    if (!acc[category]) {
      acc[category] = { total: 0, healthy: 0, warning: 0, critical: 0, avgScore: 0 };
    }
    acc[category].total += 1;
    acc[category][asset.status] = (acc[category][asset.status] || 0) + 1;
    acc[category].avgScore += asset.predictiveScore;
    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].avgScore = Math.round(
      categoryStats[category].avgScore / categoryStats[category].total
    );
  });

  const overallStats = {
    totalAssets: assets.length,
    avgHealthScore: Math.round(
      assets.reduce((sum, asset) => sum + asset.predictiveScore, 0) / assets.length
    ),
    criticalAssets: assets.filter(a => a.status === 'critical').length,
    warrantyExpiringSoon: assets.filter(a => {
      const daysUntilExpiry = Math.ceil(
        (a.warrantyExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    }).length
  };

  const predictiveInsights = [
    {
      title: 'Failure Risk Analysis',
      description: 'Assets with high failure probability in next 30 days',
      items: assets
        .filter(a => a.predictiveScore < 50)
        .map(a => ({
          name: a.name,
          risk: 100 - a.predictiveScore,
          status: a.status
        }))
    },
    {
      title: 'Maintenance Recommendations',
      description: 'Suggested maintenance actions based on AI analysis',
      items: [
        { name: 'HVAC System #B02', action: 'Filter replacement recommended', priority: 'High' },
        { name: 'Server Rack #C03', action: 'Cooling system inspection needed', priority: 'Critical' },
        { name: 'Water Pump #D04', action: 'Regular maintenance due', priority: 'Medium' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{overallStats.totalAssets}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold text-success">{overallStats.avgHealthScore}%</p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Assets</p>
                <p className="text-2xl font-bold text-destructive">{overallStats.criticalAssets}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warranty Expiring</p>
                <p className="text-2xl font-bold text-warning">{overallStats.warrantyExpiringSoon}</p>
              </div>
              <ArrowTrendingDownIcon className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Category Analysis</CardTitle>
          <CardDescription>Health metrics by equipment category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{category}</h4>
                  <Badge variant="outline">{stats.total} assets</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <p className="font-medium text-success">{stats.healthy || 0}</p>
                    <p className="text-muted-foreground">Healthy</p>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <p className="font-medium text-warning">{stats.warning || 0}</p>
                    <p className="text-muted-foreground">Warning</p>
                  </div>
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <p className="font-medium text-destructive">{stats.critical || 0}</p>
                    <p className="text-muted-foreground">Critical</p>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="font-medium text-primary">{stats.avgScore}%</p>
                    <p className="text-muted-foreground">Avg Score</p>
                  </div>
                </div>
                
                <Progress value={(stats.healthy / stats.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictiveInsights.map((insight, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <CardDescription>{insight.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insight.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      {'risk' in item && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">Risk:</span>
                          <Badge 
                            variant={item.risk > 70 ? 'destructive' : item.risk > 40 ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {item.risk}%
                          </Badge>
                        </div>
                      )}
                      {'action' in item && (
                        <p className="text-xs text-muted-foreground mt-1">{item.action}</p>
                      )}
                    </div>
                    {'priority' in item && (
                      <Badge 
                        variant={
                          item.priority === 'Critical' ? 'destructive' : 
                          item.priority === 'High' ? 'secondary' : 'outline'
                        }
                      >
                        {item.priority}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};