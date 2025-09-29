import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AssetDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onEditAsset: () => void;
  onGenerateQR: () => void;
  assetData: {
    id: string;
    type: string;
    location: string;
    status: string;
    healthScore: number;
    condition: string;
    installDate: string;
    lastInspection: string;
    nextMaintenance: string;
    vendor?: {
      name: string;
      id: string;
      email: string;
      phone: string;
      address: string;
      status: string;
    };
    specifications?: {
      model: string;
      serialNumber: string;
      manufacturer: string;
      description: string;
    };
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ 
  visible, 
  onClose, 
  onEditAsset, 
  onGenerateQR, 
  assetData 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'inactive':
        return '#6b7280';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Asset Details</Text>
              <Text style={styles.headerSubtitle}>
                ID: {assetData.id} • {assetData.type}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{assetData.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assetData.status) }]}>
                    <Text style={styles.statusText}>{assetData.status}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Install Date</Text>
                  <Text style={styles.infoValue}>{assetData.installDate}</Text>
                </View>
              </View>
            </View>

            {/* Health & Performance */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="analytics-outline" size={20} color="#6b7280" />
                <Text style={styles.sectionTitle}>Health & Performance</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.healthScoreContainer}>
                  <Text style={styles.infoLabel}>Health Score</Text>
                  <View style={styles.healthScoreWrapper}>
                    <Text style={[styles.healthScoreValue, { color: getHealthScoreColor(assetData.healthScore) }]}>
                      {assetData.healthScore}
                    </Text>
                    <Text style={[styles.healthScoreLabel, { color: getHealthScoreColor(assetData.healthScore) }]}>
                      {assetData.condition}
                    </Text>
                  </View>
                </View>
                <View style={styles.healthProgressBar}>
                  <View 
                    style={[
                      styles.healthProgress, 
                      { 
                        width: `${assetData.healthScore}%`,
                        backgroundColor: getHealthScoreColor(assetData.healthScore)
                      }
                    ]} 
                  />
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Updated</Text>
                  <Text style={styles.infoValue}>Sep 21, 2025</Text>
                </View>
              </View>
            </View>

            {/* Asset Identification */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card-outline" size={20} color="#6b7280" />
                <Text style={styles.sectionTitle}>Asset Identification</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Asset ID</Text>
                  <Text style={styles.infoValue}>{assetData.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{assetData.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>QR Code</Text>
                  <TouchableOpacity style={styles.qrCodeLink} onPress={onGenerateQR}>
                    <Text style={styles.qrCodeText}>QR_{assetData.id}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Timeline & Maintenance */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
                <Text style={styles.sectionTitle}>Timeline & Maintenance</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Inspection</Text>
                  <Text style={styles.infoValue}>{assetData.lastInspection}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Next Maintenance</Text>
                  <Text style={styles.infoValue}>{assetData.nextMaintenance}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created Date</Text>
                  <Text style={styles.infoValue}>Sep 21, 2025</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Maintenance Schedule</Text>
                  <Text style={styles.infoValue}>N/A</Text>
                </View>
              </View>
            </View>

            {/* Vendor & Financial Information */}
            {assetData.vendor && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="business-outline" size={20} color="#6b7280" />
                  <Text style={styles.sectionTitle}>Vendor & Financial Information</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.vendorCard}>
                    <Text style={styles.vendorName}>{assetData.vendor.name}</Text>
                    <View style={styles.vendorDetails}>
                      <Text style={styles.vendorDetailItem}>ID: {assetData.vendor.id}</Text>
                      <Text style={styles.vendorDetailItem}>Email: {assetData.vendor.email}</Text>
                      <Text style={styles.vendorDetailItem}>Phone: {assetData.vendor.phone}</Text>
                      <Text style={styles.vendorDetailItem}>Address: {assetData.vendor.address}</Text>
                      <View style={styles.vendorStatusRow}>
                        <Text style={styles.vendorDetailItem}>Status: </Text>
                        <View style={[styles.vendorStatusBadge, { backgroundColor: getStatusColor(assetData.vendor.status) }]}>
                          <Text style={styles.vendorStatusText}>{assetData.vendor.status}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Asset Specifications */}
            {assetData.specifications && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="settings-outline" size={20} color="#6b7280" />
                  <Text style={styles.sectionTitle}>Asset Specifications</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.specificationsSubtitle}>Detailed asset information and specifications</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Model</Text>
                    <Text style={styles.infoValue}>{assetData.specifications.model}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Serial Number</Text>
                    <Text style={styles.infoValue}>{assetData.specifications.serialNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Manufacturer</Text>
                    <Text style={styles.infoValue}>{assetData.specifications.manufacturer}</Text>
                  </View>
                  <View style={styles.descriptionRow}>
                    <Text style={styles.infoLabel}>Description</Text>
                    <Text style={styles.descriptionText}>{assetData.specifications.description}</Text>
                  </View>
                  <TouchableOpacity style={styles.viewMetadataButton}>
                    <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                    <Text style={styles.viewMetadataText}>View Raw Metadata (Developer Info)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.editButton} onPress={onEditAsset}>
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Edit Asset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.generateQRButton} onPress={onGenerateQR}>
              <Ionicons name="qr-code-outline" size={20} color="#374151" />
              <Text style={styles.generateQRButtonText}>Generate QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: Math.min(screenWidth - 40, 600),
    maxHeight: screenHeight * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  healthScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  healthScoreWrapper: {
    alignItems: 'flex-end',
  },
  healthScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  healthScoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  healthProgressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  healthProgress: {
    height: '100%',
    borderRadius: 4,
  },
  qrCodeLink: {
    alignSelf: 'flex-end',
  },
  qrCodeText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  vendorCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  vendorDetails: {
    gap: 4,
  },
  vendorDetailItem: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  vendorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vendorStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vendorStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  specificationsSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  descriptionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
    marginTop: 4,
    lineHeight: 20,
  },
  viewMetadataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  viewMetadataText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  generateQRButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateQRButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AssetDetailsModal;