import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CameraQRScanner from '../components/CameraQRScanner';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

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

export default function ScanScreen({ navigation }: any) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const handleScanSuccess = (result: ScanResult) => {
    console.log('Scan result:', result);
    setScanResult(result);
    setIsScanning(false);
    setShowAssetDetails(true);
  };

  const handleScanCancel = () => {
    navigation.goBack();
  };

  const handleAssetDetailsClose = () => {
    setShowAssetDetails(false);
    setScanResult(null);
    setIsScanning(true);
  };

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#94a3b8';
      case 'ok': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (showAssetDetails && scanResult?.assetInfo) {
    const asset = scanResult.assetInfo;
    return (
      <Modal visible={showAssetDetails} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleAssetDetailsClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Asset Details</Text>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.homeButton}>
              <Ionicons name="home" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Asset Basic Info */}
            <View style={styles.assetCard}>
              <View style={styles.assetHeader}>
                <View style={styles.assetIdContainer}>
                  <Text style={styles.assetIdLabel}>Asset ID</Text>
                  <Text style={styles.assetId}>{asset.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(asset.status) }]}>
                  <Text style={styles.statusText}>{asset.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetLocation}>📍 {asset.location}</Text>
            </View>

            {/* Health Score */}
            <View style={styles.healthCard}>
              <Text style={styles.sectionTitle}>Health Score</Text>
              <View style={styles.healthScoreContainer}>
                <Text style={styles.healthScore}>{asset.healthScore}%</Text>
                <View style={styles.healthBar}>
                  <View 
                    style={[
                      styles.healthBarFill, 
                      { 
                        width: `${asset.healthScore || 0}%`,
                        backgroundColor: (asset.healthScore || 0) >= 80 ? '#10b981' : 
                                        (asset.healthScore || 0) >= 60 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Asset Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Asset Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{asset.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Condition:</Text>
                <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(asset.condition!) }]}>
                  <Text style={styles.conditionText}>{asset.condition?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Serial Number:</Text>
                <Text style={styles.detailValue}>{asset.serialNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Manufacturer:</Text>
                <Text style={styles.detailValue}>{asset.manufacturer}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Model:</Text>
                <Text style={styles.detailValue}>{asset.model}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Install Date:</Text>
                <Text style={styles.detailValue}>{asset.installDate}</Text>
              </View>
            </View>

            {/* Maintenance Information */}
            <View style={styles.maintenanceCard}>
              <Text style={styles.sectionTitle}>Maintenance</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Inspection:</Text>
                <Text style={styles.detailValue}>{asset.lastInspection}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Maintenance:</Text>
                <Text style={styles.detailValue}>{asset.nextMaintenance}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Schedule:</Text>
                <Text style={styles.detailValue}>{asset.maintenanceSchedule}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Warranty Expiry:</Text>
                <Text style={styles.detailValue}>{asset.warrantyExpiry}</Text>
              </View>
            </View>

            {/* Technical Specifications */}
            {asset.technicalSpecs && (
              <View style={styles.specsCard}>
                <Text style={styles.sectionTitle}>Technical Specifications</Text>
                <Text style={styles.specsText}>{asset.technicalSpecs}</Text>
              </View>
            )}

            {/* Vendor Information */}
            <View style={styles.vendorCard}>
              <Text style={styles.sectionTitle}>Vendor Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vendor:</Text>
                <Text style={styles.detailValue}>{asset.vendor}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchase Cost:</Text>
                <Text style={styles.detailValue}>${asset.purchaseCost?.toFixed(2)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Edit Asset', 'Edit functionality coming soon!')}>
                <Ionicons name="create-outline" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Edit Asset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Schedule Maintenance', 'Maintenance scheduling coming soon!')}>
                <Ionicons name="calendar-outline" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Schedule Maintenance</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isScanning && (
        <CameraQRScanner
          onScanSuccess={handleScanSuccess}
          onCancel={handleScanCancel}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
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
  homeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  assetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  assetIdContainer: {
    flex: 1,
  },
  assetIdLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  assetId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  assetLocation: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  healthCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  healthScoreContainer: {
    alignItems: 'center',
  },
  healthScore: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  healthBar: {
    width: width - 80,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  maintenanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  vendorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});