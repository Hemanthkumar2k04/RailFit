// src/components/AssetStatusCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPinIcon, 
  CalendarIcon, 
  WrenchScrewdriverIcon,
  ChartBarIcon,
  QrCodeIcon
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

interface AssetStatusCardProps {
  asset: Asset;
}

export const AssetStatusCard: React.FC<AssetStatusCardProps> = ({ asset }) => {
  const getStatusVariant = (status: Asset['status']) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      case 'maintenance': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const daysUntilWarrantyExpiry = Math.ceil(
    (asset.warrantyExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{asset.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{asset.category}</p>
          </div>
          <Badge variant={getStatusVariant(asset.status)} className="capitalize">
            {asset.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinIcon className="w-4 h-4" />
          <span>{asset.location}</span>
        </div>

        {/* Predictive Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Health Score</span>
            <span className={`text-sm font-bold ${getScoreColor(asset.predictiveScore)}`}>
              {asset.predictiveScore}%
            </span>
          </div>
          <Progress 
            value={asset.predictiveScore} 
            className="h-2"
          />
        </div>

        {/* Warranty Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>Warranty</span>
          </div>
          <span className={daysUntilWarrantyExpiry <= 30 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
            {daysUntilWarrantyExpiry > 0 
              ? `${daysUntilWarrantyExpiry} days left`
              : 'Expired'
            }
          </span>
        </div>

        {/* Last Maintenance */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-4 h-4 text-muted-foreground" />
            <span>Last Service</span>
          </div>
          <span className="text-muted-foreground">
            {asset.lastMaintenance.toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <QrCodeIcon className="w-4 h-4" />
            View QR
          </Button>
          <Button 
            variant={asset.status === 'critical' ? 'destructive' : 'default'} 
            size="sm" 
            className="flex-1"
          >
            <ChartBarIcon className="w-4 h-4" />
            Details
          </Button>
        </div>

        {/* Critical Alert */}
        {asset.status === 'critical' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Immediate attention required
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};