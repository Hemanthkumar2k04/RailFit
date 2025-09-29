import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';
import apiService, { ApiAsset } from '../services/api';

const { width, height } = Dimensions.get('window');

interface QRCodeScannerProps {
  onScanSuccess: (data: ScanResult) => void;
  onCancel: () => void;
}

interface ScanResult {
  qrData: string;
  location: Location.LocationObject | null;
  timestamp: Date;
  assetId?: string;
  vendorId?: string;
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

export default function QRCodeScanner({ onScanSuccess, onCancel }: QRCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    getPermissions();
    getCurrentLocation();
  }, []);

  const getPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for asset tracking');
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

  const parseQRData = (data: string): Partial<AssetInfo> => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(data);
      return parsed;
    } catch {
      // If not JSON, treat as asset ID
      return { id: data };
    }
  };

  const getAssetInfo = async (qrData: string): Promise<AssetInfo | null> => {
    try {
      // First try to get asset by QR code using the dedicated endpoint
      const response = await apiService.searchAssetByQrCode(qrData);
      
      if (response.data) {
        const asset = response.data;
        
        // Convert API asset to AssetInfo format
        const assetInfo: AssetInfo = {
          id: asset.asset_id,
          name: `${asset.type} - ${asset.location}`,
          vendor: asset.vendor_id || 'Unknown',
          type: asset.type,
          location: asset.location,
          lastInspection: asset.metadata?.last_maintenance || asset.install_date || 'N/A',
          status: asset.status === 'active' ? 'operational' as const : 
                  asset.status === 'under_maintenance' ? 'maintenance' as const : 'critical' as const,
          qrCode: asset.qr_code || qrData,
          healthScore: asset.health_score || 85,
          serialNumber: asset.metadata?.serial_number || 'N/A',
          manufacturer: asset.metadata?.manufacturer || 'Unknown',
          installDate: asset.install_date || 'N/A',
          nextMaintenance: asset.metadata?.next_maintenance || 'N/A',
          model: asset.metadata?.model || 'N/A',
          purchaseCost: asset.metadata?.purchase_cost || 0,
          warrantyExpiry: asset.metadata?.warranty_expiry || 'N/A',
          technicalSpecs: asset.metadata?.technical_specs || 'N/A',
          maintenanceSchedule: asset.metadata?.maintenance_schedule || 'N/A',
          condition: asset.condition
        };
        
        return assetInfo;
      } else {
        // Asset not found in backend
        return null;
      }
    } catch (error) {
      console.error('Error fetching asset from API:', error);
      
      // Fallback to mock data for development/demo purposes
      // You can remove this fallback in production
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
          purchaseCost: 85.00,
          warrantyExpiry: '2025-01-10',
          technicalSpecs: 'Tensile strength: 50kN, Operating temperature: -20°C to +50°C',
          maintenanceSchedule: 'Monthly',
          condition: 'good'
        },
        {
          id: 'c67d1234',
          name: 'Concrete Sleeper - Junction B-12',
          vendor: 'Concrete Works',
          type: 'Sleeper',
          location: 'Junction B-12',
          lastInspection: '2023-12-01',
          status: 'critical',
          qrCode: 'QR-c67d1234',
          healthScore: 45,
          serialNumber: 'SLP-1234',
          manufacturer: 'Concrete Works',
          installDate: '2023-12-01',
          nextMaintenance: '2024-01-01',
          model: 'SLP-2023-CON',
          purchaseCost: 200.00,
          warrantyExpiry: '2028-12-01',
          technicalSpecs: 'Load capacity: 40 tons, Concrete grade: M40, Length: 2.6m',
          maintenanceSchedule: 'Annual',
          condition: 'critical'
        }
      ];

      // Search for asset in mock data
      const foundAsset = mockAssets.find(asset => 
        asset.qrCode === qrData || 
        asset.id === qrData ||
        qrData.includes(asset.id)
      );

      return foundAsset || null;
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      const assetInfo = await getAssetInfo(data);
      
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
      };

      // Show comprehensive asset info before proceeding
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
        `🔄 Next Maintenance: ${assetInfo.nextMaintenance}\n` +
        `📋 Serial: ${assetInfo.serialNumber}`,
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

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={getPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <Ionicons 
              name={flashOn ? "flash" : "flash-off"} 
              size={24} 
              color={Colors.surface} 
            />
          </TouchableOpacity>
        </View>

        {/* Scanning Area */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Point your camera at a QR code to scan
          </Text>
          {location && (
            <Text style={styles.locationText}>
              📍 Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.surface} />
            <Text style={styles.loadingText}>Processing scan...</Text>
          </View>
        )}

        {/* Manual Entry Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => {
              Alert.prompt(
                'Manual Entry',
                'Enter Asset ID manually:',
                (text) => {
                  if (text) {
                    handleBarCodeScanned({ type: 'manual', data: text });
                  }
                }
              );
            }}
          >
            <Ionicons name="keypad" size={20} color={Colors.primary.main} />
            <Text style={styles.manualButtonText}>Manual Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl + 20,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    ...Typography.textStyles.h3,
    color: Colors.surface,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.accent.main,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  instructionText: {
    ...Typography.textStyles.body,
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    ...Typography.textStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl + 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderRadius: Spacing.borderRadius.md,
  },
  manualButtonText: {
    ...Typography.textStyles.button,
    color: Colors.primary.main,
    marginLeft: Spacing.sm,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.textStyles.body,
    color: Colors.surface,
    marginTop: Spacing.base,
  },
  permissionText: {
    ...Typography.textStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderRadius: Spacing.borderRadius.md,
  },
  buttonText: {
    ...Typography.textStyles.button,
    color: Colors.surface,
  },
});