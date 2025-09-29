import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SimpleQRScannerProps {
  onScanSuccess: (data: ScanResult) => void;
  onCancel: () => void;
}

interface ScanResult {
  qrData: string;
  location: any;
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

export default function SimpleQRScanner({ onScanSuccess, onCancel }: SimpleQRScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const findAssetByCode = (code: string): AssetInfo | null => {
    // Try to find asset by ID, QR code, or serial number
    return mockAssets.find(asset => 
      asset.id === code || 
      asset.qrCode === code || 
      asset.serialNumber === code ||
      asset.id.toLowerCase().includes(code.toLowerCase())
    ) || null;
  };

  const handleManualScan = async () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter an asset ID or QR code');
      return;
    }

    setIsProcessing(true);

    try {
      const assetInfo = findAssetByCode(manualInput.trim());
      
      if (!assetInfo) {
        Alert.alert(
          'Asset Not Found',
          `No asset found for: ${manualInput}`,
          [
            { text: 'Try Again', onPress: () => setManualInput('') },
            { text: 'Cancel', onPress: onCancel },
          ]
        );
        setIsProcessing(false);
        return;
      }

      const scanResult: ScanResult = {
        qrData: manualInput,
        location: null,
        timestamp: new Date(),
        assetId: assetInfo.id,
        vendorId: assetInfo.vendor,
        assetInfo: assetInfo,
      };

      // Show success confirmation
      const statusIcon = assetInfo.status === 'operational' ? '✅' : 
                        assetInfo.status === 'maintenance' ? '⚠️' : '🚨';
      
      Alert.alert(
        'Asset Found Successfully',
        `${statusIcon} ${assetInfo.name}\n\n` +
        `📍 Location: ${assetInfo.location}\n` +
        `📊 Health Score: ${assetInfo.healthScore}%\n` +
        `🔧 Status: ${assetInfo.status.toUpperCase()}`,
        [
          { text: 'Try Another', onPress: () => { setManualInput(''); setIsProcessing(false); } },
          { text: 'View Details', onPress: () => { setIsProcessing(false); onScanSuccess(scanResult); } },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process asset lookup. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleQuickScan = (assetId: string) => {
    setManualInput(assetId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Scanner</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scanner Area Simulation */}
      <View style={styles.scannerArea}>
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerBox}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>
        
        <View style={styles.instructionContainer}>
          <Ionicons name="qr-code-outline" size={48} color="#ffffff" />
          <Text style={styles.instructionText}>
            Camera QR Scanner{'\n'}(Temporarily Disabled)
          </Text>
          <Text style={styles.subInstructionText}>
            Use manual input below for testing
          </Text>
        </View>
      </View>

      {/* Manual Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Enter Asset ID or QR Code:</Text>
        <TextInput
          style={styles.textInput}
          value={manualInput}
          onChangeText={setManualInput}
          placeholder="e.g., d23e0996, QR-576bdd49, RP-0996"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={[styles.scanButton, isProcessing && styles.scanButtonDisabled]} 
          onPress={handleManualScan}
          disabled={isProcessing}
        >
          <Ionicons name="search" size={20} color="#ffffff" />
          <Text style={styles.scanButtonText}>
            {isProcessing ? 'Processing...' : 'Lookup Asset'}
          </Text>
        </TouchableOpacity>

        {/* Quick Access Buttons */}
        <Text style={styles.quickAccessLabel}>Quick Test Assets:</Text>
        <View style={styles.quickButtonsContainer}>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => handleQuickScan('d23e0996')}
          >
            <Text style={styles.quickButtonText}>Rail Pad</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => handleQuickScan('a45f8821')}
          >
            <Text style={styles.quickButtonText}>Rail Clip</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => handleQuickScan('576bdd49')}
          >
            <Text style={styles.quickButtonText}>Liner</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 34,
  },
  scannerArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
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
  instructionContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },
  subInstructionText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 10,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});