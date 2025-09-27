import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download, Eye, X } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface QRCodeDisplayProps {
  assetId: string;
  assetType?: string;
  size?: number;
  showControls?: boolean;
  className?: string;
}

interface QRCodeData {
  asset_id: string;
  type: string;
  location: string;
  status: string;
  health_score?: number;
  predicted_rul_days: number;
  last_inspection: string;
  next_maintenance: string;
  qr_version: string;
}

export default function QRCodeDisplay({ 
  assetId, 
  assetType, 
  size = 200, 
  showControls = true,
  className = "" 
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showData, setShowData] = useState(false);

  const generateQRCode = async (format: 'png' | 'svg' | 'json' = 'png') => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (format === 'json') {
        // Get JSON data for display
        const response = await fetch(API_ENDPOINTS.ASSETS.QR_CODE(assetId) + '?format=json', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch QR data');
        }

        const data = await response.json();
        setQrData(data);
        return data;
      } else {
        // Get PNG/SVG image
        const response = await fetch(API_ENDPOINTS.ASSETS.QR_CODE(assetId) + `?format=${format}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to generate QR code');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setQrCodeUrl(url);
        return url;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      console.error('QR Code generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg' = 'png') => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.ASSETS.QR_CODE(assetId) + `?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `asset_${assetId}_qr.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const viewQRCode = async () => {
    await generateQRCode('png');
    await generateQRCode('json');
    setShowModal(true);
  };

  useEffect(() => {
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [qrCodeUrl]);

  if (!showControls && !qrCodeUrl) {
    // Auto-generate for display-only mode
    useEffect(() => {
      generateQRCode('png');
    }, [assetId]);
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {showControls && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={viewQRCode}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              {isLoading ? 'Generating...' : 'View QR'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQRCode('png')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </>
        )}

        {!showControls && qrCodeUrl && (
          <img 
            src={qrCodeUrl} 
            alt={`QR Code for ${assetType || 'Asset'}`}
            width={size}
            height={size}
            className="border rounded"
          />
        )}

        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>

      {/* QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code for {assetType || 'Asset'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* QR Code Image */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for ${assetType || 'Asset'}`}
                    className="border rounded-lg shadow-sm"
                    style={{ maxWidth: '300px', height: 'auto' }}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQRCode('png')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download PNG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQRCode('svg')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download SVG
                    </Button>
                  </div>
                </div>
              )}

              {/* QR Code Data */}
              {qrData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">QR Code Data</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowData(!showData)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {showData ? 'Hide' : 'Show'} Data
                    </Button>
                  </div>

                  {showData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(qrData, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Asset ID:</strong> {qrData.asset_id}</div>
                    <div><strong>Type:</strong> {qrData.type}</div>
                    <div><strong>Location:</strong> {qrData.location}</div>
                    <div><strong>Status:</strong> {qrData.status}</div>
                    {qrData.health_score && (
                      <div><strong>Health Score:</strong> {qrData.health_score}</div>
                    )}
                    <div><strong>Predicted RUL (Days):</strong> {qrData.predicted_rul_days}</div>
                    <div><strong>Last Inspection:</strong> {qrData.last_inspection}</div>
                    <div><strong>Next Maintenance:</strong> {qrData.next_maintenance}</div>
                    <div><strong>QR Version:</strong> {qrData.qr_version}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}