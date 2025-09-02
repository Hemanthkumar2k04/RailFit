// src/components/QRScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { XMarkIcon, CameraIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/api';
import { useToast } from '../hooks/use-toast';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      initializeCamera();
    } else {
      cleanup();
    }

    return cleanup;
  }, [open]);

  const initializeCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasPermission(false);
    }
  };

  const cleanup = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const simulateScan = () => {
    setScanning(true);
    
    // Simulate QR code detection with realistic QR codes
    setTimeout(() => {
      const mockResults = [
        'QR_GEN_A01_2024',
        'QR_HVAC_B02_2024', 
        'QR_SRV_C03_2024',
        'QR_PUMP_D04_2024'
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      handleScanResult(randomResult);
      setScanning(false);
    }, 2000);
  };

  const handleScanResult = async (qrCode: string) => {
    try {
      setLookupLoading(true);
      
      // Lookup asset by QR code in Supabase
      const asset = await ApiService.fetchAssetByQRCode(qrCode);
      
      toast({
        title: "Asset Found",
        description: `Found: ${asset.name} (${asset.location})`,
      });
      
      onScan(qrCode);
      onClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Asset not found';
      toast({
        title: "Asset Not Found",
        description: `No asset found with QR code: ${qrCode}`,
        variant: "destructive",
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleManualLookup = async () => {
    if (!manualInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an asset ID or QR code",
        variant: "destructive",
      });
      return;
    }

    try {
      setLookupLoading(true);
      
      // Try to fetch asset by ID first, then by QR code
      let asset;
      try {
        asset = await ApiService.fetchAssetById(manualInput.trim());
      } catch {
        // If not found by ID, try by QR code
        asset = await ApiService.fetchAssetByQRCode(manualInput.trim());
      }
      
      toast({
        title: "Asset Found",
        description: `Found: ${asset.name}`,
      });
      
      onScan(manualInput.trim());
      onClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Asset not found';
      toast({
        title: "Asset Not Found",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5" />
            Scan Asset QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Requesting camera access...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center p-4">
                  <XMarkIcon className="w-12 h-12 mx-auto mb-2 text-red-400" />
                  <p className="text-sm mb-2">Camera access denied</p>
                  <p className="text-xs opacity-75">{error}</p>
                </div>
              </div>
            )}

            {hasPermission && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
                    
                    {(scanning || lookupLoading) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {lookupLoading ? 'Looking up asset...' : 'Scanning...'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Position the QR code within the frame to scan
            </p>
            <Badge variant="outline" className="text-xs">
              Auto-detection enabled
            </Badge>
          </div>

          {/* Demo Button */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={simulateScan}
              disabled={scanning || lookupLoading}
              className="flex-1"
            >
              {scanning ? 'Scanning...' : 'Demo Scan'}
            </Button>
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>

          {/* Manual Input */}
          <div className="pt-2 border-t space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Having trouble? Manually enter the asset ID
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Asset ID (e.g., QR_GEN_A01_2024)"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
              />
              <Button 
                onClick={handleManualLookup}
                disabled={lookupLoading}
                size="sm"
              >
                <QrCodeIcon className="w-4 h-4" />
                Lookup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};