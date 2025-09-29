import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface CameraQRScannerProps {
  onScanSuccess: (data: ScanResult) => void;
  onCancel: () => void;
}

interface ScanResult {
  qrData: string;
  location: Location.LocationObject | null;
  timestamp: Date;
  assetId?: string;
  vendorId?: string;
  assetInfo?: AssetInfo;
}

interface AssetInfo {
  id: string;
  name: string;
  vendor: string;
  type: string;
  location: string;
  lastInspection: string;
  status: 'operational' | 'maintenance' | 'critical';
  qrCode?: string;
  healthScore?: number;
  serialNumber?: string;
  manufacturer?: string;
  installDate?: string;
  nextMaintenance?: string;
  model?: string;
  purchaseCost?: number;
  warrantyExpiry?: string;
  technicalSpecs?: string;
  maintenanceSchedule?: string;
  condition?: string;
}

const mockAssets: AssetInfo[] = [
  {
    id: 'd23e0996',
    name: 'Rail Pad - Visitor Center XX-34',
    vendor: 'Railway Corp',
    type: 'Rail Pad',
    location: 'Visitor Center XX-34',
    lastInspection: '2024-01-12',
    status: 'operational',
    qrCode: 'QR-d23e0996',
    healthScore: 95,
    serialNumber: 'RP-0996',
    manufacturer: 'Railway Corp',
    installDate: '2024-03-12',
    nextMaintenance: '2024-04-12',
    model: 'RP-2024-HD',
    purchaseCost: 150.00,
    warrantyExpiry: '2026-03-12',
    technicalSpecs: 'Load capacity: 25 tons, Temperature range: -40°C to +70°C',
    maintenanceSchedule: 'Quarterly',
    condition: 'excellent'
  },
  {
    id: '576bdd49',
    name: 'Rail Pad - First Aid Point TT',
    vendor: 'Railway Corp',
    type: 'Rail Pad',
    location: 'First Aid Point TT',
    lastInspection: '2024-02-01',
    status: 'operational',
    qrCode: 'QR-576bdd49',
    healthScore: 92,
    serialNumber: 'RP-dd49',
    manufacturer: 'Railway Corp',
    installDate: '2024-02-15',
    nextMaintenance: '2024-03-15',
    model: 'RP-2024-STD',
    purchaseCost: 120.00,
    warrantyExpiry: '2026-02-15',
    technicalSpecs: 'Load capacity: 20 tons, Temperature range: -30°C to +60°C',
    maintenanceSchedule: 'Bi-annual',
    condition: 'excellent'
  },
  {
    id: 'a45f8821',
    name: 'Elastic Rail Clip - Platform 2-A',
    vendor: 'Clip Systems Ltd',
    type: 'Elastic Rail Clip',
    location: 'Platform 2-A',
    lastInspection: '2024-01-01',
    status: 'maintenance',
    qrCode: 'QR-a45f8821',
    healthScore: 78,
    serialNumber: 'ERC-8821',
    manufacturer: 'Clip Systems Ltd',
    installDate: '2024-01-10',
    nextMaintenance: '2024-02-10',
    model: 'ERC-2024-PRO',
    purchaseCost: 200.00,
    warrantyExpiry: '2026-01-10',
    technicalSpecs: 'Spring force: 10kN, Operating temperature: -40°C to +80°C',
    maintenanceSchedule: 'Monthly',
    condition: 'good'
  }
];

export default function CameraQRScanner({ onScanSuccess, onCancel }: CameraQRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(locationData);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const findAssetByCode = (code: string): AssetInfo | null => {
    // Try to find asset by ID, QR code, or serial number
    return mockAssets.find(asset => 
      asset.id === code || 
      asset.qrCode === code || 
      asset.serialNumber === code ||
      asset.id.toLowerCase().includes(code.toLowerCase()) ||
      code.toLowerCase().includes(asset.id.toLowerCase())
    ) || null;
  };

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      console.log('QR Code scanned:', data);
      
      // Try to parse QR data (could be JSON or simple string)
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = { id: data };
      }

      // Look for asset information
      const assetInfo = findAssetByCode(parsedData.id || parsedData.asset_id || data);
      
      if (!assetInfo) {
        Alert.alert(
          'Asset Not Found',
          `No asset information found for: ${data}`,
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { text: 'Cancel', onPress: onCancel },
          ]
        );
        setIsLoading(false);
        return;
      }

      const scanResult: ScanResult = {
        qrData: data,
        location,
        timestamp: new Date(),
        assetId: assetInfo.id,
        vendorId: assetInfo.vendor,
        assetInfo: assetInfo,
      };

      // Show success confirmation
      const statusIcon = assetInfo.status === 'operational' ? '✅' : 
                        assetInfo.status === 'maintenance' ? '⚠️' : '🚨';
      
      Alert.alert(
        'Asset Scanned Successfully',
        `${statusIcon} ${assetInfo.name}\n\n` +
        `📍 Location: ${assetInfo.location}\n` +
        `🏭 Manufacturer: ${assetInfo.manufacturer}\n` +
        `📊 Health Score: ${assetInfo.healthScore}%\n` +
        `🔧 Status: ${assetInfo.status.toUpperCase()}\n` +
        `📅 Last Inspection: ${assetInfo.lastInspection}\n` +
        `🔄 Next Maintenance: ${assetInfo.nextMaintenance}`,
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'View Full Details', onPress: () => onScanSuccess(scanResult) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process scan. Please try again.');
      setScanned(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTorch = () => {
    setTorch(!torch);
  };

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#6b7280" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan QR codes on railway assets.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity onPress={toggleTorch} style={styles.torchButton}>
          <Ionicons 
            name={torch ? "flashlight" : "flashlight-outline"} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
        enableTorch={torch}
      >
        {/* Scanner Overlay */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerBox}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            
            {/* Scanning line animation */}
            {!scanned && (
              <View style={styles.scanLine} />
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {scanned ? 'Processing...' : 'Position QR code within the frame'}
          </Text>
          {isLoading && (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginTop: 10 }} />
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => setScanned(false)}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={24} color="#ffffff" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleTorch}
          >
            <Ionicons 
              name={torch ? "flashlight" : "flashlight-outline"} 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.controlButtonText}>
              {torch ? 'Flash Off' : 'Flash On'}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  torchButton: {
    padding: 5,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#ffffff',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#ffffff',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#ffffff',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#ffffff',
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ff6b6b',
    opacity: 0.8,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 80,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f9fafb',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});