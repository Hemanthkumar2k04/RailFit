import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Package, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import type { Asset, AssetCreate } from '@/types/asset';
import { ASSET_TYPES } from '@/types/asset';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded?: (asset: Asset) => void;
}

export default function AddAssetModal({ isOpen, onClose, onAssetAdded }: AddAssetModalProps) {
  const [formData, setFormData] = useState<AssetCreate>({
    type: '',
    vendor: '',
    installDate: '',
    location: '',
    warrantyPeriod: 24
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('jwt_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/assets/', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create asset');
      }

      const result = await response.json();
      
      // The API returns the asset directly, not wrapped in a CreateAssetResponse
      const asset: Asset = {
        assetId: result.asset_id,
        type: result.type,
        vendor: result.vendor_id || '',
        installDate: result.install_date || '',
        location: result.location,
        warrantyPeriod: result.warranty_period || 0,
        healthScore: result.health_score,
        predictedRUL: result.predicted_rul,
        status: result.status,
        lastInspection: undefined,
        inspectionHistory: []
      };
      
      setCreatedAsset(asset);
      
      if (onAssetAdded) {
        onAssetAdded(asset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: '',
      vendor: '',
      installDate: '',
      location: '',
      warrantyPeriod: 24
    });
    setCreatedAsset(null);
    setError('');
    onClose();
  };

  const handleInputChange = (field: keyof AssetCreate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {createdAsset ? 'Asset Created Successfully!' : 'Add New Asset'}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {!createdAsset ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asset Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Asset Type</option>
                    {ASSET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor *</label>
                  <Input
                    value={formData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    placeholder="e.g., ABC Industries"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Install Date *</label>
                  <Input
                    type="date"
                    value={formData.installDate}
                    onChange={(e) => handleInputChange('installDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Warranty Period (months) *</label>
                  <Input
                    type="number"
                    value={formData.warrantyPeriod}
                    onChange={(e) => handleInputChange('warrantyPeriod', parseInt(e.target.value))}
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Delhi-Mumbai Route, KM 245"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-black hover:bg-gray-800"
                >
                  {isLoading ? 'Creating...' : 'Create Asset'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-800">Asset Created Successfully!</h4>
                  <p className="text-sm text-green-600">Asset ID: {createdAsset.assetId}</p>
                </div>
              </div>

              {/* Asset Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <p className="font-medium">{createdAsset.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Vendor:</span>
                  <p className="font-medium">{createdAsset.vendor}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Location:</span>
                  <p className="font-medium">{createdAsset.location}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Health Score:</span>
                  <p className="font-medium">{createdAsset.healthScore}%</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="h-5 w-5" />
                  <h4 className="font-medium">Asset QR Code</h4>
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white border rounded-lg">
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded">
                      <QrCode className="h-16 w-16 text-gray-400" />
                      <span className="sr-only">QR Code for {createdAsset.assetId}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code to quickly access asset information
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Print QR Code
                </Button>
                <Button
                  onClick={handleClose}
                  className="bg-black hover:bg-gray-800"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}